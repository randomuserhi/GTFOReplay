import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { loadGLTF } from "../../../library/modelloader.js";
import { GearModel } from "../gear.js";

export class GearGLTFModel extends GearModel {
    gltf: Group;
    material = new MeshPhongMaterial({ color: 0xcccccc });

    constructor(path: string, newLoader?: boolean) {
        super();

        const gltf = this.gltf = new Group();
        loadGLTF(path, newLoader).then((geometry) => gltf.add(new Mesh(geometry, this.material)));
        this.root.add(gltf);
    }
}