import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";

export interface Ladder {
    dimension: number;
    top: Pod.Vector;
    rotation: Pod.Quaternion;
    height: number;
}

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Map.Ladders": Ladder[];
        }
    }
}

ModuleLoader.registerHeader("Vanilla.Map.Ladders", "0.0.1", {
    parse: async (data, header) => {
        const ladders = header.getOrDefault("Vanilla.Map.Ladders", () => []);
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