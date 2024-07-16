import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Factory } from "../../library/factory.js";
import { DynamicPosition } from "../../library/helpers.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.FogSphere": {
                parse: DynamicPosition.Parse & {
                    range: number;
                };
                spawn: DynamicPosition.Spawn & {
                    range: number;
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.FogSphere": Map<number, FogSphere>
        }
    }
}

export interface FogSphere extends DynamicPosition.Type {
    id: number;
    range: number;
}

ModuleLoader.registerDynamic("Vanilla.FogSphere", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicPosition.parse(data);
            return {
                ...result,
                range: await BitHelper.readHalf(data),
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const collection = snapshot.getOrDefault("Vanilla.FogSphere", Factory("Map"));
    
            if (!collection.has(id)) throw new Error(`FogSphere of id '${id}' was not found.`);
            const sphere = collection.get(id)!;
            DynamicPosition.lerp(sphere, data, lerp);
            sphere.range += (data.range - sphere.range) * lerp;
        }
    },
    spawn: {
        parse: async (data) => {
            const spawn = await DynamicPosition.spawn(data);
            const result = {
                ...spawn,
                range: await BitHelper.readHalf(data),
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const collection = snapshot.getOrDefault("Vanilla.FogSphere", Factory("Map"));
        
            if (collection.has(id)) throw new Error(`FogSphere of id '${id}' already exists.`);
            collection.set(id, { id, ...data });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const collection = snapshot.getOrDefault("Vanilla.FogSphere", Factory("Map"));

            if (!collection.has(id)) throw new Error(`FogSphere of id '${id}' did not exist.`);
            collection.delete(id);
        }
    }
});