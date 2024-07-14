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
        this.watcher = chokidar.watch(`${this.path}/**/*.js`);
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
            const response: {
                success: boolean;
                path: string | undefined;
                error: string | undefined;
            } = {
                success: false,
                path: undefined,
                error: "An unknown error occured."
            };

            if (Program.win === null) return response; 

            const result = await dialog.showOpenDialog(Program.win, {
                properties: ["openDirectory"],
                defaultPath: path.join(__dirname, "../assets/profiles")
            });

            try {
                if (!result.canceled) {
                    const path = result.filePaths[0];
                    if (!(await fs.stat(path)).isDirectory()) {
                        response.error = "Invalid path, please point to a directory.";
                        return response;
                    }
                    this.watch(path);
                    console.log(`Switched modules to ${path}`);
                    
                    response.success = true;
                    response.path = path;
                    response.error = "";
                    return response;
                } else {
                    response.error = "No folder was selected.";
                    return response; 
                }
            } catch (e) {
                response.error = `Unexpected error ${e}`;
                return response;
            }
        });
    }
}