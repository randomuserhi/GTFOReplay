import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Dynamic } from "../replayrecorder.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Enemy.Tongue": {
                parse: {
                    dimension: number;
                    progress: number;
                    spline: Pod.Vector[];
                };
                spawn: {
                    owner: number;
                    dimension: number;
                    progress: number;
                    spline: Pod.Vector[];
                };
                despawn: void;
            };
        }

        interface Events {
            "Vanilla.Enemy.TongueEvent": {
                id: number;
                spline: Pod.Vector[];
            }
        }
    
        interface Data {
            "Vanilla.Enemy.Tongue": Map<number, Tongue>
        }
    }
}

ModuleLoader.registerEvent("Vanilla.Enemy.TongueEvent", "0.0.1", {
    parse: async (data) => {
        const header = {
            id: await BitHelper.readInt(data),
        };
        const length = await BitHelper.readByte(data);
        const spline: Pod.Vector[] = new Array(length);
        spline[0] = await BitHelper.readVector(data);
        for (let i = 1; i < length; ++i) {
            const point = { x: 0, y: 0, z: 0 };
            spline[i] = Pod.Vec.add(point, spline[i - 1], await BitHelper.readHalfVector(data));
        }
        return {
            ...header, spline
        };
    }, 
    exec: (data, snapshot) => {
        const tongues = snapshot.getOrDefault("Vanilla.Enemy.Tongue", () => new Map());

        const { id } = data;
        if (!tongues.has(id)) return; // enemy died
        
        const tongue = tongues.get(id)!;
        tongue.spline = data.spline;
        tongue.progress = 1;
    }
});

export interface Tongue extends Dynamic {
    owner: number;
    dimension: number;
    progress: number;
    spline: Pod.Vector[];
}

ModuleLoader.registerDynamic("Vanilla.Enemy.Tongue", "0.0.1", {
    main: {
        parse: async (data) => {
            const header = {
                dimension: await BitHelper.readByte(data),
                progress: await BitHelper.readByte(data) / 255
            };
            const length = await BitHelper.readByte(data);
            const spline: Pod.Vector[] = new Array(length);
            spline[0] = await BitHelper.readVector(data);
            for (let i = 1; i < length; ++i) {
                const point = { x: 0, y: 0, z: 0 };
                spline[i] = Pod.Vec.add(point, spline[i - 1], await BitHelper.readHalfVector(data));
            }
            return {
                ...header, spline
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const tongues = snapshot.getOrDefault("Vanilla.Enemy.Tongue", () => new Map());
    
            if (!tongues.has(id)) throw new TongueNotFound(`Tongue of id '${id}' was not found.`);
            
            const tongue = tongues.get(id)!;
            tongue.spline = data.spline;
            tongue.dimension = data.dimension;
            tongue.progress += (data.progress - tongue.progress) * lerp;
        }
    },
    spawn: {
        parse: async (data) => {
            const header = {
                owner: await BitHelper.readUShort(data),
                dimension: await BitHelper.readByte(data),
                progress: await BitHelper.readByte(data) / 255
            };
            const length = await BitHelper.readByte(data);
            const spline: Pod.Vector[] = new Array(length);
            spline[0] = await BitHelper.readVector(data);
            for (let i = 1; i < length; ++i) {
                const point = { x: 0, y: 0, z: 0 };
                spline[i] = Pod.Vec.add(point, spline[i - 1], await BitHelper.readHalfVector(data));
            }
            return {
                ...header, spline
            };
        },
        exec: (id, data, snapshot) => {
            const enemies = snapshot.getOrDefault("Vanilla.Enemy.Tongue", () => new Map());
        
            if (enemies.has(id)) throw new DuplicateTongue(`Tongue of id '${id}' already exists.`);
            enemies.set(id, { id, ...data });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const tongues = snapshot.getOrDefault("Vanilla.Enemy.Tongue", () => new Map());

            if (!tongues.has(id)) throw new TongueNotFound(`Tongue of id '${id}' did not exist.`);
            tongues.delete(id);
        }
    }
});

class TongueNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

class DuplicateTongue extends Error {
    constructor(message?: string) {
        super(message);
    }
}