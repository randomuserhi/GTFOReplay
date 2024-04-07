import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";

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
    "Medi" | 
    "Disinfect";
export const typemap: PackType[] = [
    "Ammo",
    "Tool",
    "Medi",
    "Disinfect"
];

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
        // TODO
    }
});