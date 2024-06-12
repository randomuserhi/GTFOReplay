import { ColorRepresentation, CylinderGeometry, Group, Mesh, MeshPhongMaterial, SphereGeometry } from "three";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import { playerColors } from "../player/renderer.js";
import { EnemyModel } from "./enemy.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.Enemy.Alerts": void;
        }

        interface RenderData {
            "Vanilla.Enemy.Alerts": AlertModel[];
        }
    }
}

const sphere = new SphereGeometry(0.5, 10, 10);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10);

class AlertModel {
    group: Group;
    material: MeshPhongMaterial;

    constructor(color: ColorRepresentation) {
        this.group = new Group();

        this.material = new MeshPhongMaterial({ color });
        const model = new Group();

        const obj0 = new Mesh(sphere, this.material);
        model.add(obj0);
        obj0.scale.set(0.1, 0.1, 0.1);

        const obj1 = new Mesh(cylinder, this.material);
        model.add(obj1);
        obj1.position.set(0, 0.35, 0);
        obj1.scale.set(0.1, 0.2, 0.1);

        this.group.add(model);
        this.group.scale.set(1.5, 1.5, 1.5);
    }

    public update(enemy: EnemyModel) {
        enemy.root.add(this.group);
        this.group.position.set(0, enemy.tmpHeight + 1, 0);
    }

    public remove() {
        this.group.removeFromParent();
    }
}

ModuleLoader.registerRender("Vanilla.Enemy.Alerts", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, {
        name, pass: (renderer, snapshot) => {
            const _models: AlertModel[] = [];
            const models = renderer.getOrDefault("Vanilla.Enemy.Alerts", () => []);
            const alerts = snapshot.getOrDefault("Vanilla.Enemy.Alert", () => []);
            const enemies = renderer.getOrDefault("Enemies", () => new Map());
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
            for (const alert of alerts) {
                if (!enemies.has(alert.enemy)) continue;
                const enemy = enemies.get(alert.enemy)!;
                if (!enemy.isVisible()) continue;

                const i = _models.length;
                if (models[i] === undefined) {
                    const model = new AlertModel(0xffffff);
                    models[i] = model;
                }
                const model = models[i];
                
                let color: ColorRepresentation = 0xffffff;
                if (alert.player !== undefined && players.has(alert.player)) {
                    color = playerColors[players.get(alert.player)!.slot];
                }
                model.material.color.set(color);

                model.update(enemy);

                _models.push(model);
            }
            for (let i = _models.length; i < models.length; ++i) {
                models[i].remove();
            }
            renderer.set("Vanilla.Enemy.Alerts", _models);
        } 
    }]);
});