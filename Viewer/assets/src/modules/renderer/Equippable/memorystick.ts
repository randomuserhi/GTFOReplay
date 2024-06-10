import { Group, Mesh, MeshPhongMaterial } from "three";
import { loadGLTF } from "../modeloader.js";
import { Model } from "./equippable.js";

const material = new MeshPhongMaterial({
    color: 0xcccccc
});

export class MemoryStick extends Model {
    model: Group;
    
    constructor() {
        super();
        this.equipOffsetPos = { x: 0.1, y: 0, z: 0 };
        this.leftHandGrip = { x: 0.1, y: 0, z: 0 };

        const model = this.model = new Group();
        loadGLTF("../js3party/models/Objective/mem stick.glb", false).then((geometry) => model.add(new Mesh(geometry, material)));
        model.scale.set(0.05, 0.05, 0.05);

        this.group.add(model);
    }
    public inLevel(): void {
        this.model.position.set(0, 0.1, 0);
        this.model.rotation.set(0, 0, 90 * Math.deg2rad);
    }
}