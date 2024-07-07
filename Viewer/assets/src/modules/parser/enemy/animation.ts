import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Factory } from "../../library/factory";
import { ScreamType } from "./scream";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
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

            "Vanilla.Enemy.Animation.BigFlyerCharge": {
                id: number;
                charge: number;
            };
        }

        interface Data {
            "Vanilla.Enemy.Animation": Map<number, EnemyAnimState>;
        }
    }
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

export interface EnemyAnimState {
    velocity: Pod.Vector;
    state: State;
    lastStateTime: number;
    up: boolean;
    detect: number;
    lastWindupTime: number;
    windupAnimIndex: number;
    lastEndHitreactTime: number;
    lastHitreactTime: number;
    hitreactAnimIndex: number;
    hitreactDirection: HitreactDirection;
    hitreactType: HitreactType;
    lastMeleeTime: number;
    lastEndMeleeTime: number;
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
    bigFlyerCharge: number;
    lastBigFlyerCharge: number;
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
            const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", Factory("Map"));

            if (!anims.has(id)) throw new Error(`EnemyAnim of id '${id}' was not found.`);
            const anim = anims.get(id)!;
            Pod.Vec.lerp(anim.velocity, anim.velocity, data.velocity, lerp);
            if (anim.state !== data.state) {
                const time = snapshot.time();

                const wasInHitreact = anim.state === "Hitreact" || anim.state === "HitReactFlyer";
                const notInHitreact = data.state !== "Hitreact" && data.state !== "HitReactFlyer";
                if (wasInHitreact && notInHitreact) {
                    anim.lastEndHitreactTime = time; 
                }

                anim.state = data.state;
                anim.lastStateTime = time;
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
            const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", Factory("Map"));

            if (anims.has(id)) throw new Error(`EnemyAnim of id '${id}' already exists.`);
            anims.set(id, { 
                ...data,
                lastStateTime: -Infinity,
                lastWindupTime: -Infinity,
                windupAnimIndex: 0,
                lastHitreactTime: -Infinity,
                lastEndHitreactTime: -Infinity,
                hitreactAnimIndex: 0,
                hitreactDirection: "Forward",
                hitreactType: "Light",
                lastMeleeTime: -Infinity,
                lastEndMeleeTime: -Infinity,
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
                scoutScreamStart: true,
                lastBigFlyerCharge: -Infinity,
                bigFlyerCharge: 0,
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", Factory("Map"));

            if (!anims.has(id)) throw new Error(`EnemyAnim of id '${id}' did not exist.`);
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
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", Factory("Map"));
        
        const id = data.id;
        if (!anims.has(id)) throw new Error(`EnemyAnim of id '${id}' was not found.`);
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
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", Factory("Map"));
        
        const id = data.id;
        // NOTE(randomuserhi): for some reason backend reports hitreacts post-enemy death - skip error checking simply for backwards compatability
        // TODO(randomuserhi): Update parser version in backend and verify this error still persists in latest version
        if (!anims.has(id)) return; //throw new Error(`EnemyAnim of id '${id}' was not found.`); 
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
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", Factory("Map"));
        
        const id = data.id;
        if (!anims.has(id)) throw new Error(`EnemyAnim of id '${id}' was not found.`);
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
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", Factory("Map"));
        
        const id = data.id;
        if (!anims.has(id)) throw new Error(`EnemyAnim of id '${id}' was not found.`);
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
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", Factory("Map"));
        
        const id = data.id;
        if (!anims.has(id)) throw new Error(`EnemyAnim of id '${id}' was not found.`);
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
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", Factory("Map"));
        
        const id = data.id;
        if (!anims.has(id)) throw new Error(`EnemyAnim of id '${id}' was not found.`);
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
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", Factory("Map"));
        
        const id = data.id;
        if (!anims.has(id)) throw new Error(`EnemyAnim of id '${id}' was not found.`);
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
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", Factory("Map"));
        
        const id = data.id;
        if (!anims.has(id)) throw new Error(`EnemyAnim of id '${id}' was not found.`);
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
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", Factory("Map"));
        
        const id = data.id;
        // NOTE(randomuserhi): for some reason backend reports screams post-enemy death - skip error checking simply for backwards compatability
        // TODO(randomuserhi): Update parser version in backend and verify this error still persists in latest version
        if (!anims.has(id)) return; //throw new Error(`EnemyAnim of id '${id}' was not found.`);
        const anim = anims.get(id)!;
        anim.lastScoutScream = snapshot.time();
        anim.scoutScreamStart = data.start;
    }
});

ModuleLoader.registerEvent("Vanilla.Enemy.Animation.BigFlyerCharge", "0.0.1", {
    parse: async (bytes) => {
        return {
            id: await BitHelper.readInt(bytes),
            charge: await BitHelper.readHalf(bytes),
        };
    },
    exec: async (data, snapshot) => {
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", Factory("Map"));
        
        const id = data.id;
        if (!anims.has(id)) throw new Error(`EnemyAnim of id '${id}' was not found.`);
        const anim = anims.get(id)!;
        anim.lastBigFlyerCharge = snapshot.time();
        anim.bigFlyerCharge = data.charge + 0.5;
    }
});