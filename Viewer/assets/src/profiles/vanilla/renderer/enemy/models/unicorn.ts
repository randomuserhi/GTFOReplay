import { Mesh, MeshPhongMaterial } from "@esm/three";
import { loadGLTF } from "../../../library/modelloader.js";
import { EnemyAnimState } from "../../../parser/enemy/animation.js";
import { Enemy } from "../../../parser/enemy/enemy.js";
import { StickFigureSettings } from "../../models/stickfigure.js";
import { EnemyModelWrapper } from "../lib.js";
import { HumanoidEnemyModel } from "./humanoid.js";

export class UnicornHorn extends HumanoidEnemyModel {
    hornMaterial = new MeshPhongMaterial();

    constructor(wrapper: EnemyModelWrapper) {
        super(wrapper);

        // attach new meshes and stuff here
        loadGLTF("../js3party/models/spike.glb").then((model) => {
            const horn = new Mesh(model, this.hornMaterial);
            this.visual.joints.head.add(horn);
            horn.position.set(0, 0.2, 0);
        });
    }

    public applySettings(settings?: StickFigureSettings): void {
        super.applySettings(settings);

        if (settings?.color !== undefined) this.hornMaterial.color.set(settings.color);
    }

    public render(dt: number, time: number, enemy: Enemy, anim: EnemyAnimState) {
        if (!this.isVisible()) return;
        super.render(dt, time, enemy, anim);

        // add additional render stuff here

    }
}