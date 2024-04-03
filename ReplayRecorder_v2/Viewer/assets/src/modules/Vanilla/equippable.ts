import { Group, QuaternionLike, Vector3Like } from "three";

export abstract class Model {
    group: Group;

    offsetPos: Vector3Like;
    offsetRot: QuaternionLike;

    constructor() {
        this.group = new Group;
        this.offsetPos = {
            x: 0, y: 0, z: 0
        };
        this.offsetRot = {
            x: 0, y: 0, z: 0, w: 0
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars 
    public update(data: any): void {}
}

export interface Equippable {
    id: number;
    model?: Model;
}