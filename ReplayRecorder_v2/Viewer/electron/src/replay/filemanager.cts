import * as chokidar from "chokidar";
import * as fs from "fs";

interface FileHandle { 
    path: string;
    finite?: boolean ;
}

class File {
    readonly path: string;
    private watcher: chokidar.FSWatcher | undefined;
    private requests: {
        start: number;
        end: number;
        numBytes: number;
        callback: (bytes?: ArrayBufferLike) => void;
    }[];

    private cyclicBuffer: Uint8Array;
    private cyclicStart?: { index: number, offset: number };
    private cyclicEnd: { index: number, offset: number };

    constructor(path: string) {
        this.path = path;
        this.requests = [];

        this.cyclicBuffer = new Uint8Array(32768);
        this.cyclicEnd = {
            index: 0,
            offset: 0
        };
    }

    public receiveLiveBytes(data: { offset: number, bytes: Uint8Array }) {
        const { offset, bytes } = data;
        //console.log(`${offset} | ${bytes.byteLength}`);
        if (this.cyclicStart === undefined) {
            this.cyclicStart = {
                index: 0,
                offset: offset
            };
            this.cyclicEnd.offset = offset;
        }
        if (offset !== this.cyclicEnd.offset) return;
        for (let i = 0; i < bytes.length; ++i) {
            this.cyclicBuffer[this.cyclicEnd.index] = bytes[i];
            this.cyclicEnd.index = (this.cyclicEnd.index + 1) % this.cyclicBuffer.length; 
            this.cyclicEnd.offset += 1;
            if (this.cyclicEnd.index === this.cyclicStart.index) {
                this.cyclicStart.index = (this.cyclicStart.index + 1) % this.cyclicBuffer.length; 
                this.cyclicStart.offset += 1;
            }
        }

        this.doAllRequests();
    }

    public open() {
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

    private getBytesImpl(start: number, end: number, numBytes: number): Promise<ArrayBufferLike> {
        return new Promise((resolve, reject) => {
            if (this.cyclicStart !== undefined && numBytes < this.cyclicBuffer.length &&
                start >= this.cyclicStart.offset && (end + 1) <= this.cyclicEnd.offset) {
                //console.log("get from link");
                const bytes = new Uint8Array(numBytes);
                const readHead = (this.cyclicStart.index + (start - this.cyclicStart.offset)) % this.cyclicBuffer.length;
                for (let i = 0; i < numBytes; ++i) {
                    const index = (readHead + i) % this.cyclicBuffer.length;
                    bytes[i] = this.cyclicBuffer[index];
                }
                resolve(bytes);
            } else {
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
            }
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

export class FileManager {
    file?: File;

    constructor() {
    }

    public setupIPC(ipc: Electron.IpcMain) {
        ipc.handle("open", async (_, file: FileHandle) => {
            if (this.file !== undefined) {
                this.file.close();
            } 
            this.file = new File(file.path);
            await this.file.open();
        });
        ipc.on("close", () => {
            this.file?.close();
        });
        
        ipc.handle("getBytes", async (_, index: number, numBytes: number, wait?: boolean) => {
            return await this.file?.getBytes(index, numBytes, wait);
        });
        ipc.handle("getAllBytes", async () => {
            return await this.file?.getAllBytes();
        });
    }
}