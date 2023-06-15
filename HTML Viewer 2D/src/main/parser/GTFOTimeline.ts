interface GTFOTimeline<T = unknown>
{
    type: "event" | "dynamic";
    time: number;
    order: number;
    tick: number;
    detail: T;
}

interface GTFOTracer
{
    a: Vector;
    b: Vector;
    time: number;
}

interface GTFODynamic
{
    position: Vector;
    rotation: Quaternion;
}

interface GTFOEvent<T extends keyof GTFOEventMap = "unknown"> 
{
    type: GTFOEventType;
    detail: GTFOEventMap[T];
}

interface GTFOEventMap
{
    "unknown": unknown;

    "playerJoin": GTFOEventPlayerJoin;
    "playerLeave": GTFOEventPlayerLeave;
    "enemySpawn": GTFOEventEnemySpawn;
    "enemyDespawn": GTFOEventEnemyDespawn;
    "enemyDead": GTFOEventEnemyDead;
    "enemyChangeState": GTFOEventEnemyChangeState;
    "enemyBulletDamage": GTFOEventEnemyBulletDamage;
    "enemyMeleeDamage": GTFOEventEnemyMeleeDamage;
}
type GTFOEventType = keyof GTFOEventMap;
let eventMap: GTFOEventType[] = [
    "playerJoin",
    "playerLeave",
    "enemySpawn",
    "enemyDespawn",
    "enemyDead",
    "enemyChangeState",
    "enemyBulletDamage",
    "enemyMeleeDamage"
];

interface Window
{
    eventMap: GTFOEventType[];
}

interface GTFOEventPlayerJoin
{
    player: bigint;
    instance: number;
    slot: number;
    name: string;
}
interface GTFOEventPlayerLeave
{
    player: bigint;
    instance: number;
}
interface GTFOEventEnemySpawn
{
    instance: number;
    state: GTFOEnemyState;
    type: string;
}
interface GTFOEventEnemyDespawn
{
    instance: number;
}
interface GTFOEventEnemyDead
{
    instance: number;
}
interface GTFOEventEnemyChangeState
{
    instance: number;
    state: GTFOEnemyState;
}
interface GTFOEventEnemyBulletDamage
{
    instance: number;
    damage: number;
    slot: number;
}
interface GTFOEventEnemyMeleeDamage
{
    instance: number;
    damage: number;
    slot: number;
}