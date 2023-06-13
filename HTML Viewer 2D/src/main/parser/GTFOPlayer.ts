declare var GTFOPlayer: GTFOPlayerConstructor
interface Window
{
    GTFOPlayer: GTFOPlayerConstructor;
}

interface GTFOPlayer
{
    health: number;
}
interface GTFOPlayerConstructor
{
    new(): GTFOPlayer;
    prototype: GTFOPlayer;
}

(function() {

    let GTFOPlayer: GTFOPlayerConstructor = window.GTFOPlayer = function(this: GTFOPlayer)
    {
        this.health = GTFOSpecification.player.maxHealth;
    } as Function as GTFOPlayerConstructor;

})();