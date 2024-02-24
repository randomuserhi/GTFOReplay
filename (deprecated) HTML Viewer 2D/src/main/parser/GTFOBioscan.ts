declare var GTFOBioscan: GTFOBioscanConstructor
interface Window
{
    GTFOBioscan: GTFOBioscanConstructor;
}

interface GTFOBioscan
{
    instance: number;
    radius: number;
    progress: number;
    r: number;
    g: number;
    b: number;
    flags: number;
}
interface GTFOBioscanConstructor
{
    new(instance: number, radius: number, flags: number): GTFOBioscan;
    prototype: GTFOBioscan;
    clone(player: GTFOBioscan): GTFOBioscan;

    FullTeam: 0b1;
    Checkpoint: 0b10;
    Moving: 0b100;
    Extraction: 0b1000;
    Alarm: 0b10000;
    ReduceWhenNoPlayer: 0b100000;
}

(function() {

    let GTFOBioscan: GTFOBioscanConstructor = window.GTFOBioscan = function(this: GTFOBioscan, instance: number, radius: number, flags: number)
    {
        this.instance = instance;
        this.radius = radius;
        this.progress = 0;
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.flags = flags;
    } as Function as GTFOBioscanConstructor;
    GTFOBioscan.clone = function(bioscan: GTFOBioscan): GTFOBioscan
    {
        return RHU.clone(bioscan, GTFOBioscan.prototype);
    };

    GTFOBioscan.FullTeam = 0b1;
    GTFOBioscan.Checkpoint = 0b10;
    GTFOBioscan.Moving = 0b100;
    GTFOBioscan.Extraction = 0b1000;
    GTFOBioscan.Alarm = 0b10000;
    GTFOBioscan.ReduceWhenNoPlayer = 0b100000;

})();