import { Color, Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { loadGLTF } from "../modeloader.js";
import { Model } from "./equippable.js";

export class Syringe extends Model {
    model: Group;

    constructor(color: Color) {
        super();
        this.equipOffsetPos = { x: 0, y: 0.1, z: -0.05 };
        this.leftHandGrip = { x: 0.05, y: -0.1, z: 0 };

        const model = this.model = new Group();
        loadGLTF("../js3party/models/Consumables/syringe.glb", false).then((geometry) => model.add(new Mesh(geometry, new MeshPhongMaterial({
            color
        }))));
        model.scale.set(0.1, 0.1, 0.1);
        model.rotateX(-90 * Math.deg2rad);

        this.group.add(model);
    }

    public inLevel(): void {
        this.model.scale.set(0.08, 0.08, 0.08);
        this.model.rotation.set(0, 90 * Math.deg2rad, 90 * Math.deg2rad);
        this.model.position.set(0.05, 0.04, 0);
    }
}