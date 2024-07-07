import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { StatTracker } from "../stattracker/stattracker";

declare module "@esm/@root/replay/moduleloader.js" {
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
        const statTracker = StatTracker.from(snapshot);

        const { source, target } = data;
        if (enemies.has(source)) {
            if (players.has(target)) {
                const player = players.get(target)!;
                const sourceStats = StatTracker.getPlayer(player.snet, statTracker)!;

                const enemy = enemies.get(source)!;
                const enemyTypeHash = enemy.type.hash;
                if (!sourceStats.tongueDodges.has(enemyTypeHash)) {
                    sourceStats.tongueDodges.set(enemyTypeHash, { type: enemy.type, value: 0 });
                }
                sourceStats.tongueDodges.get(enemyTypeHash)!.value += 1;
            } else {
                throw new Error(`target '${target}' was not a player.`);
            }
        }
    }
});