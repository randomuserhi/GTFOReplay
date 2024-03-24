import { CylinderGeometry, LineBasicMaterial, Mesh, MeshStandardMaterial, Quaternion, SphereGeometry } from "three";
import { ModuleLoader } from "../../replay/moduleloader.js";
import * as Pod from "../../replay/pod.js";
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
            "Vanilla.Enemy.Projectile.Trails": Map<number, Trail>
        }
    }
}

export interface Projectile extends DynamicTransform {
}

export interface Trail {
    points: { position: Pod.Vector, time: number }[];
    dimension: number;
    duration: number;
}

ModuleLoader.registerDynamic("Vanilla.Enemy.Projectile", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicTransform.parse(data);
            return result;
        }, 
        exec: (id, data, snapshot, lerp) => {
            const projectiles = snapshot.getOrDefault("Vanilla.Enemy.Projectile", () => new Map());
    
            if (!projectiles.has(id)) throw new ProjectileNotFound(`Dynamic of id '${id}' was not found.`);
            const projectile = projectiles.get(id)!;
            DynamicTransform.lerp(projectile, data, lerp);

            const trails = snapshot.getOrDefault("Vanilla.Enemy.Projectile.Trails", () => new Map());
            if (!trails.has(id)) trails.set(id, {
                points: [],
                dimension: data.dimension,
                duration: 500
            });
            trails.get(id)!.points.push({
                position: projectile.position,
                time: snapshot.time()
            });
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

ModuleLoader.registerTick((snapshot) => {
    const t = snapshot.time();
    const trails = snapshot.getOrDefault("Vanilla.Enemy.Projectile.Trails", () => new Map());
    for (const [id, trail] of [...trails.entries()]) {
        trail.points = trail.points.filter((p) => (t - p.time) < trail.duration);
        if (trail.points.length === 0) {
            trails.delete(id);
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
            "Enemy.Projectile.Trails": Map<number, Mesh[]>;
        }
    }
}

const geometry = new SphereGeometry(0.05, 10, 10);
const trailGeometry = new CylinderGeometry(1, 1, 1, 10, 10).translate(0, 0.5, 0).rotateX(Math.PI * 0.5);

ModuleLoader.registerRender("Enemy.Projectile", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Enemy.Projectile", () => new Map());
            const projectiles = snapshot.getOrDefault("Vanilla.Enemy.Projectile", () => new Map());
            for (const [id, projectile] of projectiles) {
                if (!models.has(id)) {
                    const material = new MeshStandardMaterial( { color: 0xff0000 } );

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
            const models = renderer.getOrDefault("Enemy.Projectile.Trails", () => new Map());
            const trails = snapshot.getOrDefault("Vanilla.Enemy.Projectile.Trails", () => new Map());
            for (const [id, trail] of trails) {
                if (!models.has(id)) {
                    models.set(id, []);
                }
                const model = models.get(id)!;
                while (model.length < trail.points.length - 1) {
                    const material = new MeshStandardMaterial({ color: 0xffffff });
                    material.transparent = true;
                    material.opacity = 1;

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

