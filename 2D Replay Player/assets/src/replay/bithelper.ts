/* exported FileStream */
class FileStream {
    readonly path: string;
    finite: boolean;
    private index: number;

    // NOTE(randomuserhi): If the filestream is finite then when EndOfFile is reached, it will terminate.
    constructor(path: string, finite: boolean = true) {
        this.path = path;
        this.index = 0;
        this.finite = finite;
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
        return new ByteStream(await window.api.invoke("getBytes", this.path, this.index, numBytes, !this.finite));
    }
}

class ByteStream {
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

/* exported BitHelper */
namespace BitHelper {
    export const littleEndian: boolean = (() => {
        const buffer = new ArrayBuffer(2);
        new DataView(buffer).setInt16(0, 256, true /* littleEndian */);
        // Int16Array uses the platform's endianness.
        return new Int16Array(buffer)[0] === 256;
    })();

    export async function readByte(stream: ByteStream | FileStream): Promise<number> {
        if (Object.prototype.isPrototypeOf.call(FileStream.prototype, stream)) {
            stream = stream as FileStream;
            stream = await stream.getBytes(1);
        } else {
            stream = stream as ByteStream;
        }
        return stream.view.getUint8(stream.index++);
    }

    export async function readString(stream: ByteStream | FileStream, length: number): Promise<string> {
        if (Object.prototype.isPrototypeOf.call(FileStream.prototype, stream)) {
            stream = stream as FileStream;
            stream = await stream.getBytes(length);
        } else {
            stream = stream as ByteStream;
        }
        const start = stream.view.byteOffset + stream.index;
        const end = stream.view.byteOffset + (stream.index += length);
        return new TextDecoder().decode(stream.view.buffer.slice(start, end));
    }

    export async function readULong(stream: ByteStream | FileStream): Promise<bigint> {
        const sizeof = 8;
        if (Object.prototype.isPrototypeOf.call(FileStream.prototype, stream)) {
            stream = stream as FileStream;
            stream = await stream.getBytes(sizeof);
        } else {
            stream = stream as ByteStream;
        }
        const index = stream.index;
        stream.index += sizeof;
        return stream.view.getBigUint64(index, BitHelper.littleEndian);
    }
    export async function readUInt(stream: ByteStream | FileStream): Promise<number> {
        const sizeof = 4;
        if (Object.prototype.isPrototypeOf.call(FileStream.prototype, stream)) {
            stream = stream as FileStream;
            stream = await stream.getBytes(sizeof);
        } else {
            stream = stream as ByteStream;
        }
        const index = stream.index;
        stream.index += sizeof;
        return stream.view.getUint32(index, BitHelper.littleEndian);
    }
    export async function readUShort(stream: ByteStream | FileStream): Promise<number> {
        const sizeof = 2;
        if (Object.prototype.isPrototypeOf.call(FileStream.prototype, stream)) {
            stream = stream as FileStream;
            stream = await stream.getBytes(sizeof);
        } else {
            stream = stream as ByteStream;
        }
        const index = stream.index;
        stream.index += sizeof;
        return stream.view.getUint16(index, BitHelper.littleEndian);
    }

    export async function readLong(stream: ByteStream | FileStream): Promise<bigint> {
        const sizeof = 8;
        if (Object.prototype.isPrototypeOf.call(FileStream.prototype, stream)) {
            stream = stream as FileStream;
            stream = await stream.getBytes(sizeof);
        } else {
            stream = stream as ByteStream;
        }
        const index = stream.index;
        stream.index += sizeof;
        return stream.view.getBigInt64(index, BitHelper.littleEndian);
    }
    export async function readInt(stream: ByteStream | FileStream): Promise<number> {
        const sizeof = 4;
        if (Object.prototype.isPrototypeOf.call(FileStream.prototype, stream)) {
            stream = stream as FileStream;
            stream = await stream.getBytes(sizeof);
        } else {
            stream = stream as ByteStream;
        }
        const index = stream.index;
        stream.index += sizeof;
        return stream.view.getInt32(index, BitHelper.littleEndian);
    }
    export async function readShort(stream: ByteStream | FileStream): Promise<number> {
        const sizeof = 2;
        if (Object.prototype.isPrototypeOf.call(FileStream.prototype, stream)) {
            stream = stream as FileStream;
            stream = await stream.getBytes(sizeof);
        } else {
            stream = stream as ByteStream;
        }
        const index = stream.index;
        stream.index += sizeof;
        return stream.view.getInt16(index, BitHelper.littleEndian);
    }

    export async function readHalf(stream: ByteStream | FileStream): Promise<number> {
        const ushort = await BitHelper.readUShort(stream);

        // Create a 32 bit DataView to store the input
        const arr = new ArrayBuffer(4);
        const dv = new DataView(arr);

        // Set the Float16 into the last 16 bits of the dataview
        // So our dataView is [00xx]
        dv.setUint16(2, ushort, false);

        // Get all 32 bits as a 32 bit integer
        // (JS bitwise operations are performed on 32 bit signed integers)
        const asInt32 = dv.getInt32(0, false);

        // All bits aside from the sign
        let rest = asInt32 & 0x7fff;
        // Sign bit
        let sign = asInt32 & 0x8000;
        // Exponent bits
        const exponent = asInt32 & 0x7c00;

        // Shift the non-sign bits into place for a 32 bit Float
        rest <<= 13;
        // Shift the sign bit into place for a 32 bit Float
        sign <<= 16;

        // Adjust bias
        // https://en.wikipedia.org/wiki/Half-precision_floating-point_format#Exponent_encoding
        rest += 0x38000000;
        // Denormals-as-zero
        rest = (exponent === 0 ? 0 : rest);
        // Re-insert sign bit
        rest |= sign;

        // Set the adjusted float32 (stored as int32) back into the dataview
        dv.setInt32(0, rest, false);

        // Get it back out as a float32 (which js will convert to a Number)
        return dv.getFloat32(0, false);
    }
    export async function readFloat(stream: ByteStream | FileStream): Promise<number> {
        const sizeof = 4;
        if (Object.prototype.isPrototypeOf.call(FileStream.prototype, stream)) {
            stream = stream as FileStream;
            stream = await stream.getBytes(sizeof);
        } else {
            stream = stream as ByteStream;
        }
        const index = stream.index;
        stream.index += sizeof;
        return stream.view.getFloat32(index, BitHelper.littleEndian);
    }

    export async function readQuaternion(stream: ByteStream | FileStream): Promise<Quaternion> {
        const i = await BitHelper.readByte(stream);
        let x = 0, y = 0, z = 0, w = 0;
        switch (i) {
        case 0:
            y = await BitHelper.readFloat(stream);
            z = await BitHelper.readFloat(stream);
            w = await BitHelper.readFloat(stream);
            x = await Math.sqrt(Math.clamp01(1 - y * y - z * z - w * w));
            break;
        case 1:
            x = await BitHelper.readFloat(stream);
            z = await BitHelper.readFloat(stream);
            w = await BitHelper.readFloat(stream);
            y = Math.sqrt(Math.clamp01(1 - x * x - z * z - w * w));
            break;
        case 2:
            x = await BitHelper.readFloat(stream);
            y = await BitHelper.readFloat(stream);
            w = await BitHelper.readFloat(stream);
            z = Math.sqrt(Math.clamp01(1 - x * x - y * y - w * w));
            break;
        case 3:
            x = await BitHelper.readFloat(stream);
            y = await BitHelper.readFloat(stream);
            z = await BitHelper.readFloat(stream);
            w = Math.sqrt(Math.clamp01(1 - x * x - y * y - z * z));
            break;
        }
        return { x: x, y: y, z: z, w: w };
    }
    export async function readHalfQuaternion(stream: ByteStream | FileStream): Promise<Quaternion> {
        const i = await BitHelper.readByte(stream);
        let x = 0, y = 0, z = 0, w = 0;
        switch (i) {
        case 0:
            y = await BitHelper.readHalf(stream);
            z = await BitHelper.readHalf(stream);
            w = await BitHelper.readHalf(stream);
            x = Math.sqrt(Math.clamp01(1 - y * y - z * z - w * w));
            break;
        case 1:
            x = await BitHelper.readHalf(stream);
            z = await BitHelper.readHalf(stream);
            w = await BitHelper.readHalf(stream);
            y = Math.sqrt(Math.clamp01(1 - x * x - z * z - w * w));
            break;
        case 2:
            x = await BitHelper.readHalf(stream);
            y = await BitHelper.readHalf(stream);
            w = await BitHelper.readHalf(stream);
            z = Math.sqrt(Math.clamp01(1 - x * x - y * y - w * w));
            break;
        case 3:
            x = await BitHelper.readHalf(stream);
            y = await BitHelper.readHalf(stream);
            z = await BitHelper.readHalf(stream);
            w = Math.sqrt(Math.clamp01(1 - x * x - y * y - z * z));
            break;
        }
        return { x: x, y: y, z: z, w: w };
    }
    export async function readVector(stream: ByteStream | FileStream): Promise<Vector> {
        return { x: await BitHelper.readFloat(stream), y: await BitHelper.readFloat(stream), z: await BitHelper.readFloat(stream) };
    }
    export async function readHalfVector(stream: ByteStream | FileStream): Promise<Vector> {
        return { x: await BitHelper.readHalf(stream), y: await BitHelper.readHalf(stream), z: await BitHelper.readHalf(stream) };
    }

    /*export async function readFloatArray(stream: ByteStream, length: number): Promise<number[]> {
        const array = new Array(length);
        for (let i = 0; i < length; ++i)
            array[i] = await BitHelper.readFloat(stream);
        return array;
    }*/
}