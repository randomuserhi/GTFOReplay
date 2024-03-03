import * as chokidar from "chokidar";
import * as fs from "fs";
import { TcpClient } from "../net/tcpClient.cjs";

class File {
    readonly path: string;
    private watcher: chokidar.FSWatcher | undefined;
    private requests: {
        start: number;
        end: number;
        numBytes: number;
        callback: (bytes?: ArrayBufferLike) => void;
    }[];

    constructor(path: string) {
        this.path = path;
        this.requests = [];

        this.client = new TcpClient();
        this.cyclicBuffer = new Uint8Array(1024);
        this.cyclicEnd = {
            index: 0,
            offset: 0
        };
        this.client.addEventListener("message", (data) => {
            console.log(`offset: ${data.offset}`);
            
            if (this.cyclicStart === undefined) {
                this.cyclicStart = {
                    index: 0,
                    offset: data.offset
                };
                this.cyclicEnd.offset = data.offset;
            }
            if (data.offset !== this.cyclicEnd.offset) return;
            for (let i = 0; i < data.bytes.length; ++i) {
                this.cyclicBuffer[this.cyclicEnd.index] = data.bytes[i];
                this.cyclicEnd.index = (this.cyclicEnd.index + 1) % this.cyclicBuffer.length; 
                this.cyclicEnd.offset += 1;
                if (this.cyclicEnd.index === this.cyclicStart.index) {
                    this.cyclicStart.index = (this.cyclicStart.index + 1) % this.cyclicBuffer.length; 
                    this.cyclicStart.offset += 1;
                }
            }
            console.log(`start: ${this.cyclicStart.offset} ${this.cyclicEnd.offset} ${this.cyclicStart.index} ${this.cyclicEnd.index}`);
        });
    }

    private client: TcpClient;
    private cyclicBuffer: Uint8Array;
    private cyclicStart?: { index: number, offset: number };
    private cyclicEnd: { index: number, offset: number };
    public link(port: number) {
        console.log("setting up link");
        if (this.client.active()) {
            this.client.disconnect();
        }
        this.cyclicStart = undefined;
        this.cyclicEnd.index = 0;
        this.cyclicEnd.offset = 0;
        this.client.connect("127.0.0.1", port);
        console.log("link setup");
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
            console.log(`request bytes: ${start} ${end} (${numBytes})`);
            if (this.client.active() && this.cyclicStart !== undefined && numBytes < this.cyclicBuffer.length &&
                start >= this.cyclicStart.offset && (end + 1) <= this.cyclicEnd.offset) {
                console.log("Retrieved Bytes from link.");
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
                    if (buffer.byteLength === numBytes) resolve(buffer);
                    else reject();
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
    private files: Map<string, File>;

    constructor() {
        this.files = new Map();
    }

    public setupIPC(ipc: Electron.IpcMain) {
        ipc.handle("open", (_, path: string) => {
            if (this.files.has(path)) return;
            const replay = new File(path);
            replay.open();
            this.files.set(path, replay);
        });
        ipc.on("close", (_, path: string) => {
            this.files.get(path)?.close();
            this.files.delete(path);
        });
        ipc.on("link", (_, path: string, port: number) => {
            console.log("received link");
            if (!this.files.has(path)) return;
            this.files.get(path)!.link(port);
        });
        
        ipc.handle("getBytes", async (_, path: string, index: number, numBytes: number, wait?: boolean) => {
            return await this.files.get(path)?.getBytes(index, numBytes, wait);
        });
        ipc.handle("getAllBytes", async (_, path: string) => {
            return await this.files.get(path)?.getAllBytes();
        });
    }
}