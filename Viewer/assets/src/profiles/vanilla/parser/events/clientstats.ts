import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Factory } from "../../library/factory.js";
import { StatTracker } from "../stattracker/stattracker.js";
import { typemap, type PackType } from "./packuse.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Headers { "Vanilla.StatTracker.Client": true }
        interface Events {
            "Vanilla.StatTracker.EnemyDeath": { id: number };
            "Vanilla.StatTracker.PackConsumed": { owner: number; type: PackType };
        }
    }
}

ModuleLoader.registerHeader("Vanilla.StatTracker.Client", "0.0.1", {
    parse: async (_, header) => {
        if (header.has("Vanilla.StatTracker.Client")) throw new Error("Duplicate client statistics header.");
        header.set("Vanilla.StatTracker.Client", true);
    }
});

ModuleLoader.registerEvent("Vanilla.StatTracker.EnemyDeath", "0.0.1", {
    parse: async bytes => ({ id: await BitHelper.readInt(bytes) }),
    exec: (_, snapshot) => {
        // Only explicit death records count. Despawns and predicted damage do not.
        ++StatTracker.from(snapshot).confirmedEnemyDeaths;
    }
});

ModuleLoader.registerEvent("Vanilla.StatTracker.PackConsumed", "0.0.1", {
    parse: async bytes => {
        const owner = await BitHelper.readInt(bytes);
        const type = typemap[await BitHelper.readByte(bytes)];
        if (type === undefined) throw new Error("Invalid consumed pack type.");
        return { owner, type };
    },
    exec: (data, snapshot) => {
        const player = snapshot.getOrDefault("Vanilla.Player", Factory("Map")).get(data.owner);
        if (!player) throw new Error(`Pack owner '${data.owner}' does not exist.`);
        const packs = StatTracker.getPlayer(player.snet, StatTracker.from(snapshot)).packsConsumed;
        packs.set(data.type, (packs.get(data.type) ?? 0) + 1);
    }
});
