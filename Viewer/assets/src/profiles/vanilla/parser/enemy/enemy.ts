import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader, ReplayApi } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
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
                    consumedPlayerSlotIndex?: number;
                    targetPlayerSlotIndex?: number;
                    stagger?: number;
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
            "Vanilla.Enemy.Identities": Map<number, { type: Identifier }>;
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

const enemyOnDeathEvents = new Map<keyof EnemyOnDeathEventTypes, Set<(snapshot: ReplayApi, enemy: Enemy, data: any) => void>>();
export const EnemyOnDeathEvents = {
    register<T extends keyof EnemyOnDeathEventTypes>(type: T, factory: (snapshot: ReplayApi, enemy: Enemy, data: EnemyOnDeathEventTypes[T]) => void) {
        if (enemyOnDeathEvents.has(type)) {
            console.warn(`Replacing EnemyOnDeathEvent '${type}'.`);
        }
        if (!enemyOnDeathEvents.has(type)) {
            enemyOnDeathEvents.set(type, new Set());
        }
        enemyOnDeathEvents.get(type)!.add(factory);
    }
};

export function TriggerEnemyOnDeathEvents(snapshot: ReplayApi, enemy: Enemy) {
    if (enemy.lastHit === undefined || enemy.lastHitTime === undefined || snapshot.time() - enemy.lastHitTime > 1000) return;

    const events = enemyOnDeathEvents.get(enemy.lastHit.type);
    if (events === undefined) {
        throw new Error(`Unable to find EnemyOnDeathEvent '${enemy.lastHit.type}'.`);
    }
    for (const event of events) {
        event(snapshot, enemy, enemy.lastHit.data);
    }
}

ModuleLoader.registerDynamic("Vanilla.Enemy", "0.0.5", {
    main: {
        parse: async (data) => {
            const transform = await DynamicTransform.parse(data);
            const mask = await BitHelper.readByte(data);
            if (mask & 224)
                throw new Error("Invalid enemy state mask.");
            return {
                ...transform, tagged: !!(mask & 1), canStagger: !!(mask & 2),
                consumedPlayerSlotIndex: mask & 4 ? await BitHelper.readByte(data) : undefined,
                targetPlayerSlotIndex: mask & 8 ? await BitHelper.readByte(data) : undefined,
                stagger: mask & 16 ? await BitHelper.readByte(data) / 255 : undefined
            };
        },
        exec: (id, data, snapshot, lerp) => {
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", Factory("Map"));
            if (!enemies.has(id))
                throw new Error(`Enemy of id '${id}' was not found.`);
            const enemy = enemies.get(id)!;
            DynamicTransform.lerp(enemy, data, lerp);
            enemy.tagged = data.tagged;
            if (data.consumedPlayerSlotIndex !== undefined)
                enemy.consumedPlayerSlotIndex = data.consumedPlayerSlotIndex;
            if (data.targetPlayerSlotIndex !== undefined)
                enemy.targetPlayerSlotIndex = data.targetPlayerSlotIndex;
            if (data.stagger !== undefined)
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
                maxHealth: await BitHelper.readHalf(data)
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", Factory("Map"));
            if (enemies.has(id))
                throw new Error(`Enemy of id '${id}' already exists.`);
            // Host damage can arrive after the local enemy despawn. Retain only
            // its recorded identity for statistics, not its render/simulation state.
            snapshot.getOrDefault("Vanilla.Enemy.Identities", Factory("Map")).set(id, { type: data.type });
            enemies.set(id, {
                id, ...data,
                health: data.maxHealth,
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
            if (!enemies.has(id))
                throw new Error(`Enemy of id '${id}' did not exist.`);
            const enemy = enemies.get(id)!;
            DeathCross.spawn(snapshot, id, enemy.dimension, enemy.position);
            enemies.delete(id);
            // Check kill stats in the event enemy health prediction fails -> To prevent rewarding kills to enemies despawned by world event - only count enemies that died within 1 second of being hit
            if (enemy.health > 0) {
                TriggerEnemyOnDeathEvents(snapshot, enemy);
            }
            enemy.health = 0;
        }
    }
});
