(function () {
    let GTFOContainer = window.GTFOContainer = function (id, position, rotation) {
        this.id = id;
        this.position = position;
        this.rotation = rotation;
    };
    GTFOContainer.parse = function (bytes, reader) {
        let id = BitHelper.readByte(bytes, reader);
        let position = BitHelper.readVector(bytes, reader);
        position.x *= GTFOReplaySettings.scale;
        position.y *= GTFOReplaySettings.scale;
        position.z *= GTFOReplaySettings.scale;
        let rotation = BitHelper.readHalfQuaternion(bytes, reader);
        return new GTFOContainer(id, position, rotation);
    };
})();
