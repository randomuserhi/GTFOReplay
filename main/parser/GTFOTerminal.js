(function () {
    let GTFOTerminal = window.GTFOTerminal = function (id, position, rotation) {
        this.id = id;
        this.position = position;
        this.rotation = rotation;
    };
    GTFOTerminal.parse = function (bytes, reader) {
        let id = BitHelper.readByte(bytes, reader);
        let position = BitHelper.readVector(bytes, reader);
        position.x *= GTFOReplaySettings.scale;
        position.y *= GTFOReplaySettings.scale;
        position.z *= GTFOReplaySettings.scale;
        let rotation = BitHelper.readHalfQuaternion(bytes, reader);
        return new GTFOTerminal(id, position, rotation);
    };
})();
