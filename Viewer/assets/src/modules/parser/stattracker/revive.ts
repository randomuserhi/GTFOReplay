import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { StatTracker, getPlayerStats, isPlayer } from "./stats.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "Vanilla.StatTracker.Revive": Revive;
        }
    }
}

export interface Revive {
    source: number;
    target: number;
}

ModuleLoader.registerEvent("Vanilla.StatTracker.Revive", "0.0.1", {
    parse: async (bytes) => {
        return {
            source: await BitHelper.readUShort(bytes),
            target: await BitHelper.readUShort(bytes),
        };
    },
    exec: async (data, snapshot) => {
        const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
        const statTracker = snapshot.getOrDefault("Vanilla.StatTracker", StatTracker);

        const { source } = data;
        if (isPlayer(source, players)) {
            const player = players.get(source)!;
            const sourceStats = getPlayerStats(player.snet, statTracker)!;

            sourceStats.revives += 1;
        } else {
            throw new Error(`source ${source} was not a player.`);
        }
    }
});