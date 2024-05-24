import { Camera, Color, Group, Matrix4, Mesh, MeshPhongMaterial, Object3D, Quaternion, Scene, SphereGeometry, Vector3 } from "three";
import { Text } from "troika-three-text";
import * as BitHelper from "../../../replay/bithelper.js";
import { consume } from "../../../replay/instancing.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";
import { DuplicateDynamic, DynamicNotFound, DynamicParse, DynamicPosition, DynamicTransform } from "../../replayrecorder.js";
import { AvatarSkeleton, AvatarStructure, createAvatarStruct } from "../animations/animation.js";
import { animCrouch, animDetection, animVelocity, playerAnimations } from "../animations/assets.js";
import { HumanAnimation, HumanJoints, HumanSkeleton, defaultHumanStructure } from "../animations/human.js";
import { createDeathCross } from "../deathcross.js";
import { upV, zeroQ, zeroV } from "../humanmodel.js";
import { EnemyAnimHandle, EnemySpecification, specification } from "../specification.js";
import { Damage } from "../stattracker/damage.js";
import { StatTracker, getPlayerStats, isPlayer } from "../stattracker/stats.js";
import { ScreamType } from "./enemyscreams.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Enemy": {
                parse: DynamicParse;
                spawn: {
                    dimension: number;
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                    animHandle?: AnimHandles.Flags;
                    scale: number;
                    type: number;
                };
                despawn: void;
            };

            "Vanilla.Enemy.LimbCustom": {
                parse: {
                    dimension: number;
                    absolute: boolean;
                    position: Pod.Vector;
                    active: boolean;
                };
                spawn: {
                    dimension: number;
                    position: Pod.Vector;
                    owner: number;
                    scale: number;
                };
                despawn: void;
            };

            "Vanilla.Enemy.Animation": {
                parse: {
                    velocity: Pod.Vector;
                    state: State;
                    up: boolean;
                    detect: number;
                };
                spawn: {
                    velocity: Pod.Vector;
                    state: State;
                    up: boolean;
                    detect: number;
                };
                despawn: void;
            }
        }
    
        interface Events {
            "Vanilla.Enemy.LimbDestruction": {
                id: number;
                limb: Limb; 
            };

            "Vanilla.Enemy.Animation.AttackWindup": {
                id: number;
                animIndex: number;
            };

            "Vanilla.Enemy.Animation.Hitreact": {
                id: number;
                animIndex: number;
                direction: HitreactDirection;
                type: HitreactType;
            };

            "Vanilla.Enemy.Animation.Melee": {
                id: number;
                animIndex: number;
                type: MeleeType;
            };

            "Vanilla.Enemy.Animation.Jump": {
                id: number;
                animIndex: number;
            };

            "Vanilla.Enemy.Animation.Heartbeat": {
                id: number;
                animIndex: number;
            };

            "Vanilla.Enemy.Animation.Wakeup": {
                id: number;
                animIndex: number;
                turn: boolean;
            };
        }

        interface Data {
            "Vanilla.Enemy": Map<number, Enemy>;
            "Vanilla.Enemy.Cache": Map<number, EnemyCache>; // Stores enemies that have been despawned so they can be referenced by late events. E.g Damage Events recieved late due to ping.
            "Vanilla.Enemy.Animation": Map<number, EnemyAnimState>;
            "Vanilla.Enemy.LimbCustom": Map<number, LimbCustom>;
        }
    }
}

type Limb = 
    "Head";
const limbTypemap: Limb[] = [
    "Head"
];

export const states = [
    "None",
    "StandStill",
    "PathMove",
    "Knockdown",
    "JumpDissolve",
    "LiquidSnake",
    "KnockdownRecover",
    "Hitreact",
    "ShortcutJump",
    "FloaterFly",
    "FloaterHitReact",
    "Dead",
    "ScoutDetection",
    "ScoutScream",
    "Hibernate",
    "HibernateWakeUp",
    "Scream",
    "StuckInGlue",
    "ShooterAttack",
    "StrikerAttack",
    "TankAttack",
    "TankMultiTargetAttack",
    "TentacleDragMove",
    "StrikerMelee",
    "ClimbLadder",
    "Jump",
    "BirtherGiveBirth",
    "TriggerFogSphere",
    "PathMoveFlyer",
    "HitReactFlyer",
    "ShooterAttackFlyer",
    "DeadFlyer",
    "DeadSquidBoss"
] as const;
export type State = typeof states[number];
export const stateMap: Map<State, number> = new Map([...states.entries()].map(e => [e[1], e[0]]));

export const hitreactDirections = [
    "Forward",
    "Backward",
    "Left",
    "Right",
] as const;
export type HitreactDirection = typeof hitreactDirections[number];

export const hitreactTypes = [
    "Light",
    "Heavy",
] as const;
export type HitreactType = typeof hitreactTypes[number];

export const meleeTypes = [
    "Forward",
    "Backward",
] as const;
export type MeleeType = typeof meleeTypes[number];

export interface LimbCustom extends DynamicPosition {
    owner: number;
    scale: number;
    active: boolean;
}

export interface EnemyCache {
    time: number;
    enemy: Enemy;
}

export interface Enemy extends DynamicTransform {
    animHandle?: AnimHandles.Flags;
    health: number;
    head: boolean;
    scale: number;
    type: number;
    players: Set<bigint>;
    lastHit?: Damage;
    lastHitTime?: number;
}

export namespace AnimHandles {
    export type Flags = 
        "unspecified" |
        "enemyCripple" |
        "enemyRunner" |
        "enemyFiddler" |
        "enemyLow" |
        "enemyCrawlFlip" |
        "enemyCrawl" |
        "enemyGiant" |
        "enemyBig" |
        "enemyExploder" |
        "enemyBirtherCrawlFlip" |
        "enemyPouncer";
    export const FlagMap = new Map<number, Flags>([
        [1, "unspecified"],
        [2, "enemyCripple"],
        [4, "enemyRunner"],
        [8, "enemyFiddler"],
        [0x10, "enemyLow"],
        [0x20, "enemyCrawlFlip"],
        [0x40, "enemyCrawl"],
        [0x80, "enemyGiant"],
        [0x100, "enemyBig"],
        [0x200, "enemyExploder"],
        [0x400, "enemyBirtherCrawlFlip"],
        [0x800, "enemyPouncer"]
    ]); 
    export const Unspecified = 1;
    export const EnemyCripple = 2;
    export const EnemyRunner = 4;
    export const EnemyFiddler = 8;
    export const EnemyLow = 0x10;
    export const EnemyCrawlFlip = 0x20;
    export const EnemyCrawl = 0x40;
    export const EnemyGiant = 0x80;
    export const EnemyBig = 0x100;
    export const EnemyExploder = 0x200;
    export const EnemyBirtherCrawlFlip = 0x400;
    export const EnemyPouncer = 0x800;
}

ModuleLoader.registerDynamic("Vanilla.Enemy", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicTransform.parse(data);
            return result;
        }, 
        exec: (id, data, snapshot, lerp) => {
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
    
            if (!enemies.has(id)) throw new EnemyNotFound(`Enemy of id '${id}' was not found.`);
            DynamicTransform.lerp(enemies.get(id)!, data, lerp);
        }
    },
    spawn: {
        parse: async (data) => {
            const spawn = await DynamicTransform.parseSpawn(data);
            const result = {
                ...spawn,
                animHandle: AnimHandles.FlagMap.get(await BitHelper.readUShort(data)),
                scale: await BitHelper.readHalf(data),
                type: await BitHelper.readUShort(data),
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
        
            if (enemies.has(id)) throw new DuplicateEnemy(`Enemy of id '${id}' already exists.`);
            const datablock = specification.enemies.get(data.type);
            if (datablock === undefined) throw new Error(`Could not find enemy datablock of type '${data.type}'.`);
            enemies.set(id, { 
                id, ...data,
                health: datablock.maxHealth,
                head: true,
                players: new Set(),
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            // TODO(randomuserhi): Cleanup code
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
            const cache = snapshot.getOrDefault("Vanilla.Enemy.Cache", () => new Map());

            if (!enemies.has(id)) throw new EnemyNotFound(`Enemy of id '${id}' did not exist.`);
            const enemy = enemies.get(id)!;
            createDeathCross(snapshot, id, enemy.dimension, enemy.position);
            enemies.delete(id);

            // Check kill stats in the event enemy health prediction fails
            if (enemy.health > 0 && enemy.lastHit !== undefined && enemy.lastHitTime !== undefined && 
                snapshot.time() - enemy.lastHitTime <= cacheClearTime) {
                enemy.health = 0;
                // Update kill to last player that hit enemy
                const statTracker = snapshot.getOrDefault("Vanilla.StatTracker", StatTracker);
                const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
                
                let lastHit;
                if (isPlayer(enemy.lastHit.source, players)) {
                    lastHit = players.get(enemy.lastHit.source)!.snet;
                } else if(enemy.lastHit.type === "Explosive") {
                    const detonations = snapshot.getOrDefault("Vanilla.Mine.Detonate", () => new Map());
                    const mines = snapshot.getOrDefault("Vanilla.Mine", () => new Map());

                    const detonation = detonations.get(enemy.lastHit.source);
                    if (detonation === undefined) throw new Error("Explosive damage was dealt, but cannot find detonation event.");

                    const mine = mines.get(enemy.lastHit.source);
                    if (mine === undefined) throw new Error("Explosive damage was dealt, but cannot find mine.");

                    lastHit = mine.snet;
                }
                if (lastHit === undefined) throw new Error(`Could not find player '${enemy.lastHit.source}'.`);
                
                for (const snet of enemy.players) {
                    const sourceStats = getPlayerStats(snet, statTracker);

                    if (snet === lastHit) {
                        if (enemy.lastHit.type === "Explosive") {
                            if (!sourceStats.mineKills.has(enemy.type)) {
                                sourceStats.mineKills.set(enemy.type, 0);
                            }
                            sourceStats.mineKills.set(enemy.type, sourceStats.mineKills.get(enemy.type)! + 1);
                        } else if (enemy.lastHit.sentry) {
                            if (!sourceStats.sentryKills.has(enemy.type)) {
                                sourceStats.sentryKills.set(enemy.type, 0);
                            }
                            sourceStats.sentryKills.set(enemy.type, sourceStats.sentryKills.get(enemy.type)! + 1);
                        } else {
                            if (!sourceStats.kills.has(enemy.type)) {
                                sourceStats.kills.set(enemy.type, 0);
                            }
                            sourceStats.kills.set(enemy.type, sourceStats.kills.get(enemy.type)! + 1);
                        }
                    } else {
                        if (!sourceStats.assists.has(enemy.type)) {
                            sourceStats.assists.set(enemy.type, 0);
                        }
                        sourceStats.assists.set(enemy.type, sourceStats.assists.get(enemy.type)! + 1);
                    }
                }
            }
            
            if (!cache.has(id)) {
                cache.set(id, {
                    time: snapshot.time(),
                    enemy
                });
            }
        }
    }
});

const cacheClearTime = 1000;
ModuleLoader.registerTick((snapshot) => {
    const cache = snapshot.getOrDefault("Vanilla.Enemy.Cache", () => new Map());
    for (const [id, item] of [...cache.entries()]) {
        if (snapshot.time() - item.time > cacheClearTime) {
            if (item.enemy.health > 0) {
                console.warn(`Cache cleared enemy: ${id}[health: ${item.enemy.health}]`);
                console.log(item.enemy);
            }
            cache.delete(id);
        }
    }
});

ModuleLoader.registerEvent("Vanilla.Enemy.LimbDestruction", "0.0.1", {
    parse: async (data) => {
        return {
            id: await BitHelper.readInt(data),
            limb: limbTypemap[await BitHelper.readByte(data)]
        };
    },
    exec: (data, snapshot) => {
        const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());

        const { id, limb } = data;
        if (!enemies.has(id)) return;
        switch(limb) {
        case "Head": enemies.get(id)!.head = false; break;
        }
    }
});

ModuleLoader.registerDynamic("Vanilla.Enemy.LimbCustom", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicPosition.parse(data);
            return {
                ...result,
                active: await BitHelper.readBool(data)
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const limbs = snapshot.getOrDefault("Vanilla.Enemy.LimbCustom", () => new Map());
    
            if (!limbs.has(id)) throw new DynamicNotFound(`Limb of id '${id}' was not found.`);
            const limb = limbs.get(id)!;
            DynamicPosition.lerp(limb, data, lerp);
            limb.active = data.active;
        }
    },
    spawn: {
        parse: async (data) => {
            const spawn = await DynamicPosition.parseSpawn(data);
            const result = {
                ...spawn,
                owner: await BitHelper.readUShort(data),
                scale: await BitHelper.readHalf(data)
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const limbs = snapshot.getOrDefault("Vanilla.Enemy.LimbCustom", () => new Map());
        
            if (limbs.has(id)) throw new DuplicateDynamic(`Limb of id '${id}' already exists.`);
            limbs.set(id, { 
                id, ...data, active: true
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const limbs = snapshot.getOrDefault("Vanilla.Enemy.LimbCustom", () => new Map());

            if (!limbs.has(id)) throw new DynamicNotFound(`Limb of id '${id}' did not exist.`);
            limbs.delete(id);
        }
    }
});

export class EnemyNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicateEnemy extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export interface EnemyAnimState {
    velocity: Pod.Vector;
    state: State;
    lastStateTime: number;
    up: boolean;
    detect: number;
    lastWindupTime: number;
    windupAnimIndex: number;
    lastHitreactTime: number;
    hitreactAnimIndex: number;
    hitreactDirection: HitreactDirection;
    hitreactType: HitreactType;
    lastMeleeTime: number;
    meleeType: MeleeType;
    meleeAnimIndex: number;
    lastJumpTime: number;
    jumpAnimIndex: number;
    lastScreamTime: number;
    screamAnimIndex: number;
    screamType: ScreamType;
    heartbeatAnimIndex: number;
    lastHeartbeatTime: number;
    lastWakeupTime: number;
    wakeupAnimIndex: number;
    wakeupTurn: boolean;
}

ModuleLoader.registerDynamic("Vanilla.Enemy.Animation", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                velocity: { x: (await BitHelper.readByte(data) / 255 * 2 - 1) * 10, y: 0, z: (await BitHelper.readByte(data) / 255 * 2 - 1) * 10 },
                state: states[await BitHelper.readByte(data)],
                up: await BitHelper.readBool(data),
                detect: await BitHelper.readByte(data) / 255
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", () => new Map());
    
            if (!anims.has(id)) throw new AnimNotFound(`EnemyAnim of id '${id}' was not found.`);
            const anim = anims.get(id)!;
            Pod.Vec.lerp(anim.velocity, anim.velocity, data.velocity, lerp);
            if (anim.state !== data.state) {
                anim.state = data.state;
                anim.lastStateTime = snapshot.time();
            }
            anim.up = data.up;
            anim.detect = anim.detect + (data.detect - anim.detect) * lerp;
        }
    },
    spawn: {
        parse: async (data) => {
            return {
                velocity: { x: (await BitHelper.readByte(data) / 255 * 2 - 1) * 10, y: 0, z: (await BitHelper.readByte(data) / 255 * 2 - 1) * 10 },
                state: states[await BitHelper.readByte(data)],
                up: await BitHelper.readBool(data),
                detect: await BitHelper.readByte(data) / 255
            };
        },
        exec: (id, data, snapshot) => {
            const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", () => new Map());
        
            if (anims.has(id)) throw new DuplicateAnim(`EnemyAnim of id '${id}' already exists.`);
            anims.set(id, { 
                ...data,
                lastStateTime: -Infinity,
                lastWindupTime: -Infinity,
                windupAnimIndex: 0,
                lastHitreactTime: -Infinity,
                hitreactAnimIndex: 0,
                hitreactDirection: "Forward",
                hitreactType: "Light",
                lastMeleeTime: -Infinity,
                meleeAnimIndex: 0,
                meleeType: "Forward",
                lastJumpTime: -Infinity,
                jumpAnimIndex: 0,
                lastScreamTime: -Infinity,
                screamAnimIndex: 0,
                screamType: "Regular",
                lastHeartbeatTime: -Infinity,
                heartbeatAnimIndex: 0,
                lastWakeupTime: -Infinity,
                wakeupAnimIndex: 0,
                wakeupTurn: false
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", () => new Map());

            if (!anims.has(id)) throw new AnimNotFound(`EnemyAnim of id '${id}' did not exist.`);
            anims.delete(id);
        }
    }
});

ModuleLoader.registerEvent("Vanilla.Enemy.Animation.AttackWindup", "0.0.1", {
    parse: async (bytes) => {
        return {
            id: await BitHelper.readInt(bytes),
            animIndex: await BitHelper.readByte(bytes),
        };
    },
    exec: async (data, snapshot) => {
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", () => new Map());
        
        const id = data.id;
        if (!anims.has(id)) throw new AnimNotFound(`EnemyAnim of id '${id}' was not found.`);
        const anim = anims.get(id)!;
        anim.lastWindupTime = snapshot.time();
        anim.windupAnimIndex = data.animIndex;
    }
});

ModuleLoader.registerEvent("Vanilla.Enemy.Animation.Hitreact", "0.0.1", {
    parse: async (bytes) => {
        return {
            id: await BitHelper.readInt(bytes),
            animIndex: await BitHelper.readByte(bytes),
            direction: hitreactDirections[await BitHelper.readByte(bytes)],
            type: hitreactTypes[await BitHelper.readByte(bytes)],
        };
    },
    exec: async (data, snapshot) => {
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", () => new Map());
        
        const id = data.id;
        if (!anims.has(id)) throw new AnimNotFound(`EnemyAnim of id '${id}' was not found.`);
        const anim = anims.get(id)!;
        anim.lastHitreactTime = snapshot.time();
        anim.hitreactAnimIndex = data.animIndex;
        anim.hitreactDirection = data.direction;
        anim.hitreactType = data.type;
    }
});

ModuleLoader.registerEvent("Vanilla.Enemy.Animation.Melee", "0.0.1", {
    parse: async (bytes) => {
        return {
            id: await BitHelper.readInt(bytes),
            animIndex: await BitHelper.readByte(bytes),
            type: meleeTypes[await BitHelper.readByte(bytes)],
        };
    },
    exec: async (data, snapshot) => {
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", () => new Map());
        
        const id = data.id;
        if (!anims.has(id)) throw new AnimNotFound(`EnemyAnim of id '${id}' was not found.`);
        const anim = anims.get(id)!;
        anim.lastMeleeTime = snapshot.time();
        anim.meleeAnimIndex = data.animIndex;
        anim.meleeType = data.type;
    }
});

ModuleLoader.registerEvent("Vanilla.Enemy.Animation.Jump", "0.0.1", {
    parse: async (bytes) => {
        return {
            id: await BitHelper.readInt(bytes),
            animIndex: await BitHelper.readByte(bytes)
        };
    },
    exec: async (data, snapshot) => {
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", () => new Map());
        
        const id = data.id;
        if (!anims.has(id)) throw new AnimNotFound(`EnemyAnim of id '${id}' was not found.`);
        const anim = anims.get(id)!;
        anim.lastJumpTime = snapshot.time();
        anim.jumpAnimIndex = data.animIndex;
    }
});

ModuleLoader.registerEvent("Vanilla.Enemy.Animation.Heartbeat", "0.0.1", {
    parse: async (bytes) => {
        return {
            id: await BitHelper.readInt(bytes),
            animIndex: await BitHelper.readByte(bytes)
        };
    },
    exec: async (data, snapshot) => {
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", () => new Map());
        
        const id = data.id;
        if (!anims.has(id)) throw new AnimNotFound(`EnemyAnim of id '${id}' was not found.`);
        const anim = anims.get(id)!;
        anim.lastHeartbeatTime = snapshot.time();
        anim.heartbeatAnimIndex = data.animIndex;
    }
});

ModuleLoader.registerEvent("Vanilla.Enemy.Animation.Wakeup", "0.0.1", {
    parse: async (bytes) => {
        return {
            id: await BitHelper.readInt(bytes),
            animIndex: await BitHelper.readByte(bytes),
            turn: await BitHelper.readBool(bytes)
        };
    },
    exec: async (data, snapshot) => {
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", () => new Map());
        
        const id = data.id;
        if (!anims.has(id)) throw new AnimNotFound(`EnemyAnim of id '${id}' was not found.`);
        const anim = anims.get(id)!;
        anim.lastWakeupTime = snapshot.time();
        anim.wakeupAnimIndex = data.animIndex;
        anim.wakeupTurn = data.turn;
    }
});

export class AnimNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicateAnim extends Error {
    constructor(message?: string) {
        super(message);
    }
}

// --------------------------- RENDERING ---------------------------

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Enemies": void;
        }

        interface RenderData {
            "Enemies": Map<number, EnemyModel>;
            "Enemy.LimbCustom": Map<number, { mesh: Mesh, material: MeshPhongMaterial }>;
        }
    }
}

const worldPos: AvatarStructure<HumanJoints, Vector3> = createAvatarStruct(HumanJoints, () => new Vector3());
function getWorldPos(worldPos: AvatarStructure<HumanJoints, Vector3>, skeleton: HumanSkeleton): AvatarStructure<HumanJoints, Vector3> {
    for (const key of skeleton.keys) {
        skeleton.joints[key].getWorldPosition(worldPos[key]);
    }

    return worldPos;
}

const bodyTop = Pod.Vec.zero();
const bodyBottom = Pod.Vec.zero();
const temp = new Vector3();

const headScale = new Vector3(0.15, 0.15, 0.15);

const rot = new Quaternion();

const radius = 0.05;
const sM = new Vector3(radius, radius, radius);
const scale = new Vector3(radius, radius, radius);

export class EnemyModel {
    root: Object3D;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(enemy: Enemy) {
        this.root = new Group();
    }

    public addToScene(scene: Scene) {
        scene.add(this.root);
    }

    public removeFromScene(scene: Scene) {
        scene.remove(this.root);
    }

    public setVisible(visible: boolean) {
        this.root.visible = visible;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public update(dt: number, time: number, enemy: Enemy, anim: EnemyAnimState, camera: Camera) {
    }

    public dispose() {
    }
}

const tmpPos = new Vector3();
const camPos = new Vector3();

export class HumanoidEnemyModel extends EnemyModel {
    anchor: Object3D;
    pivot: Object3D;
    
    skeleton: HumanSkeleton;
    visual: HumanSkeleton;
    color: Color;

    head: number;
    parts: number[];
    points: number[];

    datablock?: EnemySpecification;
    animHandle?: EnemyAnimHandle;

    offset: number;

    tmp?: Text;

    private construct(skeleton: HumanSkeleton) {
        skeleton.joints.hip.add(
            skeleton.joints.spine0,
            skeleton.joints.leftUpperLeg,
            skeleton.joints.rightUpperLeg
        );
        skeleton.joints.leftUpperLeg.add(skeleton.joints.leftLowerLeg);
        skeleton.joints.leftLowerLeg.add(skeleton.joints.leftFoot!);
        skeleton.joints.rightUpperLeg.add(skeleton.joints.rightLowerLeg);
        skeleton.joints.rightLowerLeg.add(skeleton.joints.rightFoot!);
        skeleton.joints.spine0.add(skeleton.joints.spine1);
        skeleton.joints.spine1.add(skeleton.joints.spine2);
        skeleton.joints.spine2.add(
            skeleton.joints.neck,
            skeleton.joints.leftShoulder,
            skeleton.joints.rightShoulder
        );
        skeleton.joints.leftShoulder.add(skeleton.joints.leftUpperArm);
        skeleton.joints.leftUpperArm.add(skeleton.joints.leftLowerArm);
        skeleton.joints.leftLowerArm.add(skeleton.joints.leftHand!);
        skeleton.joints.rightShoulder.add(skeleton.joints.rightUpperArm);
        skeleton.joints.rightUpperArm.add(skeleton.joints.rightLowerArm);
        skeleton.joints.rightLowerArm.add(skeleton.joints.rightHand!);
        skeleton.joints.neck.add(skeleton.joints.head);
        
        skeleton.set(defaultHumanStructure);
    }

    constructor(enemy: Enemy) {
        super(enemy);
        this.offset = Math.random() * 10;

        this.datablock = specification.enemies.get(enemy.type);
        if (enemy.animHandle !== undefined) {
            this.animHandle = specification.enemyAnimHandles.get(enemy.animHandle);
        }

        this.color = new Color(0xff0000);

        this.anchor = new Group();
        this.pivot = new Group();
        this.anchor.add(this.pivot);
        this.root.add(this.anchor);

        this.skeleton = new AvatarSkeleton(HumanJoints, "hip");
        this.visual = new AvatarSkeleton(HumanJoints, "hip");
        this.construct(this.skeleton);
        this.construct(this.visual);

        this.pivot.add(this.visual.joints.hip);

        // Scale model - NOTE(randomuserhi): IK doesn't work with scaled models
        let scale = enemy.scale;
        if (this.datablock !== undefined) {
            if (this.datablock.neckScale !== undefined) {
                this.skeleton.joints.neck.scale.copy(this.datablock.neckScale);
            }
            if (this.datablock.armScale !== undefined) {
                this.skeleton.joints.leftUpperArm.scale.copy(this.datablock.armScale);
                this.skeleton.joints.rightUpperArm.scale.copy(this.datablock.armScale);
            }
            if (this.datablock.legScale !== undefined) {
                this.skeleton.joints.leftUpperLeg.scale.copy(this.datablock.legScale);
                this.skeleton.joints.rightUpperLeg.scale.copy(this.datablock.legScale);
            }
            if (this.datablock.chestScale !== undefined) {
                this.skeleton.joints.spine2.scale.copy(this.datablock.chestScale);
            }
            if (this.datablock.scale !== undefined) {
                scale *= this.datablock.scale;
            }
        }

        this.anchor.scale.set(scale, scale, scale);

        this.parts = new Array(9);
        this.points = new Array(14);
        this.head = -1;
    
        this.tmp = new Text();
        this.tmp.font = "./fonts/oxanium/Oxanium-SemiBold.ttf";
        this.tmp.fontSize = 0.2;
        this.tmp.position.y = 2;
        this.tmp.textAlign = "center";
        this.tmp.anchorX = "center";
        this.tmp.anchorY = "bottom";
        this.tmp.color = 0xffffff;
        this.tmp.visible = false;
        this.anchor.add(this.tmp);
    }

    public update(dt: number, time: number, enemy: Enemy, anim: EnemyAnimState, camera: Camera) {
        this.animate(dt, time, enemy, anim, camera);
        this.render(dt, enemy);
    }

    private animate(dt: number, time: number, enemy: Enemy, anim: EnemyAnimState, camera: Camera) {
        this.pivot.rotation.set(0, 0, 0);

        time /= 1000; // NOTE(randomuserhi): Animations are handled using seconds, convert ms to seconds
        const offsetTime = time + this.offset;

        animVelocity.x = anim.velocity.x;
        animVelocity.y = anim.velocity.z;
        animCrouch.x = 0;
        animDetection.x = anim.detect;

        const overrideBlend = this.animHandle !== undefined && this.animHandle.blend ? Math.clamp01(this.animHandle.blend * dt) : 1;

        if (this.animHandle === undefined) {
            this.skeleton.blend(playerAnimations.defaultMovement.sample(offsetTime), overrideBlend);
            return;
        }

        const stateTime = time - (anim.lastStateTime / 1000);
        switch (anim.state) {
        case "Hibernate": {
            this.skeleton.override(this.animHandle.hibernateLoop.sample(stateTime));
            if (stateTime < this.animHandle.hibernateIn.duration) {
                this.skeleton.blend(this.animHandle.hibernateIn.sample(stateTime), 1 - Math.clamp01(stateTime / this.animHandle.hibernateIn.duration));
            }
            
            const heartbeatTime = time - (anim.lastHeartbeatTime / 1000);
            const heartbeatAnim = this.animHandle.heartbeats[anim.heartbeatAnimIndex];
            const inHeartbeat = heartbeatAnim !== undefined && heartbeatTime < heartbeatAnim.duration;
            if (inHeartbeat) {
                const blend = heartbeatTime < heartbeatAnim.duration / 2 ? Math.clamp01(heartbeatTime / 0.15) : Math.clamp01((heartbeatAnim.duration - heartbeatTime) / 0.15);
                this.skeleton.blend(heartbeatAnim.sample(Math.clamp(heartbeatTime, 0, heartbeatAnim.duration)), blend);
            }
        } break;
        case "ClimbLadder": 
            if (anim.up) {
                this.pivot.rotation.set(-90 * Math.deg2rad, 0, 0, "YXZ");
            } else {
                this.pivot.rotation.set(90 * Math.deg2rad, 180 * Math.deg2rad, 0, "YXZ");
            } 
            this.skeleton.blend(this.animHandle.ladderClimb.sample(offsetTime, 2), overrideBlend);
            break;
        default: this.skeleton.blend(this.animHandle.movement.sample(offsetTime), overrideBlend); break;
        }

        const wakeupTime = time - (anim.lastWakeupTime / 1000);
        const wakeupAnim = anim.wakeupTurn ? this.animHandle.wakeupTurns[anim.wakeupAnimIndex] : this.animHandle.wakeup[anim.wakeupAnimIndex];
        const inWakeup = wakeupAnim !== undefined && wakeupTime < wakeupAnim.duration && anim.state === "HibernateWakeUp";
        if (inWakeup) {
            const blend = wakeupTime < wakeupAnim.duration / 2 ? Math.clamp01(wakeupTime / 0.15) : Math.clamp01((wakeupAnim.duration - wakeupTime) / 0.15);
            this.skeleton.blend(wakeupAnim.sample(Math.clamp(wakeupTime, 0, wakeupAnim.duration)), blend);
        }

        const screamTime = time - (anim.lastScreamTime / 1000);
        const screamAnim = this.animHandle.screams[anim.screamAnimIndex];
        const inScream = screamAnim !== undefined && screamTime < screamAnim.duration && (anim.state === "Scream" || anim.state === "ScoutScream");
        if (inScream) {
            if (anim.screamType === "Regular") {
                const blend = screamTime < screamAnim.duration / 2 ? Math.clamp01(screamTime / 0.15) : Math.clamp01((screamAnim.duration - screamTime) / 0.15);
                this.skeleton.blend(screamAnim.sample(Math.clamp(screamTime, 0, screamAnim.duration)), blend);
            }

            // TODO(randomuserhi): scream effect...
        }

        const jumpTime = time - (anim.lastJumpTime / 1000);
        const jumpAnim = this.animHandle.jump[anim.jumpAnimIndex];
        const inJump = (jumpTime < jumpAnim.duration || anim.state === "Jump");
        if (inJump) {
            const blend = jumpTime < jumpAnim.duration / 2 ? Math.clamp01(jumpTime / 0.15) : Math.clamp01((jumpAnim.duration - jumpTime) / 0.15);
            this.skeleton.blend(jumpAnim.sample(Math.clamp(jumpTime, 0, jumpAnim.duration)), blend);
            return;
        }

        if (this.animHandle.melee !== undefined) {
            const meleeTime = time - (anim.lastMeleeTime / 1000);
            const meleeAnim = this.animHandle.melee[anim.meleeType][anim.meleeAnimIndex];
            const inMelee = meleeAnim !== undefined && meleeTime < meleeAnim.duration;
            if (inMelee) {
                const blend = meleeTime < meleeAnim.duration / 2 ? Math.clamp01(meleeTime / 0.15) : Math.clamp01((meleeAnim.duration - meleeTime) / 0.15);
                this.skeleton.blend(meleeAnim.sample(Math.clamp(meleeTime, 0, meleeAnim.duration)), blend);
            }
        }

        const windupTime = time - (anim.lastWindupTime / 1000);
        const windupAnim = this.animHandle.abilityFire[anim.windupAnimIndex];
        const inWindup = windupAnim !== undefined && (windupTime < windupAnim.duration || anim.state === "StrikerAttack");
        if (inWindup) {
            const blend = windupTime < windupAnim.duration / 2 ? Math.clamp01(windupTime / 0.15) : Math.clamp01((windupAnim.duration - windupTime) / 0.15);
            this.skeleton.blend(windupAnim.sample(Math.clamp(windupTime, 0, windupAnim.duration)), blend);
        }

        if (this.animHandle.melee !== undefined) {
            const meleeTime = time - (anim.lastMeleeTime / 1000);
            const meleeAnim = this.animHandle.melee[anim.meleeType][anim.meleeAnimIndex];
            const inMelee = meleeAnim !== undefined && (meleeTime < meleeAnim.duration && anim.state === "StrikerAttack");
            if (inMelee) {
                const blend = meleeTime < meleeAnim.duration / 2 ? Math.clamp01(meleeTime / 0.15) : Math.clamp01((meleeAnim.duration - meleeTime) / 0.15);
                this.skeleton.blend(meleeAnim.sample(Math.clamp(meleeTime, 0, meleeAnim.duration)), blend);
            }
        }

        const hitreactTime = time - (anim.lastHitreactTime / 1000);
        let hitreactAnim: HumanAnimation | undefined = undefined;
        switch (anim.hitreactType) {
        case "Heavy": {
            switch (anim.hitreactDirection) {
            case "Backward": hitreactAnim = this.animHandle.hitHeavyBwd[anim.hitreactAnimIndex]; break;
            case "Forward": hitreactAnim = this.animHandle.hitHeavyFwd[anim.hitreactAnimIndex]; break;
            case "Left": hitreactAnim = this.animHandle.hitHeavyLt[anim.hitreactAnimIndex]; break;
            case "Right": hitreactAnim = this.animHandle.hitHeavyRt[anim.hitreactAnimIndex]; break;
            }
        } break;
        case "Light": {
            switch (anim.hitreactDirection) {
            case "Backward": hitreactAnim = this.animHandle.hitLightBwd[anim.hitreactAnimIndex]; break;
            case "Forward": hitreactAnim = this.animHandle.hitLightFwd[anim.hitreactAnimIndex]; break;
            case "Left": hitreactAnim = this.animHandle.hitLightLt[anim.hitreactAnimIndex]; break;
            case "Right": hitreactAnim = this.animHandle.hitLightRt[anim.hitreactAnimIndex]; break;
            }
        } break;
        }
        const inHitreact = hitreactAnim !== undefined && hitreactTime < hitreactAnim.duration;
        if (inHitreact) {
            const blend = hitreactTime < hitreactAnim.duration / 2 ? Math.clamp01(hitreactTime / 0.15) : Math.clamp01((hitreactAnim.duration - hitreactTime) / 0.15);
            this.skeleton.blend(hitreactAnim.sample(Math.clamp(hitreactTime, 0, hitreactAnim.duration)), blend);
        }

        if (this.tmp === undefined) return;

        //this.tmp.text = `${stateTime < this.animHandle.hibernateIn.duration}`;

        this.tmp.visible = false;

        this.tmp.getWorldPosition(tmpPos);
        camera.getWorldPosition(camPos);

        const lerp = Math.clamp01(camPos.distanceTo(tmpPos) / 30);
        this.tmp.fontSize = lerp * 0.3 + 0.05;
        this.tmp.lookAt(camPos);
    }

    public render(dt: number, enemy: Enemy): void {
        this.root.position.copy(enemy.position);
        this.anchor.quaternion.copy(enemy.rotation);

        const blendFactor = Math.clamp01(dt * 50);
        for (const key of HumanJoints) {
            this.visual.joints[key].quaternion.slerp(this.skeleton.joints[key].quaternion, blendFactor);
        }
        this.visual.root.position.lerp(this.skeleton.root.position, blendFactor);
        getWorldPos(worldPos, this.visual);

        const pM = new Matrix4();

        if (enemy.head)
            this.head = consume("Sphere.MeshPhong", pM.compose(worldPos.head, zeroQ, headScale), this.color);

        let i = 0;
        let j = 0;

        Pod.Vec.copy(bodyTop, worldPos.neck);

        Pod.Vec.mid(bodyBottom, worldPos.leftUpperLeg, worldPos.rightUpperLeg);

        pM.lookAt(temp.copy(bodyBottom).sub(bodyTop), zeroV, upV);
        scale.z = Pod.Vec.dist(bodyTop, bodyBottom);
        pM.compose(temp.copy(bodyTop), rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(bodyTop, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(bodyBottom, zeroQ, sM), this.color);

        pM.lookAt(temp.copy(worldPos.leftLowerArm).sub(worldPos.leftUpperArm), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.leftUpperArm, worldPos.leftLowerArm);
        pM.compose(worldPos.leftUpperArm, rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        pM.lookAt(temp.copy(worldPos.leftHand!).sub(worldPos.leftLowerArm), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.leftLowerArm, worldPos.leftHand!);
        pM.compose(worldPos.leftLowerArm, rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.leftUpperArm, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.leftLowerArm, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.leftHand, zeroQ, sM), this.color);

        pM.lookAt(temp.copy(worldPos.rightLowerArm).sub(worldPos.rightUpperArm), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.rightUpperArm, worldPos.rightLowerArm);
        pM.compose(worldPos.rightUpperArm, rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        pM.lookAt(temp.copy(worldPos.rightHand!).sub(worldPos.rightLowerArm), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.rightLowerArm, worldPos.rightHand!);
        pM.compose(worldPos.rightLowerArm, rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.rightUpperArm, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.rightLowerArm, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.rightHand, zeroQ, sM), this.color);

        pM.lookAt(temp.copy(worldPos.leftLowerLeg).sub(worldPos.leftUpperLeg), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.leftUpperLeg, worldPos.leftLowerLeg);
        pM.compose(worldPos.leftUpperLeg, rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        pM.lookAt(temp.copy(worldPos.leftFoot!).sub(worldPos.leftLowerLeg), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.leftLowerLeg, worldPos.leftFoot);
        pM.compose(worldPos.leftLowerLeg, rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.leftUpperLeg, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.leftLowerLeg, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.leftFoot, zeroQ, sM), this.color);

        pM.lookAt(temp.copy(worldPos.rightLowerLeg).sub(worldPos.rightUpperLeg), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.rightUpperLeg, worldPos.rightLowerLeg);
        pM.compose(worldPos.rightUpperLeg, rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        pM.lookAt(temp.copy(worldPos.rightFoot!).sub(worldPos.rightLowerLeg), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.rightLowerLeg, worldPos.rightFoot!);
        pM.compose(worldPos.rightLowerLeg, rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.rightUpperLeg, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.rightLowerLeg, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.rightFoot, zeroQ, sM), this.color);
    }

    public dispose(): void {
        this.tmp?.dispose();
        this.tmp = undefined;
    }
}

ModuleLoader.registerRender("Enemies", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot, dt) => {
            const time = snapshot.time();
            const models = renderer.getOrDefault("Enemies", () => new Map());
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
            const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", () => new Map());
            const camera = renderer.get("Camera")!;
            for (const [id, enemy] of enemies) {
                if (!models.has(id)) {
                    const modelFactory = specification.enemies.get(enemy.type)?.model;
                    let model: EnemyModel;
                    if (modelFactory !== undefined) {
                        model = modelFactory();
                    } else {
                        model = new HumanoidEnemyModel(enemy);
                    }
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.setVisible(enemy.dimension === renderer.get("Dimension"));
                
                if (model.root.visible) {
                    if (anims.has(id)) {
                        const anim = anims.get(id)!;
                        model.update(dt, time, enemy, anim, camera);
                    }
                }
            }

            for (const [id, model] of [...models.entries()]) {
                if (!enemies.has(id)) {
                    model.removeFromScene(renderer.scene);
                    model.dispose();
                    models.delete(id);
                }
            }
        } 
    }, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Enemy.LimbCustom", () => new Map());
            const limbs = snapshot.getOrDefault("Vanilla.Enemy.LimbCustom", () => new Map());
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
            for (const [id, limb] of limbs) {
                const owner = enemies.get(limb.owner);
                if (!models.has(id)) {
                    const material = new MeshPhongMaterial({
                        color: 0xff0000
                    });
                    material.transparent = true;
                    material.opacity = 0.8;
            
                    const geometry = new SphereGeometry(limb.scale, 10, 10);
            
                    const mesh = new Mesh(geometry, material);
                    models.set(id, { mesh, material });
                    renderer.scene.add(mesh);
                }
                const model = models.get(id)!;
                if (owner === undefined) {
                    model.mesh.visible = false;
                    continue;
                }

                model.mesh.position.set(limb.position.x, limb.position.y, limb.position.z);
                model.mesh.visible = limb.active && limb.dimension === renderer.get("Dimension");
            }

            for (const [id, model] of [...models.entries()]) {
                if (!limbs.has(id)) {
                    renderer.scene.remove(model.mesh);
                    models.delete(id);
                }
            }
        } 
    }]);
});