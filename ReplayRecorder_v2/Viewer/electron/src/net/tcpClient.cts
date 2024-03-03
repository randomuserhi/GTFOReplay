import * as net from "net";
import * as os from "os";
import { core } from "../rnu/rnu.cjs";

export interface MessageEventMap
{
    "message": { offset: number, bytes: Uint8Array }
}

export class TcpClient {
    private static textEncoder = new TextEncoder();

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

        const headerSize: number = 4;
        let read: number = 0;
        let state: "waiting" | "reading" = "waiting";
        let msgSize: number;
        let recvBuffer: Uint8Array = new Uint8Array(1024);
        socket.on("data", (buffer: Buffer): void => {
            if (socket === null)
                return;

            let slice: number = 0;
            while (slice < socket.bytesRead) {
                switch(state) {
                case "waiting":
                    // Waiting for message header

                    if (recvBuffer.byteLength < headerSize)
                        recvBuffer = new Uint8Array(headerSize);

                    if (read < headerSize) {
                        // Read message header from buffer
                        for (let i = 0; i < headerSize && i < socket.bytesRead; ++i, ++read) {
                            recvBuffer[read] = buffer[slice + i];
                        }
                    } else {
                        // Decode message header and transition to next state when applicable

                        slice += read;
                        read = 0;

                        if (os.endianness() !== "LE") {
                            msgSize = (recvBuffer[0] << 24) |
                                    (recvBuffer[1] << 16) |
                                    (recvBuffer[2] << 8)  |
                                    (recvBuffer[3] << 0);
                        } else {
                            msgSize = (recvBuffer[0] << 0)  |
                                    (recvBuffer[1] << 8)  |
                                    (recvBuffer[2] << 16) |
                                    (recvBuffer[3] << 24);
                        }
                        if (msgSize > 0) { // Transition to reading state when there is a message
                            state = "reading";
                        }
                    }
                    break;
                case "reading":
                    // Reading message

                    if (recvBuffer.byteLength < msgSize)
                        recvBuffer = new Uint8Array(msgSize);

                    if (read < msgSize) {
                        // Read message from buffer
                        for (let i = 0; i < msgSize && i < socket.bytesRead; ++i, ++read) {
                            recvBuffer[read] = buffer[slice + i];
                        }
                    } else {
                        // Decode message and trigger "message" event

                        slice += read;
                        read = 0;

                        let offset;
                        if (os.endianness() !== "LE") {
                            offset = (recvBuffer[0] << 24) |
                                    (recvBuffer[1] << 16) |
                                    (recvBuffer[2] << 8)  |
                                    (recvBuffer[3] << 0);
                        } else {
                            offset = (recvBuffer[0] << 0)  |
                                    (recvBuffer[1] << 8)  |
                                    (recvBuffer[2] << 16) |
                                    (recvBuffer[3] << 24);
                        }

                        const bytes = new Uint8Array(msgSize - 4);
                        for (let i = 0; i < msgSize - 4; ++i) {
                            bytes[i] = recvBuffer[i + 4];
                        }

                        this.dispatchEvent("message", { offset, bytes });

                        state = "waiting";
                    }
                    break;
                }
            }
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