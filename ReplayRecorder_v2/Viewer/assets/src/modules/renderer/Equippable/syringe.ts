import { BufferGeometry, Color, Group, Material, Mesh, MeshPhongMaterial, Object3D } from "three";
import { loadGLTF } from "../modeloader.js";
import { Model } from "./equippable.js";

let asset: BufferGeometry | undefined = undefined;
loadGLTF("../js3party/models/Consumables/syringe.glb").then((model) => {
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

export class Syringe extends Model {
    constructor(color: Color) {
        super();
        this.equipOffsetPos = { x: 0, y: 0.1, z: -0.05 };
        this.leftHandGrip = { x: 0.05, y: -0.1, z: 0 };

        const model = new Group();
        getAsset(model, new MeshPhongMaterial({
            color
        }));
        model.scale.set(0.1, 0.1, 0.1);
        model.rotateX(-90 * Math.deg2rad);

        this.group.add(model);
    }
}