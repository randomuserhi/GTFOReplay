import { Ipc } from "./ipc";

export interface FileHandle {
    path?: string;
    finite?: boolean;
}

export class FileStream {
    readonly file: FileHandle;
    finite: boolean;
    private index: number;
    ipc: Ipc;

    // NOTE(randomuserhi): If the filestream is finite then when EndOfFile is reached, it will terminate.
    // NOTE(randomuserhi): If the file has no path, then its a network based connection
    constructor(ipc: Ipc, file: FileHandle) {
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

    private cache?: Uint8Array;
    private cacheStart: number;
    private cacheEnd: number;
    public async cacheBytes(numBytes: number): Promise<void> {
        console.log(`cached: ${numBytes} bytes!`);
        this.cache = await this.ipc.invoke("getBytes", this.index, numBytes, !this.finite);
        this.cacheStart = this.index;
        this.cacheEnd = this.index + numBytes;
    }
    public async cacheAllBytes(): Promise<void> {
        this.cache = await this.ipc.invoke("getAllBytes");
        console.log(`cached: ${this.cache!.byteLength} bytes!`);
        this.cacheStart = 0;
        this.cacheEnd = 0 + this.cache!.byteLength;
    }
    public async cacheNetworkBuffer(): Promise<boolean> {
        if (this.index >= this.cacheStart && this.index < this.cacheEnd) {
            return false;
        }
        const result = await this.ipc.invoke("getNetBytes", this.index);
        if (result === undefined) return false;
        this.cache = result.cache;
        this.cacheStart = result.cacheStart;
        this.cacheEnd = result.cacheEnd;
        console.log(`cached net bytes: ${this.cacheStart} ${this.cacheEnd} ${this.cache!.byteLength} bytes!`);
        return true;
    }

    public async getBytes(numBytes: number): Promise<ByteStream> {
        let result: ByteStream; 
        if (this.cache !== undefined && this.index >= this.cacheStart && this.index + numBytes <= this.cacheEnd) {
            result = new ByteStream(new Uint8Array(this.cache.buffer, this.cache.byteOffset + this.index - this.cacheStart, numBytes));
        } else {
            result = await this.peekBytes(numBytes);
        }
        this.index += numBytes;
        
        // clear cache if index exceeds its bounds
        if (this.cache !== undefined && this.index > this.cacheEnd) {
            this.cache = undefined;
            this.cacheStart = 0;
            this.cacheEnd = 0;
        }

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