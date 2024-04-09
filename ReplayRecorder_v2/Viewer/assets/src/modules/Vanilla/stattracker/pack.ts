import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import { StatTracker, getPlayerStats } from "./stats.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "Vanilla.StatTracker.Pack": Pack;
        }
    }
}

export type PackType = 
    "Ammo" |
    "Tool" |
    "Healing" | // NOTE(randomuserhi): Medipack / I2HP syringe 
    "Disinfect";
export const typemap: PackType[] = [
    "Ammo",
    "Tool",
    "Healing",
    "Disinfect"
];

export interface Pack {
    type: PackType;
    source: number;
    target: number;
}

// TODO(randomuserhi): handle source player -> broken in backend
ModuleLoader.registerEvent("Vanilla.StatTracker.Pack", "0.0.1", {
    parse: async (bytes) => {
        return {
            type: typemap[await BitHelper.readByte(bytes)],
            source: await BitHelper.readUShort(bytes),
            target: await BitHelper.readUShort(bytes),
        };
    },
    exec: async (data, snapshot) => {
        const statTracker = snapshot.getOrDefault("Vanilla.StatTracker", StatTracker);
        const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());

        const source = players.get(data.source);
        if (source === undefined) throw new Error(`${data.source} does not exist.`);

        const target = players.get(data.target);
        if (target === undefined) throw new Error(`${data.source} does not exist.`);

        const sourceStats = getPlayerStats(source.snet, statTracker)!;
        const packsGiven = sourceStats.packsGiven;
        if (packsGiven.has(data.type)) {
            packsGiven.set(data.type, 0);
        }
        packsGiven.set(data.type, packsGiven.get(data.type)! + 1);

        const targetStats = getPlayerStats(target.snet, statTracker)!;
        const packsUsed = targetStats.packsUsed;
        if (packsUsed.has(data.type)) {
            packsUsed.set(data.type, 0);
        }
        packsUsed.set(data.type, packsUsed.get(data.type)! + 1);
    }
});