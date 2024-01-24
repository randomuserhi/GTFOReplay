(function () {
    let GTFOPlayer = window.GTFOPlayer = function (instance, name, slot) {
        this.instance = instance;
        this.name = name;
        this.slot = slot;
        this.alive = true;
        this.health = GTFOSpecification.player.maxHealth;
        this.equipped = "Unknown";
        this.sentry = null;
    };
    GTFOPlayer.clone = function (player) {
        return RHU.clone(player, GTFOPlayer.prototype);
    };
})();
