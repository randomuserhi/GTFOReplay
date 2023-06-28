declare var GTFOEnemy: GTFOEnemyConstructor
interface Window
{
    GTFOEnemy: GTFOEnemyConstructor;
}

// TODO(randomuserhi): Move state map to GTFOSpecification
type GTFOEnemyBehaviourState = 
    "Hibernating" |
    "Patrolling" |
    "InCombat";
let GTFOEnemyBehaviourStateMap: GTFOEnemyBehaviourState[] = [
    "Hibernating",
    "Patrolling",
    "InCombat"
];
type GTFOEnemyLocomotionState =
    "Default" |
    "StuckInGlue";
let GTFOEnemyLocomotionStateMap: GTFOEnemyLocomotionState[] = [
    "Default",
    "StuckInGlue"
];

interface GTFOEnemy
{
    instance: number;
    type: string;
    behaviourState: GTFOEnemyBehaviourState;
    locomotionState: GTFOEnemyLocomotionState;
}
interface GTFOEnemyConstructor
{
    new(instance: number, type: string, state: GTFOEnemyBehaviourState): GTFOEnemy;
    prototype: GTFOEnemy;
    clone(enemy: GTFOEnemy): GTFOEnemy;
}

(function() {

    let GTFOEnemy: GTFOEnemyConstructor = window.GTFOEnemy = function(this: GTFOEnemy, instance: number, type: string, state: GTFOEnemyBehaviourState)
    {
        this.instance = instance;
        this.type = type;
        this.behaviourState = state;
        this.locomotionState = "Default";
    } as Function as GTFOEnemyConstructor;
    GTFOEnemy.clone = function(enemy: GTFOEnemy): GTFOEnemy
    {
        return RHU.clone(enemy, GTFOEnemy.prototype);
    };

})();