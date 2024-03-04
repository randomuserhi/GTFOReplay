import { Quaternion, Vector } from "./pod.js";
import { ByteStream, FileStream } from "./stream.js";

declare global {
    interface Math {
        clamp(value: number, min: number, max: number): number;
        clamp01(value: number): number;
    }
}

Math.clamp = function (value, min, max) {
    return Math.min(max, Math.max(value, min));
};
Math.clamp01 = function (value) {
    return Math.clamp(value, 0, 1);
};

export const littleEndian: boolean = (() => {
    const buffer = new ArrayBuffer(2);
    new DataView(buffer).setInt16(0, 256, true /* littleEndian */);
    // Int16Array uses the platform's endianness.
    return new Int16Array(buffer)[0] === 256;
})();

export type Type = "byte" | "ushort" | "uint" | "ulong" | "short" | "int" | "long" | "float" | "single" | "half" | "vector" | "halfVector" | "quaternion" | "halfQuaternion";
export function sizeof(type: Type): number {
    switch(type) {
    case "byte": return 1;
    case "short":
    case "ushort": 
    case "half": return 2;
    case "int":
    case "uint": 
    case "float":
    case "single": return 4;
    case "long":
    case "ulong": return 8;
    case "vector": return 12;
    case "halfVector": return 6;
    case "quaternion": return 16;
    case "halfQuaternion": return 8;
    default: throw new Error("Invalid type.");
    }
}

export async function readByte(stream: ByteStream | FileStream): Promise<number> {
    if (stream instanceof FileStream) {
        stream = await stream.getBytes(1);
    } else {
        stream = stream as ByteStream;
    }
    return stream.view.getUint8(stream.index++);
}

export async function readString(stream: ByteStream | FileStream, length?: number): Promise<string> {
    if (length === undefined) length = await readUShort(stream);
    if (stream instanceof FileStream) {
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
    if (stream instanceof FileStream) {
        stream = await stream.getBytes(sizeof);
    } else {
        stream = stream as ByteStream;
    }
    const index = stream.index;
    stream.index += sizeof;
    return stream.view.getBigUint64(index, littleEndian);
}
export async function readUInt(stream: ByteStream | FileStream): Promise<number> {
    const sizeof = 4;
    if (stream instanceof FileStream) {
        stream = await stream.getBytes(sizeof);
    } else {
        stream = stream as ByteStream;
    }
    const index = stream.index;
    stream.index += sizeof;
    return stream.view.getUint32(index, littleEndian);
}
export async function readUShort(stream: ByteStream | FileStream): Promise<number> {
    const sizeof = 2;
    if (stream instanceof FileStream) {
        stream = await stream.getBytes(sizeof);
    } else {
        stream = stream as ByteStream;
    }
    const index = stream.index;
    stream.index += sizeof;
    return stream.view.getUint16(index, littleEndian);
}

export async function readLong(stream: ByteStream | FileStream): Promise<bigint> {
    const sizeof = 8;
    if (stream instanceof FileStream) {
        stream = await stream.getBytes(sizeof);
    } else {
        stream = stream as ByteStream;
    }
    const index = stream.index;
    stream.index += sizeof;
    return stream.view.getBigInt64(index, littleEndian);
}
export async function readInt(stream: ByteStream | FileStream): Promise<number> {
    const sizeof = 4;
    if (stream instanceof FileStream) {
        stream = await stream.getBytes(sizeof);
    } else {
        stream = stream as ByteStream;
    }
    const index = stream.index;
    stream.index += sizeof;
    return stream.view.getInt32(index, littleEndian);
}
export async function readShort(stream: ByteStream | FileStream): Promise<number> {
    const sizeof = 2;
    if (stream instanceof FileStream) {
        stream = await stream.getBytes(sizeof);
    } else {
        stream = stream as ByteStream;
    }
    const index = stream.index;
    stream.index += sizeof;
    return stream.view.getInt16(index, littleEndian);
}

export async function readHalf(stream: ByteStream | FileStream): Promise<number> {
    const ushort = await readUShort(stream);

    // Create a 32 bit DataView to store the input
    const arr = new ArrayBuffer(4);
    const dv = new DataView(arr);

    // Set the Float16 into the last 16 bits of the dataview
    // So our dataView is [00xx]
    dv.setUint16(2, ushort);

    // Get all 32 bits as a 32 bit integer
    // (JS bitwise operations are performed on 32 bit signed integers)
    const asInt32 = dv.getInt32(0);

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
    dv.setInt32(0, rest);

    // Get it back out as a float32 (which js will convert to a Number)
    return dv.getFloat32(0);
}
export async function readFloat(stream: ByteStream | FileStream): Promise<number> {
    const sizeof = 4;
    if (stream instanceof FileStream) {
        stream = await stream.getBytes(sizeof);
    } else {
        stream = stream as ByteStream;
    }
    const index = stream.index;
    stream.index += sizeof;
    return stream.view.getFloat32(index, littleEndian);
}

export async function readQuaternion(stream: ByteStream | FileStream): Promise<Quaternion> {
    const i = await readByte(stream);
    let x = 0, y = 0, z = 0, w = 0;
    switch (i) {
    case 0:
        y = await readFloat(stream);
        z = await readFloat(stream);
        w = await readFloat(stream);
        x = await Math.sqrt(Math.clamp01(1 - y * y - z * z - w * w));
        break;
    case 1:
        x = await readFloat(stream);
        z = await readFloat(stream);
        w = await readFloat(stream);
        y = Math.sqrt(Math.clamp01(1 - x * x - z * z - w * w));
        break;
    case 2:
        x = await readFloat(stream);
        y = await readFloat(stream);
        w = await readFloat(stream);
        z = Math.sqrt(Math.clamp01(1 - x * x - y * y - w * w));
        break;
    case 3:
        x = await readFloat(stream);
        y = await readFloat(stream);
        z = await readFloat(stream);
        w = Math.sqrt(Math.clamp01(1 - x * x - y * y - z * z));
        break;
    }
    return { x: x, y: -y, z: -z, w: w };
}
export async function readHalfQuaternion(stream: ByteStream | FileStream): Promise<Quaternion> {
    const i = await readByte(stream);
    let x = 0, y = 0, z = 0, w = 0;
    switch (i) {
    case 0:
        y = await readHalf(stream);
        z = await readHalf(stream);
        w = await readHalf(stream);
        x = Math.sqrt(Math.clamp01(1 - y * y - z * z - w * w));
        break;
    case 1:
        x = await readHalf(stream);
        z = await readHalf(stream);
        w = await readHalf(stream);
        y = Math.sqrt(Math.clamp01(1 - x * x - z * z - w * w));
        break;
    case 2:
        x = await readHalf(stream);
        y = await readHalf(stream);
        w = await readHalf(stream);
        z = Math.sqrt(Math.clamp01(1 - x * x - y * y - w * w));
        break;
    case 3:
        x = await readHalf(stream);
        y = await readHalf(stream);
        z = await readHalf(stream);
        w = Math.sqrt(Math.clamp01(1 - x * x - y * y - z * z));
        break;
    }
    return { x: x, y: -y, z: -z, w: w };
}
export async function readVector(stream: ByteStream | FileStream): Promise<Vector> {
    return { x: -await readFloat(stream), y: await readFloat(stream), z: await readFloat(stream) };
}
export async function readHalfVector(stream: ByteStream | FileStream): Promise<Vector> {
    return { x: -await readHalf(stream), y: await readHalf(stream), z: await readHalf(stream) };
}

export async function readUShortArray(stream: ByteStream | FileStream, length: number): Promise<number[]> {
    const array = new Array(length);
    for (let i = 0; i < length; ++i)
        array[i] = await readUShort(stream);
    return array;
}
export async function readVectorArray(stream: ByteStream | FileStream, length: number): Promise<Vector[]> {
    const array = new Array<Vector>(length);
    for (let i = 0; i < length; ++i) {
        array[i] = await readVector(stream);
    }
    return array;
}
export async function readVectorArrayAsFloat32(stream: ByteStream | FileStream, length: number): Promise<Float32Array> {
    length *= 3;
    const array = new Array<number>(length);
    for (let i = 0; i < length;) {
        array[i++] = -await readFloat(stream);
        array[i++] = await readFloat(stream);
        array[i++] = await readFloat(stream);
    }
    return new Float32Array(array);
}
export async function readFloat32Array(stream: ByteStream | FileStream, length: number): Promise<Float32Array> {
    const array = new Array<number>(length);
    for (let i = 0; i < length; ++i) {
        array[i] = await readFloat(stream);
    }
    return new Float32Array(array);
}

function reserve(numBytes: number, stream: ByteStream) {
    const size = stream.index + numBytes;
    let capacity = stream.view.byteLength;
    while (size > capacity) {
        capacity *= 2;
    }
    if (capacity !== stream.view.byteLength) {
        const newBuffer = new Uint8Array(capacity);
        newBuffer.set(stream.bytes);
        stream.assign(newBuffer);
    }
}

export async function writeByte(byte: number, stream: ByteStream) {
    if (byte < 0 || byte > 255) throw new TypeError("Value is not of type 'byte'.");
    const sizeof = 1;
    reserve(sizeof, stream);
    stream.view.setUint8(stream.index, byte);
    stream.index += sizeof;
}

export async function writeBytes(bytes: Uint8Array, stream: ByteStream) {
    writeUShort(bytes.byteLength, stream);
    reserve(bytes.byteLength, stream);
    for (let i = 0; i < bytes.byteLength; ++i) {
        writeByte(bytes[i], stream);
    }
}

const textEncoder = new TextEncoder();
export async function writeString(message: string, stream: ByteStream) {
    writeBytes(textEncoder.encode(message), stream);
}

export async function writeULong(ulong: bigint, stream: ByteStream) {
    const sizeof = 8;
    reserve(sizeof, stream);
    stream.view.setBigUint64(stream.index, ulong);
    stream.index += sizeof;
}
export async function writeUInt(uint: number, stream: ByteStream) {
    const sizeof = 4;
    reserve(sizeof, stream);
    stream.view.setUint32(stream.index, uint);
    stream.index += sizeof;
}
export async function writeUShort(ushort: number, stream: ByteStream) {
    if (ushort < 0 || ushort > 65535) throw new TypeError("Value is not of type 'ushort'.");
    const sizeof = 2;
    reserve(sizeof, stream);
    stream.view.setUint16(stream.index, ushort);
    stream.index += sizeof;
}

export async function writeLong(long: bigint, stream: ByteStream) {
    const sizeof = 8;
    reserve(sizeof, stream);
    stream.view.setBigInt64(stream.index, long);
    stream.index += sizeof;
}
export async function writeInt(int: number, stream: ByteStream) {
    const sizeof = 4;
    reserve(sizeof, stream);
    stream.view.setInt32(stream.index, int);
    stream.index += sizeof;
}
export async function writeShort(short: number, stream: ByteStream) {
    if (short < 0 || short > 65535) throw new TypeError("Value is not of type 'short'.");
    const sizeof = 2;
    reserve(sizeof, stream);
    stream.view.setInt16(stream.index, short);
    stream.index += sizeof;
}

function ToInt(expr: boolean) {
    return expr ? 1 : 0;
}

export async function writeHalf(float: number, stream: ByteStream) {
    // Create a 32 bit DataView to store the input
    const arr = new ArrayBuffer(4);
    const dv = new DataView(arr);
    dv.setFloat32(0, float);
    const uint = dv.getUint32(0);

    const b = uint + 0x00001000; // round-to-nearest-even: add last bit after truncated mantissa
    const e = (b & 0x7F800000) >> 23; // exponent
    const m = b & 0x007FFFFF; // mantissa; in line below: 0x007FF000 = 0x00800000-0x00001000 = decimal indicator flag - initial rounding

    writeUShort((b & 0x80000000) >> 16 | ToInt(e > 112) * ((((e - 112) << 10) & 0x7C00) | m >> 13) | (ToInt(e < 113) & ToInt(e > 101)) * ((((0x007FF000 + m) >> (125 - e)) + 1) >> 1) | ToInt(e > 143) * 0x7FFF, stream);
}
export async function writeFloat(float: number, stream: ByteStream) {
    const sizeof = 4;
    reserve(sizeof, stream);
    stream.view.setFloat32(stream.index, float);
    stream.index += sizeof;
}