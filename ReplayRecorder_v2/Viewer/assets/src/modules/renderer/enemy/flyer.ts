import { Camera, EulerOrder, Group, Mesh, MeshPhongMaterial, Vector3 } from "three";
//import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Text } from "troika-three-text";
import * as Pod from "../../../replay/pod.js";
import { Enemy, EnemyAnimState } from "../../parser/enemy/enemy.js";
import { loadGLTF } from "../modeloader.js";
import { EnemyModel } from "./enemy.js";

const tmpPos = new Vector3();
const camPos = new Vector3();

export class SquidModel extends EnemyModel {
    anchor: Group = new Group();
    tmp?: Text; 

    eye: Group = new Group();

    constructor(enemy: Enemy) {
        super(enemy);

        const material = new MeshPhongMaterial({
            color: 0xff0000
        });

        loadGLTF("../js3party/models/based_squid.glb").then((model) => this.eye.add(new Mesh(model, material)));
        this.eye.scale.set(1, 1, 1);
        this.eye.rotateY(15 * Math.deg2rad);
        
        this.anchor.add(this.eye);
        this.anchor.scale.set(enemy.scale, enemy.scale, enemy.scale);
        this.root.add(this.anchor);

        this.tmp = new Text();
        this.tmp.font = "./fonts/oxanium/Oxanium-SemiBold.ttf";
        this.tmp.fontSize = 0.2;
        this.tmp.position.y = 2;
        this.tmp.textAlign = "center";
        this.tmp.anchorX = "center";
        this.tmp.anchorY = "bottom";
        this.tmp.color = 0xffffff;
        this.tmp.visible = false;
        this.anchor.add(this.tmp);
    }

    public update(dt: number, time: number, enemy: Enemy, anim: EnemyAnimState, camera: Camera) {
        this.animate(dt, time, enemy, anim, camera);
        this.render(dt, enemy);
    }

    public animate(dt: number, time: number, enemy: Enemy, anim: EnemyAnimState, camera: Camera) {
        if (this.tmp === undefined) return;

        //this.tmp.text = `flyer`;

        this.tmp.visible = false;

        this.tmp.getWorldPosition(tmpPos);
        camera.getWorldPosition(camPos);

        const lerp = Math.clamp01(camPos.distanceTo(tmpPos) / 30);
        this.tmp.fontSize = lerp * 0.3 + 0.05;
        this.tmp.lookAt(camPos);
    }

    public render(dt: number, enemy: Enemy): void {
        this.root.position.copy(enemy.position);
        this.anchor.quaternion.copy(enemy.rotation);
    }

    public dispose() {
        this.tmp?.dispose();
        this.tmp = undefined;
    }
}

export class FlyerModel extends EnemyModel {
    anchor: Group = new Group();
    tmp?: Text; 

    eye: Group = new Group();
    spikes: Group[] = new Array(6);

    left: number = 0;
    right: number = 0;

    constructor(enemy: Enemy) {
        super(enemy);

        const material = new MeshPhongMaterial({
            color: 0xff0000
        });

        loadGLTF("../js3party/models/meatball.glb").then((model) => this.eye.add(new Mesh(model, material)));
        this.eye.scale.set(0.4, 0.4, 0.4);
        this.eye.rotateY(15 * Math.deg2rad);
        
        for (let i = 0; i < this.spikes.length; ++i) {
            const group = new Group();
            group.scale.set(0.2, 0.4, 0.2);
            loadGLTF("../js3party/models/spike.glb").then((model) => group.add(new Mesh(model, material)));
            this.spikes[i] = group;
        }
        
        this.anchor.add(this.eye, ...this.spikes);
        this.anchor.scale.set(enemy.scale, enemy.scale, enemy.scale);
        this.root.add(this.anchor);

        this.tmp = new Text();
        this.tmp.font = "./fonts/oxanium/Oxanium-SemiBold.ttf";
        this.tmp.fontSize = 0.2;
        this.tmp.position.y = 2;
        this.tmp.textAlign = "center";
        this.tmp.anchorX = "center";
        this.tmp.anchorY = "bottom";
        this.tmp.color = 0xffffff;
        this.tmp.visible = false;
        this.anchor.add(this.tmp);
    }

    public update(dt: number, time: number, enemy: Enemy, anim: EnemyAnimState, camera: Camera) {
        this.animate(dt, time, enemy, anim, camera);
        this.render(dt, enemy);
    }

    public animate(dt: number, time: number, enemy: Enemy, anim: EnemyAnimState, camera: Camera) {
        const drift = 30;
        const separation = 10 + (1 - Math.clamp01(Pod.Vec.length(anim.velocity) / 10)) * 10;
        const min = 90 - separation;
        const max = 90 + separation;
        
        const z = drift * Math.deg2rad * Math.clamp(anim.velocity.z / 10, -1, 1);
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
        
        if (this.tmp === undefined) return;

        //this.tmp.text = `flyer`;

        this.tmp.visible = false;

        this.tmp.getWorldPosition(tmpPos);
        camera.getWorldPosition(camPos);

        const lerp = Math.clamp01(camPos.distanceTo(tmpPos) / 30);
        this.tmp.fontSize = lerp * 0.3 + 0.05;
        this.tmp.lookAt(camPos);
    }

    public render(dt: number, enemy: Enemy): void {
        this.root.position.copy(enemy.position);
        this.anchor.quaternion.copy(enemy.rotation);
    }

    public dispose() {
        this.tmp?.dispose();
        this.tmp = undefined;
    }
}

export class BigFlyerModel extends EnemyModel {
    anchor: Group = new Group();
    tmp?: Text; 

    eye: Group = new Group();
    spikes: Group[] = new Array(6);
    corners: Group[] = new Array(4);

    left: number = 0;
    right: number = 0;

    open: number = 0;

    constructor(enemy: Enemy) {
        super(enemy);

        const material = new MeshPhongMaterial({
            color: 0xff0000
        });

        const scale = 1.3;
        loadGLTF("../js3party/models/big_meatball_body.glb").then((model) => this.eye.add(new Mesh(model, material)));
        this.eye.scale.set(scale, scale, scale);
        
        for (let i = 0; i < this.spikes.length; ++i) {
            const group = new Group();
            group.scale.set(0.2, 0.6, 0.2);
            loadGLTF("../js3party/models/spike.glb").then((model) => group.add(new Mesh(model, material)));
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
            loadGLTF("../js3party/models/big_meatball_corner.glb").then((model) => corner.add(new Mesh(model, material)));
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
        this.anchor.scale.set(enemy.scale, enemy.scale, enemy.scale);
        this.root.add(this.anchor);

        this.tmp = new Text();
        this.tmp.font = "./fonts/oxanium/Oxanium-SemiBold.ttf";
        this.tmp.fontSize = 0.2;
        this.tmp.position.y = 2;
        this.tmp.textAlign = "center";
        this.tmp.anchorX = "center";
        this.tmp.anchorY = "bottom";
        this.tmp.color = 0xffffff;
        this.tmp.visible = false;
        this.anchor.add(this.tmp);
    }

    public update(dt: number, time: number, enemy: Enemy, anim: EnemyAnimState, camera: Camera) {
        this.animate(dt, time, enemy, anim, camera);
        this.render(dt, enemy);
    }

    public animate(dt: number, time: number, enemy: Enemy, anim: EnemyAnimState, camera: Camera) {
        time /= 1000; // animations are dealt with in seconds

        const drift = 30;
        const separation = 10 + (1 - Math.clamp01(Pod.Vec.length(anim.velocity) / 10)) * 10;
        const min = 90 - separation;
        const max = 90 + separation;
        
        const z = drift * Math.deg2rad * Math.clamp(anim.velocity.z / 10, -1, 1);
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
        
        if (this.tmp === undefined) return;

        //this.tmp.text = `flyer`;

        this.tmp.visible = false;

        this.tmp.getWorldPosition(tmpPos);
        camera.getWorldPosition(camPos);

        const lerp = Math.clamp01(camPos.distanceTo(tmpPos) / 30);
        this.tmp.fontSize = lerp * 0.3 + 0.05;
        this.tmp.lookAt(camPos);
    }

    public render(dt: number, enemy: Enemy): void {
        this.root.position.copy(enemy.position);
        this.anchor.quaternion.copy(enemy.rotation);
    }

    public dispose() {
        this.tmp?.dispose();
        this.tmp = undefined;
    }
}