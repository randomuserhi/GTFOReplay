import { BufferGeometry, Group, Material, Mesh, MeshPhongMaterial, Object3D } from "three";
import { loadGLTF } from "../modeloader.js";
import { Model } from "./equippable.js";

let asset: BufferGeometry | undefined = undefined;
loadGLTF("../js3party/models/Consumables/lock melter.glb").then((model) => {
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

export class LockMelter extends Model {
    model: Group;
    
    constructor() {
        super();
        this.equipOffsetPos = { x: 0.1, y: 0, z: 0 };
        this.leftHandGrip = { x: 0.1, y: 0, z: 0 };

        const model = this.model = new Group();
        getAsset(model, material);
        model.scale.set(0.04, 0.04, 0.04);

        this.group.add(model);
    }
    public inLevel(): void {
        this.model.position.set(0, 0.05, 0);
        this.model.rotation.set(0, 0, 90 * Math.deg2rad);
    }
}