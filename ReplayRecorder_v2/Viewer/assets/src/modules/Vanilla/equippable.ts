import { Group } from "three";

export abstract class Model {
    group: Group;

    constructor() {
        this.group = new Group;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars 
    public update(data: any): void {}
}

export interface Equippable {
    id: number;
    model?: Model;
}