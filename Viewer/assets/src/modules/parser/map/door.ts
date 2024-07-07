import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Factory } from "../../library/factory.js";

const doorTypes = [
    "WeakDoor",
    "SecurityDoor",
    "BulkheadDoor",
    "BulkheadDoorMain",
    "ApexDoor"
] as const;
export type DoorType = typeof doorTypes[number];

const doorStatus = [
    "Closed",
    "Open",
    "Glued",
    "Destroyed"
] as const;
export type DoorStatus = typeof doorStatus[number];

const doorSizes = [
    "Small",
    "Medium",
    "Large"
] as const;
export type DoorSize = typeof doorSizes[number];

export const lockType = [
    "None",
    "Melee",
    "Hackable"
] as const;
export type LockType = typeof lockType[number];

export interface Door {
    id: number;
    position: Pod.Vector;
    rotation: Pod.Quaternion;
    dimension: number;
    serialNumber: number;
    isCheckpoint: boolean;
    type: DoorType;
    size: DoorSize;
}

export interface DoorState {
    id: number;
    status: DoorStatus;
    change?: number; // when the status change occured
}

export interface WeakDoor {
    id: number;
    maxHealth: number;
    health: number;
    lastPunch: number;
    lock0: LockType;
    lock1: LockType;
}

export interface DoorStatusChange {
    id: number;
    status: DoorStatus;
}

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Map.Doors": Map<number, Door>;
        }

        interface Events {
            "Vanilla.Map.DoorStatusChange": DoorStatusChange;
            "Vanilla.Map.WeakDoor.Punch": { id: number };
        }

        interface Dynamics {
            "Vanilla.Map.WeakDoor":  {
                parse: {
                    health: number;
                    lock0: LockType;
                    lock1: LockType;
                };
                spawn: {
                    maxHealth: number;
                    lock0: LockType;
                    lock1: LockType;
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Map.WeakDoor": Map<number, WeakDoor>
            "Vanilla.Map.DoorState": Map<number, DoorState>
        }
    }
}

ModuleLoader.registerHeader("Vanilla.Map.Doors", "0.0.1", {
    parse: async (data, header) => {
        const doors = new Map<number, Door>();

        const nDoors = await BitHelper.readUShort(data);
        for (let i = 0; i < nDoors; ++i) {
            const id = await BitHelper.readInt(data);

            const dimension = await BitHelper.readByte(data);
            const position = await BitHelper.readVector(data);
            const rotation = await BitHelper.readHalfQuaternion(data);

            const serialNumber = await BitHelper.readUShort(data);
            const isCheckpoint = await BitHelper.readBool(data);
            const type = doorTypes[await BitHelper.readByte(data)];
            const size = doorSizes[await BitHelper.readByte(data)];

            doors.set(id, {
                id,
                dimension, position, rotation,
                serialNumber, isCheckpoint, type, size,
            });
        }

        if (header.has("Vanilla.Map.Doors")) throw new Error("Doors was already written.");
        else header.set("Vanilla.Map.Doors", doors);
    }
});

ModuleLoader.registerDynamic("Vanilla.Map.WeakDoor", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                health: await BitHelper.readByte(data),
                lock0: lockType[await BitHelper.readByte(data)],
                lock1: lockType[await BitHelper.readByte(data)],
            };
        }, 
        exec: (id, data, snapshot) => {
            const weakDoors = snapshot.getOrDefault("Vanilla.Map.WeakDoor", Factory("Map"));
    
            if (!weakDoors.has(id)) throw new Error(`WeakDoor of id '${id}' was not found.`);
            const weakDoor = weakDoors.get(id)!;
            weakDoor.health = (data.health / 255) * weakDoor.maxHealth;
            weakDoor.lock0 = data.lock0;
            weakDoor.lock1 = data.lock1;
        }
    },
    spawn: {
        parse: async (data) => {
            return {
                maxHealth: await BitHelper.readHalf(data),
                lock0: lockType[await BitHelper.readByte(data)],
                lock1: lockType[await BitHelper.readByte(data)],
            };
        },
        exec: (id, data, snapshot) => {
            const weakDoors = snapshot.getOrDefault("Vanilla.Map.WeakDoor", Factory("Map"));
        
            if (weakDoors.has(id)) throw new Error(`WeakDoor of id '${id}' already exists.`);
            weakDoors.set(id, { 
                id, ...data,
                lastPunch: -Infinity,
                health: data.maxHealth
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const weakDoors = snapshot.getOrDefault("Vanilla.Map.WeakDoor", Factory("Map"));

            if (!weakDoors.has(id)) throw new Error(`WeakDoor of id '${id}' did not exist.`);
            weakDoors.delete(id);
        }
    }
});

ModuleLoader.registerEvent("Vanilla.Map.WeakDoor.Punch", "0.0.1", {
    parse: async (data) => {
        return {
            id: await BitHelper.readInt(data)
        };
    },
    exec: (data, snapshot) => {
        const weakDoors = snapshot.getOrDefault("Vanilla.Map.WeakDoor", Factory("Map"));
        const id = data.id;
        if (!weakDoors.has(id)) throw new Error(`WeakDoor of id '${id}' was not found.`);
        const weakDoor = weakDoors.get(id)!;
        weakDoor.lastPunch = snapshot.time();
    }
});

ModuleLoader.registerEvent("Vanilla.Map.DoorStatusChange", "0.0.1", {
    parse: async (data) => {
        return {
            id: await BitHelper.readInt(data),
            status: doorStatus[await BitHelper.readByte(data)]
        };
    },
    exec: (data, snapshot) => {
        const doors = snapshot.getOrDefault("Vanilla.Map.DoorState", Factory("Map"));

        const { id, status } = data;
        const exists = doors.has(id);
        if (!exists) doors.set(id, { id, status });
        const door = doors.get(id)!;
        if (door.status !== "Glued") {
            door.change = snapshot.time();
        }
        door.status = status;
    }
});