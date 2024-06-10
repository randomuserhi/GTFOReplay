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