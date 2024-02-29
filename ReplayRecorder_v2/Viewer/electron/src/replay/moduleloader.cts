import * as chokidar from "chokidar";
import * as path from "path";
import * as fs from 'node:fs/promises';

export class ModuleLoader {
    private post: (event: string, ...args: any[]) => void;
    readonly path: string;
    private watcher: chokidar.FSWatcher;

    constructor(post: (event: string, ...args: any[]) => void, path: string) {
        this.post = post;
        this.path = path;
        this.watcher = chokidar.watch(path);
        this.watcher.on("all", (event, path) => {
            switch(event) {
            case "change":
            case "add":
                this.post("loadModules", [path]);
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
        ipc.handle("loadModules", async () => {
            return await ModuleLoader.getFiles(this.path);
        });
    }
}