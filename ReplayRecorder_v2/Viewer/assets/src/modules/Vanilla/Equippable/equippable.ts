import { Group, Object3D, QuaternionLike, Vector3Like } from "three";

export abstract class Model {
    group: Group;

    baseFoldRot: QuaternionLike;

    offsetPos: Vector3Like;
    offsetRot: QuaternionLike;

    equipOffsetPos: Vector3Like;
    equipOffsetRot: QuaternionLike;

    leftHand: Object3D;

    constructor() {
        this.group = new Group;
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

        this.leftHand = new Object3D();
        this.group.add(this.leftHand);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars 
    public update(data: any): void {}
}