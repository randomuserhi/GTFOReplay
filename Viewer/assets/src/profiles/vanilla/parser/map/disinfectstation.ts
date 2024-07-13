import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Factory } from "../../library/factory.js";

ModuleLoader.registerASLModule(module.src);

export interface DisinfectStation {
    id: number;
    dimension: number;
    position: Pod.Vector;
    rotation: Pod.Quaternion;
    serialNumber: number;
}

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Map.DisinfectStations": Map<number, DisinfectStation>;
        }
    }
}

ModuleLoader.registerHeader("Vanilla.Map.DisinfectStations", "0.0.1", {
    parse: async (data, header) => {
        const stations = header.getOrDefault("Vanilla.Map.DisinfectStations", Factory("Map"));
        const count = await BitHelper.readUShort(data);
        for (let i = 0; i < count; ++i) {
            const id = await BitHelper.readInt(data);
            const dimension = await BitHelper.readByte(data);
            const position = await BitHelper.readVector(data);
            const rotation = await BitHelper.readHalfQuaternion(data);
            const serialNumber = await BitHelper.readUShort(data);

            stations.set(id, {
                id,
                dimension,
                position,
                rotation,
                serialNumber,
            });
        }
    }
});