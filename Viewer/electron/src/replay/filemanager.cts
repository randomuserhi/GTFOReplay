import * as chokidar from "chokidar";
import { randomUUID } from "crypto";
import { dialog } from "electron";
import * as fs from "fs";
import path from "path";
import * as yauzl from "yauzl";
import Program from "../main.cjs";

interface FileHandle { 
    path: string;
    finite?: boolean ;
}

// TODO(randomuserhi): Don't store entire net buffer -> deallocate early blocks as they are read and parsed
class NetBuffer {
    static chunkSize = 4096 * 5;
    
    private chunks: Uint8Array[];
    private reserveChunks(offset: number, size: number) {
        const index = Math.floor((offset + size) / NetBuffer.chunkSize);
        while (this.chunks.length <= index) {
            this.chunks.push(new Uint8Array(NetBuffer.chunkSize));
        }
    }

    private ranges: { start: number, end: number }[];
    private query(index: number): number {
        // NOTE(randomuserhi): returns negative index if not found

        if (this.ranges.length == 0) throw new Error("Cannot query length of 0");
        if (this.ranges.length == 1) {
            if (index < this.ranges[0].start || index > this.ranges[0].end) return -1;
            return 0;
        }

        let min = 0;
        let max = this.ranges.length - 1;

        while (min < max) {
            const mid = Math.floor((min + max) / 2);
            const range = this.ranges[mid];

            if (index < range.start) {
                max = mid - 1;
            } else if (index > range.end) {
                min = mid + 1;
            } else {
                return mid;
            }
        }

        return -min - 1;
    }

    constructor() {
        this.chunks = [];
        this.ranges = [];
    }

    public getAllBytes(start: number): { cache: ArrayBufferLike, cacheStart: number, cacheEnd: number } | undefined {
        if (this.ranges.length === 0) return undefined;

        const startRange = this.query(start);
        if (startRange < 0) return undefined;

        // Free memory of previous chunks as they should not need to be re-accessed
        for (let i = 0; i < Math.floor(start / NetBuffer.chunkSize) - 1; ++i) {
            this.chunks[i] = undefined!; 
        }

        const range = this.ranges[startRange];

        const length = range.end - start + 1;
        const data = new Uint8Array(length);
        let byteOffset = start;

        for (let i = 0; i < length; ++i, ++byteOffset) {
            const chunkIndex = Math.floor(byteOffset / NetBuffer.chunkSize);
            data[i] = this.chunks[chunkIndex][byteOffset - NetBuffer.chunkSize * chunkIndex];
        }

        return { cache: data, cacheStart: start, cacheEnd: range.end };
    }

    public getBytes(start: number, end: number, numBytes: number): Uint8Array | undefined {
        if (this.ranges.length === 0) return undefined;

        const startRange = this.query(start);
        const endRange = this.query(end);
        if (startRange < 0 || endRange < 0) return undefined;
        if (startRange !== endRange) return undefined;

        const data = new Uint8Array(numBytes);
        let byteOffset = start;
        for (let i = 0; i < numBytes; ++i, ++byteOffset) {
            const chunkIndex = Math.floor(byteOffset / NetBuffer.chunkSize);
            data[i] = this.chunks[chunkIndex][byteOffset - NetBuffer.chunkSize * chunkIndex];
        }

        return data;
    }

    public setByteRange(start: number, data: Uint8Array) {
        const length = data.byteLength;
        let end = start + length - 1;

        // Write data
        this.reserveChunks(start, length);
        let byteOffset = start;
        for (let i = 0; i < length; ++i, ++byteOffset) {
            const chunkIndex = Math.floor(byteOffset / NetBuffer.chunkSize);
            this.chunks[chunkIndex][byteOffset - NetBuffer.chunkSize * chunkIndex] = data[i];
        }

        // Assign ranges
        const newRanges: { start: number, end: number }[] = [];
        
        for (const range of this.ranges) {
            if (end < range.start - 1) {
                newRanges.push({ start, end });
                start = range.start;
                end = range.end;
            } else if (start > range.end + 1) {
                newRanges.push(range);
            } else {
                start = Math.min(start, range.start);
                end = Math.max(end, range.end);
            }
        }
        
        newRanges.push({ start, end });
        
        this.ranges = newRanges;

        // TODO(randomuserhi): display the byte range for feedback when loading spectator view
    }
}

class File {
    readonly path: string | undefined;
    private watcher: chokidar.FSWatcher | undefined;
    private requests: {
        start: number;
        end: number;
        numBytes: number;
        callback: (bytes?: ArrayBufferLike) => void;
    }[];

    private replayInstanceId: number;
    public link(replayInstanceId: number) {
        this.replayInstanceId = replayInstanceId;
    }

    constructor(path: string | undefined) {
        this.path = path;
        this.requests = [];
        this.replayInstanceId = -1;
        this.netBuffer = new NetBuffer();
    }

    netBuffer: NetBuffer;
    public receiveLiveBytes(data: { replayInstanceId: number, offset: number, bytes: Uint8Array }) {
        const { replayInstanceId, offset, bytes } = data;

        // console.log(`recv: ${offset} ${bytes.byteLength} ${replayInstanceId} -> ${this.replayInstanceId}`);

        if (replayInstanceId != this.replayInstanceId) {
            console.log(`${replayInstanceId} != ${this.replayInstanceId}`);
            return;
        }
        this.netBuffer.setByteRange(offset, bytes);

        this.doAllRequests();
    }

    public open() {
        if (this.path === undefined) return; // Network based file, skip watcher
        if (this.watcher !== undefined) {
            this.watcher.close();
        }
        this.watcher = chokidar.watch(this.path, {
            usePolling: true
        }); // TODO(randomuserhi): requires polling for some reason => shouldn't need to tho?
        this.watcher.on("all", () => {
            this.doAllRequests();
        });
    }

    public close() {
        // close all on going requests
        const requests = this.requests;
        this.requests = [];
        requests.forEach(r => r.callback());

        if (this.watcher !== undefined) {
            this.watcher.close();
        }
    }

    private doAllRequests() {
        const requests = this.requests;
        this.requests = [];
        requests.forEach(r => this.doRequest(r));
    }

    private doRequest(request: { start: number; end: number; numBytes: number; callback: (bytes?: ArrayBufferLike) => void }, wait: boolean = true) {
        const { start, end, numBytes, callback } = request;
        if (end < start) {
            callback();
            return;
        }
        this.getBytesImpl(start, end, numBytes).then(callback).catch(() => {
            if (wait) {
                this.requests.push({
                    start,
                    end,
                    numBytes,
                    callback
                });
            } else callback();
        });
    }

    public async getNetBytes(start: number): Promise<{ cache: ArrayBufferLike, cacheStart: number, cacheEnd: number } | undefined> {
        return this.netBuffer.getAllBytes(start);
    }

    private getBytesImpl(start: number, end: number, numBytes: number): Promise<ArrayBufferLike> {
        return new Promise((resolve, reject) => {
            const netBytes = this.netBuffer.getBytes(start, end, numBytes);
            if (netBytes !== undefined) {
                // If we have it in our net cache, use that
                resolve(netBytes);
            } else if (this.path !== undefined) {
                const stream = fs.createReadStream(this.path, {
                    flags: "r",
                    start,
                    end
                });
                stream.on("error", reject);
                const chunks: Buffer[] = [];
                stream.on("data", (chunk: Buffer | string) => {
                    chunks.push(chunk as Buffer);
                });
                stream.on("end", () => {
                    const buffer = Buffer.concat(chunks);
                    if (buffer.byteLength === numBytes) {
                        resolve(buffer);
                    } else reject();
                    stream.close();
                });
            } else reject();
        });
    }
    public getBytes(index: number, numBytes: number, wait: boolean = true): Promise<ArrayBufferLike | undefined> {
        const start = index;
        const end = index + numBytes - 1;
        return new Promise((resolve) => {
            this.doRequest({
                start,
                end,
                numBytes,
                callback: resolve
            }, wait);
        });
    }

    public getAllBytes(): Promise<ArrayBufferLike> {
        return new Promise((resolve, reject) => {
            if (this.path === undefined) {
                resolve(Buffer.concat([]));
                return;
            } 
            const stream = fs.createReadStream(this.path, {
                flags: "r"
            });
            stream.on("error", reject);
            const chunks: Buffer[] = [];
            stream.on("data", (chunk: Buffer | string) => {
                chunks.push(chunk as Buffer);
            });
            stream.on("end", () => {
                resolve(Buffer.concat(chunks));
                stream.close();
            });
        });
    }
}

const zipSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]); // "PK\x03\x04"
function isZipFile(filePath: string) {
    const buffer = Buffer.alloc(4);

    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);

    return buffer.equals(zipSignature);
}

const uuid = randomUUID();
const tempPath = path.join(__dirname, `/temp-${uuid}.replay`);

export class FileManager {
    file?: File;

    constructor() {
    }

    private async _open(filePath?: string) {
        this.file = new File(filePath);
        await this.file.open();
    }

    public link(replayInstanceId: number) {
        if (this.file === undefined) return;
        this.file.link(replayInstanceId);
    }

    public open(filePath?: string): Promise<void> {
        if (this.file !== undefined) {
            this.file.close();
        }

        // check if file is a zip -> if it is uncompress it to temp location and open that
        if (filePath !== undefined && isZipFile(filePath)) {
            return new Promise((resolve, reject) => {
                yauzl.open(filePath, { lazyEntries: true }, (err, zipfile) => {
                    if (err) return reject(err);
    
                    if (zipfile.entryCount !== 1) return reject(new Error("Compressed replays must follow the format of a single replay file in an archive."));

                    zipfile.on("entry", (entry) => {
                        if (!entry.fileName.endsWith('/')) {
                            // File entry (Should only be 1 file entry in zipped replay)
                            
                            zipfile.openReadStream(entry, (err, readStream) => {
                                if (err) return reject(err);
    
                                Program.post("console.log", `Zipped replay => extracted to '${tempPath}'`);
                                
                                const writeStream = fs.createWriteStream(tempPath);
                                readStream.pipe(writeStream);
    
                                writeStream.on("finish", async () => {
                                    resolve(await this._open(tempPath));
                                });
                            });
                        }
                    });
                    zipfile.on("end", resolve);
                    zipfile.on("error", reject);
                    
                    zipfile.readEntry();
                });
            });
        } else {
            return this._open(filePath);
        }
    }

    public dispose() {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }

    public setupIPC(ipc: Electron.IpcMain) {
        ipc.handle("chooseFile", async () => {
            const result = await dialog.showOpenDialog({
                title:"Select File",
                properties: ["openFile"]
            });

            return result.filePaths;
        });
        ipc.handle("open", async (_, file: FileHandle) => {
            await this.open(file.path);
        });
        ipc.on("close", () => {
            this.file?.close();
        });
        ipc.handle("lastFile", () => {
            return this.file?.path;
        });
        
        ipc.handle("getBytes", async (_, index: number, numBytes: number, wait?: boolean) => {
            return await this.file?.getBytes(index, numBytes, wait);
        });
        ipc.handle("getAllBytes", async () => {
            return await this.file?.getAllBytes();
        });
        ipc.handle("getNetBytes", async (_, index: number) => {
            return await this.file?.getNetBytes(index);
        });
    }
}