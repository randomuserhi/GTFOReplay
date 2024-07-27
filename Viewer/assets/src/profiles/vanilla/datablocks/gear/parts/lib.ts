import { QuaternionLike } from "@esm/three";
import { AlignType } from "../../../renderer/models/gearjson.js";

export interface GearPartDatablock {
    path: string;
    fold?: string;
    foldOffsetRot?: QuaternionLike;
    baseFoldRot?: QuaternionLike;
    aligns?: {
        alignType: AlignType;
        alignName: string;
    }[];
}