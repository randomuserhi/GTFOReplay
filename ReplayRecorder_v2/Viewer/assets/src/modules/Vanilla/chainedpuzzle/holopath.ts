import { Mesh, MeshPhongMaterial, Vector3 } from "three";
import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";
import { DynamicSplineGeometry } from "../../dynamicspline.js";
import { Dynamic } from "../../replayrecorder.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Holopath": {
                parse: {
                    progress: number;
                };
                spawn: {
                    dimension: number;
                    spline: Pod.Vector[];
                };
                despawn: void;
            };
        }
    
        interface Data {
            "Vanilla.Holopath": Map<number, Holopath>
        }
    }
}

export interface Holopath extends Dynamic {
    dimension: number;
    progress: number;
    spline: Pod.Vector[];
}

ModuleLoader.registerDynamic("Vanilla.Holopath", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                progress: await BitHelper.readByte(data) / 255
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const holpaths = snapshot.getOrDefault("Vanilla.Holopath", () => new Map());
    
            if (!holpaths.has(id)) throw new HolopathNotFound(`Holopath of id '${id}' was not found.`);
            
            const holopath = holpaths.get(id)!;
            holopath.progress += (data.progress - holopath.progress) * lerp;
        }
    },
    spawn: {
        parse: async (data) => {
            const header = {
                dimension: await BitHelper.readByte(data),
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
            const holopaths = snapshot.getOrDefault("Vanilla.Holopath", () => new Map());
        
            if (holopaths.has(id)) throw new DuplicateHolopath(`Holopath of id '${id}' already exists.`);
            holopaths.set(id, { id, ...data, progress: 0 });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const holopaths = snapshot.getOrDefault("Vanilla.Holopath", () => new Map());

            if (!holopaths.has(id)) throw new HolopathNotFound(`Holopath of id '${id}' did not exist.`);
            holopaths.delete(id);
        }
    }
});

class HolopathNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

class DuplicateHolopath extends Error {
    constructor(message?: string) {
        super(message);
    }
}

// --------------------------- RENDERING ---------------------------


declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Holopath": void;
        }

        interface RenderData {
            "Holopath": Map<number, { mesh: Mesh, geometry: DynamicSplineGeometry }>;
        }
    }
}

ModuleLoader.registerRender("Holopath", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Holopath", () => new Map());
            const holopaths = snapshot.getOrDefault("Vanilla.Holopath", () => new Map());
            for (const [id, holopath] of holopaths) {
                if (!models.has(id)) {
                    const geometry = new DynamicSplineGeometry(0.07, 6, 50, true);
                    const material = new MeshPhongMaterial( { color: 0xffffff } );
                    material.transparent = true;
                    material.opacity = 0.5;

                    const mesh = new Mesh(geometry, material);

                    models.set(id, { mesh, geometry });
                    renderer.scene.add(mesh);
                }
                const model = models.get(id)!;

                let totalLength = 0;
                for (let i = 1; i < holopath.spline.length; ++i) {
                    totalLength += Pod.Vec.length(Pod.Vec.sub(holopath.spline[i], holopath.spline[i - 1]));
                }
                const distance = holopath.progress * totalLength;
                const points: Vector3[] = [new Vector3(holopath.spline[0].x, holopath.spline[0].y, holopath.spline[0].z)];
                for (let i = 1, d = 0; d <= distance && i < holopath.spline.length; ++i) {
                    const diff = Pod.Vec.sub(holopath.spline[i], holopath.spline[i - 1]);
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

