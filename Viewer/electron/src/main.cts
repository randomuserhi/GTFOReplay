import { BrowserWindow, ipcMain, shell } from "electron";
import * as path from "path";
import { FileManager } from "./replay/filemanager.cjs";
import { GTFOManager } from "./replay/gtfomanager.cjs";
import { ModuleLoader } from "./replay/moduleloader.cjs";

/*declare module "./net/tcpClient.cjs"
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

    static moduleLoader: ModuleLoader;
    static rendererModuleLoader: ModuleLoader;
    static fileManager: FileManager;
    static gtfoManager: GTFOManager;

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
        Program.setupIPC();

        Program.moduleLoader = new ModuleLoader(Program.post, path.resolve(__dirname, "assets/profiles"));
        Program.moduleLoader.setupIPC(ipcMain);

        Program.fileManager = new FileManager();
        Program.fileManager.setupIPC(ipcMain);
        Program.app.on("before-quit", () => {
            // NOTE(randomuserhi): Clean up temporary files generated 
            Program.fileManager?.dispose();
        });

        Program.gtfoManager = new GTFOManager(Program.fileManager);
        Program.gtfoManager.setupIPC(ipcMain);

        Program.win = new BrowserWindow({
            frame: false, // remove the window frame
            show: false, // hide the window,
            backgroundColor: "#000", // always set a bg color to enable font antialiasing
            webPreferences: {
                nodeIntegration: false, // is default value after Electron v5 - is disabled as per security (https://www.electronjs.org/docs/latest/tutorial/security)
                contextIsolation: true, // protect against prototype pollution - (https://www.electronjs.org/docs/latest/tutorial/context-isolation)
                preload: path.join(__dirname, "preload.cjs") // use a preload script
            }
        });
        Program.win.webContents.setWindowOpenHandler((details) => {
            shell.openExternal(details.url);
            return { action: "deny" };
        });
        Program.win.on("closed", Program.onClose);
        Program.win.loadFile(path.join(__dirname, "assets/main/main.html")); // load the main page
        Program.win.show();
    }

    private static setupIPC(): void {
        ipcMain.on("closeWindow", (e) => {
            if (e.senderFrame === null) return;
            if (!Program.isTrustedFrame(e.senderFrame)) return;
            if (Program.win === null) return;
            
            Program.win.close();
        });
        ipcMain.on("maximizeWindow", (e) => {
            if (e.senderFrame === null) return;
            if (!Program.isTrustedFrame(e.senderFrame)) return;
            if (Program.win === null) return;

            Program.win.isMaximized() ? Program.win.unmaximize() : Program.win.maximize();
        });
        ipcMain.on("minimizeWindow", (e) => {
            if (e.senderFrame === null) return;
            if (!Program.isTrustedFrame(e.senderFrame)) return;
            if (Program.win === null) return;

            Program.win.minimize();
        });
        ipcMain.on("openDevTools", (e) => {
            if (e.senderFrame === null) return;
            if (!Program.isTrustedFrame(e.senderFrame)) return;
            if (Program.win === null) return;

            Program.win.webContents.openDevTools();
        });
    }

    // TODO(randomuserhi): Typescript template events - Front End as well
    static post(event: string, ...args: any[]): void {
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
        process.on("SIGINT", () => {
            app.quit(); // Gracefully trigger app shutdown
        });
        Program.app = app;
        Program.app.on("window-all-closed", Program.onWindowAllClosed);
        if (Program.app.isReady()) {
            Program.onReady();
        } else {
            Program.app.on("ready", Program.onReady);
        }
    }
}