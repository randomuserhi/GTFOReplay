import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "Vanilla.Enemy.LimbDestruction": {
                id: number;
                limb: Limb; 
            };
        }
    }
}

const limbTypemap = [
    "Head"
] as const;
type Limb = typeof limbTypemap[number];

ModuleLoader.registerEvent("Vanilla.Enemy.LimbDestruction", "0.0.1", {
    parse: async (data) => {
        return {
            id: await BitHelper.readInt(data),
            limb: limbTypemap[await BitHelper.readByte(data)]
        };
    },
    exec: (data, snapshot) => {
        const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());

        const { id, limb } = data;
        if (!enemies.has(id)) return;
        switch(limb) {
        case "Head": enemies.get(id)!.head = false; break;
        }
    }
});