import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Factory } from "../../library/factory.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Enemy.Tendril": {
                parse: {
                    sourcePos: Pod.Vector;
                    relPos: Pod.Vector;
                    detect: boolean;
                };
                spawn: {
                    sourcePos: Pod.Vector;
                    relPos: Pod.Vector;
                    detect: boolean;
                    owner: number;
                };
                despawn: void;
            };
        }

        interface Events {
            "Vanilla.Enemy.TongueEvent": {
                id: number;
                spline: Pod.Vector[];
            }
        }
    
        interface Data {
            "Vanilla.Enemy.Tendril": Map<number, EnemyTendril>
        }
    }
}

export interface EnemyTendril {
    sourcePos: Pod.Vector;
    relPos: Pod.Vector;
    detect: boolean;
    owner: number;
}

ModuleLoader.registerDynamic("Vanilla.Enemy.Tendril", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                sourcePos: await BitHelper.readHalfVector(data),
                relPos: await BitHelper.readHalfVector(data),
                detect: await BitHelper.readBool(data)
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const tendrils = snapshot.getOrDefault("Vanilla.Enemy.Tendril", Factory("Map"));
    
            if (!tendrils.has(id)) throw new Error(`Tendril of id '${id}' was not found.`);
            
            const tendril = tendrils.get(id)!;
            tendril.detect = data.detect;
            Pod.Vec.lerp(tendril.relPos, tendril.relPos, data.relPos, lerp); 
        }
    },
    spawn: {
        parse: async (data) => {
            return {
                sourcePos: await BitHelper.readHalfVector(data),
                relPos: await BitHelper.readHalfVector(data),
                detect: await BitHelper.readBool(data),
                owner: await BitHelper.readUShort(data)
            };
        },
        exec: (id, data, snapshot) => {
            const tendrils = snapshot.getOrDefault("Vanilla.Enemy.Tendril", Factory("Map"));
        
            if (tendrils.has(id)) throw new Error(`Tendril of id '${id}' already exists.`);
            tendrils.set(id, { ...data });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const tendrils = snapshot.getOrDefault("Vanilla.Enemy.Tendril", Factory("Map"));

            if (!tendrils.has(id)) throw new Error(`Tendril of id '${id}' did not exist.`);
            tendrils.delete(id);
        }
    }
});