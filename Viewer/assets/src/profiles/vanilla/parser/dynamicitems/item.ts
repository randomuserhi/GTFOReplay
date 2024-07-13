import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Factory } from "../../library/factory.js";
import { DynamicTransform } from "../../library/helpers.js";
import { Identifier, IdentifierData } from "../identifier.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.DynamicItem": {
                parse: DynamicTransform.Parse;
                spawn: DynamicTransform.Spawn & {
                    type: Identifier
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.DynamicItem": Map<number, DynamicItem>
        }
    }
}

export interface DynamicItem extends DynamicTransform.Type {
    id: number;
    type: Identifier;
}

ModuleLoader.registerDynamic("Vanilla.DynamicItem", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicTransform.parse(data);
            return {
                ...result
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const collection = snapshot.getOrDefault("Vanilla.DynamicItem", Factory("Map"));
    
            if (!collection.has(id)) throw new Error(`DynamicItem of id '${id}' was not found.`);
            const cfoam = collection.get(id)!;
            DynamicTransform.lerp(cfoam, data, lerp);
        }
    },
    spawn: {
        parse: async (data, snapshot) => {
            const spawn = await DynamicTransform.spawn(data);
            const result = {
                ...spawn,
                type: await Identifier.parse(IdentifierData(snapshot), data)
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const collection = snapshot.getOrDefault("Vanilla.DynamicItem", Factory("Map"));
        
            if (collection.has(id)) throw new Error(`DynamicItem of id '${id}' already exists.`);
            collection.set(id, { id, ...data });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const collection = snapshot.getOrDefault("Vanilla.DynamicItem", Factory("Map"));

            if (!collection.has(id)) throw new Error(`DynamicItem of id '${id}' did not exist.`);
            collection.delete(id);
        }
    }
});