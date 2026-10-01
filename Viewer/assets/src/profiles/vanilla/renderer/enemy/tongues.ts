import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Mesh, MeshPhongMaterial, Vector3 } from "@esm/three";
import { DynamicSplineGeometry } from "../../library/dynamicspline.js";
import { Factory } from "../../library/factory.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Enemy.Tongue": void;
        }

        interface RenderData {
            "Enemy.Tongue": Map<number, { mesh: Mesh, geometry: DynamicSplineGeometry }>;
        }
    }
}

const temp = Pod.Vec.zero();
ModuleLoader.registerRender("Enemy.Tongue", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Enemy.Tongue", Factory("Map"));
            const tongues = snapshot.getOrDefault("Vanilla.Enemy.Tongue", Factory("Map"));
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", Factory("Map"));
            const enemyModels = renderer.getOrDefault("Enemies", Factory("Map"));
            for (const [id, tongue] of tongues) {
                const owner = enemies.get(tongue.owner);

                if (!models.has(id)) {
                    const geometry = new DynamicSplineGeometry(0.07, 6, 50, true);
                    const material = new MeshPhongMaterial( { color: 0xff0000 } );

                    const mesh = new Mesh(geometry, material);
                    mesh.castShadow = true;

                    models.set(id, { mesh, geometry });
                    renderer.scene.add(mesh);
                }
                const model = models.get(id)!;
                if (owner === undefined || tongue.spline.length < 2) {
                    model.mesh.visible = false;
                    continue;
                }

                const wrapper = enemyModels.get(owner.id);
                if (tongue.dimension !== renderer.get("Dimension") || (wrapper !== undefined && !wrapper.model.isVisible())) {
                    model.mesh.visible = false;
                    continue;
                }
                
                // The game records the spline's actual mouth anchor. A reconstructed
                // head matrix can be stale or absent while the enemy is visible.
                let totalLength = 0;
                for (let i = 1; i < tongue.spline.length; ++i) {
                    totalLength += Pod.Vec.dist(tongue.spline[i], tongue.spline[i - 1]);
                }
                const distance = tongue.progress * totalLength;
                const start = tongue.spline[0];
                const points: Vector3[] = [new Vector3(start.x, start.y, start.z)];
                for (let i = 1, d = 0; d < distance && i < tongue.spline.length; ++i) {
                    const diff = Pod.Vec.sub(temp, tongue.spline[i], tongue.spline[i - 1]);
                    const dist = Pod.Vec.length(diff);
                    if (dist === 0) continue;
                    
                    let lerp = 1;
                    const diffDist = distance - d;
                    if (diffDist < dist) {
                        lerp = diffDist / dist;
                    }
                    points.push(new Vector3(
                        tongue.spline[i-1].x + diff.x * lerp,
                        tongue.spline[i-1].y + diff.y * lerp,
                        tongue.spline[i-1].z + diff.z * lerp
                    ));
                    
                    d += dist;
                }
                if (points.length > 1) {
                    model.geometry.morph(points);
                }
                model.mesh.visible = points.length > 1;
            }

            for (const [id, model] of [...models.entries()]) {
                if (!tongues.has(id)) {
                    renderer.scene.remove(model.mesh);
                    models.delete(id);
                }
            }
        } 
    }]);
});

