import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { loadGLTFGeometry } from "../../../library/modelloader.js";
import { GearModel } from "../gear.js";

const defaultMaterial = new MeshPhongMaterial({ color: 0xffffff });

export class GearGLTFModel extends GearModel {
    gltf: Group;
    material = defaultMaterial;

    constructor(path: string, newLoader?: boolean) {
        super();

        const gltf = this.gltf = new Group();
        loadGLTFGeometry(path, newLoader).then((geometry) => gltf.add(new Mesh(geometry, this.material)));
        this.root.add(gltf);
    }
}