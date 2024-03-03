import * as net from "net";
import * as os from "os";
import { core } from "../rnu/rnu.cjs";

export interface MessageEventMap
{
    "message": Uint8Array;
}

export class TcpClient {
    private socket: net.Socket | null;
    private eventMap: Map<string, Set<Function>>;

    constructor() {
        this.eventMap = new Map();
    }

    public addEventListener<T extends (string & {}) | keyof MessageEventMap>(type: T, listener: (this: TcpClient, ev: T extends keyof MessageEventMap ? MessageEventMap[T] : any) => any) {
        if (!this.eventMap.has(type)) {
            this.eventMap.set(type, new Set<Function>());
        }
        
        const listeners = this.eventMap.get(type)!;
        listeners.add(listener);
    }
    
    public removeEventListener<T extends (string & {}) | keyof MessageEventMap>(type: T, listener: (this: TcpClient, ev: T extends keyof MessageEventMap ? MessageEventMap[T] : any) => any) {
        const listeners = this.eventMap.get(type);
        if (core.exists(listeners)) {
            listeners.delete(listener);
        }
    }

    public dispatchEvent<T extends (string & {}) | keyof MessageEventMap>(type: T, ev: T extends keyof MessageEventMap ? MessageEventMap[T] : any) {
        const listeners = this.eventMap.get(type);
        if (core.exists(listeners)) {
            for (const listener of listeners) {
                listener.call(this, ev);
            }
        }
    }

    public async send(bytes: Uint8Array) {
        if (!core.exists(this.socket))
            throw new Error("Socket is null");
        
        const buffer = new Uint8Array(4 + bytes.byteLength);
        // Write message length to buffer
        if (os.endianness() !== "LE") {
            buffer[0] = (bytes.byteLength&0xff000000)>>24;
            buffer[1] = (bytes.byteLength&0x00ff0000)>>16;
            buffer[2] = (bytes.byteLength&0x0000ff00)>>8;
            buffer[3] = (bytes.byteLength&0x000000ff)>>0;
        } else {
            buffer[3] = (bytes.byteLength&0xff000000)>>24;
            buffer[2] = (bytes.byteLength&0x00ff0000)>>16;
            buffer[1] = (bytes.byteLength&0x0000ff00)>>8;
            buffer[0] = (bytes.byteLength&0x000000ff)>>0;
        }
        
        // Write message to buffer
        for (let i = 0; i < bytes.byteLength; ++i) {
            buffer[i + 4] = bytes[i];
        }
        
        const socket = this.socket;
        return new Promise<void>((resolve, reject) => {
            socket.write(buffer, (error) => core.exists(error) ? reject(error) : resolve());
        });
    }

    public active(): boolean {
        return core.exists(this.socket);
    }

    public disconnect() {
        if (core.exists(this.socket))
            this.socket.destroy();
        this.socket = null;
    }

    public async connect(ip: string, port: number) {
        if (core.exists(this.socket))
            this.socket.destroy();
        const socket = this.socket = new net.Socket();

        // TODO(randomuserhi): Handling Integer Overflow
        let prevBytesRead = 0;
        socket.on("data", (buffer: Buffer): void => {
            if (socket === null)
                return;

            const bytesRead = socket.bytesRead - prevBytesRead;
            prevBytesRead = socket.bytesRead;
            const bytes = new Uint8Array(bytesRead);
            for (let i = 0; i < bytesRead; ++i) {
                bytes[i] = buffer[i];
            }

            this.dispatchEvent("message", bytes);
        });

        return new Promise<void>((resolve, reject) => {
            const errListener = (error: Error) => {
                socket.off("error", errListener);
                reject(error);
            };
            socket.on("error", errListener);
            socket.connect(port, ip, () => resolve());
        });
    }
}