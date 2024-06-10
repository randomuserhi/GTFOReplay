import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";
import { Dynamic } from "../../parser/replayrecorder.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Holopath": {
                parse: {
                    progress: number;
                };
                spawn: {
                    dimension: number;
                    spline: Pod.Vector[];
                };
                despawn: void;
            };
        }
    
        interface Data {
            "Vanilla.Holopath": Map<number, Holopath>
        }
    }
}

export interface Holopath extends Dynamic {
    dimension: number;
    progress: number;
    spline: Pod.Vector[];
}

ModuleLoader.registerDynamic("Vanilla.Holopath", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                progress: await BitHelper.readByte(data) / 255
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const holpaths = snapshot.getOrDefault("Vanilla.Holopath", () => new Map());
    
            if (!holpaths.has(id)) throw new HolopathNotFound(`Holopath of id '${id}' was not found.`);
            
            const holopath = holpaths.get(id)!;
            holopath.progress += (data.progress - holopath.progress) * lerp;
        }
    },
    spawn: {
        parse: async (data) => {
            const header = {
                dimension: await BitHelper.readByte(data),
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
            const holopaths = snapshot.getOrDefault("Vanilla.Holopath", () => new Map());
        
            if (holopaths.has(id)) throw new DuplicateHolopath(`Holopath of id '${id}' already exists.`);
            holopaths.set(id, { id, ...data, progress: 0 });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const holopaths = snapshot.getOrDefault("Vanilla.Holopath", () => new Map());

            if (!holopaths.has(id)) throw new HolopathNotFound(`Holopath of id '${id}' did not exist.`);
            holopaths.delete(id);
        }
    }
});

class HolopathNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

class DuplicateHolopath extends Error {
    constructor(message?: string) {
        super(message);
    }
}