import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";

export interface Terminal {
    id: number;
    dimension: number;
    position: Pod.Vector;
    rotation: Pod.Quaternion;
}

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Map.Terminals": Map<number, Terminal>;
        }
    }
}

ModuleLoader.registerHeader("Vanilla.Map.Terminals", "0.0.1", {
    parse: async (data, header) => {
        const terminals = header.getOrDefault("Vanilla.Map.Terminals", () => new Map());
        const count = await BitHelper.readUShort(data);
        for (let i = 0; i < count; ++i) {
            const id = await BitHelper.readInt(data);
            terminals.set(id, {
                id,
                dimension: await BitHelper.readByte(data),
                position: await BitHelper.readVector(data),
                rotation: await BitHelper.readHalfQuaternion(data),
            });
        }
    }
});