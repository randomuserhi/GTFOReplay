
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Bezier } from "../library/bezier.js";
import { duration } from "../parser/deathcross.js";
import { Box } from "./models/primitives.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.DeathCross": void;
        }

        interface RenderData {
            "Vanilla.DeathCross": Model[];
        }
    }
}

class Model {
    group: Group;

    constructor() {
        this.group = new Group();

        const main = new MeshPhongMaterial({
            color: 0xff0000
        });
        const border = new MeshPhongMaterial({
            color: 0xffffff
        });

        const gun = new Group();

        const obj0 = new Mesh(Box, main);
        gun.add(obj0);
        obj0.scale.set(1.68736, 0.2, 0.41788);
        obj0.position.set(0, 0, 0);

        const obj1 = new Mesh(Box, main);
        gun.add(obj1);
        obj1.scale.set(0.41788, 0.2, 1.68736);
        obj1.position.set(0, 0, 0);

        const obj2 = new Mesh(Box, border);
        gun.add(obj2);
        obj2.scale.set(1.996835, 0.1053439, 0.7320759);
        obj2.position.set(0, -0.054, 0);

        const obj3 = new Mesh(Box, border);
        gun.add(obj3);
        obj3.scale.set(0.7320759, 0.1053439, 1.996835);
        obj3.position.set(0, -0.0539999, 0);

        this.group.add(gun);
        gun.rotateY(Math.PI/4);
        gun.position.set(0, 0.2, 0);
        gun.scale.set(0.3, 0.6, 0.3);
    }
}

const bezier = Bezier(.81,-0.11,.58,1.1);

ModuleLoader.registerRender("Vanilla.DeathCross", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, {
        name, pass: (renderer, snapshot) => {
            const time = snapshot.time();
            const _models: Model[] = [];
            const models = renderer.getOrDefault("Vanilla.DeathCross", () => []);
            const deathCrosses = snapshot.getOrDefault("Vanilla.DeathCross", () => []);
            for (const cross of deathCrosses) {
                const i = _models.length;
                if (models[i] === undefined) {
                    models[i] = new Model();
                    renderer.scene.add(models[i].group);
                }

                let t = (time - cross.time) / (duration + cross.deviation);
                let dx = 0;
                let dy = 0;
                let scale = 1;
                let visible = true;
                if (t < 0.15) {
                    t = t / 0.15;
                    scale = 1 + 5 * bezier(1 - t);
                
                    const idx = Math.round(t * (cross.shake.length - 1));
                    dx = cross.shake[idx][0];
                    dy = cross.shake[idx][1];
                } else {
                    t -= 0.15;
                    t = t / (1 - 0.15);
                    const c = Math.sin(2 * Math.PI * ((6/2) * t * t + 2 * t));
                    if (c < 0) visible = false;
                }

                const mesh = models[i].group;
                mesh.position.set(cross.position.x + dx, cross.position.y, cross.position.z + dy);
                mesh.scale.set(scale, 1, scale);
                
                mesh.visible = cross.dimension === renderer.get("Dimension") && visible;

                _models.push(models[i]);
            }
            for (let i = _models.length; i < models.length; ++i) {
                renderer.scene.remove(models[i].group);
            }
            renderer.set("Vanilla.DeathCross", _models);
        } 
    }]);
});