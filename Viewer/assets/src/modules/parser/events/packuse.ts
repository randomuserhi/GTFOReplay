import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Factory } from "../../library/factory.js";
import { StatTracker } from "../stattracker/stattracker.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "Vanilla.StatTracker.Pack": Pack;
        }
    }
}

export const typemap = [
    "Ammo",
    "Tool",
    "Healing", // NOTE(randomuserhi): Medipack / I2HP syringe 
    "Disinfect"
] as const;
export type PackType = typeof typemap[number];

export interface Pack {
    type: PackType;
    source: number;
    target: number;
}

ModuleLoader.registerEvent("Vanilla.StatTracker.Pack", "0.0.1", {
    parse: async (bytes) => {
        return {
            type: typemap[await BitHelper.readByte(bytes)],
            source: await BitHelper.readUShort(bytes),
            target: await BitHelper.readUShort(bytes),
        };
    },
    exec: async (data, snapshot) => {
        const statTracker = StatTracker.from(snapshot);
        const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));

        const source = players.get(data.source);
        if (source === undefined) throw new Error(`${data.source} does not exist.`);

        const target = players.get(data.target);
        if (target === undefined) throw new Error(`${data.source} does not exist.`);

        if (source !== target) {
            const sourceStats = StatTracker.getPlayer(source.snet, statTracker)!;
            const packsGiven = sourceStats.packsGiven;
            if (!packsGiven.has(data.type)) {
                packsGiven.set(data.type, 0);
            }
            packsGiven.set(data.type, packsGiven.get(data.type)! + 1);
        }

        const targetStats = StatTracker.getPlayer(target.snet, statTracker)!;
        const packsUsed = targetStats.packsUsed;
        if (!packsUsed.has(data.type)) {
            packsUsed.set(data.type, 0);
        }
        packsUsed.set(data.type, packsUsed.get(data.type)! + 1);
    }
});