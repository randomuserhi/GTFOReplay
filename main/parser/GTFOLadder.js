(function () {
    let GTFOLadder = window.GTFOLadder = function (id, top, height, rotation) {
        this.id = id;
        this.top = top;
        this.height = height;
        this.rotation = rotation;
    };
    GTFOLadder.parse = function (bytes, reader) {
        let id = BitHelper.readByte(bytes, reader);
        let top = BitHelper.readVector(bytes, reader);
        top.x *= GTFOReplaySettings.scale;
        top.y *= GTFOReplaySettings.scale;
        top.z *= GTFOReplaySettings.scale;
        let height = BitHelper.readHalf(bytes, reader);
        let rotation = BitHelper.readHalfQuaternion(bytes, reader);
        return new GTFOLadder(id, top, height, rotation);
    };
})();
