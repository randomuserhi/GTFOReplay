let GTFODoorStateMap = [
    "closed",
    "open",
    "glued",
    "destroyed"
];
(function () {
    let GTFODoor = window.GTFODoor = function (id, type, size, healthMax, position, rotation) {
        this.id = id;
        this.type = type;
        this.size = size;
        this.healthMax = healthMax;
        this.position = position;
        this.rotation = rotation;
    };
    let doorTypes = ["weak", "security", "bulkhead", "bulkheadMain", "apex"];
    let doorSizes = ["small", "medium", "large"];
    GTFODoor.parse = function (bytes, reader) {
        let id = BitHelper.readByte(bytes, reader);
        let type = doorTypes[BitHelper.readByte(bytes, reader)];
        let size = doorSizes[BitHelper.readByte(bytes, reader)];
        let healthMax = BitHelper.readByte(bytes, reader);
        let position = BitHelper.readVector(bytes, reader);
        position.x *= GTFOReplaySettings.scale;
        position.y *= GTFOReplaySettings.scale;
        position.z *= GTFOReplaySettings.scale;
        let rotation = BitHelper.readHalfQuaternion(bytes, reader);
        return new GTFODoor(id, type, size, healthMax, position, rotation);
    };
})();
