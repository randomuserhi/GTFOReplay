import * as BitHelper from "../../replay/bithelper.js";
import { ModuleLoader } from "../../replay/moduleloader.js";
import * as Pod from "../../replay/pod.js";
import { DynamicPosition } from "../parser/replayrecorder.js";

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Cfoam": {
                parse: {
                    dimension: number; 
                    absolute: boolean;
                    position: Pod.Vector;
                    scale: number;
                };
                spawn: {
                    dimension: number;
                    position: Pod.Vector;
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

export interface Cfoam extends DynamicPosition {
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
            const collection = snapshot.getOrDefault("Vanilla.Cfoam", () => new Map());
    
            if (!collection.has(id)) throw new CfoamNotFound(`Cfoam of id '${id}' was not found.`);
            const cfoam = collection.get(id)!;
            DynamicPosition.lerp(cfoam, data, lerp);
            cfoam.scale = data.scale;
        }
    },
    spawn: {
        parse: async (data) => {
            const spawn = await DynamicPosition.parseSpawn(data);
            const result = {
                ...spawn,
                scale: await BitHelper.readHalf(data)
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const collection = snapshot.getOrDefault("Vanilla.Cfoam", () => new Map());
        
            if (collection.has(id)) throw new DuplicateCfoam(`Cfoam of id '${id}' already exists.`);
            collection.set(id, { id, ...data });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const collection = snapshot.getOrDefault("Vanilla.Cfoam", () => new Map());

            if (!collection.has(id)) throw new CfoamNotFound(`Cfoam of id '${id}' did not exist.`);
            collection.delete(id);
        }
    }
});

export class CfoamNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicateCfoam extends Error {
    constructor(message?: string) {
        super(message);
    }
}