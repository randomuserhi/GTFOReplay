import { ItemModel } from "./items.js";
import type { GearFoldAnimation } from "../animations/gearfold.js";
import type { WeaponView } from "@esm/@root/replay/native-weapon-view.js";


export class GearModel extends ItemModel {
    view?: WeaponView;
    readonly type = "Gear";
    get reloadAnimation(): GearFoldAnimation | undefined { return undefined; }
    /** Undo only the viewer's world-model shrink, preserving authored part scales. */
    get nativeScale(): number { return 1; }

    constructor() {
        super();
    }

    public animate(t: number): void {
        throw new Error("Not Implemented.");
    }
}
