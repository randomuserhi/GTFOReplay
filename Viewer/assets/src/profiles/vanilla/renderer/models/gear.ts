import { Vector3Like } from "@esm/three";
import { ItemModel } from "./items.js";


export class GearModel extends ItemModel {
    readonly type = "Gear";

    constructor() {
        super();
    }

    public animate(t: number, leftHand?: Vector3Like): void {
        if (leftHand !== undefined) this.leftHand?.position.copy(leftHand);
    }
}