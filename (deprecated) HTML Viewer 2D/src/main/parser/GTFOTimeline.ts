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
    killer?: bigint;
}

interface GTFOScream
{
    instance: number;
    color: string;
    time: number;
}

interface GTFOAlert
{
    instance: number;
    offset: Vector;
    color: string;
    time: number;
}

interface GTFOTracer
{
    dimensionIndex: number;
    a: Vector;
    b: Vector;
    damage: number;
    time: number;
    color: string;
    type: "visual" | "damage" | "melee";
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
    type: T | ({} & string);
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
    "enemyAlerted": GTFOEventEnemyAlerted;
    "enemyScreamed": GTFOEventEnemyScreamed;
    "enemyTargetSet": GTFOEventEnemyTargetSet;
    "bulletShot": GTFOEventBulletShot;
    "spawnScanCircle": GTFOEventSpawnScanCircle;
    "despawnScanCircle": GTFOEventDespawnScanCircle;
    "spawnHolopath": GTFOEventSpawnHolopath;
    "despawnHolopath": GTFOEventDespawnHolopath;
    "checkpoint": null;
    "spawnTendril": GTFOEventSpawnTendril;
    "despawnTendril": GTFOEventDespawnTendril;
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
    "despawnGlue",
    "enemyAlerted",
    "enemyScreamed",
    "enemyTargetSet",
    "bulletShot",
    "spawnScanCircle",
    "despawnScanCircle",
    "spawnHolopath",
    "despawnHolopath",
    "checkpoint",
    "spawnTendril",
    "despawnTendril",
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
    instance: number;
    damage: number;
    slot: number;
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
interface GTFOEventEnemyAlerted
{
    instance: number;
    slot: number;
}
interface GTFOEventEnemyScreamed
{
    instance: number;
    scout: boolean;
}
interface GTFOEventEnemyTargetSet
{
    instance: number;
    slot: number;
}
interface GTFOEventBulletShot
{
    slot: number;
    damage: number;
    hit: boolean;
    dimensionIndex: number;
    start: Vector;
    end: Vector;
}
interface GTFOEventSpawnScanCircle
{
    instance: number;
    radius: number;
    flags: number;
}
interface GTFOEventDespawnScanCircle
{
    instance: number;
}
interface GTFOEventSpawnHolopath
{
    instance: number;
    dimensionIndex: number;
    spline: Vector[];
}
interface GTFOEventDespawnHolopath
{
    instance: number;
}
interface GTFOEventSpawnTendril
{
    owner: number;
    tendril: number;
}
interface GTFOEventDespawnTendril
{
    tendril: number;
}

interface GTFODynamicPropMap
{
    "unknown": unknown;

    "tongue": GTFODynamicPropTongue;
    "scan": GTFODynamicPropScan;
    "holopath": GTFODynamicPropHolopath;
    "playerStatus": GTFODynamicPropPlayerStatus;
}
type GTFODynamicPropType = keyof GTFODynamicPropMap;
let dynamicPropMap: GTFODynamicPropType[] = [
    "tongue",
    "scan",
    "holopath",
    "playerStatus",
];

interface GTFODynamicPropTongue
{
    instance: number;
    lerp: number;
    spline: Vector[];
}
interface GTFODynamicPropScan
{
    instance: number;
    progress: number;
    r: number;
    g: number;
    b: number;
}
interface GTFODynamicPropHolopath
{
    instance: number;
    lerp: number;
}
interface GTFODynamicPropPlayerStatus
{
    instance: number;
    health: number;
    infection: number;
    primary: number;
    special: number;
    tool: number;
    consumable: number;
    resource: number
}