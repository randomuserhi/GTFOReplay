import { Object3D, QuaternionLike, Vector3Like } from "@esm/three";
import { zeroQ, zeroV } from "../../library/constants.js";
import { Model } from "../../library/models/lib.js";
import { BasicModel } from "./basicModel.js";

export class ItemModel extends Model {
    offsetPos?: Vector3Like;
    offsetRot?: QuaternionLike;

    equipOffsetPos?: Vector3Like;
    equipOffsetRot?: QuaternionLike;

    leftHandGrip?: Vector3Like;
    leftHandGripRotation?: QuaternionLike;
    leftHand?: Object3D;
    rightHandGrip?: { pos: Vector3Like; rot: QuaternionLike };

    readonly type: "Gear" | "Item" = "Item"; 

    constructor() {
        super();

        this.root.add(this.leftHand = new Object3D());
    }

    public reset() {
        if (this.leftHandGrip !== undefined) this.leftHand?.position.copy(this.leftHandGrip);
        else this.leftHand?.position.copy(zeroV);
        this.leftHand?.quaternion.copy(this.leftHandGripRotation ?? zeroQ);
    }

    public inLevel() {
        
    }
}

export class BasicItemModel extends ItemModel {
    private readonly shape: BasicModel;
    constructor(identity: string, error: unknown) {
        super();
        this.shape = new BasicModel(`item ${identity}`, error, [.2, .2, .5]);
        this.root.add(this.shape);
    }
    override dispose() { this.shape.dispose(); this.root.removeFromParent(); }
}

// Both held and dropped items must remain visible when a mod has no model factory.
export function createItemModel(factory: (() => ItemModel) | undefined, identity: string): ItemModel {
    try {
        const model = factory?.();
        if (model) return model;
        return new BasicItemModel(identity, "No registered model.");
    } catch (error) { return new BasicItemModel(identity, error); }
}
