import * as chokidar from "chokidar";
import * as fs from "fs";

class Replay {
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
        this._getBytes(start, end).then(callback).catch(() => {
            if (wait) {
                this.requests.push({
                    start,
                    end,
                    callback
                });
            } else callback();
        });
    }

    private _getBytes(start: number, end: number): Promise<ArrayBufferLike> {
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
}

export class ReplayManager {
    private replays: Map<string, Replay>;

    constructor() {
        this.replays = new Map();
    }

    public setupIPC(ipc: Electron.IpcMain) {
        ipc.handle("open", (_, path: string) => {
            if (this.replays.has(path)) return;
            const replay = new Replay(path);
            this.replays.set(path, replay);
        });
        ipc.on("close", (_, path: string) => {
            this.replays.delete(path);
        });
        
        ipc.handle("getBytes", async (_, path: string, index: number, numBytes: number, wait?: boolean) => {
            return await this.replays.get(path)?.getBytes(index, numBytes, wait);
        });
    }
}