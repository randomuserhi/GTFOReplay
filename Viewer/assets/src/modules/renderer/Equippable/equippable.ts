import { Group, Object3D, QuaternionLike, Vector3Like } from "three";
import { GearFoldAvatar } from "../../renderer/animations/gearfold";

export abstract class Model {
    group: Group;
    fold?: Group;

    baseFoldRot: QuaternionLike;

    offsetPos: Vector3Like;
    offsetRot: QuaternionLike;

    equipOffsetPos: Vector3Like;
    equipOffsetRot: QuaternionLike;

    leftHandGrip: Vector3Like;
    leftHand?: Object3D;

    constructor() {
        this.group = new Group;
        this.group.add(this.leftHand = new Object3D());
        this.offsetPos = {
            x: 0, y: 0, z: 0
        };
        this.offsetRot = {
            x: 0, y: 0, z: 0, w: 0
        };
        this.baseFoldRot = {
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

    public update(gearfold: GearFoldAvatar): void {
        this.fold?.quaternion.copy(gearfold.joints.fold);
        this.leftHand?.position.copy(gearfold.root);
    }

    public reset() {
        this.fold?.quaternion.copy(this.baseFoldRot);
        this.leftHand?.position.copy(this.leftHandGrip);
    }

    public inLevel() {
        
    }
}