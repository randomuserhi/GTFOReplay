import { Object3D, QuaternionLike, Vector3Like } from "@esm/three";
import { Model } from "../../library/models/lib.js";

export class ItemModel extends Model {
    offsetPos: Vector3Like;
    offsetRot: QuaternionLike;

    equipOffsetPos: Vector3Like;
    equipOffsetRot: QuaternionLike;

    leftHandGrip: Vector3Like;
    leftHand?: Object3D;

    readonly type: "Gear" | "Item" = "Item"; 

    constructor() {
        super();

        this.root.add(this.leftHand = new Object3D());
        this.offsetPos = {
            x: 0, y: 0, z: 0
        };
        this.offsetRot = {
            x: 0, y: 0, z: 0, w: 0
        };
        this.equipOffsetPos = {
            x: 0, y: 0, z: 0
        };
        this.equipOffsetRot = {
            x: 0, y: 0, z: 0, w: 1
        };
        this.leftHandGrip = {
            x: 0, y: 0, z: 0
        };
    }

    public reset() {
        this.leftHand?.position.copy(this.leftHandGrip);
    }

    public inLevel() {
        
    }
}