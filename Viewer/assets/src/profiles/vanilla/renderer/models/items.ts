import { Object3D, QuaternionLike, Vector3Like } from "@esm/three";
import { zeroV } from "../../library/constants.js";
import { Model } from "../../library/models/lib.js";

export class ItemModel extends Model {
    offsetPos?: Vector3Like;
    offsetRot?: QuaternionLike;

    equipOffsetPos?: Vector3Like;
    equipOffsetRot?: QuaternionLike;

    leftHandGrip?: Vector3Like;
    leftHand?: Object3D;

    readonly type: "Gear" | "Item" = "Item"; 

    constructor() {
        super();

        this.root.add(this.leftHand = new Object3D());
    }

    public reset() {
        if (this.leftHandGrip !== undefined) this.leftHand?.position.copy(this.leftHandGrip);
        else this.leftHand?.position.copy(zeroV);
    }

    public inLevel() {
        
    }
}