import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";
import { DuplicateDynamic, DynamicNotFound, DynamicTransform } from "../../parser/replayrecorder.js";
import { HumanJoints } from "../../renderer/animations/human.js";
import { specification } from "../../renderer/specification.js";
import { createDeathCross } from "../deathcross.js";
import { Damage } from "../stattracker/damage.js";
import { StatTracker, getPlayerStats, isPlayer } from "../stattracker/stats.js";
import { ScreamType } from "./enemyscreams.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Enemy": {
                parse: {
                    dimension: number;
                    absolute: boolean;
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                    consumedPlayerSlotIndex: number;
                };
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
                    active: boolean;
                };
                spawn: {
                    owner: number;
                    bone: HumanJoints;
                    offset: Pod.Vector;
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

            "Vanilla.Enemy.Animation.PouncerGrab": {
                id: number;
            };

            "Vanilla.Enemy.Animation.PouncerSpit": {
                id: number;
            };

            "Vanilla.Enemy.Animation.ScoutScream": {
                id: number;
                start: boolean;
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

export interface LimbCustom {
    owner: number;
    bone: HumanJoints;
    offset: Pod.Vector;
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
    consumedPlayerSlotIndex: number;
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
            const transform = await DynamicTransform.parse(data);
            const result = {
                ...transform,
                consumedPlayerSlotIndex: await BitHelper.readByte(data)
            };
            return result;
        }, 
        exec: (id, data, snapshot, lerp) => {
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
    
            if (!enemies.has(id)) throw new EnemyNotFound(`Enemy of id '${id}' was not found.`);
            const enemy = enemies.get(id)!;
            DynamicTransform.lerp(enemy, data, lerp);
            enemy.consumedPlayerSlotIndex = data.consumedPlayerSlotIndex;
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
                consumedPlayerSlotIndex: 255,
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
            return {
                active: await BitHelper.readBool(data)
            };
        }, 
        exec: (id, data, snapshot) => {
            const limbs = snapshot.getOrDefault("Vanilla.Enemy.LimbCustom", () => new Map());
    
            if (!limbs.has(id)) throw new DynamicNotFound(`Limb of id '${id}' was not found.`);
            const limb = limbs.get(id)!;
            limb.active = data.active;
        }
    },
    spawn: {
        parse: async (data) => {
            return {
                owner: await BitHelper.readUShort(data),
                bone: HumanJoints[await BitHelper.readByte(data)],
                offset: await BitHelper.readHalfVector(data),
                scale: await BitHelper.readHalf(data)
            };
        },
        exec: (id, data, snapshot) => {
            const limbs = snapshot.getOrDefault("Vanilla.Enemy.LimbCustom", () => new Map());
        
            if (limbs.has(id)) throw new DuplicateDynamic(`Limb of id '${id}' already exists.`);
            limbs.set(id, { 
                ...data, active: true
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
    lastPouncerGrabTime: number;
    lastPouncerSpitTime: number;
    scoutScreamStart: boolean;
    lastScoutScream: number;
}

ModuleLoader.registerDynamic("Vanilla.Enemy.Animation", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                velocity: { x: (await BitHelper.readByte(data) / 255 * 2 - 1) * 10, y: (await BitHelper.readByte(data) / 255 * 2 - 1) * 10, z: (await BitHelper.readByte(data) / 255 * 2 - 1) * 10 },
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
                velocity: { x: (await BitHelper.readByte(data) / 255 * 2 - 1) * 10, y: (await BitHelper.readByte(data) / 255 * 2 - 1) * 10, z: (await BitHelper.readByte(data) / 255 * 2 - 1) * 10 },
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
                wakeupTurn: false,
                lastPouncerGrabTime: -Infinity,
                lastPouncerSpitTime: -Infinity,
                lastScoutScream: -Infinity,
                scoutScreamStart: true
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
        // Don't trigger other animations
        anim.lastMeleeTime = -Infinity; 
        anim.lastScoutScream = -Infinity;
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

        // On hitreact, stop other anims
        anim.lastMeleeTime = -Infinity; 
        anim.lastWindupTime = -Infinity;
        anim.lastScoutScream = -Infinity;
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

        // Don't trigger other animations
        anim.lastScoutScream = -Infinity;
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

ModuleLoader.registerEvent("Vanilla.Enemy.Animation.PouncerGrab", "0.0.1", {
    parse: async (bytes) => {
        return {
            id: await BitHelper.readInt(bytes),
        };
    },
    exec: async (data, snapshot) => {
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", () => new Map());
        
        const id = data.id;
        if (!anims.has(id)) throw new AnimNotFound(`EnemyAnim of id '${id}' was not found.`);
        const anim = anims.get(id)!;
        anim.lastPouncerGrabTime = snapshot.time();
        anim.lastPouncerSpitTime = -Infinity;
    }
});

ModuleLoader.registerEvent("Vanilla.Enemy.Animation.PouncerSpit", "0.0.1", {
    parse: async (bytes) => {
        return {
            id: await BitHelper.readInt(bytes),
        };
    },
    exec: async (data, snapshot) => {
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", () => new Map());
        
        const id = data.id;
        if (!anims.has(id)) throw new AnimNotFound(`EnemyAnim of id '${id}' was not found.`);
        const anim = anims.get(id)!;
        anim.lastPouncerSpitTime = snapshot.time();
        anim.lastPouncerGrabTime = -Infinity;
    }
});

ModuleLoader.registerEvent("Vanilla.Enemy.Animation.ScoutScream", "0.0.1", {
    parse: async (bytes) => {
        return {
            id: await BitHelper.readInt(bytes),
            start: await BitHelper.readBool(bytes)
        };
    },
    exec: async (data, snapshot) => {
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", () => new Map());
        
        const id = data.id;
        if (!anims.has(id)) throw new AnimNotFound(`EnemyAnim of id '${id}' was not found.`);
        const anim = anims.get(id)!;
        anim.lastScoutScream = snapshot.time();
        anim.scoutScreamStart = data.start;
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