import { AlignType } from "../../../renderer/models/gearbuilder.js";

export interface GearPartDatablock {
    path: string;
    fold?: string;
    aligns?: {
        alignType: AlignType;
        alignName: string;
    }[];
}