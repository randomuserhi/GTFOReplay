import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Factory } from "../../library/factory";
import { StatTracker } from "../stattracker/stattracker";

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
        const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
        const statTracker = StatTracker.from(snapshot);

        const { source } = data;
        if (players.has(source)) {
            const player = players.get(source)!;
            const sourceStats = StatTracker.getPlayer(player.snet, statTracker)!;

            sourceStats.revives += 1;
        } else {
            throw new Error(`source ${source} was not a player.`);
        }
    }
});