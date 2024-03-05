import { BoxGeometry, Mesh, MeshPhongMaterial, Quaternion, Vector3 } from "three";
import { ModuleLoader } from "../../replay/moduleloader.js";
import * as Pod from "../../replay/pod.js";
import { DynamicTransform } from "../replayrecorder.js";

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Enemy": {
                parse: {
                    dimension: number;
                    absolute: boolean;
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                };
                spawn: {
                    dimension: number;
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                };
                despawn: void;
            };
        }
    
        interface Data {
            "Vanilla.Enemy": Map<number, Enemy>
        }
    }
}

export interface Enemy extends DynamicTransform {
}

ModuleLoader.registerDynamic("Vanilla.Enemy", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicTransform.parseTransform(data);
            return result;
        }, 
        exec: (id, data, snapshot, lerp) => {
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
    
            if (!enemies.has(id)) throw new EnemyNotFound(`Enemy of id '${id}' was not found.`);
            DynamicTransform.lerp(enemies.get(id)!, data, lerp);
        }
    },
    spawn: {
        parse: async (data) => {
            const spawn = await DynamicTransform.parseSpawn(data);
            const result = {
                ...spawn
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
        
            if (enemies.has(id)) throw new DuplicateEnemy(`Enemy of id '${id}' already exists.`);
            enemies.set(id, { id, ...data });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());

            if (!enemies.has(id)) throw new EnemyNotFound(`Enemy of id '${id}' did not exist.`);
            enemies.delete(id);
        }
    }
});

class EnemyNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

class DuplicateEnemy extends Error {
    constructor(message?: string) {
        super(message);
    }
}

// --------------------------- RENDERING ---------------------------


declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Enemies": void;
        }

        interface RenderData {
            "Enemies": Map<number, Mesh>;
        }
    }
}

ModuleLoader.registerRender("Enemies", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([{ 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Enemies", () => new Map());
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
            for (const [id, enemy] of enemies) {
                if (enemy.dimension !== renderer.get("Dimension")) {
                    models.delete(id);
                    continue;
                }

                if (!models.has(id)) {
                    const geometry = new BoxGeometry( 0.5, 0.5, 0.5 );
                    const material = new MeshPhongMaterial({
                        color: 0x00ff00
                    });

                    const model = new Mesh(geometry, material);
                    model.castShadow = true;
                    model.receiveShadow = true;

                    models.set(id, model);
                    renderer.scene.add(model);
                }

                const model = models.get(id)!;
                const offset = new Vector3(0, 1, 0);
                model.position.set(enemy.position.x, enemy.position.y, enemy.position.z);
                model.position.add(offset);
                model.setRotationFromQuaternion(new Quaternion(enemy.rotation.x, enemy.rotation.y, enemy.rotation.z, enemy.rotation.w));
            }

            for (const [id, model] of [...models.entries()]) {
                if (!enemies.has(id)) {
                    renderer.scene.remove(model);
                    models.delete(id);
                }
            }
        } 
    }, ...renderLoop]);
});