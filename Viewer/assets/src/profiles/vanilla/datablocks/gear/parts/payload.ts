import { Group, QuaternionLike, Vector3Like } from "@esm/three";
import { GearFoldAnimation } from "../../../renderer/animations/gearfold.js";
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
    paths: Partial<Record<PayloadType, string | (() => Group)>>; 
    unit?: "deg" | "rad";
    offsetRot?: Vector3Like;
    offsetPos?: Vector3Like;
    offsetScale?: Vector3Like;
    fold?: string;
    foldOffsetRot?: QuaternionLike;
    baseFoldRot?: QuaternionLike;
    foldAnim?: GearFoldAnimation;
    aligns?: {
        alignType: AlignType;
        alignName: string;
    }[];
}

export const GearPartPayloadDatablock = new Datablock<number, GearPartPayloadDatablock>();