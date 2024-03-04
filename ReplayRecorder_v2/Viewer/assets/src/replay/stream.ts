import { Ipc } from "./ipc";

export interface FileHandle {
    path: string;
    finite?: boolean;
}

export class FileStream {
    readonly file: FileHandle;
    finite: boolean;
    private index: number;
    ipc: Ipc;

    // NOTE(randomuserhi): If the filestream is finite then when EndOfFile is reached, it will terminate.
    constructor(ipc: Ipc, file: FileHandle) {
        if (file.path === undefined) throw new SyntaxError("File must have a path.");

        this.file = file;
        this.index = 0;
        this.finite = file.finite !== undefined ? file.finite : false;
        this.ipc = ipc;
    }

    public open(): Promise<void> {
        return this.ipc.invoke("open", this.file);
    }

    public close(): void {
        this.ipc.send("close", this.file);
    }

    public async getBytes(numBytes: number): Promise<ByteStream> {
        const result = await this.peekBytes(numBytes);
        this.index += numBytes;
        return result;
    }

    public async peekBytes(numBytes: number): Promise<ByteStream> {
        return new ByteStream(await this.ipc.invoke("getBytes", this.index, numBytes, !this.finite));
    }
}

export class ByteStream {
    index: number;
    view: DataView;
    bytes: Uint8Array;

    constructor(bytes?: Uint8Array) {
        this.index = 0;
        this.assign(bytes !== undefined ? bytes : new Uint8Array(0));
    }

    public assign(bytes: Uint8Array) {
        this.bytes = bytes;
        this.view = new DataView(this.bytes.buffer, this.bytes.byteOffset, this.bytes.byteLength);
    }
}