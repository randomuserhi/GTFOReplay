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

    health: number;
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
        
        this.health = GTFOSpecification.player.maxHealth;
    } as Function as GTFOPlayerConstructor;
    GTFOPlayer.clone = function(player: GTFOPlayer): GTFOPlayer
    {
        return RHU.clone(player, GTFOPlayer.prototype);
    };

})();