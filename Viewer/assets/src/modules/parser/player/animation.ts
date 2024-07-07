import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Factory } from "../../library/factory.js";

interface AnimationEvent {
    owner: number;
}

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Player.Animation": {
                parse: {
                    velocity: Pod.Vector;
                    crouch: number;
                    targetLookDir: Pod.Vector;
                    state: State;
                    meleeCharging: boolean;
                    throwCharging: boolean;
                    isReloading: boolean;
                    reloadDurationInSeconds: number;
                };
                spawn: Dynamics["Vanilla.Player.Animation"]["parse"];
                despawn: void;
            };
        }

        interface Events {
            "Vanilla.Player.Animation.MeleeSwing": AnimationEvent & {
                charged: boolean;
            }
            "Vanilla.Player.Animation.MeleeShove": AnimationEvent;
            "Vanilla.Player.Animation.ConsumableThrow": AnimationEvent;
            "Vanilla.Player.Animation.Revive": AnimationEvent;
            "Vanilla.Player.Animation.Downed": AnimationEvent;
        }

        interface Data {
            "Vanilla.Player.Animation": Map<number, PlayerAnimState>;
        }
    }
}

const states = [
    "stand",
    "crouch",
    "run",
    "jump",
    "fall",
    "land",
    "stunned",
    "downed",
    "climbLadder",
    "onTerminal",
    "melee",
    "empty",
    "grabbedByTrap",
    "grabbedByTank",
    "testing",
    "inElevator",
    "grabbedByPouncer",
    "standStill"
] as const;
type State = typeof states[number];

export interface PlayerAnimState {
    velocity: Pod.Vector;
    crouch: number;
    targetLookDir: Pod.Vector;
    state: State;
    lastStateTransition: number;
    meleeCharging: boolean;
    lastMeleeChargingTransition: number;
    lastSwingTime: number;
    chargedSwing: boolean;
    throwCharging: boolean;
    lastThrowChargingTransition: number;
    lastThrowTime: number;
    isReloading: boolean;
    reloadDurationInSeconds: number;
    lastReloadTransition: number;
    lastShot: number;
    lastShoveTime: number;
    lastRevive: number;
    isDowned: boolean;
    lastDowned: number;
}

ModuleLoader.registerDynamic("Vanilla.Player.Animation", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                velocity: { x: (await BitHelper.readByte(data) / 255 * 2 - 1) * 10, y: 0, z: (await BitHelper.readByte(data) / 255 * 2 - 1) * 10 },
                crouch: await BitHelper.readByte(data) / 255,
                targetLookDir: await BitHelper.readHalfVector(data),
                state: states[await BitHelper.readByte(data)],
                meleeCharging: await BitHelper.readBool(data),
                throwCharging: await BitHelper.readBool(data),
                isReloading: await BitHelper.readBool(data),
                reloadDurationInSeconds: await BitHelper.readHalf(data)
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const anims = snapshot.getOrDefault("Vanilla.Player.Animation", Factory("Map"));
    
            if (!anims.has(id)) throw new Error(`PlayerAnim of id '${id}' was not found.`);
            const anim = anims.get(id)!;
            Pod.Vec.lerp(anim.velocity, anim.velocity, data.velocity, lerp);
            anim.crouch = anim.crouch + (data.crouch - anim.crouch) * lerp;
            Pod.Vec.lerp(anim.targetLookDir, anim.targetLookDir, data.targetLookDir, lerp);
            
            anim.reloadDurationInSeconds = data.reloadDurationInSeconds;

            const t = snapshot.time();
            if (anim.state !== data.state) {
                anim.state = data.state;
                anim.lastStateTransition = t;
            }
            if (anim.meleeCharging !== data.meleeCharging) {
                anim.meleeCharging = data.meleeCharging;
                anim.lastMeleeChargingTransition = t;
            }
            if (anim.throwCharging !== data.throwCharging) {
                anim.throwCharging = data.throwCharging;
                anim.lastThrowChargingTransition = t;
            }
            if (anim.isReloading !== data.isReloading) {
                anim.isReloading = data.isReloading;
                anim.lastReloadTransition = t;
            }

            // Safety net for isDowned in case there is a mismatch (common to desync when restarting at checkpoints):
            const minimumDownedTime = 1000; // in ms
            if (anim.state !== "downed" && anim.isDowned && t - anim.lastDowned > minimumDownedTime) {
                anim.isDowned = false;
            }
        }
    },
    spawn: {
        parse: async (data) => {
            return {
                velocity: { x: (await BitHelper.readByte(data) / 255 * 2 - 1) * 10, y: 0, z: (await BitHelper.readByte(data) / 255 * 2 - 1) * 10 },
                crouch: await BitHelper.readByte(data) / 255,
                targetLookDir: await BitHelper.readHalfVector(data),
                state: states[await BitHelper.readByte(data)],
                meleeCharging: await BitHelper.readBool(data),
                throwCharging: await BitHelper.readBool(data),
                isReloading: await BitHelper.readBool(data),
                reloadDurationInSeconds: await BitHelper.readHalf(data),
            };
        },
        exec: (id, data, snapshot) => {
            const anims = snapshot.getOrDefault("Vanilla.Player.Animation", Factory("Map"));
        
            if (anims.has(id)) throw new Error(`PlayerAnim of id '${id}' already exists.`);
            anims.set(id, { 
                ...data, 
                lastStateTransition: -Infinity,
                lastSwingTime: -Infinity,
                lastThrowTime: -Infinity,
                lastShoveTime: -Infinity,
                chargedSwing: false,
                lastMeleeChargingTransition: -Infinity,
                lastThrowChargingTransition: -Infinity,
                lastReloadTransition: -Infinity,
                lastShot: -Infinity,
                lastRevive: -Infinity,
                lastDowned: -Infinity,
                isDowned: false
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const anims = snapshot.getOrDefault("Vanilla.Player.Animation", Factory("Map"));

            if (!anims.has(id)) throw new Error(`PlayerAnim of id '${id}' did not exist.`);
            anims.delete(id);
        }
    }
});

ModuleLoader.registerEvent("Vanilla.Player.Animation.MeleeSwing", "0.0.1", {
    parse: async (bytes) => {
        return {
            owner: await BitHelper.readInt(bytes),
            charged: await BitHelper.readBool(bytes)
        };
    },
    exec: async (data, snapshot) => {
        const anims = snapshot.getOrDefault("Vanilla.Player.Animation", Factory("Map"));
        
        const id = data.owner;
        if (!anims.has(id)) throw new Error(`PlayerAnim of id '${id}' was not found.`);
        const anim = anims.get(id)!;
        anim.lastSwingTime = snapshot.time();
        anim.chargedSwing = data.charged;
    }
});

ModuleLoader.registerEvent("Vanilla.Player.Animation.MeleeShove", "0.0.1", {
    parse: async (bytes) => {
        return {
            owner: await BitHelper.readInt(bytes)
        };
    },
    exec: async (data, snapshot) => {
        const anims = snapshot.getOrDefault("Vanilla.Player.Animation", Factory("Map"));
        
        const id = data.owner;
        if (!anims.has(id)) throw new Error(`PlayerAnim of id '${id}' was not found.`);
        const anim = anims.get(id)!;
        anim.lastShoveTime = snapshot.time();
    }
});

ModuleLoader.registerEvent("Vanilla.Player.Animation.ConsumableThrow", "0.0.1", {
    parse: async (bytes) => {
        return {
            owner: await BitHelper.readInt(bytes)
        };
    },
    exec: async (data, snapshot) => {
        const anims = snapshot.getOrDefault("Vanilla.Player.Animation", Factory("Map"));
        
        const id = data.owner;
        if (!anims.has(id)) throw new Error(`PlayerAnim of id '${id}' was not found.`);
        const anim = anims.get(id)!;
        anim.lastThrowTime = snapshot.time();
    }
});

ModuleLoader.registerEvent("Vanilla.Player.Animation.Revive", "0.0.1", {
    parse: async (bytes) => {
        return {
            owner: await BitHelper.readInt(bytes)
        };
    },
    exec: async (data, snapshot) => {
        const anims = snapshot.getOrDefault("Vanilla.Player.Animation", Factory("Map"));
        
        const id = data.owner;
        if (!anims.has(id)) throw new Error(`PlayerAnim of id '${id}' was not found.`);
        const anim = anims.get(id)!;
        anim.lastRevive = snapshot.time();
        anim.isDowned = false;
    }
});

ModuleLoader.registerEvent("Vanilla.Player.Animation.Downed", "0.0.1", {
    parse: async (bytes) => {
        return {
            owner: await BitHelper.readInt(bytes)
        };
    },
    exec: async (data, snapshot) => {
        const anims = snapshot.getOrDefault("Vanilla.Player.Animation", Factory("Map"));
        
        const id = data.owner;
        if (!anims.has(id)) throw new Error(`PlayerAnim of id '${id}' was not found.`);
        const anim = anims.get(id)!;
        anim.lastDowned = snapshot.time();
        anim.isDowned = true;
    }
});