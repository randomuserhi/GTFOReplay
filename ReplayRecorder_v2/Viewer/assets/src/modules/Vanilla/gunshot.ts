import { ColorRepresentation, CylinderGeometry, LineBasicMaterial, Mesh, MeshStandardMaterial } from "three";
import * as BitHelper from "../../replay/bithelper.js";
import { ModuleLoader } from "../../replay/moduleloader.js";
import * as Pod from "../../replay/pod.js";
import { playerColors } from "./player.js";

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "Vanilla.Player.Gunshots": {
                owner: number;
                dimension: number;
                damage: number;
                start: Pod.Vector;
                end: Pod.Vector;
                sentry: boolean;
            };
        }
    
        interface Data {
            "Vanilla.Player.Gunshots": Gunshot[]
        }
    }
}

export interface Gunshot {
    owner: number;
    dimension: number;
    damage: number;
    start: Pod.Vector;
    end: Pod.Vector;
    sentry: boolean;
    time: number;
}

ModuleLoader.registerEvent("Vanilla.Player.Gunshots", "0.0.1", {
    parse: async (bytes) => {
        return {
            owner: await BitHelper.readInt(bytes),
            dimension: await BitHelper.readByte(bytes),
            damage: await BitHelper.readHalf(bytes),
            sentry: await BitHelper.readBool(bytes),
            start: await BitHelper.readVector(bytes),
            end: await BitHelper.readVector(bytes),
        };
    },
    exec: async (data, snapshot) => {
        const gunshots = snapshot.getOrDefault("Vanilla.Player.Gunshots", () => []);
        gunshots.push({ time: snapshot.time(), ...data });
    }
});

ModuleLoader.registerTick((snapshot) => {
    const t = snapshot.time();
    const gunshots = snapshot.getOrDefault("Vanilla.Player.Gunshots", () => []);
    snapshot.set("Vanilla.Player.Gunshots", gunshots.filter((p) => (t - p.time) < duration));
});

// --------------------------- RENDERING ---------------------------


declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.Player.Gunshots": void;
        }

        interface RenderData {
            "Vanilla.Player.Gunshots": Mesh[];
        }
    }
}

const duration = 200;
const gunshotGeometry = new CylinderGeometry(1, 1, 1, 10, 10).translate(0, 0.5, 0).rotateX(Math.PI * 0.5);

ModuleLoader.registerRender("Vanilla.Player.Gunshots", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, {
        name, pass: (renderer, snapshot) => {
            const t = snapshot.time();
            const _models = [];
            const models = renderer.getOrDefault("Vanilla.Player.Gunshots", () => []);
            const gunshots = snapshot.getOrDefault("Vanilla.Player.Gunshots", () => []);
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
            let i = 0;
            for (; i < gunshots.length; ++i) {
                if (models[i] === undefined) {
                    let color: ColorRepresentation = 0xffffff;
                    if (players.has(gunshots[i].owner)) {
                        color = playerColors[players.get(gunshots[i].owner)!.slot];
                    }
                    const material = new MeshStandardMaterial({ color });
                    material.transparent = true;
                    material.opacity = 1;

                    const mesh = new Mesh(gunshotGeometry, material);
                    mesh.scale.set(0.02, 0.02, 0.02);
                    models[i] = mesh;
                    renderer.scene.add(mesh);
                }
                const mesh = models[i];
                const a = gunshots[i].start;
                const b = gunshots[i].end;
                mesh.position.set(a.x, a.y, a.z);
                mesh.lookAt(b.x, b.y, b.z);
                mesh.scale.z = Pod.Vec.dist(a, b);

                const opacity = 1 - Math.clamp01((t - gunshots[i].time) / duration);
                if (opacity === 0) {
                    mesh.visible = false;
                    continue;
                }
                (mesh.material as LineBasicMaterial).opacity = opacity;
                mesh.visible = gunshots[i].dimension === renderer.get("Dimension");

                _models.push(models[i]);
            }
            for (; i < models.length; ++i) {
                renderer.scene.remove(models[i]);
            }
            renderer.set("Vanilla.Player.Gunshots", _models);
        } 
    }]);
});

