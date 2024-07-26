import { AlignType } from "../../../renderer/models/gearjson.js";
import { Datablock } from "../../lib.js";

if (module.metadata.isParser) console.warn("Datablocks should not be loaded by the parser. This degrades performance greatly.");

export const payloadType = [
    "Explosive",
    "Glue",
    "Fire",
    "Health"
] as const;
export type PayloadType = typeof payloadType[number];

export interface GearPartPayloadDatablock {
    paths: Partial<Record<PayloadType, string>>;
    fold?: string;
    aligns?: {
        alignType: AlignType;
        alignName: string;
    }[];
}

export const GearPartPayloadDatablock = new Datablock<number, GearPartPayloadDatablock>();