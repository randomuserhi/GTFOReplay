let Reader = function () {
    this.index = 0;
};
let BitHelper = {
    littleEndian: (() => {
        const buffer = new ArrayBuffer(2);
        new DataView(buffer).setInt16(0, 256, true);
        return new Int16Array(buffer)[0] === 256;
    })(),
    readByte: function (buffer, reader) {
        return buffer.getUint8(reader.index++);
    },
    readUInt: function (buffer, reader) {
        let index = reader.index;
        reader.index += 4;
        return buffer.getUint32(index, this.littleEndian);
    },
    readUShort: function (buffer, reader) {
        let index = reader.index;
        reader.index += 2;
        return buffer.getUint16(index, this.littleEndian);
    },
    readFloat: function (buffer, reader) {
        let index = reader.index;
        reader.index += 4;
        return buffer.getFloat32(index, this.littleEndian);
    },
    readHalf: function (buffer, reader) {
        let ushort = this.readUShort(buffer, reader);
        const arr = new ArrayBuffer(4);
        const dv = new DataView(arr);
        dv.setUint16(2, ushort, false);
        const asInt32 = dv.getInt32(0, false);
        let rest = asInt32 & 0x7fff;
        let sign = asInt32 & 0x8000;
        const exponent = asInt32 & 0x7c00;
        rest <<= 13;
        sign <<= 16;
        rest += 0x38000000;
        rest = (exponent === 0 ? 0 : rest);
        rest |= sign;
        dv.setInt32(0, rest, false);
        return dv.getFloat32(0, false);
    },
    readQuaternion: function (buffer, reader) {
        let i = this.readByte(buffer, reader);
        let x = 0, y = 0, z = 0, w = 0;
        switch (i) {
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
        return new THREE.Quaternion(-x, -y, z, w);
    },
    readHalfQuaternion: function (buffer, reader) {
        let i = this.readByte(buffer, reader);
        let x = 0, y = 0, z = 0, w = 0;
        switch (i) {
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
        return new THREE.Quaternion(-x, -y, z, w);
    },
    readVector: function (buffer, reader) {
        return new THREE.Vector3(-this.readFloat(buffer, reader), this.readFloat(buffer, reader), this.readFloat(buffer, reader));
    },
    readHalfVector: function (buffer, reader) {
        return new THREE.Vector3(-this.readHalf(buffer, reader), this.readHalf(buffer, reader), this.readHalf(buffer, reader));
    },
    readUShortArray: function (buffer, reader, length) {
        let array = new Array(length);
        for (let i = 0; i < length; ++i)
            array[i] = this.readUShort(buffer, reader);
        return array;
    },
    readFloatArray: function (buffer, reader, length) {
        let array = new Array(length);
        for (let i = 0; i < length; ++i)
            array[i] = this.readFloat(buffer, reader);
        return array;
    },
    readVectorArray: function (buffer, reader, length) {
        let array = new Array(length * 3);
        for (let i = 0; i < length * 3;) {
            array[i++] = -this.readFloat(buffer, reader);
            array[i++] = this.readFloat(buffer, reader);
            array[i++] = this.readFloat(buffer, reader);
        }
        return array;
    }
};
