import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Mesh, MeshPhongMaterial, Vector3 } from "@esm/three";
import { DynamicSplineGeometry } from "../../library/dynamicspline.js";
import { Factory } from "../../library/factory.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Holopath": void;
        }

        interface RenderData {
            "Holopath": Map<number, { mesh: Mesh, geometry: DynamicSplineGeometry }>;
        }
    }
}

const temp = Pod.Vec.zero();

ModuleLoader.registerRender("Holopath", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Holopath", Factory("Map"));
            const holopaths = snapshot.getOrDefault("Vanilla.Holopath", Factory("Map"));
            for (const [id, holopath] of holopaths) {
                if (!models.has(id)) {
                    const geometry = new DynamicSplineGeometry(0.07, 6, 50, true);
                    const material = new MeshPhongMaterial( { color: 0xffffff } );
                    material.transparent = true;
                    material.opacity = 0.5;
                    material.depthWrite = false;

                    const mesh = new Mesh(geometry, material);

                    models.set(id, { mesh, geometry });
                    renderer.scene.add(mesh);
                }
                const model = models.get(id)!;

                let totalLength = 0;
                for (let i = 1; i < holopath.spline.length; ++i) {
                    totalLength += Pod.Vec.length(Pod.Vec.sub(temp, holopath.spline[i], holopath.spline[i - 1]));
                }
                const distance = holopath.progress * totalLength;
                const points: Vector3[] = [new Vector3(holopath.spline[0].x, holopath.spline[0].y, holopath.spline[0].z)];
                for (let i = 1, d = 0; d <= distance && i < holopath.spline.length; ++i) {
                    const diff = Pod.Vec.sub(temp, holopath.spline[i], holopath.spline[i - 1]);
                    const dist = Pod.Vec.length(diff);
                    
                    let lerp = 1;
                    const diffDist = distance - d;
                    if (diffDist < dist) {
                        lerp = diffDist / dist;
                    }
                    points.push(new Vector3(
                        holopath.spline[i-1].x + diff.x * lerp,
                        holopath.spline[i-1].y + diff.y * lerp,
                        holopath.spline[i-1].z + diff.z * lerp
                    ));
                    
                    d += dist;
                }

                model.geometry.morph(points);
                model.mesh.visible = holopath.dimension === renderer.get("Dimension");
            }

            for (const [id, model] of [...models.entries()]) {
                if (!holopaths.has(id)) {
                    renderer.scene.remove(model.mesh);
                    models.delete(id);
                }
            }
        } 
    }]);
});

