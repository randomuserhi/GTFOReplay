import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { EnemyDatablock } from "../../datablocks/enemy/enemy.js";
import { Factory } from "../../library/factory.js";
import { DynamicTransform } from "../../library/helpers.js";
import { DeathCross } from "../deathcross.js";
import { Damage } from "../events/damage.js";
import { Identifier, IdentifierData } from "../identifier.js";
import { StatTracker } from "../stattracker/stattracker.js";
import { AnimHandles } from "./animation.js";

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
    lastHit?: Damage;
    lastHitTime?: number;
    tagged: boolean;
    targetPlayerSlotIndex: number;
    consumedPlayerSlotIndex: number;
}

let enemyParser: ModuleLoader.DynamicModule<"Vanilla.Enemy"> = ModuleLoader.registerDynamic("Vanilla.Enemy", "0.0.1", {
    main: {
        parse: async (data) => {
            const transform = await DynamicTransform.parse(data);
            const result = {
                ...transform,
                tagged: await BitHelper.readBool(data),
                consumedPlayerSlotIndex: await BitHelper.readByte(data),
                targetPlayerSlotIndex: 255,
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
            const datablock = EnemyDatablock.get(data.type);
            let health = data.maxHealth;
            if (health === Infinity && datablock?.maxHealth !== undefined) {
                health = datablock.maxHealth;
            }
            enemies.set(id, { 
                id, ...data,
                health,
                head: true,
                players: new Set(),
                tagged: false,
                consumedPlayerSlotIndex: 255,
                targetPlayerSlotIndex: 255
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
                // Update kill to last player that hit enemy
                const statTracker = StatTracker.from(snapshot);
                const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
                
                let lastHit;
                if (players.has(enemy.lastHit.source)) {
                    lastHit = players.get(enemy.lastHit.source)!.snet;
                } else if(enemy.lastHit.type === "Explosive") {
                    const detonations = snapshot.getOrDefault("Vanilla.Mine.Detonate", Factory("Map"));
                    const mines = snapshot.getOrDefault("Vanilla.Mine", Factory("Map"));

                    const detonation = detonations.get(enemy.lastHit.source);
                    if (detonation === undefined) throw new Error("Explosive damage was dealt, but cannot find detonation event.");

                    const mine = mines.get(enemy.lastHit.source);
                    if (mine === undefined) throw new Error("Explosive damage was dealt, but cannot find mine.");

                    lastHit = mine.snet;
                }
                if (lastHit === undefined) throw new Error(`Could not find player '${enemy.lastHit.source}'.`);
                
                for (const snet of enemy.players) {
                    const sourceStats = StatTracker.getPlayer(snet, statTracker);

                    const enemyTypeHash = enemy.type.hash;
                    if (snet === lastHit) {
                        if (enemy.lastHit.type === "Explosive") {
                            if (!sourceStats.mineKills.has(enemyTypeHash)) {
                                sourceStats.mineKills.set(enemyTypeHash, { type: enemy.type, value: 0 });
                            }
                            sourceStats.mineKills.get(enemyTypeHash)!.value += 1;
                        } else if (enemy.lastHit.sentry) {
                            if (!sourceStats.sentryKills.has(enemyTypeHash)) {
                                sourceStats.sentryKills.set(enemyTypeHash, { type: enemy.type, value: 0 });
                            }
                            sourceStats.sentryKills.get(enemyTypeHash)!.value += 1;
                        } else {
                            if (!sourceStats.kills.has(enemyTypeHash)) {
                                sourceStats.kills.set(enemyTypeHash, { type: enemy.type, value: 0 });
                            }
                            sourceStats.kills.get(enemyTypeHash)!.value += 1;
                        }
                    } else {
                        if (!sourceStats.assists.has(enemyTypeHash)) {
                            sourceStats.assists.set(enemyTypeHash, { type: enemy.type, value: 0 });
                        }
                        sourceStats.assists.get(enemyTypeHash)!.value += 1;
                    }
                }
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
            };
            return result;
        }
    }
});