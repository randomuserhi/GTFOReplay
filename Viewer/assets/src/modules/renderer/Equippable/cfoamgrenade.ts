import { Group, Mesh, MeshPhongMaterial } from "three";
import { loadGLTF } from "../modeloader.js";
import { Model } from "./equippable.js";

const material = new MeshPhongMaterial({
    color: 0xcccccc
});

export class CfoamGrenade extends Model {
    model: Group;

    constructor() {
        super();
        this.leftHand = undefined;
        this.equipOffsetPos = { x: 0, y: 0, z: 0 };

        const model = this.model = new Group();
        loadGLTF("../js3party/models/Consumables/cnade.glb", false).then((geometry) => model.add(new Mesh(geometry, material)));
        model.scale.set(0.05, 0.05, 0.05);

        this.group.add(model);
    }

    public inLevel(): void {
        this.model.rotation.set(0, 0, 90 * Math.deg2rad);
        this.model.position.set(0, 0.1, 0);
    }
}