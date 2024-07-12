import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Factory } from "../../library/factory.js";

ModuleLoader.registerASLModule(module.src);

export interface Ladder {
    dimension: number;
    top: Pod.Vector;
    rotation: Pod.Quaternion;
    height: number;
}

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Map.Ladders": Ladder[];
        }
    }
}

ModuleLoader.registerHeader("Vanilla.Map.Ladders", "0.0.1", {
    parse: async (data, header) => {
        const ladders = header.getOrDefault("Vanilla.Map.Ladders", Factory("Array"));
        const count = await BitHelper.readUShort(data);
        for (let i = 0; i < count; ++i) {
            ladders.push({
                dimension: await BitHelper.readByte(data),
                top: await BitHelper.readVector(data),
                rotation: await BitHelper.readHalfQuaternion(data),
                height: await BitHelper.readHalf(data)
            });
        }
    }
});