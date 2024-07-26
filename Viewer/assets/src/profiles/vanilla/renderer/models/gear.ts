import { GearFoldAvatar } from "../animations/gearfold.js";
import { ItemModel } from "./items.js";


export class GearModel extends ItemModel {
    readonly type = "Gear";

    constructor() {
        super();
    }

    public animate(gearfold: GearFoldAvatar): void {
        this.leftHand?.position.copy(gearfold.root);
    }
}