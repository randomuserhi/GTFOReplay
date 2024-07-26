import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { loadGLTFGeometry } from "../../../library/modelloader.js";
import { Model } from "../../../library/models/lib.js";
import { EnemyAnimState } from "../../../parser/enemy/animation";
import { Enemy } from "../../../parser/enemy/enemy.js";

export class SquidModel extends Model<[enemy: Enemy, anim: EnemyAnimState]> {
    anchor: Group = new Group();

    eye: Group = new Group();

    constructor() {
        super();

        const material = new MeshPhongMaterial({
            color: 0xff0000
        });

        loadGLTFGeometry("../js3party/models/based_squid.glb", false).then((model) => this.eye.add(new Mesh(model, material)));
        
        this.anchor.add(this.eye);
        this.root.add(this.anchor);
    }

    public render(dt: number, time: number, enemy: Enemy) {
        this.root.position.copy(enemy.position);
        this.anchor.quaternion.copy(enemy.rotation);
    }
}