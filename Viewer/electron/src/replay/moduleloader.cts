import * as chokidar from "chokidar";
import * as fs from 'node:fs/promises';
import * as path from "path";

export class ModuleLoader {
    private post: (event: string, ...args: any[]) => void;
    readonly path: string;
    private watcher: chokidar.FSWatcher;
    readonly channel: string;

    constructor(channel: string, post: (event: string, ...args: any[]) => void, path: string) {
        this.post = post;
        this.path = path;
        this.channel = channel;
        this.watcher = chokidar.watch(this.path);
        this.watcher.on("all", (event, path) => {
            switch(event) {
            case "change":
            case "add":
                this.post(this.channel, [path]);
                break;
            }
        });
    }

    private static async getFiles(dir: string): Promise<string[]> {
        const subdirs = await fs.readdir(dir);
        const files = await Promise.all(subdirs.map(async (subdir: string) => {
            const res = path.resolve(dir, subdir);
            return (await fs.stat(res)).isDirectory() ? ModuleLoader.getFiles(res) : path.parse(res).ext.toLowerCase() === ".js" ? [res] : [];
        }));
        return files.reduce((a, f) => a.concat(f), []);
    }

    public setupIPC(ipc: Electron.IpcMain) {
        ipc.handle(this.channel, async () => {
            return await ModuleLoader.getFiles(this.path);
        });
    }
}