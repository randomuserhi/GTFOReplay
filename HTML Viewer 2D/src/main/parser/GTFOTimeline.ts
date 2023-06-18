interface GTFOTimeline<T = unknown>
{
    type: "event" | "dynamic";
    time: number;
    order: number;
    tick: number;
    detail: T;
}

interface GTFOCross
{
    pos: Vector;
    time: number;
    deviation: number;
    shake: (number[])[];
    color: string;
}

interface GTFOTracer
{
    a: Vector;
    b: Vector;
    damage: number;
    time: number;
    color: string;
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
    "enemyMineDamage": GTFOEventEnemyMineDamage;
    "playerDead": GTFOEventPlayerDead;
    "playerRevive": GTFOEventPlayerRevive;
    "playerTongueDamage": GTFOEventPlayerTongueDamage;
    "playerMeleeDamage": GTFOEventPlayerMeleeDamage;
    "playerPelletDamage": GTFOEventPlayerPelletDamage;
    "playerBulletDamage": GTFOEventPlayerBulletDamage;
    "playerMineDamage": GTFOEventPlayerMineDamage;
    "playerFallDamage": GTFOEventPlayerFallDamage;
    "playerPelletDodge": GTFOEventPlayerTongueDodge;
    "playerTongueDodge": GTFOEventPlayerTongueDodge;
    "playerWield": GTFOEventPlayerWield;
    "doorChangeState": GTFOEventDoorChangeState,
    "doorDamage": GTFOEventDoorDamage;
    "spawnMine": GTFOEventMineSpawn;
    "despawnMine": GTFOEventMineDespawn;
    "explodeMine": GTFOEventMineExplode;
    "tripline": GTFOEventMineTripLine;
    "spawnSentry": GTFOEventSentrySpawn;
    "despawnSentry": GTFOEventSentryDespawn;
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
    "enemyMeleeDamage",
    "enemyMineDamage",
    "playerDead",
    "playerRevive",
    "playerTongueDamage",
    "playerMeleeDamage",
    "playerPelletDamage",
    "playerBulletDamage",
    "playerMineDamage",
    "playerFallDamage",
    "playerPelletDodge",
    "playerTongueDodge",
    "playerWield",
    "doorChangeState",
    "doorDamage",
    "spawnMine",
    "despawnMine",
    "explodeMine",
    "tripline",
    "spawnSentry",
    "despawnSentry"
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
    sentry: boolean;
}
interface GTFOEventEnemyMeleeDamage
{
    instance: number;
    damage: number;
    slot: number;
}
interface GTFOEventEnemyMineDamage
{
    // TODO...
}
interface GTFOEventPlayerDead
{
    slot: number;
}
interface GTFOEventPlayerRevive
{
    slot: number;
    source: number;
}
interface GTFOEventPlayerTongueDamage
{
    slot: number;
    damage: number;
    source: number;
}
interface GTFOEventPlayerMeleeDamage
{
    slot: number;
    damage: number;
    source: number;
}
interface GTFOEventPlayerPelletDamage
{
    slot: number;
    damage: number;
    source: number;
}
interface GTFOEventPlayerBulletDamage
{
    slot: number;
    damage: number;
    source: number; // source is another player slot
}
interface GTFOEventPlayerMineDamage
{
    slot: number;
    damage: number;
    source: number; // source is another player slot
}
interface GTFOEventPlayerFallDamage
{
    slot: number;
    damage: number;
}
interface GTFOEventPlayerPelletDodge
{
    slot: number;
    source: number;
}
interface GTFOEventPlayerTongueDodge
{
    slot: number;
    source: number;
}
interface GTFOEventPlayerWield
{
    slot: number;
    item: number;
}
interface GTFOEventDoorChangeState
{
    id: number;
    state: GTFODoorState;
}
interface GTFOEventDoorDamage
{
    id: number;
}
interface GTFOEventMineSpawn
{
    slot: number;
    type: string;
    instance: number;
    position: Vector;
    rotation: Quaternion;
}
interface GTFOEventMineDespawn
{
    instance: number;
}
interface GTFOEventMineExplode
{
    instance: number;
}
interface GTFOEventMineTripLine
{
    instance: number;
    length: number;
}
interface GTFOEventSentrySpawn
{
    instance: number;
    slot: number;
    position: Vector;
}
interface GTFOEventSentryDespawn
{
    instance: number;
}