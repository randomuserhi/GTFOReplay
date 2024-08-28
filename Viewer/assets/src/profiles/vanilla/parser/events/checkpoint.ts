import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Factory } from "../../library/factory.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "Vanilla.Checkpoint": void;
        }

        interface Data {
            "Vanilla.Checkpoint": Checkpoint[];
        }
    }
}

export interface Checkpoint {
    time: number;
}

ModuleLoader.registerEvent("Vanilla.Checkpoint", "0.0.1", {
    parse: async (bytes, snapshot) => {
    },
    exec: async (data, snapshot) => {
        const checkpoints = snapshot.getOrDefault("Vanilla.Checkpoint", Factory("Array"));
        checkpoints.push({
            time: snapshot.time()
        });
    }
});