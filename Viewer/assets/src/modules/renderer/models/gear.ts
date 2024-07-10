import { Group, QuaternionLike } from "@esm/three";
import { GearFoldAvatar } from "../animations/gearfold";
import { ItemModel } from "./items";


export class GearModel extends ItemModel {
    fold?: Group;
    baseFoldRot: QuaternionLike;

    readonly type = "Gear";

    constructor() {
        super();

        this.baseFoldRot = {
            x: 0, y: 0, z: 0, w: 0
        };
    }

    public animate(gearfold: GearFoldAvatar): void {
        this.fold?.quaternion.copy(gearfold.joints.fold);
        this.leftHand?.position.copy(gearfold.root);
    }

    public reset() {
        super.reset();
        this.fold?.quaternion.copy(this.baseFoldRot);
    }
}