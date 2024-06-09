import { ColorRepresentation, CylinderGeometry, LineBasicMaterial, Mesh, MeshStandardMaterial } from "three";
import { ModuleLoader } from "../../replay/moduleloader.js";
import * as Pod from "../../replay/pod.js";
import { duration } from "../parser/gunshot.js";
import { playerColors } from "./player/renderer.js";

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

const gunshotGeometry = new CylinderGeometry(1, 1, 1, 10, 10).translate(0, 0.5, 0).rotateX(Math.PI * 0.5);

ModuleLoader.registerRender("Vanilla.Player.Gunshots", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, {
        name, pass: (renderer, snapshot) => {
            const t = snapshot.time();
            const _models: Mesh[] = [];
            const models = renderer.getOrDefault("Vanilla.Player.Gunshots", () => []);
            const gunshots = snapshot.getOrDefault("Vanilla.Player.Gunshots", () => []);
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
            for (const gunshot of gunshots) {
                const i = _models.length;
                if (models[i] === undefined) {
                    const material = new MeshStandardMaterial({ color: 0xffffff });
                    material.transparent = true;
                    material.opacity = 1;
                    material.depthWrite = false;

                    const mesh = new Mesh(gunshotGeometry, material);
                    mesh.scale.set(0.02, 0.02, 0.02);
                    models[i] = mesh;
                    renderer.scene.add(mesh);
                }
                const mesh = models[i];
                
                let color: ColorRepresentation = 0xffffff;
                if (players.has(gunshot.owner)) {
                    color = playerColors[players.get(gunshot.owner)!.slot % playerColors.length];
                }
                (mesh.material as MeshStandardMaterial).color.set(color);

                const a = gunshot.start;
                const b = gunshot.end;
                mesh.position.set(a.x, a.y, a.z);
                mesh.lookAt(b.x, b.y, b.z);
                mesh.scale.z = Pod.Vec.dist(a, b);

                const opacity = 1 - Math.clamp01((t - gunshot.time) / duration);
                if (opacity === 0) {
                    mesh.visible = false;
                    continue;
                }
                (mesh.material as LineBasicMaterial).opacity = opacity;
                mesh.visible = gunshot.dimension === renderer.get("Dimension");

                _models.push(models[i]);
            }
            for (let i = _models.length; i < models.length; ++i) {
                renderer.scene.remove(models[i]);
            }
            renderer.set("Vanilla.Player.Gunshots", _models);
        } 
    }]);
});

