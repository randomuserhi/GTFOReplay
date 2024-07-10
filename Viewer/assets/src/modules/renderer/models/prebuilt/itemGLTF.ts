import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { loadGLTF } from "../../../library/modelloader";
import { ItemModel } from "../items";

const material = new MeshPhongMaterial({
    color: 0xcccccc
});

export class ItemGLTFModel extends ItemModel {
    gltf: Group;

    constructor(path: string, newLoader?: boolean) {
        super();
        this.equipOffsetPos = { x: 0.1, y: 0, z: 0 };
        this.leftHandGrip = { x: 0.2, y: 0, z: 0.1 };

        const gltf = this.gltf = new Group();
        loadGLTF(path, newLoader).then((geometry) => gltf.add(new Mesh(geometry, material)));
        this.root.add(gltf);
    }
}