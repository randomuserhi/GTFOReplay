import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";
import { specification } from "../../renderer/specification.js";
import { Identifier, IdentifierData } from "../identifier.js";

export interface Item {
    id: number;
    dimension: number;
    position: Pod.Vector;
    rotation: Pod.Quaternion;
    itemID: Identifier;
    serialNumber: number;
    onGround: boolean;
    linkedToMachine: boolean;
    player: bigint | undefined;
    key: string;
}

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Map.Items":  {
                parse: {
                    dimension: number;
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                    onGround: boolean;
                    linkedToMachine: boolean;
                    // NOTE(randomuserhi): If item is not on ground and player slot is undefined (byte.MaxValue) then it means 
                    //                     item was on a player / bot that has been disconnected from the game.
                    playerSlot: number; 
                    serialNumber: number, // 65535 (ushort.MaxValue) indicates item has no serial number
                };
                spawn: {
                    dimension: number,
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                    onGround: boolean;
                    linkedToMachine: boolean;
                    playerSlot: number;  
                    serialNumber: number;
                    itemID: Identifier;
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Map.Items": Map<number, Item>
        }
    }
}

ModuleLoader.registerDynamic("Vanilla.Map.Items", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                dimension: await BitHelper.readByte(data),
                position: await BitHelper.readVector(data),
                rotation: await BitHelper.readHalfQuaternion(data),
                onGround: await BitHelper.readBool(data),
                linkedToMachine: await BitHelper.readBool(data),
                playerSlot: await BitHelper.readByte(data),
                serialNumber: await BitHelper.readUShort(data),
            };
        }, 
        exec: (id, data, snapshot) => {
            const items = snapshot.getOrDefault("Vanilla.Map.Items", () => new Map());
    
            if (!items.has(id)) throw new ItemNotFound(`Item of id '${id}' was not found.`);
            const item = items.get(id)!;
            Pod.Vec.copy(item.position, data.position);
            Pod.Quat.copy(item.rotation, data.rotation);
            item.onGround = data.onGround;
            item.linkedToMachine = data.linkedToMachine;
            item.serialNumber = data.serialNumber;
            
            const spec = specification.getEquippable(item.itemID);
            const _serial = data.serialNumber < 1000 ? `_${data.serialNumber}` : ""; 
            const serial = data.serialNumber < 1000 ? ` (${data.serialNumber})` : "";
            item.key = spec === undefined ? "Unknown" : spec.serial === undefined ? spec.name === undefined ? "Unknown" : `${spec.name}${serial}` : `${spec.serial}${_serial}`;
            
            // If the item is on the ground, a player doesn't have it.
            if (item.onGround === true) {
                item.player = undefined;
                return;
            } 

            // NOTE(randomuserhi): If item is not on ground and player slot is undefined (byte.MaxValue) then it means 
            //                     item was on a player / bot that has been disconnected from the game.
            //                     I should technically check for this case, but since its an invalid slot -> should be fine.

            const players = snapshot.getOrDefault("Vanilla.Player.Slots", () => []);
            item.player = players[data.playerSlot]?.snet;
        }
    },
    spawn: {
        parse: async (data, snapshot) => {
            return {
                dimension: await BitHelper.readByte(data),
                position: await BitHelper.readVector(data),
                rotation: await BitHelper.readHalfQuaternion(data),
                onGround: await BitHelper.readBool(data),
                linkedToMachine: await BitHelper.readBool(data),
                playerSlot: await BitHelper.readByte(data),
                serialNumber: await BitHelper.readUShort(data),
                itemID: await Identifier.parse(IdentifierData(snapshot), data),
            };
        },
        exec: (id, data, snapshot) => {
            const items = snapshot.getOrDefault("Vanilla.Map.Items", () => new Map());
        
            // NOTE(randomuserhi): Assume no player slot, so don't add it to item data
            //                     Parse it anyway cause backend saves it regardless.

            if (items.has(id)) throw new DuplicateItem(`Item of id '${id}' already exists.`);

            const spec = specification.getEquippable(data.itemID);
            const _serial = data.serialNumber < 1000 ? `_${data.serialNumber}` : ""; 
            const serial = data.serialNumber < 1000 ? ` (${data.serialNumber})` : "";
            const key = spec === undefined ? "Unknown" : spec.serial === undefined ? spec.name === undefined ? "Unknown" : `${spec.name}${serial}` : `${spec.serial}${_serial}`;

            items.set(id, { 
                id,
                dimension: data.dimension,
                position: data.position,
                rotation: data.rotation,
                onGround: data.onGround,
                linkedToMachine: data.linkedToMachine,
                serialNumber: data.serialNumber, // 65535 (ushort.MaxValue) indicates item has no serial number
                itemID: data.itemID,
                player: undefined,
                key
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const items = snapshot.getOrDefault("Vanilla.Map.WeakDoor", () => new Map());

            if (!items.has(id)) throw new ItemNotFound(`Item of id '${id}' did not exist.`);
            items.delete(id);
        }
    }
});

class ItemNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

class DuplicateItem extends Error {
    constructor(message?: string) {
        super(message);
    }
}