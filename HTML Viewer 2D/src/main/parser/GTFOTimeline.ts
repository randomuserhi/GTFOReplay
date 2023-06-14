interface GTFOTimeline<T = unknown>
{
    type: "event" | "dynamic";
    time: number;
    tick: number;
    detail: T;
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
}
type GTFOEventType = keyof GTFOEventMap;
let eventMap: GTFOEventType[] = [
    "playerJoin",
    "playerLeave",
    "enemySpawn",
    "enemyDespawn",
    "enemyDead",
    "enemyChangeState"
];

interface Window
{
    eventMap: GTFOEventType[];
}

interface GTFOEventPlayerJoin
{
    player: bigint;
    instance: number;
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