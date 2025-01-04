import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { CylinderGeometry, LineBasicMaterial, Mesh, MeshStandardMaterial, Quaternion, SphereGeometry } from "@esm/three";
import { Factory } from "../../../vanilla/library/factory.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "EWC.Projectile": void;
        }

        interface RenderData {
            "EWC.Projectile": Map<number, Mesh>;
            "EWC.Projectile.Trails": Map<number, Mesh[]>;
        }
    }
}

const geometry = new SphereGeometry(0.05, 10, 10);
const trailGeometry = new CylinderGeometry(1, 1, 1, 10, 10).translate(0, 0.5, 0).rotateX(Math.PI * 0.5);

ModuleLoader.registerRender("EWC.Projectile", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("EWC.Projectile", Factory("Map"));
            const projectiles = snapshot.getOrDefault("EWC.Projectile", Factory("Map"));
            for (const [id, projectile] of projectiles) {
                if (!models.has(id)) {
                    const material = new MeshStandardMaterial( { color: projectile.color } );

                    const mesh = new Mesh(geometry, material);
                    models.set(id, mesh);
                    renderer.scene.add(mesh);
                }
                const model = models.get(id)!;
                model.position.set(projectile.position.x, projectile.position.y, projectile.position.z);
                model.setRotationFromQuaternion(new Quaternion(projectile.rotation.x, projectile.rotation.y, projectile.rotation.z, projectile.rotation.w));
                model.visible = projectile.dimension === renderer.get("Dimension");
            }

            for (const [id, model] of [...models.entries()]) {
                if (!projectiles.has(id)) {
                    renderer.scene.remove(model);
                    models.delete(id);
                }
            }
        } 
    }, {
        name, pass: (renderer, snapshot) => {
            const t = snapshot.time();
            const models = renderer.getOrDefault("EWC.Projectile.Trails", Factory("Map"));
            const trails = snapshot.getOrDefault("EWC.Projectile.Trails", Factory("Map"));
            for (const [id, trail] of trails) {
                if (!models.has(id)) {
                    models.set(id, []);
                }
                const model = models.get(id)!;
                while (model.length < trail.points.length - 1) {
                    const material = new MeshStandardMaterial({ color: trail.color });
                    material.transparent = true;
                    material.opacity = 1;
                    material.depthWrite = false;

                    const mesh = new Mesh(trailGeometry, material);
                    mesh.scale.set(0.03, 0.03, 0.03);
                    model.push(mesh);
                    renderer.scene.add(mesh);
                }
                while (model.length != 0 && model.length > trail.points.length - 1) {
                    renderer.scene.remove(model.pop()!);
                }
                for (let i = 0; i < model.length; ++i) {
                    const a = trail.points[i];
                    const b = trail.points[i + 1];

                    const mesh = model[i];
                    mesh.position.set(a.position.x, a.position.y, a.position.z);
                    mesh.lookAt(b.position.x, b.position.y, b.position.z);
                    mesh.scale.z = Pod.Vec.dist(a.position, b.position);

                    const opacity = 1 - Math.clamp01((t - a.time) / trail.duration);
                    if (opacity === 0) {
                        model[i].visible = false;
                        continue;
                    }
                    (model[i].material as LineBasicMaterial).opacity = opacity;
                    model[i].visible = trail.dimension === renderer.get("Dimension");
                }
            }

            for (const [id, model] of [...models.entries()]) {
                if (!trails.has(id)) {
                    for (const mesh of model) {
                        renderer.scene.remove(mesh);
                    }
                    models.delete(id);
                }
            }
        } 
    }]);
});

