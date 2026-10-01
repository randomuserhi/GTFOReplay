import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Factory } from "../../library/factory.js";

ModuleLoader.registerASLModule(module.src);

export const state = [
    "Frozen",
    "Woke",
    "Retracted"
] as const;
export type SpitterStatus = typeof state[number];

export interface Spitter {
    id: number;
    dimension: number;
    position: Pod.Vector;
    rotation: Pod.Quaternion;
    scale: number;
}

export interface SpitterAppearance {
    blend: number;
    glow: [number, number, number, number];
    scale: Pod.Vector;
}

export interface SpitterState {
    appearance?: SpitterAppearance;
    id: number;
    state: SpitterStatus;
    lastStateTime: number;
    lastExplodeTime: number;
}

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Enemy.Spitters": Map<number, Spitter>;
        }

        interface Dynamics {
            "Vanilla.Enemy.Spitters.State":  {
                parse: {
                    state: SpitterStatus;
                    appearance?: SpitterAppearance;
                };
                spawn: {
                    state: SpitterStatus;
                    appearance?: SpitterAppearance;
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Enemy.Spitters.State": Map<number, SpitterState>
        }

        interface Events {
            "Vanilla.Enemy.Spitter.Explode": { id: number };
        }
    }
}

ModuleLoader.registerHeader("Vanilla.Enemy.Spitters", "0.0.1", {
    parse: async (data, header) => {
        const spitters = header.getOrDefault("Vanilla.Enemy.Spitters", Factory("Map"));
        const count = await BitHelper.readUShort(data);
        for (let i = 0; i < count; ++i) {
            const id = await BitHelper.readInt(data);
            const dimension = await BitHelper.readByte(data);
            const position = await BitHelper.readVector(data);
            const rotation = await BitHelper.readHalfQuaternion(data);
            const scale = await BitHelper.readHalf(data);

            if (spitters.has(id)) throw new Error(`Spitter of id '${id}' already exists.`);

            spitters.set(id, {
                id,
                dimension,
                position,
                rotation,
                scale
            });
        }
    }
});

async function readAppearance(data: Parameters<typeof BitHelper.readHalf>[0]): Promise<SpitterAppearance | undefined> {
    if (!await BitHelper.readBool(data)) return undefined;
    return {
        blend: await BitHelper.readHalf(data),
        glow: [await BitHelper.readHalf(data), await BitHelper.readHalf(data), await BitHelper.readHalf(data), await BitHelper.readHalf(data)],
        scale: { x: await BitHelper.readHalf(data), y: await BitHelper.readHalf(data), z: await BitHelper.readHalf(data) }
    };
}

ModuleLoader.registerDynamic("Vanilla.Enemy.Spitters.State", "0.0.2", {
    main: {
        parse: async (data) => {
            return {
                state: state[await BitHelper.readByte(data)],
                appearance: await readAppearance(data)
            };
        }, 
        exec: (id, data, snapshot) => {
            const spitters = snapshot.getOrDefault("Vanilla.Enemy.Spitters.State", Factory("Map"));
    
            if (!spitters.has(id)) throw new Error(`Generator of id '${id}' was not found.`);
            const spitter = spitters.get(id)!;
            if (spitter.state !== data.state) spitter.lastStateTime = snapshot.time();
            spitter.state = data.state;
            spitter.appearance = data.appearance;
        }
    },
    spawn: {
        parse: async (data) => {
            return {
                state: state[await BitHelper.readByte(data)],
                appearance: await readAppearance(data)
            };
        },
        exec: (id, data, snapshot) => {
            const spitters = snapshot.getOrDefault("Vanilla.Enemy.Spitters.State", Factory("Map"));

            if (spitters.has(id)) throw new Error(`Generator of id '${id}' already exists.`);
            spitters.set(id, { 
                id, ...data,
                lastStateTime: -Infinity,
                lastExplodeTime: -Infinity
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const generators = snapshot.header.getOrDefault("Vanilla.Enemy.Spitters", Factory("Map"));

            if (!generators.has(id)) throw new Error(`Generator of id '${id}' did not exist.`);
            generators.delete(id);
        }
    }
});

ModuleLoader.registerEvent("Vanilla.Enemy.Spitter.Explode", "0.0.1", {
    parse: async (data) => {
        return {
            id: await BitHelper.readInt(data),
        };
    },
    exec: (data, snapshot) => {
        const spitters = snapshot.getOrDefault("Vanilla.Enemy.Spitters.State", Factory("Map"));

        const { id } = data;
        if (!spitters.has(id)) throw new Error(`Spitter of id '${id}' was not found.`);
        spitters.get(id)!.lastExplodeTime = snapshot.time();
    }
});