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
    ReadByte(buffer: Uint8Array, reader: Reader): number;
    ReadUInt(buffer: Uint8Array, reader: Reader): number;
    ReadUShort(buffer: Uint8Array, reader: Reader): number;
}

let Reader: ReaderConstructor = function(this: Reader)
{
    this.index = 0;
} as Function as ReaderConstructor;

let BitHelper: BitHelper = {
    ReadByte: function(buffer: Uint8Array , reader: Reader): number
    {
        return buffer[reader.index++];
    },
    // TODO(randomuserhi): Need to check if these unsigned operations actually work as intended
    ReadUInt: function(buffer: Uint8Array , reader: Reader): number
    {
        return (buffer[reader.index++] << 0) | 
            (buffer[reader.index++] << 8) |
            (buffer[reader.index++] << 16) |
            (buffer[reader.index++] << 24);
    },
    ReadUShort: function(buffer: Uint8Array , reader: Reader): number
    {
        return (buffer[reader.index++] << 0) | 
            (buffer[reader.index++] << 8);
    }
};