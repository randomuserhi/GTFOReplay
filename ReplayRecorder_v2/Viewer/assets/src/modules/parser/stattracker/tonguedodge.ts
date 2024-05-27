import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import { StatTracker, getEnemy, getPlayerStats, isEnemy, isPlayer } from "./stats.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "Vanilla.StatTracker.TongueDodge": TongueDodge;
        }
    }
}

export interface TongueDodge {
    source: number;
    target: number;
}

ModuleLoader.registerEvent("Vanilla.StatTracker.TongueDodge", "0.0.1", {
    parse: async (bytes) => {
        return {
            source: await BitHelper.readUShort(bytes),
            target: await BitHelper.readUShort(bytes),
        };
    },
    exec: async (data, snapshot) => {
        const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
        const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
        const cache = snapshot.getOrDefault("Vanilla.Enemy.Cache", () => new Map()); // NOTE(randomuserhi): caches recently despawned enemies for referencing
        const statTracker = snapshot.getOrDefault("Vanilla.StatTracker", StatTracker);

        const { source, target } = data;
        if (isEnemy(source, enemies, cache)) {
            if (isPlayer(target, players)) {
                const player = players.get(target)!;
                const sourceStats = getPlayerStats(player.snet, statTracker)!;

                const enemy = getEnemy(source, enemies, cache)!;
                if (!sourceStats.tongueDodges.has(enemy.type)) {
                    sourceStats.tongueDodges.set(enemy.type, 0);
                }
                sourceStats.tongueDodges.set(enemy.type, sourceStats.tongueDodges.get(enemy.type)! + 1);
            } else {
                throw new Error(`target '${target}' was not a player.`);
            }
        } else {
            throw new Error(`source '${source}' was not an enemy.`);
        }
    }
});