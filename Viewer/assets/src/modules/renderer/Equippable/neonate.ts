import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { loadGLTF } from "../modeloader.js";
import { Model } from "./equippable.js";

const material = new MeshPhongMaterial({
    color: 0xcccccc
});

export class Neonate extends Model {
    model: Group;

    constructor() {
        super();
        this.equipOffsetPos = { x: 0.1, y: -0.1, z: 0 };
        this.leftHandGrip = { x: 0.1, y: -0.1, z: 0.1 };

        const model = this.model = new Group();
        loadGLTF("../js3party/models/BigPickups/neonate.glb", false).then((geometry) => model.add(new Mesh(geometry, material)));
        model.scale.set(0.1, 0.1, 0.1);
        model.rotation.set(-90 * Math.deg2rad, 180 * Math.deg2rad, -40 * Math.deg2rad);

        this.group.add(model);
    }
}