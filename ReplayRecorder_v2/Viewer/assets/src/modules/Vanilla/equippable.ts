import { Group } from "three";

export class Model {
    group: Group;

    constructor() {
        this.group = new Group;
    }
}

export interface Equippable {
    id: number;
    model?: Model;
}