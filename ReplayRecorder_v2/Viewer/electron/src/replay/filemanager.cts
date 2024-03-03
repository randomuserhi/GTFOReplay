import * as chokidar from "chokidar";
import * as fs from "fs";
import { TcpClient } from "../net/tcpClient.cjs";

interface FileHandle { 
    path?: string;
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

    private client: TcpClient;
    private cyclicBuffer: Uint8Array;
    private cyclicStart?: { index: number, offset: number };
    private cyclicEnd: { index: number, offset: number };

    constructor(path: string) {
        this.path = path;
        this.requests = [];

        this.client = new TcpClient();
        this.cyclicBuffer = new Uint8Array(32768);
        this.cyclicEnd = {
            index: 0,
            offset: 0
        };
        this.client.addEventListener("message", ({ offset, bytes }) => {
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
        });
    }

    public async link(ip: string, port: number) {
        if (this.client.active()) {
            this.client.disconnect();
        }
        this.cyclicStart = undefined;
        this.cyclicEnd.index = 0;
        this.cyclicEnd.offset = 0;
        await this.client.connect(ip, port);
    }

    public unlink() {
        if (!this.client.active()) return;
        this.client.disconnect();
    }

    public open() {
        if (this.watcher !== undefined) {
            this.watcher.close();
        }
        this.watcher = chokidar.watch(this.path, {
            usePolling: true
        }); // TODO(randomuserhi): requires polling for some reason => shouldn't need to tho?
        this.watcher.on("all", () => {
            const requests = this.requests;
            this.requests = [];
            requests.forEach(r => this.doRequest(r));
        });
    }

    public close() {
        if (this.watcher !== undefined) {
            this.watcher.close();
        }
        this.unlink();
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
            if (this.client.active() && this.cyclicStart !== undefined && numBytes < this.cyclicBuffer.length &&
                start >= this.cyclicStart.offset && (end + 1) <= this.cyclicEnd.offset) {
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
    private file?: File;

    constructor() {
    }

    public setupIPC(ipc: Electron.IpcMain) {
        ipc.handle("open", async (_, file: FileHandle) => {
            if (this.file !== undefined || file.path === undefined) return;
            this.file = new File(file.path);
            await this.file.open();
        });
        ipc.on("close", () => {
            this.file?.close();
        });

        ipc.on("link", (_, ip: string, port: number) => {
            this.file?.link(ip, port);
        });
        ipc.on("unlink", () => {
            this.file?.unlink();
        });
        
        ipc.handle("getBytes", async (_, index: number, numBytes: number, wait?: boolean) => {
            return await this.file?.getBytes(index, numBytes, wait);
        });
    }
}