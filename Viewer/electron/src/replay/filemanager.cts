import * as chokidar from "chokidar";
import { dialog } from "electron";
import * as fs from "fs";
import path from "path";
import * as yauzl from "yauzl";
import Program from "../main.cjs";

interface FileHandle { 
    path: string;
    finite?: boolean ;
}

// TODO(randomuserhi): shrink cyclic buffer after reading header...

class File {
    readonly path: string | undefined;
    private watcher: chokidar.FSWatcher | undefined;
    private requests: {
        start: number;
        end: number;
        numBytes: number;
        callback: (bytes?: ArrayBufferLike) => void;
    }[];

    private cyclicQueue: Uint8Array;
    private cyclicStart?: { index: number, offset: number };
    private cyclicEnd: { index: number, offset: number };

    constructor(path: string | undefined) {
        this.path = path;
        this.requests = [];

        this.cyclicQueue = new Uint8Array(32768);
        this.cyclicEnd = {
            index: 0,
            offset: 0
        };
    }

    public receiveLiveBytes(data: { offset: number, bytes: Uint8Array }) {
        const { offset, bytes } = data;
        console.log(`received: ${offset} ${bytes.length}`);
        if (this.cyclicStart === undefined) {
            this.cyclicStart = {
                index: 0,
                offset: offset
            };
            this.cyclicEnd.index = 0;
            this.cyclicEnd.offset = offset;
        }
        if (offset !== this.cyclicEnd.offset) {
            console.log(`desynced live bytes: ${offset} ${this.cyclicEnd.offset}`);
            return;
        }
        for (let i = 0; i < bytes.length; ++i) {
            this.cyclicQueue[this.cyclicEnd.index++] = bytes[i];
            const cycle = this.cyclicEnd.index % this.cyclicQueue.length;
            if (cycle === this.cyclicStart.index) {
                const capacity = this.cyclicQueue.length * 2;
                const buffer = new Uint8Array(capacity);
                buffer.set(this.cyclicQueue);
                this.cyclicQueue = buffer;
                console.log(`resized queue to ${this.cyclicQueue.length}`);
            } else {
                this.cyclicEnd.index = cycle;
            }
            ++this.cyclicEnd.offset;
        }
        console.log(`updated: ${this.cyclicStart?.offset} ${this.cyclicEnd}`);

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
        if (this.cyclicStart !== undefined && start >= this.cyclicStart.offset) {
            const numBytes = this.cyclicEnd.offset - start;
            const bytes = new Uint8Array(numBytes);
            const readHead = (this.cyclicStart.index + (start - this.cyclicStart.offset)) % this.cyclicQueue.length;
            for (let i = 0; i < numBytes; ++i) {
                const index = (readHead + i) % this.cyclicQueue.length;
                bytes[i] = this.cyclicQueue[index];

                this.cyclicStart.index = (this.cyclicStart.index + 1) % this.cyclicQueue.length;
                ++this.cyclicStart.offset;
            }
            return {
                cache: bytes,
                cacheStart: start,
                cacheEnd: this.cyclicEnd.offset
            };
        }
        return undefined;
    }

    private getBytesImpl(start: number, end: number, numBytes: number): Promise<ArrayBufferLike> {
        return new Promise((resolve, reject) => {
            if (this.cyclicStart !== undefined && numBytes < this.cyclicQueue.length &&
                start >= this.cyclicStart.offset && (end + 1) <= this.cyclicEnd.offset) {
                const bytes = new Uint8Array(numBytes);
                const readHead = (this.cyclicStart.index + (start - this.cyclicStart.offset)) % this.cyclicQueue.length;
                for (let i = 0; i < numBytes; ++i) {
                    const index = (readHead + i) % this.cyclicQueue.length;
                    bytes[i] = this.cyclicQueue[index];

                    this.cyclicStart.index = (this.cyclicStart.index + 1) % this.cyclicQueue.length;
                    ++this.cyclicStart.offset;
                }
                resolve(bytes);
            } else if (this.path !== undefined) {
                const stream = fs.createReadStream(this.path, {
                    flags: "r",
                    start,
                    end
                });
                stream.on("error", reject);
                const chunks: Buffer[] = [];
                stream.on("data", (chunk: Buffer) => {
                    chunks.push(chunk);
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
            stream.on("data", (chunk: Buffer) => {
                chunks.push(chunk);
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

export class FileManager {
    file?: File;

    constructor() {
    }

    private async _open(filePath?: string) {
        this.file = new File(filePath);
        await this.file.open();
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
    
                                const extractedPath = path.join(__dirname, "/temp.replay");
                                Program.post("console.log", `Zipped replay => extracted to '${extractedPath}'`);
                                
                                const writeStream = fs.createWriteStream(extractedPath);
                                readStream.pipe(writeStream);
    
                                writeStream.on('finish', async () => {
                                    resolve(await this._open(extractedPath));
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