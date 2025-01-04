import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Factory } from "../../../vanilla/library/factory.js";
import { xor } from "../../../vanilla/library/random.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "EWC.Explosion": EWCExplosion;
        }

        interface Data {
            "EWC.Explosion.ExplosionEffect": EWCExplosionEffect[]
        }
    }
}

export interface EWCExplosion {
    position: Pod.Vector;
    innerRadius: number;
    radius: number;
}

export interface EWCExplosionEffect extends EWCExplosion {
    time: number;
    directions: [dir: Pod.Vector, dist: number, scale: number][];
}

ModuleLoader.registerEvent("EWC.Explosion", "0.0.1", {
    parse: async (bytes) => {
        return {
            position: await BitHelper.readVector(bytes),
            innerRadius: await BitHelper.readHalf(bytes),
            radius: await BitHelper.readHalf(bytes),
        };
    },
    exec: async (data, snapshot) => {
        const explosionEffects = snapshot.getOrDefault("EWC.Explosion.ExplosionEffect", Factory("Array"));

        const r = xor(snapshot.time());
        const directions: EWCExplosionEffect["directions"] = [];
        for (let i = 0; i < 20; ++i) {
            const vec = {
                x: r() * 2 - 1,
                y: r() * 2 - 1,
                z: r() * 2 - 1
            };
            let scale: number;
            if (i < 10) {
                scale = Math.max(r() * 1, 0.1);
            } else {
                scale = Math.max(r() * 0.4, 0.01);
            }
            directions.push([Pod.Vec.normalize(vec, vec), r() * data.radius, scale]);
        }

        explosionEffects.push({ 
            time: snapshot.time(),
            ...data,
            directions
        });
    }
});

export const duration = 250;
ModuleLoader.registerTick((snapshot) => {
    const t = snapshot.time();
    const effects = snapshot.getOrDefault("EWC.Explosion.ExplosionEffect", Factory("Array"));
    snapshot.set("EWC.Explosion.ExplosionEffect", effects.filter((e) => (t - e.time) < duration));
});