import { contextBridge, ipcRenderer } from "electron";

// TODO(randomuserhi): Look into https://stackoverflow.com/a/57656281/9642458 for better security

const listeners = new Map<string, Map<(event: Electron.IpcRendererEvent, ...args: any[]) => void, (...args: any[]) => void>>();
contextBridge.exposeInMainWorld(
    "api", {
        closeWindow() { // When window.api.closeWindow() is called, send "closeWindow" event to ipcMain
            ipcRenderer.send("closeWindow");
        },
        minimizeWindow() { // When window.api.closeWindow() is called, send "minimizeWindow" event to ipcMain
            ipcRenderer.send("minimizeWindow");
        },
        maximizeWindow() { // When window.api.closeWindow() is called, send "maximizeWindow" event to ipcMain
            ipcRenderer.send("maximizeWindow");
        },
        openDevTools() {
            ipcRenderer.send("openDevTools");
        },

        // NOTE(randomuserhi): https://stackoverflow.com/a/68350101
        // Exposes a listener to allow Renderer to listen to messages from Main
        // 
        // To send from Main:
        // window.webContents.send("event-name", ...args);
        on(event: string, callback: (...args: any[]) => void) {
            const cb = (_: Electron.IpcRendererEvent, ...args: any[]) => callback(...args);
            if (!listeners.has(event)) listeners.set(event, new Map());
            const collection = listeners.get(event)!;
            if (collection.has(callback)) return;
            collection.set(callback, cb);
            ipcRenderer.on(event, cb);
        },
        off(event: string, callback: (...args: any[]) => void) {
            if (!listeners.has(event)) return;
            const collection = listeners.get(event)!;
            if (!collection.has(callback)) return;
            ipcRenderer.off(event, collection.get(callback)!);
        },
        send(event: string, ...args: any[]) {
            ipcRenderer.send(event, ...args);
        },
        invoke(event: string, ...args: any[]): Promise<any> {
            return ipcRenderer.invoke(event, ...args);
        }
    }
);