import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Factory } from "../../library/factory.js";

declare module "@esm/@root/replay/moduleloader.js" {
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

export interface Holopath {
    id: number;
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
            const holpaths = snapshot.getOrDefault("Vanilla.Holopath", Factory("Map"));
    
            if (!holpaths.has(id)) throw new Error(`Holopath of id '${id}' was not found.`);
            
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
            const holopaths = snapshot.getOrDefault("Vanilla.Holopath", Factory("Map"));
        
            if (holopaths.has(id)) throw new Error(`Holopath of id '${id}' already exists.`);
            holopaths.set(id, { id, ...data, progress: 0 });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const holopaths = snapshot.getOrDefault("Vanilla.Holopath", Factory("Map"));

            if (!holopaths.has(id)) throw new Error(`Holopath of id '${id}' did not exist.`);
            holopaths.delete(id);
        }
    }
});