import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";

export interface Generator {
    id: number;
    dimension: number;
    position: Pod.Vector;
    rotation: Pod.Quaternion;
}

export interface GeneratorState {
    id: number;
    powered: boolean;
}

export const lockType = [
    "None",
    "Melee",
    "Hackable"
] as const;
export type LockType = typeof lockType[number];

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Map.Generators": Map<number, Generator>;
        }

        interface Dynamics {
            "Vanilla.Map.Generators.State":  {
                parse: {
                    powered: boolean;
                };
                spawn: {
                    powered: boolean;
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Map.Generators.State": Map<number, GeneratorState>
        }
    }
}

ModuleLoader.registerHeader("Vanilla.Map.Generators", "0.0.1", {
    parse: async (data, header) => {
        const generators = header.getOrDefault("Vanilla.Map.Generators", () => new Map());
        const count = await BitHelper.readUShort(data);
        for (let i = 0; i < count; ++i) {
            const id = await BitHelper.readInt(data);
            generators.set(id, {
                id,
                dimension: await BitHelper.readByte(data),
                position: await BitHelper.readVector(data),
                rotation: await BitHelper.readHalfQuaternion(data),
            });
        }
    }
});

ModuleLoader.registerDynamic("Vanilla.Map.Generators.State", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                powered: await BitHelper.readBool(data)
            };
        }, 
        exec: (id, data, snapshot) => {
            const generators = snapshot.getOrDefault("Vanilla.Map.Generators.State", () => new Map());
    
            if (!generators.has(id)) throw new GeneratorNotFound(`Generator of id '${id}' was not found.`);
            const generator = generators.get(id)!;
            generator.powered = data.powered;
        }
    },
    spawn: {
        parse: async (data) => {
            return {
                powered: await BitHelper.readBool(data),
            };
        },
        exec: (id, data, snapshot) => {
            const generators = snapshot.getOrDefault("Vanilla.Map.Generators.State", () => new Map());

            if (generators.has(id)) throw new DuplicateGenerator(`Generator of id '${id}' already exists.`);
            generators.set(id, { 
                id, ...data,
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const generators = snapshot.getOrDefault("Vanilla.Map.Generators.State", () => new Map());

            if (!generators.has(id)) throw new GeneratorNotFound(`Generator of id '${id}' did not exist.`);
            generators.delete(id);
        }
    }
});

class GeneratorNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

class DuplicateGenerator extends Error {
    constructor(message?: string) {
        super(message);
    }
}
