import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { loadGLTF } from "../modeloader.js";
import { Model } from "./equippable.js";

const material = new MeshPhongMaterial({
    color: 0xcccccc
});

export class PowerCell extends Model {
    model: Group;

    constructor() {
        super();
        this.equipOffsetPos = { x: 0, y: -0.17, z: -0.02 };
        this.leftHandGrip = { x: 0.1, y: -0.2, z: 0 };

        const model = this.model = new Group();
        loadGLTF("../js3party/models/BigPickups/cell.glb", false).then((geometry) => model.add(new Mesh(geometry, material)));
        model.scale.set(0.04, 0.04, 0.04);
        model.rotateZ(Math.PI);

        this.group.add(model);
    }

    public inLevel(): void {
        this.model.rotation.set(-90 * Math.deg2rad, 0, 90 * Math.deg2rad);
        this.model.scale.set(0.07, 0.07, 0.07);
    }
}