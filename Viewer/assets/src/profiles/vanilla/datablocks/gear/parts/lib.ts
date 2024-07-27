import { QuaternionLike } from "@esm/three";
import { GearFoldAnimation } from "../../../renderer/animations/gearfold.js";
import { AlignType } from "../../../renderer/models/gearjson.js";

export interface GearPartDatablock {
    path: string;
    fold?: string;
    foldOffsetRot?: QuaternionLike;
    baseFoldRot?: QuaternionLike;
    foldAnim?: GearFoldAnimation;
    aligns?: {
        alignType: AlignType;
        alignName: string;
    }[];
}