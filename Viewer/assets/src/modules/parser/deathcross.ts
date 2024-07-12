import { ModuleLoader, ReplayApi } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Vector3Like } from "@esm/three";
import { Factory } from "../library/factory.js";
import { xor } from "../library/random.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Data {
            "Vanilla.DeathCross": DeathCross.Type[]
        }
    }
}

export namespace DeathCross {
    export interface Type {
        dimension: number;
        time: number;
        deviation: number;
        shake: (number[])[];
        position: Pod.Vector;
    }

    export function spawn(snapshot: ReplayApi, seed: number, dimension: number, position: Vector3Like) {
        const time = snapshot.time();
        const deathCrosses = snapshot.getOrDefault("Vanilla.DeathCross", Factory("Array"));
        const r = xor(time + seed ^ 0x190104029);
        const deviation = r() * 300;
        const shakeAmount = 1;
        const shake = new Array(10);
        for (let i = 0; i < 10; ++i) {
            shake[i] = [-(shakeAmount/2) + r() * shakeAmount, -(shakeAmount/2) + r() * shakeAmount];
        }
        deathCrosses.push({ 
            time, 
            dimension,
            position,
            deviation,
            shake
        });
    }
}

export const duration = 1000;
ModuleLoader.registerTick((snapshot) => {
    const t = snapshot.time();
    const gunshots = snapshot.getOrDefault("Vanilla.DeathCross", Factory("Array"));
    snapshot.set("Vanilla.DeathCross", gunshots.filter((p) => (t - p.time) < duration));
});