import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Identifier, IdentifierData } from "../identifier.js";
import { DynamicTransform } from "../replayrecorder.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Player": {
                parse: {
                    dimension: number;
                    absolute: boolean;
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                    equippedId: Identifier;
                };
                spawn: {
                    dimension: number;
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                    snet: bigint;
                    slot: number;
                    nickname: string;
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Player.Snet": Map<bigint, PlayerInfo>;
            "Vanilla.Player": Map<number, Player>;
            "Vanilla.Player.Slots": (Player | undefined)[];
        }
    }
}

export interface PlayerInfo {
    snet: bigint;
    nickname: string;
}

export interface Player extends DynamicTransform {
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
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
    
            if (!players.has(id)) throw new PlayerNotFound(`Dynamic of id '${id}' was not found.`);
            const player = players.get(id)!;
            DynamicTransform.lerp(player, data, lerp);
            if (!Identifier.equals(player.equippedId, IdentifierData(snapshot), data.equippedId)) {
                Identifier.copy(player.equippedId, data.equippedId);
                player.lastEquippedTime = snapshot.time();
            }
        }
    },
    spawn: {
        parse: async (data) => {
            const spawn = await DynamicTransform.parseSpawn(data);
            const result = {
                ...spawn,
                snet: await BitHelper.readULong(data),
                slot: await BitHelper.readByte(data),
                nickname: (await BitHelper.readString(data)).replace(/<\/?[^>]+(>|$)/g, "")
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
            const all = snapshot.getOrDefault("Vanilla.Player.Snet", () => new Map());
            const slots = snapshot.getOrDefault("Vanilla.Player.Slots", () => []);
        
            const { snet } = data;
        
            if (players.has(id)) throw new DuplicatePlayer(`Player of id '${id}(${snet})' already exists.`);
            const player = { 
                id, ...data,
                equippedId: Identifier.create(),
                lastEquippedTime: 0
            };
            players.set(id, player);
            slots[data.slot] = player;

            all.set(snet, {
                snet,
                nickname: data.nickname
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
            const slots = snapshot.getOrDefault("Vanilla.Player.Slots", () => []);

            if (!players.has(id)) throw new PlayerNotFound(`Player of id '${id}' did not exist.`);
            slots[players.get(id)!.slot] = undefined;
            players.delete(id);
        }
    }
});

export class PlayerNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicatePlayer extends Error {
    constructor(message?: string) {
        super(message);
    }
}