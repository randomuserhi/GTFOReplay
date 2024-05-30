import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";

export interface HeavyItem {
    id: number;
    dimension: number;
    position: Pod.Vector;
    rotation: Pod.Quaternion;
    itemID: number;
    onGround: boolean;
}

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Map.HeavyItem":  {
                parse: {
                    dimension: number,
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                    onGround: boolean;
                };
                spawn: {
                    dimension: number,
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                    onGround: boolean;
                    itemID: number;
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Map.HeavyItem": Map<number, HeavyItem>
        }
    }
}

ModuleLoader.registerDynamic("Vanilla.Map.HeavyItem", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                dimension: await BitHelper.readByte(data),
                position: await BitHelper.readVector(data),
                rotation: await BitHelper.readHalfQuaternion(data),
                onGround: await BitHelper.readBool(data),
            };
        }, 
        exec: (id, data, snapshot) => {
            const heavyItems = snapshot.getOrDefault("Vanilla.Map.HeavyItem", () => new Map());
    
            if (!heavyItems.has(id)) throw new HeavyItemNotFound(`HeavyItem of id '${id}' was not found.`);
            const heavyItem = heavyItems.get(id)!;
            Pod.Vec.copy(heavyItem.position, data.position);
            Pod.Quat.copy(heavyItem.rotation, data.rotation);
            heavyItem.onGround = data.onGround;
        }
    },
    spawn: {
        parse: async (data) => {
            return {
                dimension: await BitHelper.readByte(data),
                position: await BitHelper.readVector(data),
                rotation: await BitHelper.readHalfQuaternion(data),
                onGround: await BitHelper.readBool(data),
                itemID: await BitHelper.readUShort(data)
            };
        },
        exec: (id, data, snapshot) => {
            const heavyItems = snapshot.getOrDefault("Vanilla.Map.HeavyItem", () => new Map());
        
            if (heavyItems.has(id)) throw new DuplicateHeavyItem(`HeavyItem of id '${id}' already exists.`);
            heavyItems.set(id, { 
                id, ...data
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const heavyItems = snapshot.getOrDefault("Vanilla.Map.WeakDoor", () => new Map());

            if (!heavyItems.has(id)) throw new HeavyItemNotFound(`HeavyItem of id '${id}' did not exist.`);
            heavyItems.delete(id);
        }
    }
});

class HeavyItemNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

class DuplicateHeavyItem extends Error {
    constructor(message?: string) {
        super(message);
    }
}