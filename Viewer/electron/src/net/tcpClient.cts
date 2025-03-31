import * as net from "net";
import * as os from "os";
import { core } from "../rnu/rnu.cjs";
import * as BitHelper from "./bitHelper.cjs";
import { ByteStream } from "./stream.cjs";

// TODO(randomuserhi): - Proper message interface for different types of messages.
//                     - Include replay path so that when a different replay is loaded to the replay being linked, bytes are discarded
//                       instead of just causing errors. 

interface MessageTypes
{
    "startGame": void;
    "endGame": void;
    "liveBytes": void;
    "acknowledgement": void;
    "connected": void;
    "failedToConnect": void;
    "inGameMessage": void;
    "ackInGameMessage": void;
}
const messageTypes: (keyof MessageTypes)[] = [
    "startGame",
    "endGame",
    "liveBytes",
    "acknowledgement",
    "connected",
    "failedToConnect",
    "inGameMessage",
    "ackInGameMessage"
];
const messageTypeMap: Map<keyof MessageTypes, number>  = new Map([...messageTypes.entries()].map(([id, type]) => [type, id]));

export class TcpClient {
    private socket: net.Socket | null;
    private sockId: number = 0;
    private eventMap: Map<string, Set<Function>>;

    onClose: () => void | undefined;

    constructor() {
        this.eventMap = new Map();
    }

    public addEventListener<T extends (string & {}) | keyof MessageTypes>(type: T, listener: (this: TcpClient, bytes: ByteStream) => any) {
        if (!this.eventMap.has(type)) {
            this.eventMap.set(type, new Set<Function>());
        }
        
        const listeners = this.eventMap.get(type)!;
        listeners.add(listener);
    }
    
    public removeEventListener<T extends (string & {}) | keyof MessageTypes>(type: T, listener: (this: TcpClient, bytes: ByteStream) => any) {
        const listeners = this.eventMap.get(type);
        if (core.exists(listeners)) {
            listeners.delete(listener);
        }
    }

    public dispatchEvent<T extends (string & {}) | keyof MessageTypes>(type: T, bytes: ByteStream) {
        const listeners = this.eventMap.get(type);
        if (core.exists(listeners)) {
            for (const listener of listeners) {
                listener.call(this, bytes);
            }
        }
    }

    public async send(type: keyof MessageTypes, content: ByteStream) {
        if (!core.exists(this.socket))
            throw new Error("Socket is null");

        const typeId = messageTypeMap.get(type);
        if (typeId === undefined) throw new Error(`Could not get id for type '${type}'.`);

        const bytes = content.bytes;
        const size = content.index;
        
        const sizeOfHeader = 2;
        const buffer = new Uint8Array(4 + sizeOfHeader + size);
        const stream = new ByteStream(buffer);
        BitHelper.writeInt(sizeOfHeader + size, stream);
        BitHelper.writeUShort(typeId, stream);
        for (let i = 0; i < size; ++i) {
            BitHelper.writeByte(bytes[i], stream);
        }

        const socket = this.socket;
        return new Promise<void>((resolve, reject) => {
            socket.write(stream.bytes, (error) => core.exists(error) ? reject(error) : resolve());
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
        // TODO(randomusehri): Max message size to prevent too much memory being allocated
        const headerSize: number = 4;
        let read: number = 0;
        let state: "waiting" | "reading" = "waiting";
        let msgSize: number;
        let recvBuffer: Uint8Array = new Uint8Array(1024);
        let prevBytesRead = 0;
        socket.on("data", (buffer: Buffer): void => {
            if (socket === null)
                return;

            // TODO(randomuserhi): Handle integer overflow with socket.bytesRead
            const bytesRead = socket.bytesRead - prevBytesRead;
            prevBytesRead = socket.bytesRead;
            //console.log(`bytes received: ${bytesRead} > state: ${state}`);
            
            let totalRead: number = 0;
            while (totalRead < bytesRead) {
                //console.log(`remaining: ${bytesRead - totalRead}`);

                switch(state) {
                case "waiting":
                    // Waiting for message header

                    if (recvBuffer.byteLength < headerSize)
                        recvBuffer = new Uint8Array(headerSize);

                    if (read < headerSize) {
                        // Read message header from buffer
                        for (; read < headerSize && totalRead < bytesRead; ++read, ++totalRead) {
                            recvBuffer[read] = buffer[totalRead];
                        }
                    }

                    if (read >= headerSize) {
                        // Decode message header and transition to next state when applicable

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
                            // console.log(`msgSize: ${msgSize}`);
                            state = "reading";
                        }
                    }
                    break;
                case "reading":
                    // Reading message

                    if (recvBuffer.byteLength < msgSize) {
                        recvBuffer = new Uint8Array(msgSize);
                    }

                    if (read < msgSize) {
                        // Read message from buffer
                        for (; read < msgSize && totalRead < bytesRead; ++totalRead, ++read) {
                            recvBuffer[read] = buffer[totalRead];
                        }
                    }
                    //console.log(`Received: ${read}/${msgSize}`);
                    
                    if (read >= msgSize) {
                        // Decode message and trigger "message" event

                        read = 0;

                        const recvStream = new ByteStream(recvBuffer);

                        // Read message header
                        const type = BitHelper.readUShort(recvStream);

                        const msgHeaderSize = 2;
                        const content = BitHelper.readBytes(msgSize - msgHeaderSize, recvStream);

                        this.dispatchEvent(messageTypes[type], new ByteStream(content));

                        state = "waiting";
                    }
                    break;
                }
            }
        });

        return new Promise<void>((resolve, reject) => {
            const id = ++this.sockId;
            const errListener = (error: Error) => {
                socket.off("error", errListener);
                reject(error);
            };
            socket.on("error", errListener);
            socket.on("close", () => {
                if (this.sockId != id) return;
                
                this.socket?.destroy();
                this.socket = null; 

                if (this.onClose !== undefined) this.onClose();
            }); 
            socket.connect(port, ip, () => {
                resolve();
            });
        });
    }
}