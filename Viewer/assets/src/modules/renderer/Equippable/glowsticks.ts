import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { loadGLTF } from "../modeloader.js";
import { Model } from "./equippable.js";

const material = new MeshPhongMaterial({
    color: 0xcccccc
});

export class GlowStick extends Model {
    model: Group;
    
    constructor() {
        super();
        this.equipOffsetPos = { x: 0, y: 0, z: 0 };
        this.leftHand = undefined;

        this.model = new Group();
        loadGLTF("../js3party/models/Consumables/glowstick.glb", false).then((model) => this.model.add(new Mesh(model, material)));
        this.model.scale.set(0.02, 0.02, 0.02);

        this.group.add(this.model);
    }

    public inLevel(): void {
        this.model.rotation.set(90 * Math.deg2rad, 0, -90 * Math.deg2rad);
        this.model.position.set(0, 0.1, 0);
    }
}