import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { DynamicRotation, DynamicTransform } from "./replayrecorder.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Sentry": {
                parse: {
                    rotation: Pod.Quaternion;
                };
                spawn: {
                    dimension: number;
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
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

export interface Sentry extends DynamicRotation {
    position: Pod.Vector;
    rotation: Pod.Quaternion;
    dimension: number;
    owner: number;
    baseRot: Pod.Quaternion;
}

ModuleLoader.registerDynamic("Vanilla.Sentry", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicRotation.parseSpawn(data);
            return result;
        }, 
        exec: (id, data, snapshot, lerp) => {
            const sentries = snapshot.getOrDefault("Vanilla.Sentry", () => new Map());
    
            if (!sentries.has(id)) throw new SentryNotFound(`Dynamic of id '${id}' was not found.`);
            const sentry = sentries.get(id)!;
            DynamicRotation.lerp(sentry, data, lerp);
        }
    },
    spawn: {
        parse: async (data) => {
            const spawn = await DynamicTransform.parseSpawn(data);
            const result = {
                ...spawn,
                owner: await BitHelper.readUShort(data)
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const sentries = snapshot.getOrDefault("Vanilla.Sentry", () => new Map());
        
            if (sentries.has(id)) throw new DuplicateSentry(`Sentry of id '${id}' already exists.`);
            sentries.set(id, { id, ...data, baseRot: data.rotation });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const sentries = snapshot.getOrDefault("Vanilla.Sentry", () => new Map());

            if (!sentries.has(id)) throw new SentryNotFound(`Sentry of id '${id}' did not exist.`);
            sentries.delete(id);
        }
    }
});

export class SentryNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicateSentry extends Error {
    constructor(message?: string) {
        super(message);
    }
}