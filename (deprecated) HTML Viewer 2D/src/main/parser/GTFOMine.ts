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
    dimensionIndex: number;
    length: number;

    position: Vector;
    rotation: Quaternion;
}
interface GTFOMineConstructor
{
    new(instance: number, owner: bigint, type: string, dimensionIndex: number, position: Vector, rotation: Quaternion): GTFOMine;
    prototype: GTFOMine;
}

(function() {

    let GTFOMine: GTFOMineConstructor = window.GTFOMine = function(this: GTFOMine, instance: number, owner: bigint, type: string, dimensionIndex: number, position: Vector, rotation: Quaternion)
    {
        this.instance = instance;
        this.owner = owner;
        this.type = type;
        this.dimensionIndex = dimensionIndex;
        this.position = position;
        this.rotation = rotation;
        this.length = 0;
    } as Function as GTFOMineConstructor;

})();