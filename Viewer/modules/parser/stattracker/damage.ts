import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Identifier, IdentifierData } from "../identifier.js";
import { StatTracker, getEnemy, getPlayerStats, isEnemy, isPlayer } from "./stats.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "Vanilla.StatTracker.Damage": Damage;
        }
    }
}

export type DamageType = 
    "Bullet" |
    "Explosive" |
    "Melee" | 
    "Projectile" |
    "Tongue" |
    "Fall";
export const typemap: DamageType[] = [
    "Bullet",
    "Explosive",
    "Melee",
    "Projectile",
    "Tongue",
    "Fall"
];

export interface Damage {
    type: DamageType;
    source: number;
    target: number;
    damage: number;
    gear: Identifier;
    sentry: boolean;
    staggerDamage: number;
}

// TODO(randomuserhi): Cleanup code
ModuleLoader.registerEvent("Vanilla.StatTracker.Damage", "0.0.1", {
    parse: async (bytes, snapshot) => {
        return {
            type: typemap[await BitHelper.readByte(bytes)],
            source: await BitHelper.readInt(bytes),
            target: await BitHelper.readUShort(bytes),
            damage: await BitHelper.readHalf(bytes),
            gear: await Identifier.parse(IdentifierData(snapshot), bytes),
            sentry: await BitHelper.readBool(bytes),
            staggerDamage: await BitHelper.readHalf(bytes),
        };
    },
    exec: async (data, snapshot) => {
        const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
        const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
        const cache = snapshot.getOrDefault("Vanilla.Enemy.Cache", () => new Map()); // NOTE(randomuserhi): caches recently despawned enemies for referencing
        const statTracker = snapshot.getOrDefault("Vanilla.StatTracker", StatTracker);

        const { type, source, target, damage, staggerDamage, sentry } = data;
        if (isEnemy(target, enemies, cache)) {
            const enemy = getEnemy(target, enemies, cache)!;

            let sourceSnet = players.get(source)?.snet;
            if (type === "Explosive") {
                const detonations = snapshot.getOrDefault("Vanilla.Mine.Detonate", () => new Map());
                const mines = snapshot.getOrDefault("Vanilla.Mine", () => new Map());

                const detonation = detonations.get(source);
                if (detonation === undefined) throw new Error("Explosive damage was dealt, but cannot find detonation event.");

                const mine = mines.get(source);
                if (mine === undefined) throw new Error("Explosive damage was dealt, but cannot find mine.");

                if (detonation.shot === true) {
                    const player = players.get(detonation.trigger);
                    if (player === undefined) throw new Error(`Could not get player that shot mine '${detonation.trigger}'.`);
                    enemy.players.add(player.snet);
                }

                sourceSnet = mine.snet;
            }
            if (sourceSnet === undefined) {
                throw new Error(`Unable to get player snet ${source}`);
            }
            
            enemy.players.add(sourceSnet);
            if (enemy.health > 0) {
                enemy.health -= damage;
                enemy.lastHit = data;
                enemy.lastHitTime = snapshot.time();
                if (enemy.health <= 0) {
                    enemy.health = 0;

                    for (const snet of enemy.players) {
                        const sourceStats = getPlayerStats(snet, statTracker);

                        const enemyTypeHash = enemy.type.hash;
                        if (snet === sourceSnet) {
                            if (type === "Explosive") {
                                if (!sourceStats.mineKills.has(enemyTypeHash)) {
                                    sourceStats.mineKills.set(enemyTypeHash, { type: enemy.type, value: 0 });
                                }
                                sourceStats.mineKills.get(enemyTypeHash)!.value += 1;
                            } else if (sentry)  {
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

        if (type === "Projectile") {
            // TODO(randomuserhi): Damage Taken Stats
        } else if (type === "Tongue") {
            // TODO(randomuserhi): Damage Taken Stats
        } else if (type === "Explosive") {
            const detonations = snapshot.getOrDefault("Vanilla.Mine.Detonate", () => new Map());
            const mines = snapshot.getOrDefault("Vanilla.Mine", () => new Map());

            const detonation = detonations.get(source);
            if (detonation === undefined) throw new Error("Explosive damage was dealt, but cannot find detonation event.");
            
            const mine = mines.get(source);
            if (mine === undefined) throw new Error("Explosive damage was dealt, but cannot find mine.");
        
            const sourceStats = getPlayerStats(mine.snet, statTracker);
            
            if (isPlayer(target, players)) {
                const player = players.get(target)!;
                if (!sourceStats.playerDamage.explosiveDamage.has(player.snet)) {
                    sourceStats.playerDamage.explosiveDamage.set(player.snet, 0);
                }
                sourceStats.playerDamage.explosiveDamage.set(player.snet, sourceStats.playerDamage.explosiveDamage.get(player.snet)! + damage);
            } else if (isEnemy(target, enemies, cache)) {
                const enemy = getEnemy(target, enemies, cache)!;
                const enemyTypeHash = enemy.type.hash;
                if (!sourceStats.enemyDamage.explosiveDamage.has(enemyTypeHash)) {
                    sourceStats.enemyDamage.explosiveDamage.set(enemyTypeHash, { type: enemy.type, value: 0 });
                }
                sourceStats.enemyDamage.explosiveDamage.get(enemyTypeHash)!.value += damage;

                if (!sourceStats.enemyDamage.staggerDamage.has(enemyTypeHash)) {
                    sourceStats.enemyDamage.staggerDamage.set(enemyTypeHash, { type: enemy.type, value: 0 });
                }
                sourceStats.enemyDamage.staggerDamage.get(enemyTypeHash)!.value += staggerDamage;
            } else {
                throw new Error(`${target} was neither an enemy nor a player.`);
            }
        } else if (type === "Bullet") {
            const player = players.get(source);
            if (player === undefined) throw new Error(`Could not find player ${target}.`);

            const sourceStats = getPlayerStats(player.snet, statTracker);

            if (isPlayer(target, players)) {
                const player = players.get(target)!;
                if (data.sentry) {
                    if (!sourceStats.playerDamage.sentryDamage.has(player.snet)) {
                        sourceStats.playerDamage.sentryDamage.set(player.snet, 0);
                    }
                    sourceStats.playerDamage.sentryDamage.set(player.snet, sourceStats.playerDamage.sentryDamage.get(player.snet)! + damage);
                } else {
                    if (!sourceStats.playerDamage.bulletDamage.has(player.snet)) {
                        sourceStats.playerDamage.bulletDamage.set(player.snet, 0);
                    }
                    sourceStats.playerDamage.bulletDamage.set(player.snet, sourceStats.playerDamage.bulletDamage.get(player.snet)! + damage);
                }
            } else if (isEnemy(target, enemies, cache)) {
                const enemy = getEnemy(target, enemies, cache)!;
                const enemyTypeHash = enemy.type.hash;
                if (data.sentry) {
                    if (!sourceStats.enemyDamage.sentryDamage.has(enemyTypeHash)) {
                        sourceStats.enemyDamage.sentryDamage.set(enemyTypeHash, { type: enemy.type, value: 0 });
                    }
                    sourceStats.enemyDamage.sentryDamage.get(enemyTypeHash)!.value += damage;
    
                    if (!sourceStats.enemyDamage.sentryStaggerDamage.has(enemyTypeHash)) {
                        sourceStats.enemyDamage.sentryStaggerDamage.set(enemyTypeHash, { type: enemy.type, value: 0 });
                    }
                    sourceStats.enemyDamage.sentryStaggerDamage.get(enemyTypeHash)!.value += staggerDamage;
                } else {
                    if (!sourceStats.enemyDamage.bulletDamage.has(enemyTypeHash)) {
                        sourceStats.enemyDamage.bulletDamage.set(enemyTypeHash, { type: enemy.type, value: 0 });
                    }
                    sourceStats.enemyDamage.bulletDamage.get(enemyTypeHash)!.value += damage;
    
                    if (!sourceStats.enemyDamage.staggerDamage.has(enemyTypeHash)) {
                        sourceStats.enemyDamage.staggerDamage.set(enemyTypeHash, { type: enemy.type, value: 0 });
                    }
                    sourceStats.enemyDamage.staggerDamage.get(enemyTypeHash)!.value += staggerDamage;
                }
            } else {
                throw new Error(`${target} was neither an enemy nor a player.`);
            }
        } else if (type === "Melee") {
            if (isPlayer(source, players)) {
                const player = players.get(source)!;

                const sourceStats = getPlayerStats(player.snet, statTracker);

                if (isEnemy(target, enemies, cache)) {
                    const enemy = getEnemy(target, enemies, cache)!;
                    const enemyTypeHash = enemy.type.hash;
                    if (!sourceStats.enemyDamage.meleeDamage.has(enemyTypeHash)) {
                        sourceStats.enemyDamage.meleeDamage.set(enemyTypeHash, { type: enemy.type, value: 0 });
                    }
                    sourceStats.enemyDamage.meleeDamage.get(enemyTypeHash)!.value += damage;

                    if (!sourceStats.enemyDamage.staggerDamage.has(enemyTypeHash)) {
                        sourceStats.enemyDamage.staggerDamage.set(enemyTypeHash, { type: enemy.type, value: 0 });
                    }
                    sourceStats.enemyDamage.staggerDamage.get(enemyTypeHash)!.value += staggerDamage;
                } else {
                    throw new Error(`${target} was not an enemy.`);
                }
            } else if (isEnemy(source, enemies, cache)) {
                // TODO(randomuserhi): damage taken stats

                /*const enemy = getEnemy(source, enemies, cache)!;

                if (isPlayer(target, players)) {
                    const player = players.get(target)!;

                    const sourceStats = getPlayerStats(player.snet, statTracker);


                } else {
                    throw new Error(`${target} was not a player.`);
                }*/
            } else {
                throw new Error(`${target} was neither an enemy nor a player.`);
            }
        } else if (type === "Fall") {
            const player = players.get(target);
            if (player === undefined) throw new Error(`Could not find player ${target}.`);

            const sourceStats = getPlayerStats(player.snet, statTracker);

            sourceStats.fallDamage += damage;
        }
    }
});