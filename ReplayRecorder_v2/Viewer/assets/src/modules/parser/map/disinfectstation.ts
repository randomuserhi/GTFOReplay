import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";

export interface DisinfectStation {
    id: number;
    dimension: number;
    position: Pod.Vector;
    rotation: Pod.Quaternion;
}

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Map.DisinfectStations": Map<number, DisinfectStation>;
        }
    }
}

ModuleLoader.registerHeader("Vanilla.Map.DisinfectStations", "0.0.1", {
    parse: async (data, header) => {
        const stations = header.getOrDefault("Vanilla.Map.DisinfectStations", () => new Map());
        const count = await BitHelper.readUShort(data);
        for (let i = 0; i < count; ++i) {
            const id = await BitHelper.readInt(data);
            const dimension = await BitHelper.readByte(data);
            const position = await BitHelper.readVector(data);
            const rotation = await BitHelper.readHalfQuaternion(data);

            stations.set(id, {
                id,
                dimension,
                position,
                rotation,
            });
        }
    }
});