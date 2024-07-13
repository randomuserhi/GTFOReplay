import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Factory } from "../../library/factory.js";
import { DynamicTransform } from "../../library/helpers.js";
import { Identifier, IdentifierData } from "../identifier.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Mine": {
                parse: DynamicTransform.Parse & {
                    length: number;
                };
                spawn: DynamicTransform.Spawn & {
                    item: Identifier;
                    owner: number;
                };
                despawn: void;
            };
        }

        interface Events {
            "Vanilla.Mine.Detonate": {
                id: number;
                trigger: number;
                shot: boolean;
            };
        }

        interface Data {
            "Vanilla.Mine": Map<number, Mine>
            "Vanilla.Mine.Detonate": Map<number, MineDetonate>
        }
    }
}

// NOTE(randomuserhi): Converts old mine types to their item IDs for backwards compatability
const mineTypemap: number[] = [
    125,
    144,
    139
];

export interface Mine extends DynamicTransform.Type {
    id: number;
    item: Identifier;
    owner: number;
    snet: bigint;
    length: number;
}

let mineDynamicParser = ModuleLoader.registerDynamic("Vanilla.Mine", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicTransform.parse(data);
            return {
                ...result,
                length: await BitHelper.readHalf(data)
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const mines = snapshot.getOrDefault("Vanilla.Mine", Factory("Map"));
    
            if (!mines.has(id)) throw new Error(`Dynamic of id '${id}' was not found.`);
            const mine = mines.get(id)!;
            DynamicTransform.lerp(mine, data, lerp);
            mine.length = data.length;
        }
    },
    spawn: {
        parse: async (data) => {
            const spawn = await DynamicTransform.spawn(data);
            const result = {
                ...spawn,
                item: Identifier.create("Item", mineTypemap[await BitHelper.readByte(data)]),
                owner: await BitHelper.readUShort(data)
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const mines = snapshot.getOrDefault("Vanilla.Mine", Factory("Map"));
            const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
        
            if (mines.has(id)) throw new Error(`Mine of id '${id}' already exists.`);
            if (!players.has(data.owner)) throw new Error(`Mine owner, '${data.owner}', does not exist.`);
            const player = players.get(data.owner)!;
            mines.set(id, { id, ...data, snet: player.snet, length: 0 });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const mines = snapshot.getOrDefault("Vanilla.Mine", Factory("Map"));

            if (!mines.has(id)) throw new Error(`Mine of id '${id}' did not exist.`);
            mines.delete(id);
        }
    }
});
mineDynamicParser = ModuleLoader.registerDynamic("Vanilla.Mine", "0.0.2", {
    ...mineDynamicParser,
    spawn: {
        ...mineDynamicParser.spawn,
        parse: async (data, snapshot) => {
            const spawn = await DynamicTransform.spawn(data);
            const result = {
                ...spawn,
                item: await Identifier.parse(IdentifierData(snapshot), data),
                owner: await BitHelper.readUShort(data)
            };
            if (result.item.type !== "Item") throw new Error(`Mine had an incompatible identifier of ${result.item.hash}`);
            return result;
        }
    }
});

export interface MineDetonate {
    id: number;
    time: number;
    trigger: number;
    shot: boolean;
}

ModuleLoader.registerEvent("Vanilla.Mine.Detonate", "0.0.1", {
    parse: async (bytes) => {
        return {
            id: await BitHelper.readInt(bytes),
            trigger: await BitHelper.readUShort(bytes),
            shot: await BitHelper.readBool(bytes)
        };
    },
    exec: async (data, snapshot) => {
        const detonations = snapshot.getOrDefault("Vanilla.Mine.Detonate", Factory("Map"));
        
        const { id } = data;
        if (detonations.has(id)) throw new Error(`Mine Detonation of id '${id}' already exist.`);
        detonations.set(id, { ...data, time: snapshot.time() });
    }
});

// NOTE(randomuserhi): Keep detonation events around for 1 second to watch for explosion damage events that may reference it
const detonateClearTime = 1000;
ModuleLoader.registerTick((snapshot) => {
    const detonations = snapshot.getOrDefault("Vanilla.Mine.Detonate", Factory("Map"));
    for (const [id, item] of [...detonations.entries()]) {
        if (snapshot.time() - item.time > detonateClearTime) {
            detonations.delete(id);
        }
    }
});