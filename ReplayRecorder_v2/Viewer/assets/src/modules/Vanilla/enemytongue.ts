import { Mesh, MeshPhongMaterial, Vector3 } from "three";
import * as BitHelper from "../../replay/bithelper.js";
import { ModuleLoader } from "../../replay/moduleloader.js";
import * as Pod from "../../replay/pod.js";
import { DynamicSplineGeometry } from "../dynamicspline.js";
import { Dynamic } from "../replayrecorder.js";

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Enemy.Tongue": {
                parse: {
                    dimension: number;
                    progress: number;
                    spline: Pod.Vector[];
                };
                spawn: {
                    dimension: number;
                    progress: number;
                    spline: Pod.Vector[];
                };
                despawn: void;
            };
        }
    
        interface Data {
            "Vanilla.Enemy.Tongue": Map<number, Tongue>
        }
    }
}

export interface Tongue extends Dynamic {
    dimension: number;
    progress: number;
    spline: Pod.Vector[];
}

ModuleLoader.registerDynamic("Vanilla.Enemy.Tongue", "0.0.1", {
    main: {
        parse: async (data) => {
            const header = {
                dimension: await BitHelper.readByte(data),
                progress: await BitHelper.readByte(data) / 255
            };
            const length = await BitHelper.readByte(data);
            const spline: Pod.Vector[] = new Array(length);
            spline[0] = await BitHelper.readVector(data);
            for (let i = 1; i < length; ++i) {
                spline[i] = Pod.Vec.add(spline[i - 1], await BitHelper.readHalfVector(data));
            }
            return {
                ...header, spline
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const tongues = snapshot.getOrDefault("Vanilla.Enemy.Tongue", () => new Map());
    
            if (!tongues.has(id)) throw new TongueNotFound(`Tongue of id '${id}' was not found.`);
            
            const tongue = tongues.get(id)!;
            tongue.spline = data.spline;
            tongue.dimension = data.dimension;
            tongue.progress += (data.progress - tongue.progress) * lerp;
        }
    },
    spawn: {
        parse: async (data) => {
            const header = {
                dimension: await BitHelper.readByte(data),
                progress: await BitHelper.readByte(data) / 255
            };
            const length = await BitHelper.readByte(data);
            const spline: Pod.Vector[] = new Array(length);
            spline[0] = await BitHelper.readVector(data);
            for (let i = 1; i < length; ++i) {
                spline[i] = Pod.Vec.add(spline[i - 1], await BitHelper.readHalfVector(data));
            }
            return {
                ...header, spline
            };
        },
        exec: (id, data, snapshot) => {
            const enemies = snapshot.getOrDefault("Vanilla.Enemy.Tongue", () => new Map());
        
            if (enemies.has(id)) throw new DuplicateTongue(`Tongue of id '${id}' already exists.`);
            enemies.set(id, { id, ...data });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const tongues = snapshot.getOrDefault("Vanilla.Enemy.Tongue", () => new Map());

            if (!tongues.has(id)) throw new TongueNotFound(`Tongue of id '${id}' did not exist.`);
            tongues.delete(id);
        }
    }
});

class TongueNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

class DuplicateTongue extends Error {
    constructor(message?: string) {
        super(message);
    }
}

// --------------------------- RENDERING ---------------------------


declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Enemy.Tongue": void;
        }

        interface RenderData {
            "Enemy.Tongue": Map<number, { mesh: Mesh, geometry: DynamicSplineGeometry }>;
        }
    }
}

ModuleLoader.registerRender("Enemy.Tongue", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([{ 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Enemy.Tongue", () => new Map());
            const tongues = snapshot.getOrDefault("Vanilla.Enemy.Tongue", () => new Map());
            for (const [id, tongue] of tongues) {
                if (tongue.dimension !== renderer.get("Dimension")) {
                    models.delete(id);
                    continue;
                }

                if (!models.has(id)) {
                    const geometry = new DynamicSplineGeometry(0.1, 6, 50, true);
                    const material = new MeshPhongMaterial( { color: 0xff0000 } );

                    const mesh = new Mesh(geometry, material);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;

                    models.set(id, { mesh, geometry });
                    renderer.scene.add(mesh);
                }

                let totalLength = 0;
                for (let i = 1; i < tongue.spline.length; ++i) {
                    totalLength += Pod.Vec.length(Pod.Vec.sub(tongue.spline[i], tongue.spline[i - 1]));
                }
                const distance = tongue.progress * totalLength;
                const points: Vector3[] = [new Vector3(
                    tongue.spline[0].x,
                    tongue.spline[0].y,
                    tongue.spline[0].z
                )];
                for (let i = 1, d = 0; d <= distance && i < tongue.spline.length; ++i) {
                    const diff = Pod.Vec.sub(tongue.spline[i], tongue.spline[i - 1]);
                    const dist = Pod.Vec.length(diff);
                    
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

                const model = models.get(id)!;
                model.geometry.morph(points);
            }

            for (const [id, model] of [...models.entries()]) {
                if (!tongues.has(id)) {
                    renderer.scene.remove(model.mesh);
                    models.delete(id);
                }
            }
        } 
    }, ...renderLoop]);
});
