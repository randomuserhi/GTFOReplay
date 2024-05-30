import { Matrix4, Mesh, MeshPhongMaterial, Vector3 } from "three";
import { getInstance } from "../../../replay/instancing.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";
import { DynamicSplineGeometry } from "../dynamicspline.js";
import { HumanoidEnemyModel } from "./enemy.js";

declare module "../../../replay/moduleloader.js" {
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
            const models = renderer.getOrDefault("Enemy.Tongue", () => new Map());
            const tongues = snapshot.getOrDefault("Vanilla.Enemy.Tongue", () => new Map());
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
            const enemyModels = renderer.getOrDefault("Enemies", () => new Map());
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

                const enemyModel = enemyModels.get(owner.id);
                
                const originThree = new Vector3(0, 0, 0).copy(owner.position); // TODO(randomuserhi): Move elsewhere to prevent GC
                if (enemyModel !== undefined && Object.prototype.isPrototypeOf.call(HumanoidEnemyModel.prototype, enemyModel)) {
                    const humanoidModel: HumanoidEnemyModel = enemyModel as HumanoidEnemyModel;
                    const matrix = new Matrix4(); // TODO(randomuserhi): Move elsewhere to prevent GC
                    if (owner.head && humanoidModel.head !== -1)  {
                        getInstance("Sphere.MeshPhong").getMatrixAt(humanoidModel.head, matrix);
                        originThree.setFromMatrixPosition(matrix);
                    } else {
                        getInstance("Cylinder.MeshPhong").getMatrixAt(humanoidModel.parts[0], matrix);
                        originThree.setFromMatrixPosition(matrix);
                    }
                }

                const origin: Pod.Vector = {
                    x: originThree.x,
                    y: originThree.y,
                    z: originThree.z
                };

                let totalLength = 0;
                for (let i = 0; i < tongue.spline.length; ++i) {
                    if (i === 0) {
                        totalLength += Pod.Vec.length(Pod.Vec.sub(temp, tongue.spline[i], origin));
                    } else {
                        totalLength += Pod.Vec.length(Pod.Vec.sub(temp, tongue.spline[i], tongue.spline[i - 1]));
                    }
                }
                const distance = tongue.progress * totalLength;
                const points: Vector3[] = [new Vector3(origin.x, origin.y, origin.z)];
                for (let i = 0, d = 0; d <= distance && i < tongue.spline.length; ++i) {
                    let diff: Pod.Vector;
                    if (i === 0) {
                        diff = Pod.Vec.sub(temp, tongue.spline[i], origin);
                    } else {
                        diff = Pod.Vec.sub(temp, tongue.spline[i], tongue.spline[i - 1]);
                    }
                    const dist = Pod.Vec.length(diff);
                    
                    let lerp = 1;
                    const diffDist = distance - d;
                    if (diffDist < dist) {
                        lerp = diffDist / dist;
                    }
                    if (i === 0) {
                        points.push(new Vector3(
                            origin.x + diff.x * lerp,
                            origin.y + diff.y * lerp,
                            origin.z + diff.z * lerp
                        ));
                    } else {
                        points.push(new Vector3(
                            tongue.spline[i-1].x + diff.x * lerp,
                            tongue.spline[i-1].y + diff.y * lerp,
                            tongue.spline[i-1].z + diff.z * lerp
                        ));
                    }
                    
                    d += dist;
                }
                if (points.length > 1) {
                    model.geometry.morph(points);
                }
                model.mesh.visible = points.length > 1 && tongue.dimension === renderer.get("Dimension");
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

