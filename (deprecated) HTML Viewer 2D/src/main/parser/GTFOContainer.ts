declare var GTFOContainer: GTFOContainerConstructor;
interface Window
{
    GTFOContainer: GTFOContainerConstructor;
}

interface GTFOContainer
{
    id: number;
    position: Vector;
    rotation: Quaternion;
}
interface GTFOContainerConstructor
{
    new(id: number, position: Vector, rotation: Quaternion): GTFOContainer;
    prototype: GTFOContainer;
    
    parse(bytes: DataView, reader: Reader): GTFOContainer;
}

(function() {

    let GTFOContainer: GTFOContainerConstructor = window.GTFOContainer = function(this: GTFOContainer, id: number, position: Vector, rotation: Quaternion)
    {
        this.id = id;
        this.position = position;
        this.rotation = rotation;
    } as Function as GTFOContainerConstructor;

    GTFOContainer.parse = function(bytes: DataView, reader: Reader): GTFOContainer
    {
        let id = BitHelper.readByte(bytes, reader);
        let position = BitHelper.readVector(bytes, reader);
        position.x *= GTFOReplaySettings.scale;
        position.y *= GTFOReplaySettings.scale;
        position.z *= GTFOReplaySettings.scale;
        let rotation = BitHelper.readHalfQuaternion(bytes, reader);

        return new GTFOContainer(id, position, rotation);
    }

})();