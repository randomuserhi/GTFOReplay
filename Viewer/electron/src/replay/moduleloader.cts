import * as chokidar from "chokidar";
import { dialog } from "electron";
import * as fs from 'node:fs/promises';
import * as path from "path";
import Program from "../main.cjs";

export class ModuleLoader {
    private post: (event: string, ...args: any[]) => void;
    private path: string;
    private watcher?: chokidar.FSWatcher;

    constructor(post: (event: string, ...args: any[]) => void, path: string) {
        this.post = post;
        this.path = path;
        this.watch(path);
    }

    private watch(path: string) {
        if (this.watcher !== undefined) {
            this.watcher.close();
        }

        this.path = path;
        this.watcher = chokidar.watch(this.path);
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
        ipc.handle("moduleFolder", async () => {
            if (Program.win === null) return [false, "Failed to find browser window."]; 

            const result = await dialog.showOpenDialog(Program.win, {
                properties: ["openDirectory"],
                defaultPath: path.join(__dirname, "../assets")
            });

            try {
                if (!result.canceled) {
                    const path = result.filePaths[0];
                    if (!(await fs.stat(path)).isDirectory()) return [false, "Invalid path, please point to a directory."]; 
                    this.watch(path);
                    console.log(`Switched modules to ${path}`);
                    return [true];
                } else {
                    return [false, "No folder was selected."]; 
                }
            } catch (e) {
                return [false, `Unexpected error ${e}`];
            }
        });
    }
}