import * as chokidar from "chokidar";
import * as fs from "fs";

class File {
    readonly path: string;
    private watcher: chokidar.FSWatcher | null;
    private requests: {
        start: number;
        end: number;
        callback: (bytes?: ArrayBufferLike) => void;
    }[];

    constructor(path: string) {
        this.path = path;
        this.requests = [];
    }

    private doRequest(request: { start: number; end: number; callback: (bytes?: ArrayBufferLike) => void }, wait: boolean = true) {
        const { start, end, callback } = request;
        if (end < start) {
            callback();
            return;
        }
        this.getBytesImpl(start, end).then(callback).catch(() => {
            if (wait) {
                this.requests.push({
                    start,
                    end,
                    callback
                });
            } else callback();
        });
    }

    private getBytesImpl(start: number, end: number): Promise<ArrayBufferLike> {
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
                resolve(Buffer.concat(chunks));
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
            this.files.set(path, replay);
        });
        ipc.on("close", (_, path: string) => {
            this.files.delete(path);
        });
        
        ipc.handle("getBytes", async (_, path: string, index: number, numBytes: number, wait?: boolean) => {
            return await this.files.get(path)?.getBytes(index, numBytes, wait);
        });
        ipc.handle("getAllBytes", async (_, path: string) => {
            return await this.files.get(path)?.getAllBytes();
        });
    }
}