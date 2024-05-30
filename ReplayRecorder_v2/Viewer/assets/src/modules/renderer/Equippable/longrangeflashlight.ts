import { BufferGeometry, Group, Material, Mesh, MeshPhongMaterial, Object3D } from "three";
import { loadGLTF } from "../modeloader.js";
import { Model } from "./equippable.js";

let asset: BufferGeometry | undefined = undefined;
loadGLTF("../js3party/models/Consumables/long range flashlight.glb").then((model) => {
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

export class LongRangeFlashlight extends Model {
    constructor() {
        super();
        this.equipOffsetPos = { x: 0.07, y: 0, z: -0.15 };
        this.leftHandGrip = { x: 0.2, y: 0, z: 0 };
        this.offsetRot = { x: 0.707106829, y: 0, z: 0, w: 0.707106829 };

        const model = new Group();
        getAsset(model, material);
        model.scale.set(0.1, 0.1, 0.1);
        model.rotateX(Math.PI);

        this.group.add(model);
    }
}