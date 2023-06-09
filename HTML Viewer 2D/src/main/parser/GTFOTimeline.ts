interface GTFOTimeline<T = unknown>
{
    type: "event" | "dynamic" | "dynamicProp" | "EVENTSECTION" | "DYNAMICSECTION";
    time: number;
    order: number;
    tick: number;
    detail: T;
}

interface GTFOTrail
{
    points: GTFOTimedPoint[];
    duration?: number | null | undefined;
}

interface GTFOTimedPoint
{
    dimensionIndex: number;
    position: Vector;
    time: number; 
}

interface GTFOCross
{
    dimensionIndex: number;
    pos: Vector;
    time: number;
    deviation: number;
    shake: (number[])[];
    color: string;
}

interface GTFOTracer
{
    dimensionIndex: number;
    a: Vector;
    b: Vector;
    damage: number;
    time: number;
    color: string;
}

interface GTFOHit
{
    dimensionIndex: number;
    pos: Vector;
    time: number;
    color: string;
}

interface GTFODynamic
{
    position: Vector;
    rotation: Quaternion;
    velocity: Vector;
    dimensionIndex: number;
    scale: number;
    lastUpdated: number;
}

interface GTFOEvent<T extends keyof GTFOEventMap = "unknown"> 
{
    type: string;
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
    "enemyBehaviourChangeState": GTFOEventEnemyBehaviourChangeState;
    "enemyLocomotionChangeState": GTFOEventEnemyLocomotionChangeState;
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
    "spawnPellet": GTFOEventPelletSpawn;
    "despawnPellet": GTFOEventPelletDespawn;
    "spawnTongue": GTFOEventTongueSpawn;
    "despawnTongue": GTFOEventTongueDespawn;
    "setTongue": GTFODynamicPropType;
    "spawnGlue": GTFOEventGlueSpawn;
    "despawnGlue": GTFOEventGlueDespawn;
}
type GTFOEventType = keyof GTFOEventMap;
let eventMap: GTFOEventType[] = [
    "playerJoin",
    "playerLeave",
    "enemySpawn",
    "enemyDespawn",
    "enemyDead",
    "enemyBehaviourChangeState",
    "enemyLocomotionChangeState",
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
    "despawnSentry",
    "spawnPellet",
    "despawnPellet",
    "spawnTongue",
    "despawnTongue",
    "setTongue",
    "spawnGlue",
    "despawnGlue"
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
    state: GTFOEnemyBehaviourState;
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
interface GTFOEventEnemyBehaviourChangeState
{
    instance: number;
    state: GTFOEnemyBehaviourState;
}
interface GTFOEventEnemyLocomotionChangeState
{
    instance: number;
    state: GTFOEnemyLocomotionState;
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
    dimensionIndex: number;
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
    slot: number;
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
}
interface GTFOEventSentryDespawn
{
    instance: number;
}
interface GTFOEventPelletSpawn
{
    instance: number;
}
interface GTFOEventPelletDespawn
{
    instance: number;
}
interface GTFOEventTongueSpawn
{
    instance: number;
    dimensionIndex: number;
}
interface GTFOEventTongueDespawn
{
    instance: number;
}
interface GTFOEventGlueSpawn
{
    instance: number;
}
interface GTFOEventGlueDespawn
{
    instance: number;
}

interface GTFODynamicPropMap
{
    "unknown": unknown;

    "tongue": GTFODynamicPropTongue;
}
type GTFODynamicPropType = keyof GTFODynamicPropMap;
let dynamicPropMap: GTFODynamicPropType[] = [
    "tongue"
];

interface GTFODynamicPropTongue
{
    instance: number;
    lerp: number;
    spline: Vector[];
}