import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Factory } from "../../library/factory.js";
import { Identifier, IdentifierData } from "../identifier.js";
import { StatTracker } from "../stattracker/stattracker.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "Vanilla.Player.Gunshots.Info": GunshotInfo;
        }
    }
}

export interface GunshotInfo {
    owner: number;
    gear: Identifier;
    hits: number;
    crits: number;
}

ModuleLoader.registerEvent("Vanilla.Player.Gunshots.Info", "0.0.1", {
    parse: async (bytes, snapshot) => {
        return {
            owner: await BitHelper.readInt(bytes),
            gear: await Identifier.parse(IdentifierData(snapshot), bytes),
            hits: await BitHelper.readByte(bytes),
            crits: await BitHelper.readByte(bytes),
        };
    },
    exec: async (data, snapshot) => {
        const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
        const statTracker = StatTracker.from(snapshot);

        const player = players.get(data.owner);
        if (player === undefined) throw new Error(`Player of id '${data.owner}' does not exist.`);

        const stats = StatTracker.getPlayer(player.snet, statTracker);
        
        const { gear, hits, crits } = data;
        
        if (!stats.accuracy.has(gear.hash)) {
            stats.accuracy.set(gear.hash, { 
                gear: gear, 
                total: 0, 
                hits: 0, 
                crits: 0, 
                pierceHits: 0, 
                pierceCrits: 0 
            });
        }
        const accuracy = stats.accuracy.get(gear.hash)!;
        accuracy.pierceHits += hits;
        accuracy.pierceCrits += crits;
        accuracy.hits += hits > 0 ? 1 : 0;
        accuracy.crits += crits > 0 ? 1 : 0;
        accuracy.total += 1;
    }
});