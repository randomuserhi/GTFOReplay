import { BufferGeometry, Group, Material, Mesh, MeshPhongMaterial, Object3D } from "three";
import { loadGLTF } from "../modeloader.js";
import { Model } from "./equippable.js";

let asset: BufferGeometry | undefined = undefined;
loadGLTF("../js3party/models/Consumables/glowstick.glb").then((model) => {
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

export class GlowStick extends Model {
    constructor() {
        super();
        this.equipOffsetPos = { x: 0, y: 0, z: 0 };
        this.leftHand = undefined;

        const model = new Group();
        getAsset(model, material);
        model.scale.set(0.02, 0.02, 0.02);

        this.group.add(model);
    }
}