import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Factory } from "../../library/factory";

export interface Terminal {
    id: number;
    dimension: number;
    position: Pod.Vector;
    rotation: Pod.Quaternion;
}

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Map.Terminals": Map<number, Terminal>;
        }
    }
}

ModuleLoader.registerHeader("Vanilla.Map.Terminals", "0.0.1", {
    parse: async (data, header) => {
        const terminals = header.getOrDefault("Vanilla.Map.Terminals", Factory("Map"));
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