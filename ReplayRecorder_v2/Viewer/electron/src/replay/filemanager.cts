import * as chokidar from "chokidar";
import * as fs from "fs";
import { VirtualFile } from "./virtualfile.cjs";

interface FileHandle { 
    virtual?: [string, number];
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

    constructor(path: string) {
        this.path = path;
        this.requests = [];
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
    private file?: File | VirtualFile;

    constructor() {
    }

    public setupIPC(ipc: Electron.IpcMain) {
        ipc.handle("open", async (_, file: FileHandle) => {
            if (this.file !== undefined) return;
            if (file.path !== undefined) {
                this.file = new File(file.path);
                await this.file.open();
            } else if (file.virtual !== undefined) {
                const [ip, port] = file.virtual;
                this.file = new VirtualFile(ip, port);
                await this.file.open();
            }
        });
        ipc.on("close", () => {
            this.file?.close();
        });
        
        ipc.handle("getBytes", async (_, index: number, numBytes: number, wait?: boolean) => {
            return await this.file?.getBytes(index, numBytes, wait);
        });
    }
}