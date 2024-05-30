import { Group, Mesh, MeshPhongMaterial } from "three";
import { loadGLTF } from "../modeloader.js";
import { Model } from "./equippable.js";

const material = new MeshPhongMaterial({
    color: 0xcccccc
});

export class CfoamGrenade extends Model {
    constructor() {
        super();
        this.leftHand = undefined;
        this.equipOffsetPos = { x: 0, y: 0, z: 0 };

        const model = new Group();
        loadGLTF("../js3party/models/Consumables/cnade.glb").then((geometry) => model.add(new Mesh(geometry, material)));
        model.scale.set(0.05, 0.05, 0.05);

        this.group.add(model);
    }
}