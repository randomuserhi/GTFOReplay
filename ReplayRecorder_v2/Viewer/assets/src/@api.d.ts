declare namespace Electron {
    interface Ipc {
        closeWindow(): void;
        maximizeWindow(): void;
        minimizeWindow(): void;

        // TODO(randomuserhi): typescript templates -> also consider Promise API
        on(event: string, callback: (...args: any[]) => void): void;
        off(event: string, callback: (...args: any[]) => void): void;
        send(event: string, ...args: any[]): void;
        invoke(event: string, ...args: any[]): Promise<any>;
    }
}

interface Window
{
    api: Electron.Ipc;
}