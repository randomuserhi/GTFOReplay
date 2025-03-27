import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { ColorRepresentation, CylinderGeometry, Group, Mesh, MeshPhongMaterial, SphereGeometry } from "@esm/three";
import { getPlayerColor } from "../../datablocks/player/player.js";
import { Factory } from "../../library/factory.js";
import { ObjectWrapper } from "../objectwrapper.js";
import { EnemyModelWrapper } from "./lib.js";

declare module "@esm/@root/replay/moduleloader.js" {
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

class AlertModel extends ObjectWrapper<Group> {
    material: MeshPhongMaterial;
    hasPlayer: boolean;

    constructor(color: ColorRepresentation) {
        super();

        this.root = new Group();

        this.material = new MeshPhongMaterial({ color });
        const model = new Group();

        const obj0 = new Mesh(sphere, this.material);
        model.add(obj0);
        obj0.scale.set(0.1, 0.1, 0.1);

        const obj1 = new Mesh(cylinder, this.material);
        model.add(obj1);
        obj1.position.set(0, 0.35, 0);
        obj1.scale.set(0.1, 0.2, 0.1);

        this.root.add(model);
        this.root.scale.set(1.5, 1.5, 1.5);

        this.hasPlayer = false;
    }

    public update(enemy: EnemyModelWrapper) {
        enemy.model.root.add(this.root);

        if (this.hasPlayer) {
            this.root.scale.set(1.5, 1.5, 1.5);
            this.root.position.set(0, enemy.tmpHeight + 1, 0);
        } else {
            this.root.scale.set(1.49, 1.49, 1.49);
            this.root.position.set(0, enemy.tmpHeight + 1, 0);
        }
    }
}

ModuleLoader.registerRender("Vanilla.Enemy.Alerts", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, {
        name, pass: (renderer, snapshot) => {
            const _models: AlertModel[] = [];
            const models = renderer.getOrDefault("Vanilla.Enemy.Alerts", Factory("Array"));
            const alerts = snapshot.getOrDefault("Vanilla.Enemy.Alert", Factory("Array"));
            const enemies = renderer.getOrDefault("Enemies", Factory("Map"));
            const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
            for (const alert of alerts) {
                if (!enemies.has(alert.enemy)) continue;
                const enemy = enemies.get(alert.enemy)!;
                if (!enemy.model.isVisible()) continue;

                const i = _models.length;
                if (models[i] === undefined) {
                    const model = new AlertModel(0xffffff);
                    models[i] = model;
                }
                const model = models[i];
                
                let color: ColorRepresentation = 0xffffff;
                model.hasPlayer = false;
                if (alert.player !== undefined && players.has(alert.player)) {
                    color = getPlayerColor(players.get(alert.player)!.slot);
                    model.hasPlayer = true;
                }
                model.material.color.set(color);

                model.update(enemy);

                _models.push(model);
            }
            for (let i = _models.length; i < models.length; ++i) {
                models[i].removeFromParent();
            }
            renderer.set("Vanilla.Enemy.Alerts", _models);
        } 
    }]);
});