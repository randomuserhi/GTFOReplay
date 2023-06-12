let Reader = function () {
    this.index = 0;
};
let BitHelper = {
    ReadByte: function (buffer, reader) {
        return buffer[reader.index++];
    },
    ReadUInt: function (buffer, reader) {
        return (buffer[reader.index++] << 24) |
            (buffer[reader.index++] << 16) |
            (buffer[reader.index++] << 8) |
            (buffer[reader.index++] << 0);
    },
    ReadUShort: function (buffer, reader) {
        return (buffer[reader.index++] << 0) |
            (buffer[reader.index++] << 8);
    }
};
