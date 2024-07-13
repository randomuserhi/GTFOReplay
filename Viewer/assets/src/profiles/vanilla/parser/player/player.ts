import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Factory } from "../../library/factory.js";
import { DynamicTransform } from "../../library/helpers.js";
import { Identifier, IdentifierData } from "../identifier.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Player": {
                parse: DynamicTransform.Parse & {
                    equippedId: Identifier;
                };
                spawn: DynamicTransform.Spawn & {
                    snet: bigint;
                    slot: number;
                    nickname: string;
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Player": Map<number, Player>;
            "Vanilla.Player.Slots": (Player | undefined)[];
            "Vanilla.Player.Snet": Map<bigint, Player>;
        }
    }
}

export interface Player extends DynamicTransform.Type {
    id: number;
    snet: bigint;
    slot: number;
    nickname: string;
    equippedId: Identifier;
    lastEquippedTime: number;
}

ModuleLoader.registerDynamic("Vanilla.Player", "0.0.1", {
    main: {
        parse: async (data, snapshot) => {
            const result = await DynamicTransform.parse(data);
            return {
                ...result,
                equippedId: await Identifier.parse(IdentifierData(snapshot), data),
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
    
            if (!players.has(id)) throw new Error(`Player of id '${id}' was not found.`);
            const player = players.get(id)!;
            DynamicTransform.lerp(player, data, lerp);
            if (!Identifier.equals(IdentifierData(snapshot), player.equippedId, data.equippedId)) {
                Identifier.copy(player.equippedId, data.equippedId);
                player.lastEquippedTime = snapshot.time();
            }
        }
    },
    spawn: {
        parse: async (data) => {
            const spawn = await DynamicTransform.spawn(data);
            const result = {
                ...spawn,
                snet: await BitHelper.readULong(data),
                slot: await BitHelper.readByte(data),
                nickname: (await BitHelper.readString(data)).replace(/<\/?[^>]+(>|$)/g, "")
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
            const snet = snapshot.getOrDefault("Vanilla.Player.Snet", Factory("Map"));
            const slots = snapshot.getOrDefault("Vanilla.Player.Slots", Factory("Array"));
        
            if (players.has(id)) throw new Error(`Player of id '${id}(${data.snet})' already exists.`);
            const player = { 
                id, ...data,
                equippedId: Identifier.create(),
                lastEquippedTime: 0
            };

            players.set(id, player);
            slots[data.slot] = player;
            snet.set(data.snet, player);
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
            const slots = snapshot.getOrDefault("Vanilla.Player.Slots", Factory("Array"));

            if (!players.has(id)) throw new Error(`Player of id '${id}' did not exist.`);
            slots[players.get(id)!.slot] = undefined;
            players.delete(id);
        }
    }
});