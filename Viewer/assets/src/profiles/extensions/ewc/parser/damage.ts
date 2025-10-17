import { Factory } from "@asl/vanilla/library/factory.js";
import { Enemy, EnemyOnDeathEvents } from "@asl/vanilla/parser/enemy/enemy.js";
import { StatTracker } from "@asl/vanilla/parser/stattracker/stattracker.js";
import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader, ReplayApi } from "@esm/@root/replay/moduleloader.js";

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
    "DoT",
    "Shrapnel"
] as const;
export type EWCDamageType = typeof typemap[number];

export interface EWCDamage {
    type: EWCDamageType;
    source: number;
    target: number;
    damage: number;
    isSentry: boolean;
}

declare module "@asl/vanilla/parser/enemy/enemy.js" {
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
let parser = ModuleLoader.registerEvent("EWC.Damage", "0.0.1", {
    parse: async (bytes) => {
        return {
            type: typemap[await BitHelper.readByte(bytes)],
            source: await BitHelper.readUShort(bytes),
            target: await BitHelper.readUShort(bytes),
            damage: await BitHelper.readHalf(bytes),
            isSentry: false
        };
    },
    exec: async (data, snapshot) => {
        const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
        const enemies = snapshot.getOrDefault("Vanilla.Enemy", Factory("Map"));
        const statTracker = StatTracker.from(snapshot);

        const { type, source, target, damage, isSentry } = data;

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
                            if (isSentry) {
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
            }
        }

        // Damage Stats
        const sentryTag = isSentry ? ".Sentry" : "";

        if (type === "Explosive") {
            const sourceStats = StatTracker.getPlayer(sourceSnet, statTracker);
            const tag = `EWC${sentryTag}.Damage.Explosive`;

            if (enemies.has(target)) {
                const enemy = enemies.get(target)!;
                const enemyTypeHash = enemy.type.hash;

                if (!sourceStats.enemyDamage.custom.has(tag)) {
                    sourceStats.enemyDamage.custom.set(tag, new Map());
                }

                const damageTracker = sourceStats.enemyDamage.custom.get(tag)!;

                if (!damageTracker.has(enemyTypeHash)) {
                    damageTracker.set(enemyTypeHash, { type: enemy.type, value: 0 });
                }
                damageTracker.get(enemyTypeHash)!.value += damage;
            }
        } else if (type === "DoT") {
            const sourceStats = StatTracker.getPlayer(sourceSnet, statTracker);
            const tag = `EWC${sentryTag}.Damage.DoT`;

            if (enemies.has(target)) {
                const enemy = enemies.get(target)!;
                const enemyTypeHash = enemy.type.hash;

                if (!sourceStats.enemyDamage.custom.has(tag)) {
                    sourceStats.enemyDamage.custom.set(tag, new Map());
                }

                const damageTracker = sourceStats.enemyDamage.custom.get(tag)!;

                if (!damageTracker.has(enemyTypeHash)) {
                    damageTracker.set(enemyTypeHash, { type: enemy.type, value: 0 });
                }
                damageTracker.get(enemyTypeHash)!.value += damage;
            }
        } else if (type === "Shrapnel") {
            const sourceStats = StatTracker.getPlayer(sourceSnet, statTracker);
            const tag = `EWC${sentryTag}.Damage.Shrapnel`;
            
            if (enemies.has(target)) {
                const enemy = enemies.get(target)!;
                const enemyTypeHash = enemy.type.hash;

                if (!sourceStats.enemyDamage.custom.has(tag)) {
                    sourceStats.enemyDamage.custom.set(tag, new Map());
                }

                const damageTracker = sourceStats.enemyDamage.custom.get(tag)!;

                if (!damageTracker.has(enemyTypeHash)) {
                    damageTracker.set(enemyTypeHash, { type: enemy.type, value: 0 });
                }
                damageTracker.get(enemyTypeHash)!.value += damage;
            }
        }
    }
});
parser = ModuleLoader.registerEvent("EWC.Damage", "0.0.2", {
    ...parser,
    parse: async (bytes) => {
        return {
            type: typemap[await BitHelper.readByte(bytes)],
            source: await BitHelper.readUShort(bytes),
            target: await BitHelper.readUShort(bytes),
            damage: await BitHelper.readHalf(bytes),
            isSentry: await BitHelper.readBool(bytes),
        };
    }
});