import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { AnimNotFound } from "./enemy.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "Vanilla.Enemy.Animation.Scream": {
                enemy: number;
                animIndex: number;
                type: ScreamType;
            };
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

ModuleLoader.registerEvent("Vanilla.Enemy.Animation.Scream", "0.0.1", {
    parse: async (bytes) => {
        return {
            enemy: await BitHelper.readInt(bytes),
            animIndex: await BitHelper.readByte(bytes),
            type: screamTypemap[await BitHelper.readByte(bytes)]
        };
    },
    exec: async (data, snapshot) => {
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", () => new Map());
        
        const id = data.enemy;
        if (!anims.has(id)) throw new AnimNotFound(`EnemyAnim of id '${id}' was not found.`);
        const anim = anims.get(id)!;

        anim.lastScreamTime = snapshot.time();
        anim.screamAnimIndex = data.animIndex;
        anim.screamType = data.type;
    }
});