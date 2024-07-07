import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Factory } from "../library/factory.js";
import { DynamicPosition } from "../library/helpers.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Cfoam": {
                parse: DynamicPosition.Parse & {
                    scale: number;
                };
                spawn: DynamicPosition.Spawn & {
                    scale: number;
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Cfoam": Map<number, Cfoam>
        }
    }
}

export interface Cfoam extends DynamicPosition.Type {
    id: number;
    scale: number;
}

ModuleLoader.registerDynamic("Vanilla.Cfoam", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicPosition.parse(data);
            return {
                ...result,
                scale: await BitHelper.readHalf(data)
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const collection = snapshot.getOrDefault("Vanilla.Cfoam", Factory("Map"));
    
            if (!collection.has(id)) throw new Error(`Cfoam of id '${id}' was not found.`);
            const cfoam = collection.get(id)!;
            DynamicPosition.lerp(cfoam, data, lerp);
            cfoam.scale = data.scale;
        }
    },
    spawn: {
        parse: async (data) => {
            const spawn = await DynamicPosition.spawn(data);
            const result = {
                ...spawn,
                scale: await BitHelper.readHalf(data)
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const collection = snapshot.getOrDefault("Vanilla.Cfoam", Factory("Map"));
        
            if (collection.has(id)) throw new Error(`Cfoam of id '${id}' already exists.`);
            collection.set(id, { id, ...data });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const collection = snapshot.getOrDefault("Vanilla.Cfoam", Factory("Map"));

            if (!collection.has(id)) throw new Error(`Cfoam of id '${id}' did not exist.`);
            collection.delete(id);
        }
    }
});