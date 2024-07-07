import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Factory } from "../../library/factory";

export interface Generator {
    id: number;
    dimension: number;
    position: Pod.Vector;
    rotation: Pod.Quaternion;
    serialNumber: number;
}

export interface GeneratorState {
    id: number;
    powered: boolean;
}

declare module "@esm/@root/replay/moduleloader.js" {
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
        const generators = header.getOrDefault("Vanilla.Map.Generators", Factory("Map"));
        const count = await BitHelper.readUShort(data);
        for (let i = 0; i < count; ++i) {
            const id = await BitHelper.readInt(data);
            generators.set(id, {
                id,
                dimension: await BitHelper.readByte(data),
                position: await BitHelper.readVector(data),
                rotation: await BitHelper.readHalfQuaternion(data),
                serialNumber: await BitHelper.readUShort(data)
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
            const generators = snapshot.getOrDefault("Vanilla.Map.Generators.State", Factory("Map"));
    
            if (!generators.has(id)) throw new Error(`Generator of id '${id}' was not found.`);
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
            const generators = snapshot.getOrDefault("Vanilla.Map.Generators.State", Factory("Map"));

            if (generators.has(id)) throw new Error(`Generator of id '${id}' already exists.`);
            generators.set(id, { 
                id, ...data,
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const generators = snapshot.getOrDefault("Vanilla.Map.Generators.State", Factory("Map"));

            if (!generators.has(id)) throw new Error(`Generator of id '${id}' did not exist.`);
            generators.delete(id);
        }
    }
});