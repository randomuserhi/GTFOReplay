declare var GTFOTerminal: GTFOTerminalConstructor;
interface Window
{
    GTFOTerminal: GTFOTerminalConstructor;
}

interface GTFOTerminal
{
    id: number;
    position: Vector;
    rotation: Quaternion;
}
interface GTFOTerminalConstructor
{
    new(id: number, position: Vector, rotation: Quaternion): GTFOTerminal;
    prototype: GTFOTerminal;
    
    parse(bytes: DataView, reader: Reader): GTFOTerminal;
}

(function() {

    let GTFOTerminal: GTFOTerminalConstructor = window.GTFOTerminal = function(this: GTFOTerminal, id: number, position: Vector, rotation: Quaternion)
    {
        this.id = id;
        this.position = position;
        this.rotation = rotation;
    } as Function as GTFOTerminalConstructor;

    GTFOTerminal.parse = function(bytes: DataView, reader: Reader): GTFOTerminal
    {
        let id = BitHelper.readByte(bytes, reader);
        let position = BitHelper.readVector(bytes, reader);
        position.x *= GTFOReplaySettings.scale;
        position.y *= GTFOReplaySettings.scale;
        position.z *= GTFOReplaySettings.scale;
        let rotation = BitHelper.readHalfQuaternion(bytes, reader);

        return new GTFOTerminal(id, position, rotation);
    }

})();