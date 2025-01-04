import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader, ReplayApi } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { backwardsCompatEnemyHp } from "../../datablocks/enemy/backwards-compat.js";
import { Factory } from "../../library/factory.js";
import { DynamicTransform } from "../../library/helpers.js";
import { DeathCross } from "../deathcross.js";
import { Identifier, IdentifierData } from "../identifier.js";
import { AnimHandles } from "./animation.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Enemy": {
                parse: {
                    dimension: number;
                    absolute: boolean;
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                    tagged: boolean;
                    consumedPlayerSlotIndex: number;
                    targetPlayerSlotIndex: number;
                    stagger: number;
                    canStagger: boolean;
                };
                spawn: {
                    dimension: number;
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                    animHandle?: AnimHandles.Flags;
                    scale: number;
                    type: Identifier;
                    maxHealth: number;
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Enemy": Map<number, Enemy>;
        }
    }
}

export interface Enemy extends DynamicTransform.Type {
    id: number;
    animHandle?: AnimHandles.Flags;
    health: number;
    head: boolean;
    scale: number;
    type: Identifier;
    players: Set<bigint>;
    lastHit?: { type: keyof EnemyOnDeathEventTypes, data: any };
    lastHitTime?: number;
    tagged: boolean;
    targetPlayerSlotIndex: number;
    consumedPlayerSlotIndex: number;
    stagger: number;
    canStagger: boolean;
}

export interface EnemyOnDeathEventTypes {
}

const enemyOnDeathEvents = new Map<keyof EnemyOnDeathEventTypes, (snapshot: ReplayApi, enemy: Enemy, data: any) => void>();
export const EnemyOnDeathEvents = {
    register<T extends keyof EnemyOnDeathEventTypes>(type: T, factory: (snapshot: ReplayApi, enemy: Enemy, data: EnemyOnDeathEventTypes[T]) => void) {
        if (enemyOnDeathEvents.has(type)) {
            console.warn(`Replacing EnemyOnDeathEvent '${type}'.`);
        }
        enemyOnDeathEvents.set(type, factory);
    }
};

let enemyParser: ModuleLoader.DynamicModule<"Vanilla.Enemy"> = ModuleLoader.registerDynamic("Vanilla.Enemy", "0.0.1", {
    main: {
        parse: async (data) => {
            const transform = await DynamicTransform.parse(data);
            const result = {
                ...transform,
                tagged: await BitHelper.readBool(data),
                consumedPlayerSlotIndex: await BitHelper.readByte(data),
                targetPlayerSlotIndex: 255,
                stagger: Infinity,
                canStagger: true,
            };
            return result;
        }, 
        exec: (id, data, snapshot, lerp) => {
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", Factory("Map"));
        
            if (!enemies.has(id)) throw new Error(`Enemy of id '${id}' was not found.`);
            const enemy = enemies.get(id)!;
            DynamicTransform.lerp(enemy, data, lerp);
            enemy.tagged = data.tagged;
            enemy.consumedPlayerSlotIndex = data.consumedPlayerSlotIndex;
            enemy.targetPlayerSlotIndex = data.targetPlayerSlotIndex;
            enemy.stagger = data.stagger;
            enemy.canStagger = data.canStagger;
        }
    },
    spawn: {
        parse: async (data, snapshot) => {
            const spawn = await DynamicTransform.spawn(data);
            const result = {
                ...spawn,
                animHandle: AnimHandles.FlagMap.get(await BitHelper.readUShort(data)),
                scale: await BitHelper.readHalf(data),
                type: await Identifier.parse(IdentifierData(snapshot), data),
                maxHealth: Infinity
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", Factory("Map"));
        
            if (enemies.has(id)) throw new Error(`Enemy of id '${id}' already exists.`);
            const backwardsCompatHp = backwardsCompatEnemyHp.get(data.type.id);
            let health = data.maxHealth;
            if (health === Infinity && backwardsCompatHp !== undefined) {
                health = backwardsCompatHp;
            }
            enemies.set(id, { 
                id, ...data,
                health,
                head: true,
                players: new Set(),
                tagged: false,
                consumedPlayerSlotIndex: 255,
                targetPlayerSlotIndex: 255,
                stagger: Infinity,
                canStagger: true
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            // TODO(randomuserhi): Cleanup code
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", Factory("Map"));

            if (!enemies.has(id)) throw new Error(`Enemy of id '${id}' did not exist.`);
            const enemy = enemies.get(id)!;
            DeathCross.spawn(snapshot, id, enemy.dimension, enemy.position);
            enemies.delete(id);

            // Check kill stats in the event enemy health prediction fails -> To prevent rewarding kills to enemies despawned by world event - only count enemies that died within 1 second of being hit
            if (enemy.health > 0 && enemy.lastHit !== undefined && enemy.lastHitTime !== undefined && snapshot.time() - enemy.lastHitTime <= 1000) {
                const event = enemyOnDeathEvents.get(enemy.lastHit.type);
                if (event === undefined) {
                    throw new Error(`Unable to find EnemyOnDeathEvent '${enemy.lastHit.type}'.`);
                }
                event(snapshot, enemy, enemy.lastHit.data);
            }
            enemy.health = 0;
        }
    }
});
enemyParser = ModuleLoader.registerDynamic("Vanilla.Enemy", "0.0.2", {
    ...enemyParser,
    spawn: {
        ...enemyParser.spawn,
        parse: async (data, snapshot) => {
            const spawn = await DynamicTransform.spawn(data);
            const result = {
                ...spawn,
                animHandle: AnimHandles.FlagMap.get(await BitHelper.readUShort(data)),
                scale: await BitHelper.readHalf(data),
                type: await Identifier.parse(IdentifierData(snapshot), data),
                maxHealth: await BitHelper.readHalf(data)
            };
            return result;
        }
    },
});
enemyParser = ModuleLoader.registerDynamic("Vanilla.Enemy", "0.0.3", {
    ...enemyParser,
    main: {
        ...enemyParser.main,
        parse: async (data) => {
            const transform = await DynamicTransform.parse(data);
            const result = {
                ...transform,
                tagged: await BitHelper.readBool(data),
                consumedPlayerSlotIndex: await BitHelper.readByte(data),
                targetPlayerSlotIndex: await BitHelper.readByte(data),
                stagger: Infinity,
                canStagger: true
            };
            return result;
        }
    }
});
enemyParser = ModuleLoader.registerDynamic("Vanilla.Enemy", "0.0.4", {
    ...enemyParser,
    main: {
        ...enemyParser.main,
        parse: async (data) => {
            const transform = await DynamicTransform.parse(data);
            const result = {
                ...transform,
                tagged: await BitHelper.readBool(data),
                consumedPlayerSlotIndex: await BitHelper.readByte(data),
                targetPlayerSlotIndex: await BitHelper.readByte(data),
                stagger: await BitHelper.readByte(data) / 255,
                canStagger: await BitHelper.readBool(data)
            };
            return result;
        }
    }
});