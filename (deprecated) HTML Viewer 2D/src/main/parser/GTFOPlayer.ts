declare var GTFOPlayer: GTFOPlayerConstructor
interface Window
{
    GTFOPlayer: GTFOPlayerConstructor;
}

interface GTFOPlayer
{
    instance: number;
    name: string;
    slot: number;

    kills: number;

    alive: boolean;
    health: number;
    infection: number;

    primary: number;
    special: number;
    tool: number;
    consumable: number;
    resource: number;

    killer?: bigint;

    equipped: string;
    sentry: number | null | undefined; //active sentry instance
}
interface GTFOPlayerConstructor
{
    new(instance: number, name: string, slot: number): GTFOPlayer;
    prototype: GTFOPlayer;
    clone(player: GTFOPlayer): GTFOPlayer;
}

(function() {

    let GTFOPlayer: GTFOPlayerConstructor = window.GTFOPlayer = function(this: GTFOPlayer, instance: number, name: string, slot: number)
    {
        this.instance = instance;
        this.name = name;
        this.slot = slot;
        
        this.kills = 0;

        this.primary = 0;
        this.special = 0;
        this.tool = 0;
        this.consumable = 0;
        this.resource = 0;

        this.alive = true;
        this.health = 1;
        this.infection = 1;
        this.equipped = "Unknown";
        this.sentry = null;
    } as Function as GTFOPlayerConstructor;
    GTFOPlayer.clone = function(player: GTFOPlayer): GTFOPlayer
    {
        return RHU.clone(player, GTFOPlayer.prototype);
    };

})();