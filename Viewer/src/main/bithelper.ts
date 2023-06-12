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
    readUInt(buffer: DataView, reader: Reader): number;
    readUShort(buffer: DataView, reader: Reader): number;
    readFloat(buffer: DataView, reader: Reader): number;
    readHalf(buffer: DataView, reader: Reader): number;
    
    readQuaternion(buffer: DataView, reader: Reader): THREE.Quaternion;
    readHalfQuaternion(buffer: DataView, reader: Reader): THREE.Quaternion;
    readVector(buffer: DataView, reader: Reader): THREE.Vector3;
    readHalfVector(buffer: DataView, reader: Reader): THREE.Vector3;

    readUShortArray(buffer: DataView, reader: Reader, length: number): number[];
    readFloatArray(buffer: DataView, reader: Reader, length: number): number[];
    readVectorArray(buffer: DataView, reader: Reader, length: number): number[];
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
    // TODO(randomuserhi): Need to check if these unsigned operations actually work as intended
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
    readQuaternion: function(buffer: DataView, reader: Reader): THREE.Quaternion
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
        // NOTE(randomuserhi): Unity uses Left hand coordinate system, whilst ThreeJS uses Right hand coordinate system
        // angle x, axis y,z,w => convert axis from unity left hand to right hand and then
        // negate angle
        return new THREE.Quaternion(-x, -y, z, w);
    },
    readHalfQuaternion: function(buffer: DataView, reader: Reader): THREE.Quaternion
    {
        let i = this.readByte(buffer, reader);
        let x = 0, y = 0, z = 0, w = 0;
        switch (i)
        {
            case 0:
                y = this.readHalf(buffer, reader);
                z = this.readHalf(buffer, reader);
                w = this.readHalf(buffer, reader);
                x = Math.sqrt(1 - y * y - z * z - w * w);
                break;
            case 1:
                x = this.readHalf(buffer, reader);
                z = this.readHalf(buffer, reader);
                w = this.readHalf(buffer, reader);
                y = Math.sqrt(1 - x * x - z * z - w * w);
                break;
            case 2:
                x = this.readHalf(buffer, reader);
                y = this.readHalf(buffer, reader);
                w = this.readHalf(buffer, reader);
                z = Math.sqrt(1 - x * x - y * y - w * w);
                break;
            case 3:
                x = this.readHalf(buffer, reader);
                y = this.readHalf(buffer, reader);
                z = this.readHalf(buffer, reader);
                w = Math.sqrt(1 - x * x - y * y - z * z);
                break;
        }
        // NOTE(randomuserhi): Unity uses Left hand coordinate system, whilst ThreeJS uses Right hand coordinate system
        // angle x, axis y,z,w => convert axis from unity left hand to right hand and then
        // negate angle
        return new THREE.Quaternion(-x, -y, z, w);
    },
    readVector: function(buffer: DataView, reader: Reader): THREE.Vector3
    {
        // NOTE(randomuserhi): Unity uses Left hand coordinate system, whilst ThreeJS uses Right hand coordinate system
        //                     thus the x value needs to be inverted to convert between the 2 coordinate systems
        return new THREE.Vector3(-this.readFloat(buffer, reader), this.readFloat(buffer, reader), this.readFloat(buffer, reader));
    },
    readHalfVector: function(buffer: DataView, reader: Reader): THREE.Vector3
    {
        // NOTE(randomuserhi): Unity uses Left hand coordinate system, whilst ThreeJS uses Right hand coordinate system
        //                     thus the x value needs to be inverted to convert between the 2 coordinate systems
        return new THREE.Vector3(-this.readHalf(buffer, reader), this.readHalf(buffer, reader), this.readHalf(buffer, reader));
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
    readVectorArray: function(buffer: DataView, reader: Reader, length: number): number[]
    {
        let array = new Array(length * 3);
        for (let i = 0; i < length * 3;)
        {
            // NOTE(randomuserhi): Unity uses Left hand coordinate system, whilst ThreeJS uses Right hand coordinate system
            //                     thus the x value needs to be inverted to convert between the 2 coordinate systems
            array[i++] = -this.readFloat(buffer, reader);
            array[i++] = this.readFloat(buffer, reader);
            array[i++] = this.readFloat(buffer, reader);
        }
        return array;
    }
};