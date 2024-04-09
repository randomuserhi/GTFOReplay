import { ColorRepresentation, CylinderGeometry, Group, Mesh, MeshPhongMaterial, Scene, SphereGeometry } from "three";
import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import { playerColors } from "../player/renderer.js";
import { specification } from "../specification.js";
import { Enemy } from "./enemy.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "Vanilla.Enemy.Alert": {
                enemy: number;
                slot: number;
            };
        }

        interface Data {
            "Vanilla.Enemy.Alert": EnemyAlert[];
        }
    }
}

export interface EnemyAlert {
    enemy: number;
    player: number;
    time: number;
}

ModuleLoader.registerEvent("Vanilla.Enemy.Alert", "0.0.1", {
    parse: async (bytes) => {
        return {
            enemy: await BitHelper.readInt(bytes),
            slot: await BitHelper.readByte(bytes)
        };
    },
    exec: async (data, snapshot) => {
        const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
        if (players.size > 4) throw new Error("There shouldn't be more than 4 players");
        const { enemy, slot } = data;
        let player: number | undefined = undefined;
        for (const p of players.values()) {
            if (p.slot === slot) {
                player = p.id;
                break;
            }
        }
        if (player === undefined) throw new Error(`Couldn't find player slotted in position '${slot}'`);
        const alerts = snapshot.getOrDefault("Vanilla.Enemy.Alert", () => []);
        alerts.push({ time: snapshot.time(), enemy, player });
    }
});

const duration = 1500;
ModuleLoader.registerTick((snapshot) => {
    const t = snapshot.time();
    const alerts = snapshot.getOrDefault("Vanilla.Enemy.Alert", () => []);
    snapshot.set("Vanilla.Enemy.Alert", alerts.filter((a) => (t - a.time) < duration));
});

// --------------------------- RENDERING ---------------------------

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

    public update(enemy: Enemy) {
        this.group.position.copy(enemy.position);
        let height = 2;
        if (specification.enemies.has(enemy.type)) {
            const spec = specification.enemies.get(enemy.type)!;
            if (spec.height !== undefined) {
                height = spec.height;
            }
        }
        this.group.position.add({ x: 0, y: height, z: 0 });
    }

    public setVisible(visible: boolean) {
        this.group.visible = visible;
    }

    public addToScene(scene: Scene) {
        scene.add(this.group);
    }

    public removeFromScene(scene: Scene) {
        scene.remove(this.group);
    }
}

ModuleLoader.registerRender("Vanilla.Enemy.Alerts", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, {
        name, pass: (renderer, snapshot) => {
            const _models: AlertModel[] = [];
            const models = renderer.getOrDefault("Vanilla.Enemy.Alerts", () => []);
            const alerts = snapshot.getOrDefault("Vanilla.Enemy.Alert", () => []);
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
            for (const alert of alerts) {
                if (!enemies.has(alert.enemy)) continue;
                const enemy = enemies.get(alert.enemy)!;

                const i = _models.length;
                if (models[i] === undefined) {
                    const model = new AlertModel(0xffffff);
                    model.addToScene(renderer.scene);
                    models[i] = model;
                }
                const model = models[i];
                
                let color: ColorRepresentation = 0xffffff;
                if (players.has(alert.player)) {
                    color = playerColors[players.get(alerts[i].player)!.slot];
                }
                model.material.color.set(color);

                model.update(enemy);
                model.setVisible(enemy.dimension === renderer.get("Dimension"));

                _models.push(model);
            }
            for (let i = _models.length; i < models.length; ++i) {
                models[i].removeFromScene(renderer.scene);
            }
            renderer.set("Vanilla.Enemy.Alerts", _models);
        } 
    }]);
});