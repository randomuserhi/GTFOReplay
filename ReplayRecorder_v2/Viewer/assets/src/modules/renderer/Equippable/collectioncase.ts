import { BufferGeometry, Group, Material, Mesh, MeshPhongMaterial, Object3D } from "three";
import { loadGLTF } from "../modeloader.js";
import { Model } from "./equippable.js";

let asset: BufferGeometry | undefined = undefined;
loadGLTF("../js3party/models/BigPickups/collection case.glb").then((model) => {
    asset = model;
    for (const { parent, material } of waiting) {
        parent.add(new Mesh(asset, material));
    }
});
const waiting: { parent: Object3D, material: Material }[] = [];
function getAsset(parent: Object3D, material: Material) {
    if (asset === undefined) {
        waiting.push({ parent, material });
    } else {
        parent.add(new Mesh(asset, material));
    }
}

const material = new MeshPhongMaterial({
    color: 0xcccccc
});

export class CollectionCase extends Model {
    constructor() {
        super();
        this.equipOffsetPos = { x: 0.1, y: -0.1, z: 0 };
        this.leftHandGrip = { x: 0.1, y: -0.1, z: 0.1 };

        const model = new Group();
        getAsset(model, material);
        model.scale.set(0.15, 0.15, 0.15);
        model.rotateY(130 * Math.deg2rad);

        this.group.add(model);
    }
}