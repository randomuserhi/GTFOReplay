declare var GTFOTongue: GTFOTongueConstructor
interface Window
{
    GTFOTongue: GTFOTongueConstructor;
}

interface GTFOTongue
{
    instance: number;
    lerp: number;
    spline: Vector[];
}
interface GTFOTongueConstructor
{
    new(instance: number): GTFOTongue;
    prototype: GTFOTongue;
    clone(player: GTFOTongue): GTFOTongue;
}

(function() {

    let GTFOTongue: GTFOTongueConstructor = window.GTFOTongue = function(this: GTFOTongue, instance: number)
    {
        this.instance = instance;
        this.lerp = 0;
        this.spline = [];
    } as Function as GTFOTongueConstructor;
    GTFOTongue.clone = function(tongue: GTFOTongue): GTFOTongue
    {
        let t = new GTFOTongue(tongue.instance);
        t.lerp = tongue.lerp;
        t.spline = tongue.spline;
        return t;
    };

})();