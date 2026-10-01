import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "ReplayRecorder.Session": {
                id: string; startedUtc: string; expedition: string; level: string; rundown: string;
                gameVersion: string; idleHz: number; combatHz: number;
                plugins: { id: string; version: string }[];
            };
            "ReplayRecorder.Header": {
                version: string;
                isMaster: boolean;
                recorder: bigint;
            }
        }
    }
}

ModuleLoader.registerHeader("ReplayRecorder.Header", "0.0.2", {
    parse: async (data, header) => {
        if (header.has("ReplayRecorder.Header")) throw new Error("Replay header was already written.");
        header.set("ReplayRecorder.Header", {
            version: await BitHelper.readString(data),
            isMaster: await BitHelper.readByte(data) == 1,
            recorder: await BitHelper.readLong(data)
        });
    }
});

ModuleLoader.registerHeader("ReplayRecorder.Session", "0.0.1", {
    parse: async (data, header) => {
        if (header.has("ReplayRecorder.Session")) throw new Error("Session header was already written.");
        const session = {
            id: await BitHelper.readString(data), startedUtc: await BitHelper.readString(data),
            expedition: await BitHelper.readString(data), level: await BitHelper.readString(data),
            rundown: await BitHelper.readString(data), gameVersion: await BitHelper.readString(data),
            idleHz: await BitHelper.readByte(data), combatHz: await BitHelper.readByte(data),
            plugins: [] as { id: string; version: string }[]
        };
        const count = await BitHelper.readUShort(data);
        for (let i = 0; i < count; ++i) session.plugins.push({ id: await BitHelper.readString(data), version: await BitHelper.readString(data) });
        header.set("ReplayRecorder.Session", session);
    }
});
