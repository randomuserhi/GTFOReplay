import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { loadGLTF } from "../modeloader.js";
import { Model } from "./equippable.js";

const material = new MeshPhongMaterial({
    color: 0xcccccc
});

export class HeavyFogRepeller extends Model {
    model: Group;

    constructor() {
        super();
        this.equipOffsetPos = { x: 0.1, y: 0, z: 0 };
        this.leftHandGrip = { x: 0.2, y: 0, z: 0.1 };

        const model = this.model = new Group();
        loadGLTF("../js3party/models/BigPickups/fog turbine.glb", false).then((geometry) => model.add(new Mesh(geometry, material)));
        model.scale.set(0.2, 0.2, 0.2);
        model.rotation.set(0, 0, 0, "YXZ");

        this.group.add(model);
    }
}