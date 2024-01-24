let GTFOEnemyBehaviourStateMap = [
    "Hibernating",
    "Patrolling",
    "InCombat"
];
let GTFOEnemyLocomotionStateMap = [
    "Default",
    "StuckInGlue"
];
(function () {
    let GTFOEnemy = window.GTFOEnemy = function (instance, type, state, target) {
        this.instance = instance;
        this.type = type;
        this.behaviourState = state;
        this.locomotionState = "Default";
        this.target = target;
    };
    GTFOEnemy.clone = function (enemy) {
        return RHU.clone(enemy, GTFOEnemy.prototype);
    };
})();
