import { Group, Mesh, MeshPhongMaterial } from "three";
import { loadGLTF } from "../modeloader.js";
import { Model } from "./equippable.js";

const material = new MeshPhongMaterial({
    color: 0xcccccc
});

export class DataCube extends Model {
    model: Group;
    
    constructor() {
        super();
        this.equipOffsetPos = { x: 0.1, y: 0, z: 0 };
        this.leftHandGrip = { x: 0.1, y: 0, z: 0 };

        const model = this.model = new Group();
        loadGLTF("../js3party/models/Objective/data cube.glb", false).then((geometry) => model.add(new Mesh(geometry, material)));
        model.scale.set(0.03, 0.03, 0.03);

        this.group.add(model);
    }
    public inLevel(): void {
        this.model.position.set(0, 0.05, 0);
    }
}