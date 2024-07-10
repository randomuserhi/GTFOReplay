import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { loadGLTF } from "../../../library/modelloader.js";
import { ItemModel } from "../items.js";

export class ItemGLTFModel extends ItemModel {
    gltf: Group;
    material: MeshPhongMaterial = new MeshPhongMaterial({ color: 0xcccccc });

    constructor(path: string, inLevel?: (this: ItemGLTFModel) => void, newLoader?: boolean) {
        super();

        const gltf = this.gltf = new Group();
        loadGLTF(path, newLoader).then((geometry) => gltf.add(new Mesh(geometry, this.material)));
        this.root.add(gltf);
    
        if (inLevel !== undefined) this.inLevel = inLevel;
    }
}