import { Ipc } from "./ipc";

export class FileStream {
    readonly path: string;
    finite: boolean;
    private index: number;
    ipc: Ipc;

    // NOTE(randomuserhi): If the filestream is finite then when EndOfFile is reached, it will terminate.
    constructor(ipc: Ipc, path: string, finite: boolean = true) {
        this.path = path;
        this.index = 0;
        this.finite = finite;
        this.ipc = ipc;
    }

    public open(): Promise<void> {
        return this.ipc.invoke("open", this.path);
    }

    public close(): void {
        this.ipc.send("close", this.path);
    }

    public async getBytes(numBytes: number): Promise<ByteStream> {
        const result = await this.peekBytes(numBytes);
        this.index += numBytes;
        return result;
    }

    public async peekBytes(numBytes: number): Promise<ByteStream> {
        return new ByteStream(await this.ipc.invoke("getBytes", this.path, this.index, numBytes, !this.finite));
    }
}

export class ByteStream {
    index: number;
    view: DataView;

    constructor(bytes?: Uint8Array) {
        this.index = 0;
        if (bytes === undefined) {
            this.view = new DataView(new ArrayBuffer(0));
        } else {
            this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        }
    }
}