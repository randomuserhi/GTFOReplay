import { ModuleLoader, ReplayApi } from "@esm/@root/replay/moduleloader.js";
import { ByteStream } from "@esm/@root/replay/stream.js";
import { Factory } from "../../library/factory.js";
import { Identifier, IdentifierData } from "../identifier.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Player.Backpack": {
                parse: {
                    slots: Identifier[];
                    vanity: Identifier[];
                };
                spawn: Dynamics["Vanilla.Player.Backpack"]["parse"];
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Player.Backpack": Map<number, PlayerBackpack>;
        }
    }
}

export const inventorySlots = [
    "melee",
    "main",
    "special",
    "tool",
    "pack",
    "consumable",
    "heavyItem",
    "hackingTool"
] as const;
export type InventorySlot = typeof inventorySlots[number];
export const inventorySlotMap: Record<InventorySlot, number> = Object.fromEntries([...inventorySlots.entries()].map(e => [e[1], e[0]])) as any;

export const vanitySlots = [
    "helmet",
    "torso",
    "legs",
    "backpack",
    "pallete"
] as const;

export interface PlayerBackpack {
    slots: Identifier[];
    vanity: Identifier[];
}

async function parseSlots(snapshot: ReplayApi, data: ByteStream, numSlots: number): Promise<Identifier[]> {
    const items: Identifier[] = new Array(numSlots);
    for (let i = 0; i < items.length; ++i) {
        items[i] = await Identifier.parse(IdentifierData(snapshot), data);
    }
    return items;
}

let parser = ModuleLoader.registerDynamic("Vanilla.Player.Backpack", "0.0.1", {
    main: {
        parse: async (data, snapshot) => {
            const vanity = new Array(vanitySlots.length);
            for (let i = 0; i < vanity.length; ++i) {
                vanity[i] = Identifier.unknown;
            }

            return {
                slots: await parseSlots(snapshot, data, inventorySlots.length),
                vanity
            };
        }, 
        exec: (id, data, snapshot) => {
            const backpacks = snapshot.getOrDefault("Vanilla.Player.Backpack", Factory("Map"));

            if (!backpacks.has(id)) throw new Error(`Dynamic of id '${id}' was not found.`);
            const backpack = backpacks.get(id)!;
            backpack.slots = data.slots;
            backpack.vanity = data.vanity;
        }
    },
    spawn: {
        parse: async (data, snapshot) => {
            const vanity = new Array(vanitySlots.length);
            for (let i = 0; i < vanity.length; ++i) {
                vanity[i] = Identifier.unknown;
            }
            
            return {
                slots: await parseSlots(snapshot, data, inventorySlots.length),
                vanity
            };
        },
        exec: (id, data, snapshot) => {
            const backpacks = snapshot.getOrDefault("Vanilla.Player.Backpack", Factory("Map"));

            if (backpacks.has(id)) throw new Error(`Backpack of id '${id}' already exists.`);
            backpacks.set(id, { ...data });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const backpacks = snapshot.getOrDefault("Vanilla.Player.Backpack", Factory("Map"));

            if (!backpacks.has(id)) throw new Error(`Backpack of id '${id}' did not exist.`);
            backpacks.delete(id);
        }
    }
});
parser = ModuleLoader.registerDynamic("Vanilla.Player.Backpack", "0.0.2", {
    ...parser,
    main: {
        ...parser.main,
        parse: async (data, snapshot) => {
            return {
                slots: await parseSlots(snapshot, data, inventorySlots.length),
                vanity: await parseSlots(snapshot, data, vanitySlots.length),
            };
        }
    },
    spawn: {
        ...parser.spawn,
        parse: async (data, snapshot) => {
            return {
                slots: await parseSlots(snapshot, data, inventorySlots.length),
                vanity: await parseSlots(snapshot, data, vanitySlots.length),
            };
        }
    },
});