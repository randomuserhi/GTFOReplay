import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "Vanilla.Enemy.Scream": {
                enemy: number;
                type: ScreamType;
            };
        }

        interface Data {
            "Vanilla.Enemy.Scream": EnemyScream[];
        }
    }
}

export type ScreamType = 
    "Regular" |
    "Scout";
export const screamTypemap: ScreamType[] = [
    "Regular",
    "Scout"
];

export interface EnemyScream {
    enemy: number;
    type: ScreamType;
    time: number;
}

ModuleLoader.registerEvent("Vanilla.Enemy.Scream", "0.0.1", {
    parse: async (bytes) => {
        return {
            enemy: await BitHelper.readInt(bytes),
            type: screamTypemap[await BitHelper.readByte(bytes)]
        };
    },
    exec: async (data, snapshot) => {
        const screams = snapshot.getOrDefault("Vanilla.Enemy.Scream", () => []);
        screams.push({ time: snapshot.time(), ...data });
    }
});

const duration = 1500;
ModuleLoader.registerTick((snapshot) => {
    const t = snapshot.time();
    const screams = snapshot.getOrDefault("Vanilla.Enemy.Scream", () => []);
    snapshot.set("Vanilla.Enemy.Scream", screams.filter((s) => (t - s.time) < duration));
});