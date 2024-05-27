import { Camera, Group, Mesh, MeshPhongMaterial, Vector3 } from "three";
//import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Text } from "troika-three-text";
import { Enemy, EnemyAnimState } from "../../parser/enemy/enemy.js";
import { loadGLTF } from "../modeloader.js";
import { EnemyModel } from "./enemy.js";

const tmpPos = new Vector3();
const camPos = new Vector3();

export class FlyerModel extends EnemyModel {
    anchor: Group;
    tmp?: Text; 

    eye: Group;
    spikes: Group[];

    constructor(enemy: Enemy) {
        super(enemy);
        this.anchor = new Group();

        const material = new MeshPhongMaterial({
            color: 0xff0000
        });

        this.eye = new Group();
        loadGLTF("../js3party/models/meatball.glb").then((model) => this.eye.add(new Mesh(model, material)));
        
        this.spikes = new Array(6);
        for (let i = 0; i < this.spikes.length; ++i) {
            const group = new Group();
            loadGLTF("../js3party/models/spike.glb").then((model) => group.add(new Mesh(model, material)));
            this.spikes[i] = group;
        }

        this.anchor.add(this.eye, ...this.spikes);
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

        this.tmp.text = `flyer`;

        this.tmp.visible = true;

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