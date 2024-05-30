import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";

export interface ResourceContainer {
    id: number;
    dimension: number;
    position: Pod.Vector;
    rotation: Pod.Quaternion;
    isLocker: boolean;
}

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Map.ResourceContainers": Map<number, ResourceContainer>;
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
                isLocker: await BitHelper.readBool(data)
            });
        }
    }
});