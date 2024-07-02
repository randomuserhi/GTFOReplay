import { ModuleLoader, ReplayApi } from "@esm/@root/replay/moduleloader.js";
import { ByteStream } from "@esm/@root/replay/stream.js";
import { Identifier, IdentifierData } from "../identifier.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Player.Backpack": {
                parse: {
                    slots: Identifier[];
                };
                spawn: {
                    slots: Identifier[];
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Player.Backpack": Map<number, PlayerBackpack>;
        }
    }
}

export type InventorySlot = 
    "melee" |
    "main"  |
    "special" |
    "tool" |
    "pack" |
    "consumable" |
    "heavyItem" | 
    "hackingTool";
export const inventorySlots: InventorySlot[] = [
    "melee",
    "main",
    "special",
    "tool",
    "pack",
    "consumable",
    "heavyItem",
    "hackingTool"
];
export const inventorySlotMap: Map<InventorySlot, number> = new Map([...inventorySlots.entries()].map(e => [e[1], e[0]]));
export class PlayerBackpack {
    slots: Identifier[];

    constructor() {
        this.slots = new Array(inventorySlots.length);
    }

    public static async parse(snapshot: ReplayApi, data: ByteStream): Promise<Identifier[]> {
        const slots: Identifier[] = new Array(inventorySlots.length);
        for (let i = 0; i < slots.length; ++i) {
            slots[i] = await Identifier.parse(IdentifierData(snapshot), data);
        }
        return slots;
    }
}

ModuleLoader.registerDynamic("Vanilla.Player.Backpack", "0.0.1", {
    main: {
        parse: async (data, snapshot) => {
            return {
                slots: await PlayerBackpack.parse(snapshot, data)
            };
        }, 
        exec: (id, data, snapshot) => {
            const backpacks = snapshot.getOrDefault("Vanilla.Player.Backpack", () => new Map());

            if (!backpacks.has(id)) throw new BackpackNotFound(`Dynamic of id '${id}' was not found.`);
            const backpack = backpacks.get(id)!;
            backpack.slots = data.slots;
        }
    },
    spawn: {
        parse: async (data, snapshot) => {
            return {
                slots: await PlayerBackpack.parse(snapshot, data)
            };
        },
        exec: (id, data, snapshot) => {
            const backpacks = snapshot.getOrDefault("Vanilla.Player.Backpack", () => new Map());

            if (backpacks.has(id)) throw new DuplicateBackpack(`Backpack of id '${id}' already exists.`);
            backpacks.set(id, { ...data });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const backpacks = snapshot.getOrDefault("Vanilla.Player.Backpack", () => new Map());

            if (!backpacks.has(id)) throw new BackpackNotFound(`Backpack of id '${id}' did not exist.`);
            backpacks.delete(id);
        }
    }
});

export class BackpackNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicateBackpack extends Error {
    constructor(message?: string) {
        super(message);
    }
}