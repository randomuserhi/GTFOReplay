import { Mesh, MeshPhongMaterial, Scene, SphereGeometry } from "three";
import * as BitHelper from "../../replay/bithelper.js";
import { ModuleLoader } from "../../replay/moduleloader.js";
import * as Pod from "../../replay/pod.js";
import { DynamicPosition } from "../replayrecorder.js";

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
        exec: (id, data, snapshot, lerp) => {
            const collection = snapshot.getOrDefault("Vanilla.Cfoam", () => new Map());
    
            if (!collection.has(id)) throw new CfoamNotFound(`Cfoam of id '${id}' was not found.`);
            const cfoam = collection.get(id)!;
            DynamicPosition.lerp(cfoam, data, lerp);
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
            collection.set(id, { id, ...data });
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

const sphereGeometry = new SphereGeometry(0.5, 10, 10);

class CfoamModel {
    readonly sphere: Mesh;
    
    constructor() {
        const material = new MeshPhongMaterial({ color: 0xd8f0f2 });
        
        this.sphere = new Mesh(sphereGeometry, material);
    }

    public update(cfoam: Cfoam) {
        this.sphere.position.set(cfoam.position.x, cfoam.position.y, cfoam.position.z);

        this.sphere.scale.set(cfoam.scale, cfoam.scale, cfoam.scale);
    }

    public setVisible(visible: boolean) {
        this.sphere.visible = visible;
    }

    public addToScene(scene: Scene) {
        scene.add(this.sphere);
    }

    public removeFromScene(scene: Scene) {
        scene.remove(this.sphere);
    }
}

ModuleLoader.registerRender("Cfoam", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([{ 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Cfoam", () => new Map());
            const collection = snapshot.getOrDefault("Vanilla.Cfoam", () => new Map());
            for (const [id, cfoam] of collection) {
                if (!models.has(id)) {
                    const model = new CfoamModel();
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.update(cfoam);
                model.setVisible(cfoam.dimension === renderer.get("Dimension"));
            }

            for (const [id, model] of [...models.entries()]) {
                if (!collection.has(id)) {
                    model.removeFromScene(renderer.scene);
                    models.delete(id);
                }
            }
        } 
    }, ...renderLoop]);
});