import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import { StatTracker, getEnemy, getPlayerStats, isEnemy, isPlayer } from "./stats.js";

declare module "../../../replay/moduleloader.js" {
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
    gear: number;
    sentry: boolean;
    staggerDamage: number;
}

// TODO(randomuserhi): Cleanup code
ModuleLoader.registerEvent("Vanilla.StatTracker.Damage", "0.0.1", {
    parse: async (bytes) => {
        return {
            type: typemap[await BitHelper.readByte(bytes)],
            source: await BitHelper.readInt(bytes),
            target: await BitHelper.readUShort(bytes),
            damage: await BitHelper.readHalf(bytes),
            gear: await BitHelper.readUShort(bytes),
            sentry: await BitHelper.readBool(bytes),
            staggerDamage: await BitHelper.readHalf(bytes),
        };
    },
    exec: async (data, snapshot) => {
        const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
        const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
        const cache = snapshot.getOrDefault("Vanilla.Enemy.Cache", () => new Map()); // NOTE(randomuserhi): caches recently despawned enemies for referencing
        const statTracker = snapshot.getOrDefault("Vanilla.StatTracker", StatTracker);

        const { type, source, target, damage, staggerDamage } = data;
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

                // NOTE(randomuserhi): Backend code to get player shot mine just doesn't work -> so trigger is incorrect
                /*if (detonation.shot === true) {
                    const player = players.get(detonation.trigger);
                    if (player === undefined) throw new Error(`Could not get player that shot mine '${detonation.trigger}'.`);
                    enemy.players.add(player.snet);
                }*/

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

                        if (snet === sourceSnet) {
                            if (type === "Explosive") {
                                if (!sourceStats.mineKills.has(enemy.type)) {
                                    sourceStats.mineKills.set(enemy.type, 0);
                                }
                                sourceStats.mineKills.set(enemy.type, sourceStats.mineKills.get(enemy.type)! + 1);
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
                if (!sourceStats.enemyDamage.explosiveDamage.has(enemy.type)) {
                    sourceStats.enemyDamage.explosiveDamage.set(enemy.type, 0);
                }
                sourceStats.enemyDamage.explosiveDamage.set(enemy.type, sourceStats.enemyDamage.explosiveDamage.get(enemy.type)! + damage);

                if (!sourceStats.enemyDamage.staggerDamage.has(enemy.type)) {
                    sourceStats.enemyDamage.staggerDamage.set(enemy.type, 0);
                }
                sourceStats.enemyDamage.staggerDamage.set(enemy.type, sourceStats.enemyDamage.staggerDamage.get(enemy.type)! + staggerDamage);
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
                if (data.sentry) {
                    if (!sourceStats.enemyDamage.sentryDamage.has(enemy.type)) {
                        sourceStats.enemyDamage.sentryDamage.set(enemy.type, 0);
                    }
                    sourceStats.enemyDamage.sentryDamage.set(enemy.type, sourceStats.enemyDamage.sentryDamage.get(enemy.type)! + damage);
    
                    if (!sourceStats.enemyDamage.sentryStaggerDamage.has(enemy.type)) {
                        sourceStats.enemyDamage.sentryStaggerDamage.set(enemy.type, 0);
                    }
                    sourceStats.enemyDamage.sentryStaggerDamage.set(enemy.type, sourceStats.enemyDamage.sentryStaggerDamage.get(enemy.type)! + staggerDamage);
                } else {
                    if (!sourceStats.enemyDamage.bulletDamage.has(enemy.type)) {
                        sourceStats.enemyDamage.bulletDamage.set(enemy.type, 0);
                    }
                    sourceStats.enemyDamage.bulletDamage.set(enemy.type, sourceStats.enemyDamage.bulletDamage.get(enemy.type)! + damage);
    
                    if (!sourceStats.enemyDamage.staggerDamage.has(enemy.type)) {
                        sourceStats.enemyDamage.staggerDamage.set(enemy.type, 0);
                    }
                    sourceStats.enemyDamage.staggerDamage.set(enemy.type, sourceStats.enemyDamage.staggerDamage.get(enemy.type)! + staggerDamage);
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
                    if (!sourceStats.enemyDamage.meleeDamage.has(enemy.type)) {
                        sourceStats.enemyDamage.meleeDamage.set(enemy.type, 0);
                    }
                    sourceStats.enemyDamage.meleeDamage.set(enemy.type, sourceStats.enemyDamage.meleeDamage.get(enemy.type)! + damage);

                    if (!sourceStats.enemyDamage.staggerDamage.has(enemy.type)) {
                        sourceStats.enemyDamage.staggerDamage.set(enemy.type, 0);
                    }
                    sourceStats.enemyDamage.staggerDamage.set(enemy.type, sourceStats.enemyDamage.staggerDamage.get(enemy.type)! + staggerDamage);
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