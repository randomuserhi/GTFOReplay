/* exported Replay */
class Replay {
    readonly path: string;
    private index: number;

    constructor(path: string) {
        this.path = path;
        this.index = 0;
    }

    public open(): Promise<void> {
        return window.api.invoke("open", this.path);
    }

    public close(): void {
        window.api.send("close", this.path);
    }

    public async getBytes(numBytes: number): Promise<ByteStream> {
        const result = await this.peekBytes(numBytes);
        this.index += numBytes;
        return result;
    }

    public async peekBytes(numBytes: number): Promise<ByteStream> {
        return new ByteStream(await window.api.invoke("getBytes", this.path, this.index, numBytes));
    }
}