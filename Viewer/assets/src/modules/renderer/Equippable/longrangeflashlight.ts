import { Group, Mesh, MeshPhongMaterial } from "three";
import { loadGLTF } from "../modeloader.js";
import { Model } from "./equippable.js";

const material = new MeshPhongMaterial({
    color: 0xcccccc
});

export class LongRangeFlashlight extends Model {
    model: Group;
    
    constructor() {
        super();
        this.equipOffsetPos = { x: 0.07, y: 0, z: -0.15 };
        this.leftHandGrip = { x: 0.2, y: 0, z: 0 };
        this.offsetRot = { x: 0.707106829, y: 0, z: 0, w: 0.707106829 };

        const model = this.model = new Group();
        loadGLTF("../js3party/models/Consumables/long range flashlight.glb", false).then((geometry) => model.add(new Mesh(geometry, material)));
        model.scale.set(0.1, 0.1, 0.1);
        model.rotateX(Math.PI);

        this.group.add(model);
    }

    public inLevel(): void {
        this.model.scale.set(0.07, 0.07, 0.07);
        this.model.rotation.set(0, 90 * Math.deg2rad, 0);
        this.model.position.set(0, 0.1, 0);
    }
}