declare var GTFOMine: GTFOMineConstructor;
interface Window
{
    GTFOMine: GTFOMineConstructor;
}

interface GTFOMine
{
    instance: number;
    owner: bigint;
    type: string;
    length: number;

    position: Vector;
    rotation: Quaternion;
}
interface GTFOMineConstructor
{
    new(instance: number, owner: bigint, type: string, position: Vector, rotation: Quaternion): GTFOMine;
    prototype: GTFOMine;
    
    parse(bytes: DataView, reader: Reader, parser: GTFOSnapshot): GTFOMine;
}

(function() {

    let GTFOMine: GTFOMineConstructor = window.GTFOMine = function(this: GTFOMine, instance: number, owner: bigint, type: string, position: Vector, rotation: Quaternion)
    {
        this.instance = instance;
        this.owner = owner;
        this.type = type;
        this.length = 0;
        this.position = position;
        this.rotation = rotation;
    } as Function as GTFOMineConstructor;

})();