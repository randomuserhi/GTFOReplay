import { Color, DynamicDrawUsage, Matrix4, MeshPhongMaterial, SphereGeometry, Vector3 } from "three";
import * as BitHelper from "../../replay/bithelper.js";
import { consume, createInstance } from "../../replay/instancing.js";
import { ModuleLoader } from "../../replay/moduleloader.js";
import * as Pod from "../../replay/pod.js";
import { DynamicPosition } from "../replayrecorder.js";
import { zeroQ } from "./humanmodel.js";

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Cfoam": {
                parse: {
                    dimension: number; 
                    absolute: boolean;
                    position: Pod.Vector;
                    scale: number;
                };
                spawn: {
                    dimension: number;
                    position: Pod.Vector;
                    scale: number;
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Cfoam": Map<number, Cfoam>
        }
    }
}

export interface Cfoam extends DynamicPosition {
    scale: number;
}

ModuleLoader.registerDynamic("Vanilla.Cfoam", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicPosition.parse(data);
            return {
                ...result,
                scale: await BitHelper.readHalf(data)
            };
        }, 
        exec: (id, data, snapshot, lerp, duration) => {
            const collection = snapshot.getOrDefault("Vanilla.Cfoam", () => new Map());
    
            if (!collection.has(id)) throw new CfoamNotFound(`Cfoam of id '${id}' was not found.`);
            const cfoam = collection.get(id)!;
            DynamicPosition.lerp(cfoam, data, lerp, duration);
            cfoam.scale = data.scale;
        }
    },
    spawn: {
        parse: async (data) => {
            const spawn = await DynamicPosition.parseSpawn(data);
            const result = {
                ...spawn,
                scale: await BitHelper.readHalf(data)
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const collection = snapshot.getOrDefault("Vanilla.Cfoam", () => new Map());
        
            if (collection.has(id)) throw new DuplicateCfoam(`Cfoam of id '${id}' already exists.`);
            collection.set(id, { id, ...data, velocity: Pod.Vec.zero() });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const collection = snapshot.getOrDefault("Vanilla.Cfoam", () => new Map());

            if (!collection.has(id)) throw new CfoamNotFound(`Cfoam of id '${id}' did not exist.`);
            collection.delete(id);
        }
    }
});

export class CfoamNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicateCfoam extends Error {
    constructor(message?: string) {
        super(message);
    }
}

// --------------------------- RENDERING ---------------------------

declare module "../../replay/instancing.js" {
    interface InstanceTypes {
        "Cfoam.Sphere.MeshPhong": void;
    } 
}

(() => {
    const spheres = createInstance("Cfoam.Sphere.MeshPhong", new SphereGeometry(0.25, 10, 10), new MeshPhongMaterial(), 100);
    spheres.frustumCulled = false;
    spheres.instanceMatrix.setUsage( DynamicDrawUsage );
    spheres.castShadow = false;
    spheres.receiveShadow = true;
})();

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Cfoam": void;
        }

        interface RenderData {
            "Cfoam": Map<number, CfoamModel>;
        }
    }
}

const scale = new Vector3();
const mat = new Matrix4();
class CfoamModel {
    sphere: number;
    visible: boolean;
    readonly color: Color; 
    
    constructor() {
        this.color = new Color(0xd8f0f2);
    }

    public update(cfoam: Cfoam) {
        if (!this.visible) return;

        scale.set(cfoam.scale, cfoam.scale, cfoam.scale);
        mat.compose(cfoam.position, zeroQ, scale);
        this.sphere = consume("Cfoam.Sphere.MeshPhong", mat, this.color);
    }

    public setVisible(visible: boolean) {
        this.visible = visible;
    }
}

ModuleLoader.registerRender("Cfoam", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Cfoam", () => new Map());
            const collection = snapshot.getOrDefault("Vanilla.Cfoam", () => new Map());
            for (const [id, cfoam] of collection) {
                if (!models.has(id)) {
                    const model = new CfoamModel();
                    models.set(id, model);
                }

                const model = models.get(id)!;
                model.update(cfoam);
                model.setVisible(cfoam.dimension === renderer.get("Dimension"));
            }

            for (const [id, model] of [...models.entries()]) {
                if (!collection.has(id)) {
                    models.delete(id);
                }
            }
        } 
    }]);
});