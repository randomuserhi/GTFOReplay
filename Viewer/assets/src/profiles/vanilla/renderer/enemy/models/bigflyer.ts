import * as Pod from "@esm/@root/replay/pod.js";
import { EulerOrder, Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { loadGLTF } from "../../../library/modelloader.js";
import { Model } from "../../../library/models/lib.js";
import { EnemyAnimState } from "../../../parser/enemy/animation";
import { Enemy } from "../../../parser/enemy/enemy.js";

export class BigFlyerModel extends Model<[enemy: Enemy, anim: EnemyAnimState]> {
    anchor: Group = new Group();

    eye: Group = new Group();
    spikes: Group[] = new Array(6);
    corners: Group[] = new Array(4);

    left: number = 0;
    right: number = 0;

    open: number = 0;

    constructor() {
        super();

        const material = new MeshPhongMaterial({
            color: 0xff0000
        });

        const scale = 1.3;
        loadGLTF("../js3party/models/big_meatball_body.glb", false).then((model) => this.eye.add(new Mesh(model, material)));
        this.eye.scale.set(scale, scale, scale);
        
        for (let i = 0; i < this.spikes.length; ++i) {
            const group = new Group();
            group.scale.set(0.2, 0.6, 0.2);
            loadGLTF("../js3party/models/spike.glb", false).then((model) => group.add(new Mesh(model, material)));
            this.spikes[i] = group;
        }
        
        const offset = -1;
        this.spikes[0].position.set(0.4, 0, offset);
        this.spikes[1].position.set(0.4, 0.4, offset);
        this.spikes[2].position.set(0.4, -0.4, offset);
        this.spikes[3].position.set(-0.4, 0, offset);
        this.spikes[4].position.set(-0.4, 0.4, offset);
        this.spikes[5].position.set(-0.4, -0.4, offset);

        const rotations = [
            0,
            180 * Math.deg2rad,
            90 * Math.deg2rad,
            270 * Math.deg2rad
        ];
        for (let i = 0; i < this.corners.length; ++i) {
            const group = new Group();
            group.scale.set(scale, scale, scale);
            const corner = new Group();
            loadGLTF("../js3party/models/big_meatball_corner.glb", false).then((model) => corner.add(new Mesh(model, material)));
            corner.rotation.set(0, 0, rotations[i]);
            group.add(corner);
            this.corners[i] = group;
        }

        const cornerWidth = 0.261826;
        this.corners[0].position.set(-cornerWidth * scale, cornerWidth * scale, 0.25);
        this.corners[1].position.set(cornerWidth * scale, -cornerWidth * scale, 0.25);
        this.corners[2].position.set(-cornerWidth * scale, -cornerWidth * scale, 0.25);
        this.corners[3].position.set(cornerWidth * scale, cornerWidth * scale, 0.25);

        this.anchor.add(this.eye, ...this.spikes, ...this.corners);
        this.root.add(this.anchor);
    }

    public render(dt: number, time: number, enemy: Enemy, anim: EnemyAnimState) {
        this.root.position.copy(enemy.position);
        this.anchor.quaternion.copy(enemy.rotation);
        
        this.animate(dt, time, enemy, anim);
    }

    public animate(dt: number, time: number, enemy: Enemy, anim: EnemyAnimState) {
        time /= 1000; // animations are dealt with in seconds

        const drift = 30;
        const separation = 10 + (1 - Math.clamp01(Pod.Vec.length(anim.velocity) / 10)) * 10;
        const min = 90 - separation;
        const max = 90 + separation;
        
        const z = drift * Math.deg2rad * Math.clamp(-anim.velocity.z / 10, -1, 1);
        const x = Math.clamp(anim.velocity.x / 10, -1, 1);
        const value = Math.abs(x) * Math.sign(z) * drift * Math.deg2rad;
        const left = x < 1 ? 0 : value;
        const right = x > 1 ? 0 : value; 
        const lerpScale = dt;
        this.left = this.left + (left - this.left) * lerpScale;
        this.right = this.right + (right - this.right) * lerpScale;
        const y = drift * Math.clamp(anim.velocity.y / 10, -1, 1);

        
        const order: EulerOrder = "ZYX";
        this.spikes[0].rotation.set(this.right + z, 0, -(90 + y) * Math.deg2rad, order);
        this.spikes[1].rotation.set(this.right + z, 0, -(min + y) * Math.deg2rad, order);
        this.spikes[2].rotation.set(this.right + z, 0, -(max + y) * Math.deg2rad, order);
        this.spikes[3].rotation.set(this.left + z, 0, (90 + y) * Math.deg2rad, order);
        this.spikes[4].rotation.set(this.left + z, 0, (min + y) * Math.deg2rad, order);
        this.spikes[5].rotation.set(this.left + z, 0, (max + y) * Math.deg2rad, order);

        const chargeTime = time - (anim.lastBigFlyerCharge / 1000);
        let open = 80 * Math.deg2rad;
        if (chargeTime < anim.bigFlyerCharge) {
            open *= Math.clamp01(chargeTime / 0.5);
        } else {
            open *= 1 - Math.clamp01(chargeTime / 0.5);
        }
        this.open = this.open + (open - this.open) * 5 * dt;

        this.corners[0].rotation.set(-this.open, -this.open, 0, order);
        this.corners[1].rotation.set(this.open, this.open, 0, order);
        this.corners[2].rotation.set(this.open, -this.open, 0, order);
        this.corners[3].rotation.set(-this.open, this.open, 0, order);
    }
}