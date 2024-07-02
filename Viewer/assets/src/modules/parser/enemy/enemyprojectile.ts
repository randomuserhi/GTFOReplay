import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { DynamicParse, DynamicSpawn, DynamicTransform } from "../replayrecorder.js";

declare module "@esm/@root/replay/moduleloader.js" {
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
                position: { ...projectile.position },
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