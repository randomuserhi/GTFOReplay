import { Group, QuaternionLike, Vector3Like } from "@esm/three";
import { GearFoldAnimation } from "../../../renderer/animations/gearfold.js";
import { AlignType } from "../../../renderer/models/gearjson.js";

export interface GearPartDatablock {
    path: string | (() => Group);
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