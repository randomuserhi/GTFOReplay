import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "Vanilla.Player.Gunshots": {
                owner: number;
                dimension: number;
                damage: number;
                start: Pod.Vector;
                end: Pod.Vector;
                sentry: boolean;
            };
        }
    
        interface Data {
            "Vanilla.Player.Gunshots": Gunshot[]
        }
    }
}

export interface Gunshot {
    owner: number;
    dimension: number;
    damage: number;
    start: Pod.Vector;
    end: Pod.Vector;
    sentry: boolean;
    time: number;
}

export const duration = 200;

ModuleLoader.registerEvent("Vanilla.Player.Gunshots", "0.0.1", {
    parse: async (bytes) => {
        return {
            owner: await BitHelper.readInt(bytes),
            dimension: await BitHelper.readByte(bytes),
            damage: await BitHelper.readHalf(bytes),
            sentry: await BitHelper.readBool(bytes),
            start: await BitHelper.readVector(bytes),
            end: await BitHelper.readVector(bytes),
        };
    },
    exec: async (data, snapshot) => {
        const gunshots = snapshot.getOrDefault("Vanilla.Player.Gunshots", () => []);
        gunshots.push({ time: snapshot.time(), ...data });

        const anims = snapshot.getOrDefault("Vanilla.Player.Animation", () => new Map());
        if (anims.has(data.owner)) { 
            anims.get(data.owner)!.lastShot = snapshot.time();
        }
    }
});

ModuleLoader.registerTick((snapshot) => {
    const t = snapshot.time();
    const gunshots = snapshot.getOrDefault("Vanilla.Player.Gunshots", () => []);
    snapshot.set("Vanilla.Player.Gunshots", gunshots.filter((p) => (t - p.time) < duration));
});