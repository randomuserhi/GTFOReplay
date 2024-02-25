import { BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as chokidar from "chokidar";
import * as fs from 'node:fs/promises';

/*declare module "./Net/tcpClient.cjs"
{
    interface MessageEventMap
    {
        "HeartBeat": MessageEvent<Message<"HeartBeat", string>>;
    }
}*/

// TODO(randomuserhi): Look into https://www.electronjs.org/docs/latest/tutorial/security#csp-http-headers, instead of relying on
//                     <meta> tags in loaded HTML

export default class Program {
    static win: Electron.BrowserWindow | null;
    static app: Electron.App;

    private static onWindowAllClosed(): void {
        if (process.platform !== "darwin") {
            Program.app.quit();
        }
    }

    private static onClose(): void {
        // Dereference the window object. 
        Program.win = null;
    }

    private static onReady(): void {
        Program.win = new BrowserWindow({
            frame: false, // remove the window frame
            show: false, // hide the window,
            backgroundColor: "#fff", // always set a bg color to enable font antialiasing
            webPreferences: {
                nodeIntegration: false, // is default value after Electron v5 - is disabled as per security (https://www.electronjs.org/docs/latest/tutorial/security)
                contextIsolation: true, // protect against prototype pollution - (https://www.electronjs.org/docs/latest/tutorial/context-isolation)
                preload: path.join(__dirname, "preload.cjs") // use a preload script
            }
        });
        Program.win.on("closed", Program.onClose);
        Program.win.loadFile(path.join(__dirname, "assets/main/main.html")); // load the main page

        // Start Module Manager => TODO(randomuserhi): Move to its own class in a different file -> Program.ModuleManager = new ModuleManager(); ModuleManager.watch("./modules");
        // Also needs to manage error states such as folder not found - should reject filename change as well etc...
        const watcher = chokidar.watch(path.join(__dirname, "assets/modules"), {
            ignored: /^\./, 
            persistent: true
        });
        watcher.on("all", (e, _path) => {
            if (path.parse(_path).ext.toLowerCase() === ".js") {
                Program.send("module", [_path]);
            }            
        });

        //Program.win.maximize();
        Program.win.show();
    }

    private static setupIPC(): void {
        ipcMain.on("closeWindow", (e) => {
            if (!Program.isTrustedFrame(e.senderFrame)) return;
            if (Program.win === null) return;
            
            Program.win.close();
        });
        ipcMain.on("maximizeWindow", (e) => {
            if (!Program.isTrustedFrame(e.senderFrame)) return;
            if (Program.win === null) return;

            Program.win.isMaximized() ? Program.win.unmaximize() : Program.win.maximize();
        });
        ipcMain.on("minimizeWindow", (e) => {
            if (!Program.isTrustedFrame(e.senderFrame)) return;
            if (Program.win === null) return;

            Program.win.minimize();
        });
        
        // Move to module manager => ModuleManager.setupIPC(ipcMain)
        async function getFiles(dir: string): Promise<string[]> {
            const subdirs = await fs.readdir(dir);
            const files = await Promise.all(subdirs.map(async (subdir: string) => {
                const res = path.resolve(dir, subdir);
                return (await fs.stat(res)).isDirectory() ? getFiles(res) : path.parse(res).ext.toLowerCase() === ".js" ? [res] : [];
            }));
            return files.reduce((a, f) => a.concat(f), []);
        }
        ipcMain.on("loadAllModules", async () => {
            try {
                const files = await getFiles(path.join(__dirname, "assets/modules"));
                Program.send("module", files);
            } catch (err) {
                console.error(err);
            } 
        });
    }

    // TODO(randomuserhi): Typescript template events - Front End as well
    static send(event: string, ...args: any[]): void {
        if (Program.win === null) return;
        Program.win.webContents.send(event, ...args);
    }

    private static isTrustedFrame(frame: Electron.WebFrameMain): boolean {
        if (Program.win === null) return false;
        // NOTE(randomuserhi): This simply checks if the frame making the call is the same
        //                     as the loaded frame of the browser window.
        //                     This is potentially an issue if the main browser window loads 
        //                     an external unsafe URL since then this check doesn't work.
        //
        //                     For the use case of this application, the browser window should never
        //                     load an external URL so this check is fine.
        return frame === Program.win.webContents.mainFrame;
    }

    static main(app: Electron.App): void {
        Program.app = app;
        Program.app.on('window-all-closed', Program.onWindowAllClosed);
        Program.app.on('ready', Program.onReady);

        Program.setupIPC();
    }
}