import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";

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

export interface SpitterState {
    id: number;
    state: SpitterStatus;
    lastStateTime: number;
    lastExplodeTime: number;
}

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Enemy.Spitters": Map<number, Spitter>;
        }

        interface Dynamics {
            "Vanilla.Enemy.Spitters.State":  {
                parse: {
                    state: SpitterStatus;
                };
                spawn: {
                    state: SpitterStatus;
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
        const spitters = header.getOrDefault("Vanilla.Enemy.Spitters", () => new Map());
        const count = await BitHelper.readUShort(data);
        for (let i = 0; i < count; ++i) {
            const id = await BitHelper.readInt(data);
            const dimension = await BitHelper.readByte(data);
            const position = await BitHelper.readVector(data);
            const rotation = await BitHelper.readHalfQuaternion(data);
            const scale = await BitHelper.readHalf(data);

            if (spitters.has(id)) throw new DuplicateSpitter(`Spitter of id '${id}' already exists.`);

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

ModuleLoader.registerDynamic("Vanilla.Enemy.Spitters.State", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                state: state[await BitHelper.readByte(data)]
            };
        }, 
        exec: (id, data, snapshot) => {
            const spitters = snapshot.getOrDefault("Vanilla.Enemy.Spitters.State", () => new Map());
    
            if (!spitters.has(id)) throw new SpitterNotFound(`Generator of id '${id}' was not found.`);
            const spitter = spitters.get(id)!;
            spitter.state = data.state;
            spitter.lastStateTime = snapshot.time();
        }
    },
    spawn: {
        parse: async (data) => {
            return {
                state: state[await BitHelper.readByte(data)]
            };
        },
        exec: (id, data, snapshot) => {
            const spitters = snapshot.getOrDefault("Vanilla.Enemy.Spitters.State", () => new Map());

            if (spitters.has(id)) throw new DuplicateSpitter(`Generator of id '${id}' already exists.`);
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
            const generators = snapshot.header.getOrDefault("Vanilla.Enemy.Spitters", () => new Map());

            if (!generators.has(id)) throw new SpitterNotFound(`Generator of id '${id}' did not exist.`);
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
        const spitters = snapshot.getOrDefault("Vanilla.Enemy.Spitters.State", () => new Map());

        const { id } = data;
        if (!spitters.has(id)) throw new SpitterNotFound(`Spitter of id '${id}' was not found.`);
        spitters.get(id)!.lastExplodeTime = snapshot.time();
    }
});

class SpitterNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

class DuplicateSpitter extends Error {
    constructor(message?: string) {
        super(message);
    }
}