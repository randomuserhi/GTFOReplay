import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Factory } from "../../library/factory.js";
import { HumanJoints } from "../../renderer/animations/human.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Enemy.LimbCustom": {
                parse: {
                    active: boolean;
                };
                spawn: {
                    owner: number;
                    bone: HumanJoints;
                    offset: Pod.Vector;
                    scale: number;
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Enemy.LimbCustom": Map<number, LimbCustom>;
        }
    }
}

export interface LimbCustom {
    owner: number;
    bone: HumanJoints;
    offset: Pod.Vector;
    scale: number;
    active: boolean;
}

ModuleLoader.registerDynamic("Vanilla.Enemy.LimbCustom", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                active: await BitHelper.readBool(data)
            };
        }, 
        exec: (id, data, snapshot) => {
            const limbs = snapshot.getOrDefault("Vanilla.Enemy.LimbCustom", Factory("Map"));
    
            if (!limbs.has(id)) throw new Error(`Limb of id '${id}' was not found.`);
            const limb = limbs.get(id)!;
            limb.active = data.active;
        }
    },
    spawn: {
        parse: async (data) => {
            return {
                owner: await BitHelper.readUShort(data),
                bone: HumanJoints[await BitHelper.readByte(data)],
                offset: await BitHelper.readHalfVector(data),
                scale: await BitHelper.readHalf(data)
            };
        },
        exec: (id, data, snapshot) => {
            const limbs = snapshot.getOrDefault("Vanilla.Enemy.LimbCustom", Factory("Map"));
        
            if (limbs.has(id)) throw new Error(`Limb of id '${id}' already exists.`);
            limbs.set(id, { 
                ...data, active: true
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const limbs = snapshot.getOrDefault("Vanilla.Enemy.LimbCustom", Factory("Map"));

            if (!limbs.has(id)) throw new Error(`Limb of id '${id}' did not exist.`);
            limbs.delete(id);
        }
    }
});