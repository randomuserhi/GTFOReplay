import { AlignType } from "../../../renderer/models/gearjson.js";

export interface GearPartDatablock {
    path: string;
    fold?: string;
    aligns?: {
        alignType: AlignType;
        alignName: string;
    }[];
}