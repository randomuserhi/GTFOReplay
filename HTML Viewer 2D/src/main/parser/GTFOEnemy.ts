declare var GTFOEnemy: GTFOEnemyConstructor
interface Window
{
    GTFOEnemy: GTFOEnemyConstructor;
}

// TODO(randomuserhi): Move state map to GTFOSpecification
type GTFOEnemyState = 
    "Hibernating" |
    "Patrolling" |
    "InCombat";
let GTFOEnemyStateMap: GTFOEnemyState[] = [
    "Hibernating",
    "Patrolling",
    "InCombat"
];

interface GTFOEnemy
{
    instance: number;
    type: string;
    state: GTFOEnemyState;
}
interface GTFOEnemyConstructor
{
    new(instance: number, type: string, state: GTFOEnemyState): GTFOEnemy;
    prototype: GTFOEnemy;
    clone(enemy: GTFOEnemy): GTFOEnemy;
}

(function() {

    let GTFOEnemy: GTFOEnemyConstructor = window.GTFOEnemy = function(this: GTFOEnemy, instance: number, type: string, state: GTFOEnemyState)
    {
        this.instance = instance;
        this.type = type;
        this.state = state;
    } as Function as GTFOEnemyConstructor;
    GTFOEnemy.clone = function(enemy: GTFOEnemy): GTFOEnemy
    {
        return RHU.clone(enemy, GTFOEnemy.prototype);
    };

})();