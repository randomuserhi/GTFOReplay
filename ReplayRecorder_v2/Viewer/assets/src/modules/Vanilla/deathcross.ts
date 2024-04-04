import { BoxGeometry, Group, Mesh, MeshPhongMaterial, Vector3Like } from "three";
import { ModuleLoader, ReplayApi } from "../../replay/moduleloader.js";
import * as Pod from "../../replay/pod.js";
import { Bezier } from "../bezier.js";
import { xor } from "../random.js";

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface Data {
            "Vanilla.DeathCross": DeathCross[]
        }
    }
}

export interface DeathCross {
    dimension: number;
    time: number;
    deviation: number;
    shake: (number[])[];
    position: Pod.Vector;
}

export function createDeathCross(snapshot: ReplayApi, seed: number, dimension: number, position: Vector3Like) {
    const time = snapshot.time();
    const deathCrosses = snapshot.getOrDefault("Vanilla.DeathCross", () => []);
    const r = xor(time + seed ^ 0x190104029);
    const deviation = r() * 300;
    const shakeAmount = 1;
    const shake = new Array(10);
    for (let i = 0; i < 10; ++i) {
        shake[i] = [-(shakeAmount/2) + r() * shakeAmount, -(shakeAmount/2) + r() * shakeAmount];
    }
    deathCrosses.push({ 
        time, 
        dimension,
        position,
        deviation,
        shake
    });
}

const box = new BoxGeometry(1, 1, 1);

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

        const obj0 = new Mesh(box, main);
        gun.add(obj0);
        obj0.scale.set(1.68736, 0.2, 0.41788);
        obj0.position.set(0, 0, 0);

        const obj1 = new Mesh(box, main);
        gun.add(obj1);
        obj1.scale.set(0.41788, 0.2, 1.68736);
        obj1.position.set(0, 0, 0);

        const obj2 = new Mesh(box, border);
        gun.add(obj2);
        obj2.scale.set(1.996835, 0.1053439, 0.7320759);
        obj2.position.set(0, -0.054, 0);

        const obj3 = new Mesh(box, border);
        gun.add(obj3);
        obj3.scale.set(0.7320759, 0.1053439, 1.996835);
        obj3.position.set(0, -0.0539999, 0);

        this.group.add(gun);
        gun.rotateY(Math.PI/4);
        gun.position.set(0, 0.2, 0);
        gun.scale.set(0.3, 0.6, 0.3);
    }
}

const duration = 1000;
ModuleLoader.registerTick((snapshot) => {
    const t = snapshot.time();
    const gunshots = snapshot.getOrDefault("Vanilla.DeathCross", () => []);
    snapshot.set("Vanilla.DeathCross", gunshots.filter((p) => (t - p.time) < duration));
});

// --------------------------- RENDERING ---------------------------

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.DeathCross": void;
        }

        interface RenderData {
            "Vanilla.DeathCross": Model[];
        }
    }
}

const bezier = Bezier(.81,-0.11,.58,1.1);

ModuleLoader.registerRender("Vanilla.DeathCross", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, {
        name, pass: (renderer, snapshot) => {
            const time = snapshot.time();
            const _models = [];
            const models = renderer.getOrDefault("Vanilla.DeathCross", () => []);
            const deathCrosses = snapshot.getOrDefault("Vanilla.DeathCross", () => []);
            let i = 0;
            for (; i < deathCrosses.length; ++i) {
                if (models[i] === undefined) {
                    models[i] = new Model();
                    renderer.scene.add(models[i].group);
                }

                const cross = deathCrosses[i];
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
                
                mesh.visible = deathCrosses[i].dimension === renderer.get("Dimension") && visible;

                _models.push(models[i]);
            }
            for (; i < models.length; ++i) {
                renderer.scene.remove(models[i].group);
            }
            renderer.set("Vanilla.DeathCross", _models);
        } 
    }]);
});