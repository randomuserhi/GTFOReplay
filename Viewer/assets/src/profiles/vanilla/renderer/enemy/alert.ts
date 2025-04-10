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
            "Vanilla.Enemy.Alerts": Map<number, AlertModel>;
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
        this.root.position.set(0, enemy.tmpHeight + 1, 0);
    }
}

ModuleLoader.registerRender("Vanilla.Enemy.Alerts", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, {
        name, pass: (renderer, snapshot) => {
            const seen = new Set<number>();
            const models = renderer.getOrDefault("Vanilla.Enemy.Alerts", Factory("Map"));
            const alerts = snapshot.getOrDefault("Vanilla.Enemy.Alert", Factory("Array"));
            const enemies = renderer.getOrDefault("Enemies", Factory("Map"));
            const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
            for (const alert of alerts) {
                if (!enemies.has(alert.enemy)) continue;
                const enemy = enemies.get(alert.enemy)!;
                if (!enemy.model.isVisible()) continue;

                let model = models.get(alert.enemy);
                if (model === undefined) {
                    model = new AlertModel(0xffffff);
                    models.set(alert.enemy, model);
                }
                
                if (!model.hasPlayer && alert.player !== undefined && players.has(alert.player)) {
                    model.material.color.set(getPlayerColor(players.get(alert.player)!.slot));
                    model.hasPlayer = true;
                }

                model.update(enemy);

                seen.add(alert.enemy);
            }
            for (const enemy of [...models.keys()]) {
                if (!seen.has(enemy)) {
                    models.get(enemy)!.removeFromParent();
                    models.delete(enemy);
                }
            }
        } 
    }]);
});