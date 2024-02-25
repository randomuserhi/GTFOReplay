class ByteStream {
    index: number;
    view: DataView;

    constructor(bytes: Uint8Array) {
        this.index = 0;
        this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
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

    export function readByte(stream: ByteStream): number {
        return stream.view.getUint8(stream.index++);
    }

    export function readString(stream: ByteStream, length: number): string {
        return new TextDecoder().decode(stream.view.buffer.slice(stream.index, stream.index += length));
    }

    export function readULong(stream: ByteStream): bigint {
        const index = stream.index;
        stream.index += 8;
        return stream.view.getBigUint64(index, BitHelper.littleEndian);
    }
    export function readUInt(stream: ByteStream): number {
        const index = stream.index;
        stream.index += 4;
        return stream.view.getUint32(index, BitHelper.littleEndian);
    }
    export function readUShort(stream: ByteStream): number {
        const index = stream.index;
        stream.index += 2;
        return stream.view.getUint16(index, BitHelper.littleEndian);
    }

    export function readLong(stream: ByteStream): bigint {
        const index = stream.index;
        stream.index += 8;
        return stream.view.getBigInt64(index, BitHelper.littleEndian);
    }
    export function readInt(stream: ByteStream): number {
        const index = stream.index;
        stream.index += 4;
        return stream.view.getInt32(index, BitHelper.littleEndian);
    }
    export function readShort(stream: ByteStream): number {
        const index = stream.index;
        stream.index += 2;
        return stream.view.getInt16(index, BitHelper.littleEndian);
    }

    export function readHalf(stream: ByteStream): number {
        const ushort = BitHelper.readUShort(stream);

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
    export function readFloat(stream: ByteStream): number {
        const index = stream.index;
        stream.index += 4;
        return stream.view.getFloat32(index, BitHelper.littleEndian);
    }

    export function readQuaternion(stream: ByteStream): Quaternion {
        const i = BitHelper.readByte(stream);
        let x = 0, y = 0, z = 0, w = 0;
        switch (i) {
        case 0:
            y = BitHelper.readFloat(stream);
            z = BitHelper.readFloat(stream);
            w = BitHelper.readFloat(stream);
            x = Math.sqrt(Math.clamp01(1 - y * y - z * z - w * w));
            break;
        case 1:
            x = BitHelper.readFloat(stream);
            z = BitHelper.readFloat(stream);
            w = BitHelper.readFloat(stream);
            y = Math.sqrt(Math.clamp01(1 - x * x - z * z - w * w));
            break;
        case 2:
            x = BitHelper.readFloat(stream);
            y = BitHelper.readFloat(stream);
            w = BitHelper.readFloat(stream);
            z = Math.sqrt(Math.clamp01(1 - x * x - y * y - w * w));
            break;
        case 3:
            x = BitHelper.readFloat(stream);
            y = BitHelper.readFloat(stream);
            z = BitHelper.readFloat(stream);
            w = Math.sqrt(Math.clamp01(1 - x * x - y * y - z * z));
            break;
        }
        return { x: x, y: y, z: z, w: w };
    }
    export function readHalfQuaternion(stream: ByteStream): Quaternion {
        const i = BitHelper.readByte(stream);
        let x = 0, y = 0, z = 0, w = 0;
        switch (i) {
        case 0:
            y = BitHelper.readHalf(stream);
            z = BitHelper.readHalf(stream);
            w = BitHelper.readHalf(stream);
            x = Math.sqrt(Math.clamp01(1 - y * y - z * z - w * w));
            break;
        case 1:
            x = BitHelper.readHalf(stream);
            z = BitHelper.readHalf(stream);
            w = BitHelper.readHalf(stream);
            y = Math.sqrt(Math.clamp01(1 - x * x - z * z - w * w));
            break;
        case 2:
            x = BitHelper.readHalf(stream);
            y = BitHelper.readHalf(stream);
            w = BitHelper.readHalf(stream);
            z = Math.sqrt(Math.clamp01(1 - x * x - y * y - w * w));
            break;
        case 3:
            x = BitHelper.readHalf(stream);
            y = BitHelper.readHalf(stream);
            z = BitHelper.readHalf(stream);
            w = Math.sqrt(Math.clamp01(1 - x * x - y * y - z * z));
            break;
        }
        return { x: x, y: y, z: z, w: w };
    }
    export function readVector(stream: ByteStream): Vector {
        return { x: BitHelper.readFloat(stream), y: BitHelper.readFloat(stream), z: BitHelper.readFloat(stream) };
    }
    export function readHalfVector(stream: ByteStream): Vector {
        return { x: BitHelper.readHalf(stream), y: BitHelper.readHalf(stream), z: BitHelper.readHalf(stream) };
    }

    /*export function readFloatArray(stream: ByteStream, length: number): number[] {
        const array = new Array(length);
        for (let i = 0; i < length; ++i)
            array[i] = BitHelper.readFloat(stream);
        return array;
    }*/
}