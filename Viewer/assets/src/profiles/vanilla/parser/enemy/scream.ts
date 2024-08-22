import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Vector3Like } from "@esm/three";
import { Factory } from "../../library/factory.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "Vanilla.Enemy.Animation.Scream": {
                enemy: number;
                animIndex: number;
                type: ScreamType;
            };
        }

        interface Data {
            "Vanilla.Enemy.ScreamEffect": ScreamEffect[]
        }
    }
}

export const screamTypes = [
    "Regular",
    "Scout"
] as const;
export type ScreamType = typeof screamTypes[number];


export interface ScreamEffect {
    position: Vector3Like;
    type: ScreamType;
    time: number;
}

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
            type: screamTypes[await BitHelper.readByte(bytes)]
        };
    },
    exec: async (data, snapshot) => {
        const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", Factory("Map"));
        
        const id = data.enemy;
        if (!anims.has(id)) throw new Error(`EnemyAnim of id '${id}' was not found.`);
        const anim = anims.get(id)!;

        anim.lastScreamTime = snapshot.time();
        anim.screamAnimIndex = data.animIndex;
        anim.screamType = data.type;

        const enemies = snapshot.getOrDefault("Vanilla.Enemy", Factory("Map"));
        if (!enemies.has(id)) throw new Error(`Enemy of id '${id}' was not found.`);
        const enemy = enemies.get(id)!;

        const screamEffects = snapshot.getOrDefault("Vanilla.Enemy.ScreamEffect", Factory("Array"));
        screamEffects.push({ 
            time: snapshot.time(),
            position: {
                x: enemy.position.x,
                y: enemy.position.y + 2,
                z: enemy.position.z
            }, 
            type: data.type  
        });
    }
});

export const duration = 2000;
ModuleLoader.registerTick((snapshot) => {
    const t = snapshot.time();
    const effects = snapshot.getOrDefault("Vanilla.Enemy.ScreamEffect", Factory("Array"));
    snapshot.set("Vanilla.Enemy.ScreamEffect", effects.filter((e) => (t - e.time) < duration));
});