import { Mesh, MeshPhongMaterial, Quaternion, SphereGeometry } from "three";
import { ModuleLoader } from "../../replay/moduleloader.js";
import { DynamicParse, DynamicSpawn, DynamicTransform } from "../replayrecorder.js";

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Enemy.Projectile": {
                parse: DynamicParse;
                spawn: DynamicSpawn;
                despawn: void;
            };
        }
    
        interface Data {
            "Vanilla.Enemy.Projectile": Map<number, Projectile>
        }
    }
}

export interface Projectile extends DynamicTransform {
}

ModuleLoader.registerDynamic("Vanilla.Enemy.Projectile", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicTransform.parseTransform(data);
            return result;
        }, 
        exec: (id, data, snapshot, lerp) => {
            const projectiles = snapshot.getOrDefault("Vanilla.Enemy.Projectile", () => new Map());
    
            if (!projectiles.has(id)) throw new ProjectileNotFound(`Dynamic of id '${id}' was not found.`);
            const projectile = projectiles.get(id)!;
            DynamicTransform.lerp(projectile, data, lerp);
        }
    },
    spawn: {
        parse: async (data) => {
            const result = await DynamicTransform.parseSpawn(data);
            return result;
        },
        exec: (id, data, snapshot) => {
            const projectiles = snapshot.getOrDefault("Vanilla.Enemy.Projectile", () => new Map());
        
            if (projectiles.has(id)) throw new DuplicateProjectile(`Dynamic of id '${id}' already exists.`);
            projectiles.set(id, { id, ...data });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const projectiles = snapshot.getOrDefault("Vanilla.Enemy.Projectile", () => new Map());

            if (!projectiles.has(id)) throw new ProjectileNotFound(`Dynamic of id '${id}' did not exist.`);
            projectiles.delete(id);
        }
    }
});

class ProjectileNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

class DuplicateProjectile extends Error {
    constructor(message?: string) {
        super(message);
    }
}

// --------------------------- RENDERING ---------------------------


declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Enemy.Projectile": void;
        }

        interface RenderData {
            "Enemy.Projectile": Map<number, Mesh>;
        }
    }
}

const geometry = new SphereGeometry(0.05, 10, 10);

ModuleLoader.registerRender("Enemy.Projectile", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([{ 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Enemy.Projectile", () => new Map());
            const projectiles = snapshot.getOrDefault("Vanilla.Enemy.Projectile", () => new Map());
            for (const [id, projectile] of projectiles) {
                if (!models.has(id)) {
                    const material = new MeshPhongMaterial( { color: 0xff0000 } );

                    const mesh = new Mesh(geometry, material);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;

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
    }, ...renderLoop]);
});

