import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { loadGLTF } from "../modeloader.js";
import { Model } from "./equippable.js";

const material = new MeshPhongMaterial({
    color: 0xffffff
});

export class BulkheadKey extends Model {
    model: Group;

    constructor() {
        super();
        
        const model = this.model = new Group();
        loadGLTF("../js3party/models/bulkhead_key.glb", false).then((geometry) => model.add(new Mesh(geometry, material)));
        model.scale.set(0.3, 0.3, 0.3);

        this.group.add(model);
    }

    public inLevel(): void {
        this.model.position.set(0, 0.05, 0);
        this.model.rotation.set(-90 * Math.deg2rad, 0, 0);
    }
}