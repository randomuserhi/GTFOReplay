import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { getPlayerColor } from "../../../datablocks/player/player.js";
import { loadGLTFGeometry } from "../../../library/modelloader.js";
import { Model } from "../../../library/models/lib.js";
import { EnemyAnimState } from "../../../parser/enemy/animation";
import { Enemy } from "../../../parser/enemy/enemy.js";
import { EnemyModelWrapper } from "../lib.js";

export class SquidModel extends Model<[enemy: Enemy, anim: EnemyAnimState]> {
    anchor: Group = new Group();

    eye: Group = new Group();

    material: MeshPhongMaterial;

    constructor() {
        super();

        const material = this.material = new MeshPhongMaterial({
            color: 0xff0000
        });

        loadGLTFGeometry("../js3party/models/based_squid.glb", false).then((model) => this.eye.add(new Mesh(model, material)));
        
        this.anchor.add(this.eye);
        this.root.add(this.anchor);
    }

    public render(dt: number, time: number, enemy: Enemy) {
        if (EnemyModelWrapper.aggroColour() && enemy.targetPlayerSlotIndex !== 255) {
            this.material.color.set(getPlayerColor(enemy.targetPlayerSlotIndex));
        } else {
            this.material.color.set(0xff0000);
        }
        
        this.root.position.copy(enemy.position);
        this.anchor.quaternion.copy(enemy.rotation);
    }
}