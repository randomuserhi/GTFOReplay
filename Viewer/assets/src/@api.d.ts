declare namespace Electron {
    interface CallbackHandle {}

    interface Ipc {
        closeWindow(): void;
        maximizeWindow(): void;
        minimizeWindow(): void;
        openDevTools(): void;

        // TODO(randomuserhi): typescript templates -> also consider Promise API
        on(event: string, callback: (...args: any[]) => void): CallbackHandle;
        off(event: string, handle: CallbackHandle): void;
        send(event: string, ...args: any[]): void;
        invoke(event: string, ...args: any[]): Promise<any>;
    }
}

interface Window
{
    api: Electron.Ipc;
}