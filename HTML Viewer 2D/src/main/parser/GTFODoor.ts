declare var GTFODoor: GTFODoorConstructor;
interface Window
{
    GTFODoor: GTFODoorConstructor;
}

type GTFODoorType = "weak" | "security" | "bulkhead" | "bulkheadMain" | "apex";
type GTFODoorSize = "small" | "medium" | "large";

interface GTFODoor
{
    type: GTFODoorType;
    size: GTFODoorSize;
    healthMax: number;

    position: Vector;
    rotation: Quaternion;
}
interface GTFODoorConstructor
{
    new(type: GTFODoorType, size: GTFODoorSize, healthMax: number, position: Vector, rotation: Quaternion): GTFODoor;
    prototype: GTFODoor;
    
    parse(bytes: DataView, reader: Reader): GTFODoor;
}

(function() {

    let GTFODoor: GTFODoorConstructor = window.GTFODoor = function(this: GTFODoor, type: GTFODoorType, size: GTFODoorSize, healthMax: number, position: Vector, rotation: Quaternion)
    {
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
        let type = doorTypes[BitHelper.readByte(bytes, reader)];
        let size = doorSizes[BitHelper.readByte(bytes, reader)];

        let healthMax = BitHelper.readByte(bytes, reader);

        let position = BitHelper.readVector(bytes, reader);
        let rotation = BitHelper.readHalfQuaternion(bytes, reader);

        return new GTFODoor(type, size, healthMax, position, rotation);
    }

})();