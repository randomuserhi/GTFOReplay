declare var GTFOPlayer: GTFOPlayerConstructor
interface Window
{
    GTFOPlayer: GTFOPlayerConstructor;
}

interface GTFOPlayer
{
    name: string;
    instance: number;
    health: number;
}
interface GTFOPlayerConstructor
{
    new(instance: number, name: string): GTFOPlayer;
    prototype: GTFOPlayer;
    clone(player: GTFOPlayer): GTFOPlayer;
}

(function() {

    let GTFOPlayer: GTFOPlayerConstructor = window.GTFOPlayer = function(this: GTFOPlayer, instance: number, name: string)
    {
        this.name = name;
        this.instance = instance;
        this.health = GTFOSpecification.player.maxHealth;
    } as Function as GTFOPlayerConstructor;
    GTFOPlayer.clone = function(player: GTFOPlayer): GTFOPlayer
    {
        return RHU.clone(player, GTFOPlayer.prototype);
    };

})();