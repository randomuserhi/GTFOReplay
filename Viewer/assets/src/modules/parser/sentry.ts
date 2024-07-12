import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Factory } from "../library/factory.js";
import { DynamicRotation, DynamicTransform } from "../library/helpers.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Sentry": {
                parse: DynamicRotation.Parse;
                spawn: DynamicTransform.Spawn & {
                    owner: number;
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Sentry": Map<number, Sentry>
        }
    }
}

export interface Sentry extends DynamicTransform.Type {
    id: number;
    owner: number;
    baseRot: Pod.Quaternion;
}

ModuleLoader.registerDynamic("Vanilla.Sentry", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicRotation.parse(data);
            return result;
        }, 
        exec: (id, data, snapshot, lerp) => {
            const sentries = snapshot.getOrDefault("Vanilla.Sentry", Factory("Map"));
    
            if (!sentries.has(id)) throw new Error(`Dynamic of id '${id}' was not found.`);
            const sentry = sentries.get(id)!;
            DynamicRotation.lerp(sentry, data, lerp);
        }
    },
    spawn: {
        parse: async (data) => {
            const spawn = await DynamicTransform.spawn(data);
            const result = {
                ...spawn,
                owner: await BitHelper.readUShort(data)
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const sentries = snapshot.getOrDefault("Vanilla.Sentry", Factory("Map"));
        
            if (sentries.has(id)) throw new Error(`Sentry of id '${id}' already exists.`);
            sentries.set(id, { id, ...data, baseRot: { ...data.rotation } });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const sentries = snapshot.getOrDefault("Vanilla.Sentry", Factory("Map"));

            if (!sentries.has(id)) throw new Error(`Sentry of id '${id}' did not exist.`);
            sentries.delete(id);
        }
    }
});