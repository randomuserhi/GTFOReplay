interface Reader
{
    index: number;
}
interface ReaderConstructor
{
    new(): Reader;
    prototype: Reader;
}

interface BitHelper
{
    readonly littleEndian: boolean;
    readByte(buffer: DataView, reader: Reader): number;

    readString(buffer: DataView, reader: Reader): string;

    readULong(buffer: DataView, reader: Reader): bigint;
    readUInt(buffer: DataView, reader: Reader): number;
    readUShort(buffer: DataView, reader: Reader): number;

    readLong(buffer: DataView, reader: Reader): bigint;
    readInt(buffer: DataView, reader: Reader): number;
    
    readHalf(buffer: DataView, reader: Reader): number;
    readFloat(buffer: DataView, reader: Reader): number;
    
    readQuaternion(buffer: DataView, reader: Reader): Quaternion;
    readHalfQuaternion(buffer: DataView, reader: Reader): Quaternion;
    readVector(buffer: DataView, reader: Reader): Vector;
    readHalfVector(buffer: DataView, reader: Reader): Vector;

    readUShortArray(buffer: DataView, reader: Reader, length: number): number[];
    readFloatArray(buffer: DataView, reader: Reader, length: number): number[];
    readVectorArray(buffer: DataView, reader: Reader, length: number): Vector[];
}

let Reader: ReaderConstructor = function(this: Reader)
{
    this.index = 0;
} as Function as ReaderConstructor;

// TODO(randomuserhi): All endian reversal features need testing
let BitHelper: BitHelper = {
    littleEndian: (() => {
        const buffer = new ArrayBuffer(2);
        new DataView(buffer).setInt16(0, 256, true /* littleEndian */);
        // Int16Array uses the platform's endianness.
        return new Int16Array(buffer)[0] === 256;
    })(),
    readByte: function(buffer: DataView , reader: Reader): number
    {
        return buffer.getUint8(reader.index++);
    },
    readString: function(buffer: DataView, reader: Reader): string
    {
        let length = BitHelper.readUShort(buffer, reader);
        return new TextDecoder().decode(buffer.buffer.slice(reader.index, reader.index += length));
    },
    // TODO(randomuserhi): Need to check if these unsigned operations actually work as intended
    readLong: function(buffer: DataView, reader: Reader): bigint
    {
        let index = reader.index;
        reader.index += 8;
        return buffer.getBigInt64(index, this.littleEndian);
    },
    readInt: function(buffer: DataView , reader: Reader): number
    {
        let index = reader.index;
        reader.index += 4;
        return buffer.getInt32(index, this.littleEndian);
    },
    readULong: function(buffer: DataView , reader: Reader): bigint
    {
        let index = reader.index;
        reader.index += 8;
        return buffer.getBigUint64(index, this.littleEndian);
    },
    readUInt: function(buffer: DataView , reader: Reader): number
    {
        let index = reader.index;
        reader.index += 4;
        return buffer.getUint32(index, this.littleEndian);
    },
    readUShort: function(buffer: DataView, reader: Reader): number
    {
        let index = reader.index;
        reader.index += 2;
        return buffer.getUint16(index, this.littleEndian);
    },
    readFloat: function(buffer: DataView, reader: Reader): number
    {
        let index = reader.index;
        reader.index += 4;
        return buffer.getFloat32(index, this.littleEndian);
    },
    readHalf: function(buffer: DataView, reader: Reader): number
    {
        let ushort = this.readUShort(buffer, reader);

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
    },
    readQuaternion: function(buffer: DataView, reader: Reader): Quaternion
    {
        let i = this.readByte(buffer, reader);
        let x = 0, y = 0, z = 0, w = 0;
        switch (i)
        {
            case 0:
                y = this.readFloat(buffer, reader);
                z = this.readFloat(buffer, reader);
                w = this.readFloat(buffer, reader);
                x = Math.sqrt(1 - y * y - z * z - w * w);
                break;
            case 1:
                x = this.readFloat(buffer, reader);
                z = this.readFloat(buffer, reader);
                w = this.readFloat(buffer, reader);
                y = Math.sqrt(1 - x * x - z * z - w * w);
                break;
            case 2:
                x = this.readFloat(buffer, reader);
                y = this.readFloat(buffer, reader);
                w = this.readFloat(buffer, reader);
                z = Math.sqrt(1 - x * x - y * y - w * w);
                break;
            case 3:
                x = this.readFloat(buffer, reader);
                y = this.readFloat(buffer, reader);
                z = this.readFloat(buffer, reader);
                w = Math.sqrt(1 - x * x - y * y - z * z);
                break;
        }
        return { x: x, y: y, z: z, w: w };
    },
    readHalfQuaternion: function(buffer: DataView, reader: Reader): Quaternion
    {
        let i = this.readByte(buffer, reader);
        let x = 0, y = 0, z = 0, w = 0, _temp;
        switch (i)
        {
            case 0:
                y = this.readHalf(buffer, reader);
                z = this.readHalf(buffer, reader);
                w = this.readHalf(buffer, reader);
                _temp = 1 - y * y - z * z - w * w;
                // NOTE(randomuserhi): clamp to prevent issue due to inaccuracy in 16-bit floats causing vector to not be normalized
                _temp = _temp < 0 ? 0 : _temp > 1 ? 1 : _temp;
                x = Math.sqrt(_temp);
                break;
            case 1:
                x = this.readHalf(buffer, reader);
                z = this.readHalf(buffer, reader);
                w = this.readHalf(buffer, reader);
                _temp = 1 - y * y - z * z - w * w;
                // NOTE(randomuserhi): clamp to prevent issue due to inaccuracy in 16-bit floats causing vector to not be normalized
                _temp = _temp < 0 ? 0 : _temp > 1 ? 1 : _temp;
                y = Math.sqrt(_temp);
                break;
            case 2:
                x = this.readHalf(buffer, reader);
                y = this.readHalf(buffer, reader);
                w = this.readHalf(buffer, reader);
                _temp = 1 - y * y - z * z - w * w;
                // NOTE(randomuserhi): clamp to prevent issue due to inaccuracy in 16-bit floats causing vector to not be normalized
                _temp = _temp < 0 ? 0 : _temp > 1 ? 1 : _temp;
                z = Math.sqrt(_temp);
                break;
            case 3:
                x = this.readHalf(buffer, reader);
                y = this.readHalf(buffer, reader);
                z = this.readHalf(buffer, reader);
                _temp = 1 - y * y - z * z - w * w;
                // NOTE(randomuserhi): clamp to prevent issue due to inaccuracy in 16-bit floats causing vector to not be normalized
                _temp = _temp < 0 ? 0 : _temp > 1 ? 1 : _temp;
                w = Math.sqrt(_temp);
                break;
        }
        return { x: x, y: y, z: z, w: w };
    },
    readVector: function(buffer: DataView, reader: Reader): Vector
    {
        return { x: this.readFloat(buffer, reader), y: this.readFloat(buffer, reader), z: this.readFloat(buffer, reader) };
    },
    readHalfVector: function(buffer: DataView, reader: Reader): Vector
    {
        return { x: this.readHalf(buffer, reader), y: this.readHalf(buffer, reader), z: this.readHalf(buffer, reader) };
    },
    readUShortArray: function(buffer: DataView, reader: Reader, length: number): number[]
    {
        let array = new Array(length);
        for (let i = 0; i < length; ++i)
            array[i] = this.readUShort(buffer, reader);
        return array;
    },
    readFloatArray: function(buffer: DataView, reader: Reader, length: number): number[]
    {
        let array = new Array(length);
        for (let i = 0; i < length; ++i)
            array[i] = this.readFloat(buffer, reader);
        return array;
    },
    readVectorArray: function(buffer: DataView, reader: Reader, length: number): Vector[]
    {
        let array = new Array(length);
        for (let i = 0; i < length; ++i)
        {
            array[i] = { x: this.readFloat(buffer, reader), y: this.readFloat(buffer, reader), z: this.readFloat(buffer, reader) };
        }
        return array;
    }
};