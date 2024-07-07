import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";

export interface ResourceContainer {
    id: number;
    dimension: number;
    position: Pod.Vector;
    rotation: Pod.Quaternion;
    serialNumber: number;
    isLocker: boolean;
}

export interface ResourceContainerState {
    id: number;
    closed: boolean;
    lastCloseTime: number;
    lockType: LockType;
}

export const lockType = [
    "None",
    "Melee",
    "Hackable"
] as const;
export type LockType = typeof lockType[number];

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Map.ResourceContainers": Map<number, ResourceContainer>;
        }

        interface Dynamics {
            "Vanilla.Map.ResourceContainers.State":  {
                parse: {
                    closed: boolean;
                };
                spawn: {
                    closed: boolean;
                    lockType: LockType;
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Map.ResourceContainers.State": Map<number, ResourceContainerState>
        }
    }
}

ModuleLoader.registerHeader("Vanilla.Map.ResourceContainers", "0.0.1", {
    parse: async (data, header) => {
        const containers = header.getOrDefault("Vanilla.Map.ResourceContainers", () => new Map());
        const count = await BitHelper.readUShort(data);
        for (let i = 0; i < count; ++i) {
            const id = await BitHelper.readInt(data);
            containers.set(id, {
                id,
                dimension: await BitHelper.readByte(data),
                position: await BitHelper.readVector(data),
                rotation: await BitHelper.readHalfQuaternion(data),
                serialNumber: await BitHelper.readUShort(data),
                isLocker: await BitHelper.readBool(data)
            });
        }
    }
});

ModuleLoader.registerDynamic("Vanilla.Map.ResourceContainers.State", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                closed: await BitHelper.readBool(data)
            };
        }, 
        exec: (id, data, snapshot) => {
            const resourceContainers = snapshot.getOrDefault("Vanilla.Map.ResourceContainers.State", () => new Map());
    
            if (!resourceContainers.has(id)) throw new ResourceContainerNotFound(`Resource container of id '${id}' was not found.`);
            const resourceContainer = resourceContainers.get(id)!;
            if (resourceContainer.closed !== data.closed) {
                resourceContainer.lastCloseTime = snapshot.time();
                resourceContainer.closed = data.closed;
            }
        }
    },
    spawn: {
        parse: async (data) => {
            return {
                closed: await BitHelper.readBool(data),
                lockType: lockType[await BitHelper.readByte(data)]
            };
        },
        exec: (id, data, snapshot) => {
            const resourceContainers = snapshot.getOrDefault("Vanilla.Map.ResourceContainers.State", () => new Map());

            if (resourceContainers.has(id)) throw new DuplicateResourceContainer(`Resource container of id '${id}' already exists.`);
            resourceContainers.set(id, { 
                id, ...data,
                lastCloseTime: -Infinity
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const resourceContainers = snapshot.getOrDefault("Vanilla.Map.ResourceContainers.State", () => new Map());

            if (!resourceContainers.has(id)) throw new ResourceContainerNotFound(`Resource container of id '${id}' did not exist.`);
            resourceContainers.delete(id);
        }
    }
});

class ResourceContainerNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

class DuplicateResourceContainer extends Error {
    constructor(message?: string) {
        super(message);
    }
}
