import * as Pod from "@esm/@root/replay/pod.js";
import { ColorRepresentation, Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { getPlayerColor } from "../../../datablocks/player/player.js";
import { loadGLTFGeometry } from "../../../library/modelloader.js";
import { Model } from "../../../library/models/lib.js";
import { EnemyAnimState } from "../../../parser/enemy/animation";
import { Enemy } from "../../../parser/enemy/enemy.js";
import { EnemyModelWrapper } from "../lib.js";

export interface FlyerSettings {
    scale?: number;
    color?: ColorRepresentation;
}

export class FlyerModel extends Model<[enemy: Enemy, anim: EnemyAnimState]> {
    anchor: Group = new Group();

    eye: Group = new Group();
    spikes: Group[] = new Array(6);

    left: number = 0;
    right: number = 0;

    material: MeshPhongMaterial;

    public settings: FlyerSettings = { color: 0xff0000 };
    public applySettings(settings?: FlyerSettings) {
        if (settings !== undefined && this.settings !== settings) {
            for (const key in settings) {
                (this.settings as any)[key] = (settings as any)[key];
            }
        }

        if (this.settings.scale !== undefined) {
            this.anchor.scale.set(this.settings.scale, this.settings.scale, this.settings.scale);
        }
    }

    constructor() {
        super();

        const material = this.material = new MeshPhongMaterial({
            color: this.settings.color
        });

        loadGLTFGeometry("../js3party/models/meatball.glb", false).then((model) => this.eye.add(new Mesh(model, material)));
        this.eye.scale.set(0.4, 0.4, 0.4);
        this.eye.rotateY(15 * Math.deg2rad);
        
        for (let i = 0; i < this.spikes.length; ++i) {
            const group = new Group();
            group.scale.set(0.2, 0.4, 0.2);
            loadGLTFGeometry("../js3party/models/spike.glb", false).then((model) => group.add(new Mesh(model, material)));
            this.spikes[i] = group;
        }
        
        this.anchor.add(this.eye, ...this.spikes);
        this.root.add(this.anchor);
    }

    public render(dt: number, time: number, enemy: Enemy, anim: EnemyAnimState) {
        this.root.position.copy(enemy.position);
        this.anchor.quaternion.copy(enemy.rotation);
        
        this.animate(dt, time, enemy, anim);
    }

    public animate(dt: number, time: number, enemy: Enemy, anim: EnemyAnimState) {
        if (EnemyModelWrapper.aggroColour() && enemy.targetPlayerSlotIndex !== 255) {
            this.material.color.set(getPlayerColor(enemy.targetPlayerSlotIndex));
        } else {
            this.material.color.set(this.settings.color!);
        }

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

        const order = "ZYX";

        this.spikes[0].position.set(0.2, 0, 0);
        this.spikes[0].rotation.set(this.right + z, 0, -(90 + y) * Math.deg2rad, order);

        this.spikes[1].position.set(0.2, 0.2, 0);
        this.spikes[1].rotation.set(this.right + z, 0, -(min + y) * Math.deg2rad, order);

        this.spikes[2].position.set(0.2, -0.2, 0);
        this.spikes[2].rotation.set(this.right + z, 0, -(max + y) * Math.deg2rad, order);

        this.spikes[3].position.set(-0.2, 0, 0);
        this.spikes[3].rotation.set(this.left + z, 0, (90 + y) * Math.deg2rad, order);

        this.spikes[4].position.set(-0.2, 0.2, 0);
        this.spikes[4].rotation.set(this.left + z, 0, (min + y) * Math.deg2rad, order);

        this.spikes[5].position.set(-0.2, -0.2, 0);
        this.spikes[5].rotation.set(this.left + z, 0, (max + y) * Math.deg2rad, order);
    }
}