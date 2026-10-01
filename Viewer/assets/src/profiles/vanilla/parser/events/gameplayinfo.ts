import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Factory } from "../../library/factory.js";

ModuleLoader.registerASLModule(module.src);

export interface GameplayInfo { channel: string; id: number; title: string; text: string; time: number }
export interface ScanInfo { id: number; state: number; players: number; required: number; missingItems: number; exit: boolean; alarm: boolean; requirement: string }
declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "Vanilla.Gameplay.Info": Omit<GameplayInfo, 'time'>;
            "Vanilla.Bioscan.Info": ScanInfo;
        }
        interface Data {
            "Vanilla.Gameplay.Info": Map<string, GameplayInfo>;
            "Vanilla.Bioscan.Info": Map<number, ScanInfo>;
        }
    }
}

ModuleLoader.registerEvent("Vanilla.Gameplay.Info", "0.0.1", {
    parse: async bytes => ({ channel: await BitHelper.readString(bytes), id: await BitHelper.readInt(bytes), title: await BitHelper.readString(bytes), text: await BitHelper.readString(bytes) }),
    exec: (data, snapshot) => {
        snapshot.getOrDefault("Vanilla.Gameplay.Info", Factory("Map")).set(`${data.channel}:${data.id}`, { ...data, time: snapshot.time() });
    }
});
ModuleLoader.registerEvent("Vanilla.Bioscan.Info", "0.0.1", {
    parse: async bytes => ({ id: await BitHelper.readInt(bytes), state: await BitHelper.readByte(bytes), players: await BitHelper.readByte(bytes), required: await BitHelper.readByte(bytes), missingItems: await BitHelper.readByte(bytes), exit: await BitHelper.readBool(bytes), alarm: await BitHelper.readBool(bytes), requirement: await BitHelper.readString(bytes) }),
    exec: (data, snapshot) => {
        const scans = snapshot.getOrDefault("Vanilla.Bioscan.Info", Factory("Map"));
        if (data.state === 2 || data.state === 3) scans.set(data.id, data);
        else scans.delete(data.id);
    }
});
