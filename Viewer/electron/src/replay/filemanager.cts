import * as chokidar from "chokidar";
import * as fs from "fs";

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

    private cyclicBuffer: Uint8Array;
    private cyclicStart?: { index: number, offset: number };
    private cyclicEnd: { index: number, offset: number };

    constructor(path: string | undefined) {
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
        console.log(`${offset} | ${bytes.byteLength}`);
        if (this.cyclicBuffer.length < bytes.byteLength) {
            // If cyclicBuffer is too small, clear cache and resize
            this.cyclicBuffer = new Uint8Array(bytes.byteLength);
            // TODO(randomuserhi): refactor into a function called `clearCache`
            this.cyclicStart = undefined;
            this.cyclicEnd = {
                index: 0,
                offset: 0
            };
        }
        let empty = false;
        if (this.cyclicStart === undefined) {
            empty = true;
            this.cyclicStart = {
                index: 0,
                offset: offset
            };
            this.cyclicEnd.offset = offset;
        }
        if (offset !== this.cyclicEnd.offset) return; // Desynced data stream
        for (let i = 0; i < bytes.length; ++i) {
            if (!empty && this.cyclicEnd.index === this.cyclicStart.index) {
                this.cyclicStart.index = (this.cyclicStart.index + 1) % this.cyclicBuffer.length; 
                this.cyclicStart.offset += 1;
            }
            this.cyclicBuffer[this.cyclicEnd.index] = bytes[i];
            this.cyclicEnd.index = (this.cyclicEnd.index + 1) % this.cyclicBuffer.length; 
            this.cyclicEnd.offset += 1;
            empty = false;
        }

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
            const readHead = (this.cyclicStart.index + (start - this.cyclicStart.offset)) % this.cyclicBuffer.length;
            for (let i = 0; i < numBytes; ++i) {
                const index = (readHead + i) % this.cyclicBuffer.length;
                bytes[i] = this.cyclicBuffer[index];
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
            if (this.cyclicStart !== undefined && numBytes < this.cyclicBuffer.length &&
                start >= this.cyclicStart.offset && (end + 1) <= this.cyclicEnd.offset) {
                const bytes = new Uint8Array(numBytes);
                const readHead = (this.cyclicStart.index + (start - this.cyclicStart.offset)) % this.cyclicBuffer.length;
                for (let i = 0; i < numBytes; ++i) {
                    const index = (readHead + i) % this.cyclicBuffer.length;
                    bytes[i] = this.cyclicBuffer[index];
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
        ipc.handle("getNetBytes", async (_, index: number) => {
            return await this.file?.getNetBytes(index);
        });
    }
}