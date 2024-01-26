declare var GTFOHolopath: GTFOHolopathConstructor
interface Window
{
    GTFOHolopath: GTFOHolopathConstructor;
}

interface GTFOHolopath
{
    instance: number;
    dimensionIndex: number;
    lerp: number;
    spline: Vector[];
}
interface GTFOHolopathConstructor
{
    new(instance: number, dimensionIndex: number, spline: Vector[]): GTFOHolopath;
    prototype: GTFOHolopath;
    clone(player: GTFOHolopath): GTFOHolopath;
}

(function() {

    let GTFOHolopath: GTFOHolopathConstructor = window.GTFOHolopath = function(this: GTFOHolopath, instance: number, dimensionIndex: number, spline: Vector[])
    {
        this.dimensionIndex = dimensionIndex;
        this.instance = instance;
        this.lerp = 0;
        this.spline = spline;
    } as Function as GTFOHolopathConstructor;
    GTFOHolopath.clone = function(holopath: GTFOHolopath): GTFOHolopath
    {
        // NOTE(randomuserhi): spline does not change so no deep copy is needed
        let h = new GTFOHolopath(holopath.instance, holopath.dimensionIndex, holopath.spline);
        h.lerp = holopath.lerp;
        h.spline = holopath.spline;
        return h;
    };

})();