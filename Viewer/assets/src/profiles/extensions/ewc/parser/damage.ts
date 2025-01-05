import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader, ReplayApi } from "@esm/@root/replay/moduleloader.js";
import { Factory } from "../../../vanilla/library/factory.js";
import { Enemy, EnemyOnDeathEvents } from "../../../vanilla/parser/enemy/enemy.js";
import { StatTracker } from "../../../vanilla/parser/stattracker/stattracker.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "EWC.Damage": EWCDamage;
        }
    }
}

export const typemap = [
    "Explosive",
    "DoT"
] as const;
export type EWCDamageType = typeof typemap[number];

export interface EWCDamage {
    type: EWCDamageType;
    source: number;
    target: number;
    damage: number;
}

declare module "../../../vanilla/parser/enemy/enemy.js" {
    interface EnemyOnDeathEventTypes {
        "EWC": EWCDamage;
    }
}

EnemyOnDeathEvents.register("EWC", (snapshot: ReplayApi, enemy: Enemy, hitData: EWCDamage) => {
    // Update kill to last player that hit enemy
    const statTracker = StatTracker.from(snapshot);
    const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
                        
    const lastHit = players.get(hitData.source)?.snet;
    if (lastHit === undefined) throw new Error(`Could not find player '${hitData.source}'.`);
                        
    for (const snet of enemy.players) {
        const sourceStats = StatTracker.getPlayer(snet, statTracker);
        
        const enemyTypeHash = enemy.type.hash;
        if (snet === lastHit) {
            if (!sourceStats.kills.has(enemyTypeHash)) {
                sourceStats.kills.set(enemyTypeHash, { type: enemy.type, value: 0 });
            }
            sourceStats.kills.get(enemyTypeHash)!.value += 1;
        } else {
            if (!sourceStats.assists.has(enemyTypeHash)) {
                sourceStats.assists.set(enemyTypeHash, { type: enemy.type, value: 0 });
            }
            sourceStats.assists.get(enemyTypeHash)!.value += 1;
        }
    }
});

// TODO(randomuserhi): Cleanup code
ModuleLoader.registerEvent("EWC.Damage", "0.0.1", {
    parse: async (bytes) => {
        return {
            type: typemap[await BitHelper.readByte(bytes)],
            source: await BitHelper.readUShort(bytes),
            target: await BitHelper.readUShort(bytes),
            damage: await BitHelper.readHalf(bytes),
        };
    },
    exec: async (data, snapshot) => {
        const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
        const enemies = snapshot.getOrDefault("Vanilla.Enemy", Factory("Map"));
        const statTracker = StatTracker.from(snapshot);

        const { type, source, target, damage } = data;

        const sourceSnet = players.get(source)?.snet;
        if (sourceSnet === undefined) {
            throw new Error(`Unable to get player snet ${source}`);
        }
        
        // Calculate enemy HP and count kills
        if (enemies.has(target)) {
            const enemy = enemies.get(target)!;
            
            enemy.players.add(sourceSnet);
            if (enemy.health > 0) {
                enemy.health -= damage;
                enemy.lastHit = {
                    type: "EWC",
                    data
                };
                enemy.lastHitTime = snapshot.time();
                if (enemy.health <= 0) {
                    enemy.health = 0;

                    for (const snet of enemy.players) {
                        const sourceStats = StatTracker.getPlayer(snet, statTracker);

                        const enemyTypeHash = enemy.type.hash;
                        if (snet === sourceSnet) {
                            if (!sourceStats.kills.has(enemyTypeHash)) {
                                sourceStats.kills.set(enemyTypeHash, { type: enemy.type, value: 0 });
                            }
                            sourceStats.kills.get(enemyTypeHash)!.value += 1;
                        } else {
                            if (!sourceStats.assists.has(enemyTypeHash)) {
                                sourceStats.assists.set(enemyTypeHash, { type: enemy.type, value: 0 });
                            }
                            sourceStats.assists.get(enemyTypeHash)!.value += 1;
                        }
                    }
                }
            }
        }

        // Damage Stats
        if (type === "Explosive") {
            const sourceStats = StatTracker.getPlayer(sourceSnet, statTracker);

            if (enemies.has(target)) {
                const enemy = enemies.get(target)!;
                const enemyTypeHash = enemy.type.hash;

                if (!sourceStats.enemyDamage.custom.has("EWC.Damage.Explosive")) {
                    sourceStats.enemyDamage.custom.set("EWC.Damage.Explosive", new Map());
                }

                const damageTracker = sourceStats.enemyDamage.custom.get("EWC.Damage.Explosive")!;

                if (!damageTracker.has(enemyTypeHash)) {
                    damageTracker.set(enemyTypeHash, { type: enemy.type, value: 0 });
                }
                damageTracker.get(enemyTypeHash)!.value += damage;
            }
        } else if (type === "DoT") {
            const sourceStats = StatTracker.getPlayer(sourceSnet, statTracker);
            
            if (enemies.has(target)) {
                const enemy = enemies.get(target)!;
                const enemyTypeHash = enemy.type.hash;

                if (!sourceStats.enemyDamage.custom.has("EWC.Damage.DoT")) {
                    sourceStats.enemyDamage.custom.set("EWC.Damage.DoT", new Map());
                }

                const damageTracker = sourceStats.enemyDamage.custom.get("EWC.Damage.DoT")!;

                if (!damageTracker.has(enemyTypeHash)) {
                    damageTracker.set(enemyTypeHash, { type: enemy.type, value: 0 });
                }
                damageTracker.get(enemyTypeHash)!.value += damage;
            }
        }
    }
});