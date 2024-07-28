import { ItemModel } from "./items.js";


export class GearModel extends ItemModel {
    readonly type = "Gear";

    constructor() {
        super();
    }

    public animate(t: number): void {
        throw new Error("Not Implemented.");
    }
}