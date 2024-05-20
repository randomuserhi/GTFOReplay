import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import { ByteStream } from "../../../replay/stream.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Player.Backpack": {
                parse: {
                    slots: number[];
                };
                spawn: {
                    slots: number[];
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
    "consumable";
export const inventorySlots: InventorySlot[] = [
    "melee",
    "main",
    "special",
    "tool",
    "pack",
    "consumable"
];
export const inventorySlotMap: Map<InventorySlot, number> = new Map([...inventorySlots.entries()].map(e => [e[1], e[0]]));
export class PlayerBackpack {
    slots: number[];

    constructor() {
        this.slots = new Array(inventorySlots.length);
    }

    public static async parse(data: ByteStream): Promise<number[]> {
        const slots = new Array(inventorySlots.length);
        for (let i = 0; i < slots.length; ++i) {
            slots[i] = await BitHelper.readUShort(data);
        }
        return slots;
    }
}

ModuleLoader.registerDynamic("Vanilla.Player.Backpack", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                slots: await PlayerBackpack.parse(data)
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
        parse: async (data) => {
            return {
                slots: await PlayerBackpack.parse(data)
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