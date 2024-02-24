class Reader {
    index: number;

    constructor(index: number) {
        this.index = index;
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

    export function readByte(buffer: DataView, reader: Reader): number {
        return buffer.getUint8(reader.index++);
    }

    export function readString(buffer: DataView, reader: Reader): string {
        const length = BitHelper.readUShort(buffer, reader);
        return new TextDecoder().decode(buffer.buffer.slice(reader.index, reader.index += length));
    }

    export function readULong(buffer: DataView, reader: Reader): bigint {
        const index = reader.index;
        reader.index += 8;
        return buffer.getBigUint64(index, BitHelper.littleEndian);
    }
    export function readUInt(buffer: DataView, reader: Reader): number {
        const index = reader.index;
        reader.index += 4;
        return buffer.getUint32(index, BitHelper.littleEndian);
    }
    export function readUShort(buffer: DataView, reader: Reader): number {
        const index = reader.index;
        reader.index += 2;
        return buffer.getUint16(index, BitHelper.littleEndian);
    }

    export function readLong(buffer: DataView, reader: Reader): bigint {
        const index = reader.index;
        reader.index += 8;
        return buffer.getBigInt64(index, BitHelper.littleEndian);
    }
    export function readInt(buffer: DataView, reader: Reader): number {
        const index = reader.index;
        reader.index += 4;
        return buffer.getInt32(index, BitHelper.littleEndian);
    }
    export function readShort(buffer: DataView, reader: Reader): number {
        const index = reader.index;
        reader.index += 2;
        return buffer.getInt16(index, BitHelper.littleEndian);
    }

    export function readHalf(buffer: DataView, reader: Reader): number {
        const ushort = BitHelper.readUShort(buffer, reader);

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
    export function readFloat(buffer: DataView, reader: Reader): number {
        const index = reader.index;
        reader.index += 4;
        return buffer.getFloat32(index, BitHelper.littleEndian);
    }

    export function readQuaternion(buffer: DataView, reader: Reader): Quaternion {
        const i = BitHelper.readByte(buffer, reader);
        let x = 0, y = 0, z = 0, w = 0;
        switch (i) {
        case 0:
            y = BitHelper.readFloat(buffer, reader);
            z = BitHelper.readFloat(buffer, reader);
            w = BitHelper.readFloat(buffer, reader);
            x = Math.sqrt(Math.clamp01(1 - y * y - z * z - w * w));
            break;
        case 1:
            x = BitHelper.readFloat(buffer, reader);
            z = BitHelper.readFloat(buffer, reader);
            w = BitHelper.readFloat(buffer, reader);
            y = Math.sqrt(Math.clamp01(1 - x * x - z * z - w * w));
            break;
        case 2:
            x = BitHelper.readFloat(buffer, reader);
            y = BitHelper.readFloat(buffer, reader);
            w = BitHelper.readFloat(buffer, reader);
            z = Math.sqrt(Math.clamp01(1 - x * x - y * y - w * w));
            break;
        case 3:
            x = BitHelper.readFloat(buffer, reader);
            y = BitHelper.readFloat(buffer, reader);
            z = BitHelper.readFloat(buffer, reader);
            w = Math.sqrt(Math.clamp01(1 - x * x - y * y - z * z));
            break;
        }
        return { x: x, y: y, z: z, w: w };
    }
    export function readHalfQuaternion(buffer: DataView, reader: Reader): Quaternion {
        const i = BitHelper.readByte(buffer, reader);
        let x = 0, y = 0, z = 0, w = 0;
        switch (i) {
        case 0:
            y = BitHelper.readHalf(buffer, reader);
            z = BitHelper.readHalf(buffer, reader);
            w = BitHelper.readHalf(buffer, reader);
            x = Math.sqrt(Math.clamp01(1 - y * y - z * z - w * w));
            break;
        case 1:
            x = BitHelper.readHalf(buffer, reader);
            z = BitHelper.readHalf(buffer, reader);
            w = BitHelper.readHalf(buffer, reader);
            y = Math.sqrt(Math.clamp01(1 - x * x - z * z - w * w));
            break;
        case 2:
            x = BitHelper.readHalf(buffer, reader);
            y = BitHelper.readHalf(buffer, reader);
            w = BitHelper.readHalf(buffer, reader);
            z = Math.sqrt(Math.clamp01(1 - x * x - y * y - w * w));
            break;
        case 3:
            x = BitHelper.readHalf(buffer, reader);
            y = BitHelper.readHalf(buffer, reader);
            z = BitHelper.readHalf(buffer, reader);
            w = Math.sqrt(Math.clamp01(1 - x * x - y * y - z * z));
            break;
        }
        return { x: x, y: y, z: z, w: w };
    }
    export function readVector(buffer: DataView, reader: Reader): Vector {
        return { x: BitHelper.readFloat(buffer, reader), y: BitHelper.readFloat(buffer, reader), z: BitHelper.readFloat(buffer, reader) };
    }
    export function readHalfVector(buffer: DataView, reader: Reader): Vector {
        return { x: BitHelper.readHalf(buffer, reader), y: BitHelper.readHalf(buffer, reader), z: BitHelper.readHalf(buffer, reader) };
    }

    export function readUShortArray(buffer: DataView, reader: Reader, length: number): number[] {
        const array = new Array(length);
        for (let i = 0; i < length; ++i)
            array[i] = BitHelper.readUShort(buffer, reader);
        return array;
    }
    export function readFloatArray(buffer: DataView, reader: Reader, length: number): number[] {
        const array = new Array(length);
        for (let i = 0; i < length; ++i)
            array[i] = BitHelper.readFloat(buffer, reader);
        return array;
    }
    export function readVectorArray(buffer: DataView, reader: Reader, length: number): Vector[] {
        const array = new Array<Vector>(length);
        for (let i = 0; i < length; ++i) {
            array[i] = BitHelper.readVector(buffer, reader);
        }
        return array;
    }
}