declare var GTFOLadder: GTFOLadderConstructor;
interface Window
{
    GTFOLadder: GTFOLadderConstructor;
}

interface GTFOLadder
{
    id: number;
    top: Vector;
    height: number;
    rotation: Quaternion;
}
interface GTFOLadderConstructor
{
    new(id: number, top: Vector, height: number, rotation: Quaternion): GTFOLadder;
    prototype: GTFOLadder;
    
    parse(bytes: DataView, reader: Reader): GTFOLadder;
}

(function() {

    let GTFOLadder: GTFOLadderConstructor = window.GTFOLadder = function(this: GTFOLadder, id: number, top: Vector, height: number, rotation: Quaternion)
    {
        this.id = id;
        this.top = top;
        this.height = height;
        this.rotation = rotation;
    } as Function as GTFOLadderConstructor;

    GTFOLadder.parse = function(bytes: DataView, reader: Reader): GTFOLadder
    {
        let id = BitHelper.readByte(bytes, reader);
        let top = BitHelper.readVector(bytes, reader);
        top.x *= GTFOReplaySettings.scale;
        top.y *= GTFOReplaySettings.scale;
        top.z *= GTFOReplaySettings.scale;
        let height = BitHelper.readHalf(bytes, reader);
        let rotation = BitHelper.readHalfQuaternion(bytes, reader);

        return new GTFOLadder(id, top, height, rotation);
    }

})();