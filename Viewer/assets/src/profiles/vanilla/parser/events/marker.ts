import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import type { Vector } from "@esm/@root/replay/pod.js";

ModuleLoader.registerASLModule(module.src);

export interface Marker { label: string; player: bigint; dimension: number; position: Vector }
declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Events { "ReplayRecorder.Marker": Marker }
        interface Data { "ReplayRecorder.Markers": (Marker & { time: number })[] }
    }
}

ModuleLoader.registerEvent("ReplayRecorder.Marker", "0.0.1", {
    parse: async data => ({
        label: await BitHelper.readString(data), player: await BitHelper.readLong(data),
        dimension: await BitHelper.readByte(data), position: await BitHelper.readVector(data)
    }),
    exec: (data, snapshot) => {
        snapshot.getOrDefault("ReplayRecorder.Markers", () => []).push({ ...data, time: snapshot.time() });
    }
});
