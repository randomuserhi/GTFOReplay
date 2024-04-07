import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "Vanilla.StatTracker.TongueDodge": TongueDodge;
        }
    }
}

export interface TongueDodge {
    source: number;
    target: number;
}

ModuleLoader.registerEvent("Vanilla.StatTracker.TongueDodge", "0.0.1", {
    parse: async (bytes) => {
        return {
            source: await BitHelper.readUShort(bytes),
            target: await BitHelper.readUShort(bytes),
        };
    },
    exec: async (data, snapshot) => {
        // TODO
    }
});