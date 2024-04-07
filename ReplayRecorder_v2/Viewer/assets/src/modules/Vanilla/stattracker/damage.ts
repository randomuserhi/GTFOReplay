import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "Vanilla.StatTracker.Damage": Damage;
        }
    }
}

export type DamageType = 
    "Bullet" |
    "Explosive" |
    "Melee" | 
    "Projectile" |
    "Tongue" |
    "Fall";
export const typemap: DamageType[] = [
    "Bullet",
    "Explosive",
    "Melee",
    "Projectile",
    "Tongue",
    "Fall"
];

export interface Damage {
    type: DamageType;
    source: number;
    target: number;
    damage: number;
    gear: number;
    sentry: boolean;
    staggerMulti: number;
}

ModuleLoader.registerEvent("Vanilla.StatTracker.Damage", "0.0.1", {
    parse: async (bytes) => {
        return {
            type: typemap[await BitHelper.readByte(bytes)],
            source: await BitHelper.readInt(bytes),
            target: await BitHelper.readUShort(bytes),
            damage: await BitHelper.readHalf(bytes),
            gear: await BitHelper.readUShort(bytes),
            sentry: await BitHelper.readBool(bytes),
            staggerMulti: await BitHelper.readHalf(bytes),
        };
    },
    exec: async (data, snapshot) => {
        const { type } = data;
        if (type === "Explosive") {
            const detonations = snapshot.getOrDefault("Vanilla.Mine.Detonate", () => new Map());
            const mines = snapshot.getOrDefault("Vanilla.Mine", () => new Map());

            const detonation = detonations.get(data.source);
            if (detonation === undefined) throw new Error("Explosive damage was dealt, but cannot find detonation event.");
            
            const mine = mines.get(data.source);
            if (mine === undefined) throw new Error("Explosive damage was dealt, but cannot find mine.");
        
            // TODO(randomuserhi)
        }
    }
});