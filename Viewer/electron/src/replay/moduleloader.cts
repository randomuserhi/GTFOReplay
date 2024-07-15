import * as chokidar from "chokidar";
import * as fs from 'node:fs/promises';
import * as path from "path";

export class ModuleLoader {
    private post: (event: string, ...args: any[]) => void;
    private directory: string;
    private hotreload?: chokidar.FSWatcher;
    private watcher?: chokidar.FSWatcher;

    constructor(post: (event: string, ...args: any[]) => void, directory: string) {
        this.post = post;
        this.directory = directory;
    }

    private async exists(path: string) {
        try {
            await fs.access(path, fs.constants.R_OK);
            return true;
        } catch {
            return false;
        }
    }

    private async getModuleList() {
        const response: {
            success: boolean;
            modules: string[] | undefined;
            error: string | undefined;
        } = {
            success: false,
            modules: undefined,
            error: "An unknown error occured."
        };

        const fullPath = path.resolve(this.directory);
        if (!await this.exists(fullPath)) {
            response.error = `'${fullPath}' does not exist`;
            return response;
        }

        const stat = await fs.stat(fullPath);
        if (!stat.isDirectory()) {
            response.error = `Unable to find profile directory, '${fullPath}'.`;
            return response;
        }

        try {
            if (this.watcher === undefined) {   
                this.watcher = chokidar.watch(`${fullPath}/*`, {
                    depth: 0
                });
                this.watcher.on("all", async (event, path) => {
                    const stat = await fs.stat(path);
                    if (!stat.isDirectory()) return;
            
                    switch(event) {
                    case "addDir":
                    case "unlinkDir":
                        this.post("moduleList", await this.getModuleList());
                        break;
                    }
                    
                });
            }
        } catch (e) {
            this.watcher?.close();
            this.watcher = undefined;

            response.error = `Failed to start watcher '${fullPath}': ${e.toString()}`;
            response.success = false;
            response.modules = undefined;
            return response;
        }

        try {
            response.modules = await fs.readdir(this.directory);
            response.success = true;
        } catch (e) {
            response.error = `Failed to get module list from '${fullPath}': ${e.toString()}`;
            response.success = false;
            response.modules = undefined;
        }

        return response;
    }

    private async load(module: string) {
        const response: {
            success: boolean;
            module: string | undefined;
            scripts: string[] | undefined;
            error: string | undefined;
        } = {
            success: false,
            module: undefined,
            scripts: undefined,
            error: "An unknown error occured."
        };

        const fullPath = path.resolve(this.directory, module);
        if (!await this.exists(fullPath)) {
            response.error = `'${fullPath}' does not exist`;
            return response;
        }

        const stat = await fs.stat(fullPath);
        if (!stat.isDirectory()) {
            response.error = `'${fullPath}' is not a valid module`;
            return response;
        }

        try {
            if (this.hotreload !== undefined) {
                this.hotreload.close();
            }

            this.hotreload = chokidar.watch(`${fullPath}/**/*.js`);
            this.hotreload.on("all", (event, path) => {
                switch(event) {
                case "change":
                case "add":
                case "unlink":
                    this.post("loadScript", [path]);
                    break;
                }
            });

            response.scripts = await this.getFiles(fullPath);
            response.success = true;
            response.module = module;
        } catch (e) {
            response.error = `Failed to get module '${fullPath}': ${e.toString()}`;
            response.success = false;
            response.scripts = undefined;
            response.module = undefined;
        }
        
        return response;
    }

    private async getFiles(dir: string): Promise<string[]> {
        const subdirs = await fs.readdir(dir);
        const files = await Promise.all(subdirs.map(async (subdir: string) => {
            const res = path.resolve(dir, subdir);
            return (await fs.stat(res)).isDirectory() ? this.getFiles(res) : path.parse(res).ext.toLowerCase() === ".js" ? [res] : [];
        }));
        return files.reduce((a, f) => a.concat(f), []);
    }

    public setupIPC(ipc: Electron.IpcMain) {
        ipc.handle("loadModule", async (_, module: string) => {
            return await this.load(module);
        });
        ipc.handle("moduleList", async () => {
            return await this.getModuleList();
        });
    }
}