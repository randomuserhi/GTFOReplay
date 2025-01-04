import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { ColorRepresentation } from "@esm/three";
import { getPlayerColor } from "../../../vanilla/datablocks/player/player.js";
import { Factory } from "../../../vanilla/library/factory.js";
import { DynamicTransform } from "../../../vanilla/library/helpers.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "EWC.Projectile": {
                parse: DynamicTransform.Parse;
                spawn: DynamicTransform.Spawn & {
                    slot: number,
                    scale: number
                };
                despawn: void;
            };
        }
    
        interface Data {
            "EWC.Projectile": Map<number, Projectile>
            "EWC.Projectile.Trails": Map<number, Trail>
        }
    }
}

export interface Projectile extends DynamicTransform.Type {
    id: number;
    color: ColorRepresentation;
    scale: number; 
}

export interface Trail {
    points: { position: Pod.Vector, time: number }[];
    dimension: number;
    duration: number;
    color: ColorRepresentation;
}

ModuleLoader.registerDynamic("EWC.Projectile", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicTransform.parse(data);
            return result;
        }, 
        exec: (id, data, snapshot, lerp) => {
            const projectiles = snapshot.getOrDefault("EWC.Projectile", Factory("Map"));
    
            if (!projectiles.has(id)) throw new Error(`Dynamic of id '${id}' was not found.`);
            const projectile = projectiles.get(id)!;
            DynamicTransform.lerp(projectile, data, lerp);

            const trails = snapshot.getOrDefault("EWC.Projectile.Trails", Factory("Map"));
            if (!trails.has(id)) trails.set(id, {
                points: [],
                dimension: data.dimension,
                duration: 500,
                color: projectile.color
            });
            trails.get(id)!.points.push({
                position: { ...projectile.position },
                time: snapshot.time()
            });
        }
    },
    spawn: {
        parse: async (data) => {
            const result = await DynamicTransform.spawn(data);
            return {
                ...result,
                slot: await BitHelper.readByte(data),
                scale: await BitHelper.readHalf(data)
            };
        },
        exec: (id, data, snapshot) => {
            const projectiles = snapshot.getOrDefault("EWC.Projectile", Factory("Map"));
        
            if (projectiles.has(id)) throw new Error(`Dynamic of id '${id}' already exists.`);
            projectiles.set(id, { id, ...data, color: getPlayerColor(data.slot) });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const projectiles = snapshot.getOrDefault("EWC.Projectile", Factory("Map"));

            if (!projectiles.has(id)) throw new Error(`Dynamic of id '${id}' did not exist.`);
            projectiles.delete(id);
        }
    }
});

ModuleLoader.registerTick((snapshot) => {
    const t = snapshot.time();
    const trails = snapshot.getOrDefault("EWC.Projectile.Trails", Factory("Map"));
    for (const [id, trail] of [...trails.entries()]) {
        trail.points = trail.points.filter((p) => (t - p.time) < trail.duration);
        if (trail.points.length === 0) {
            trails.delete(id);
        }
    }
});