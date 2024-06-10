import { Group, Mesh, MeshPhongMaterial } from "three";
import { loadGLTF } from "../modeloader.js";
import { Model } from "./equippable.js";

const material = new MeshPhongMaterial({
    color: 0xcccccc
});

export class CargoCrate extends Model {
    constructor() {
        super();
        this.equipOffsetPos = { x: 0.1, y: -0.1, z: 0 };
        this.leftHandGrip = { x: 0.1, y: -0.1, z: 0.1 };

        const model = new Group();
        loadGLTF("../js3party/models/BigPickups/base cargo.glb", false).then((geometry) => model.add(new Mesh(geometry, material)));
        model.scale.set(0.1, 0.1, 0.1);
        model.rotateZ(Math.PI);
        model.rotateY(40 * Math.deg2rad);

        this.group.add(model);
    }
}