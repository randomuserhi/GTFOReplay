import { Vector3Like } from "three";
import { ModuleLoader, ReplayApi } from "../../replay/moduleloader.js";
import * as Pod from "../../replay/pod.js";
import { xor } from "../parser/random.js";

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface Data {
            "Vanilla.DeathCross": DeathCross[]
        }
    }
}

export interface DeathCross {
    dimension: number;
    time: number;
    deviation: number;
    shake: (number[])[];
    position: Pod.Vector;
}

export function createDeathCross(snapshot: ReplayApi, seed: number, dimension: number, position: Vector3Like) {
    const time = snapshot.time();
    const deathCrosses = snapshot.getOrDefault("Vanilla.DeathCross", () => []);
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

export const duration = 1000;
ModuleLoader.registerTick((snapshot) => {
    const t = snapshot.time();
    const gunshots = snapshot.getOrDefault("Vanilla.DeathCross", () => []);
    snapshot.set("Vanilla.DeathCross", gunshots.filter((p) => (t - p.time) < duration));
});