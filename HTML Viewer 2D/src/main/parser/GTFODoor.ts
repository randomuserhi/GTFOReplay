declare var GTFODoor: GTFODoorConstructor;
interface Window
{
    GTFODoor: GTFODoorConstructor;
}

type GTFODoorType = "weak" | "security" | "bulkhead" | "bulkheadMain" | "apex";
type GTFODoorSize = "small" | "medium" | "large";
type GTFODoorState = "closed" | "open" | "glued" | "destroyed";
let GTFODoorStateMap: GTFODoorState[] = [
    "closed",
    "open",
    "glued",
    "destroyed"
]

interface GTFODoor
{
    id: number;
    type: GTFODoorType;
    size: GTFODoorSize;
    healthMax: number;

    position: Vector;
    rotation: Quaternion;
}
interface GTFODoorConstructor
{
    new(id: number, type: GTFODoorType, size: GTFODoorSize, healthMax: number, position: Vector, rotation: Quaternion): GTFODoor;
    prototype: GTFODoor;
    
    parse(bytes: DataView, reader: Reader): GTFODoor;
}

(function() {

    let GTFODoor: GTFODoorConstructor = window.GTFODoor = function(this: GTFODoor, id: number, type: GTFODoorType, size: GTFODoorSize, healthMax: number, position: Vector, rotation: Quaternion)
    {
        this.id = id;
        this.type = type;
        this.size = size;
        this.healthMax = healthMax;
        this.position = position;
        this.rotation = rotation;
    } as Function as GTFODoorConstructor;

    let doorTypes: GTFODoorType[] = ["weak", "security", "bulkhead", "bulkheadMain", "apex"];
    let doorSizes: GTFODoorSize[] = ["small", "medium", "large"]

    GTFODoor.parse = function(bytes: DataView, reader: Reader): GTFODoor
    {
        let id = BitHelper.readByte(bytes, reader)
        let type = doorTypes[BitHelper.readByte(bytes, reader)];
        let size = doorSizes[BitHelper.readByte(bytes, reader)];

        let healthMax = BitHelper.readByte(bytes, reader);

        let position = BitHelper.readVector(bytes, reader);
        position.x *= GTFOReplaySettings.scale;
        position.y *= GTFOReplaySettings.scale;
        position.z *= GTFOReplaySettings.scale;
        let rotation = BitHelper.readHalfQuaternion(bytes, reader);

        return new GTFODoor(id, type, size, healthMax, position, rotation);
    }

})();