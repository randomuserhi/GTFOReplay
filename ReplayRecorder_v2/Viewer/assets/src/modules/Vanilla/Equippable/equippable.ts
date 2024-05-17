import { Group, Object3D, QuaternionLike, Vector3, Vector3Like } from "three";

export type Archetype = 
    "hammer" |
    "spear" |
    "knife" |
    "pistol" |
    "rifle";

const _worldLeftHand = new Vector3();
export abstract class Model {
    group: Group;

    baseFoldRot: QuaternionLike;

    offsetPos: Vector3Like;
    offsetRot: QuaternionLike;

    equipOffsetPos: Vector3Like;
    equipOffsetRot: QuaternionLike;

    archetype: Archetype;
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

        this.archetype = "rifle";
        this.leftHand = new Object3D();
        this.group.add(this.leftHand);
    }

    public worldLeftHand(): Vector3 {
        return this.leftHand.getWorldPosition(_worldLeftHand);
    } 

    // eslint-disable-next-line @typescript-eslint/no-unused-vars 
    public update(data: any): void {}
}

export interface Equippable {
    id: number;
    model?: Model;
}