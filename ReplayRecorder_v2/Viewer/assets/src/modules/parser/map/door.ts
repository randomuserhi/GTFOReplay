import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";
import { DuplicateHeaderData, Dynamic } from "../../parser/replayrecorder.js";

export type DoorType = 
    "WeakDoor" |
    "SecurityDoor" |
    "BulkheadDoor" |
    "BulkheadDoorMain" |
    "ApexDoor"; 
const doorTypemap: DoorType[] = [
    "WeakDoor",
    "SecurityDoor",
    "BulkheadDoor",
    "BulkheadDoorMain",
    "ApexDoor"
];

export type DoorStatus = 
    "Closed" |
    "Open" |
    "Glued" |
    "Destroyed";
const doorStatusTypemap: DoorStatus[] = [
    "Closed",
    "Open",
    "Glued",
    "Destroyed"
];

export type DoorSize = 
    "Small" |
    "Medium" |
    "Large";
const doorSizeTypemap: DoorSize[] = [
    "Small",
    "Medium",
    "Large"
];

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

export interface DoorState extends Dynamic {
    status: DoorStatus;
    change?: number; // when the status change occured
}

export interface WeakDoor extends Dynamic {
    maxHealth: number;
    health: number;
    lock0: LockType;
    lock1: LockType;
}

export interface DoorStatusChange {
    id: number;
    status: DoorStatus;
}

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Map.Doors": Map<number, Door>;
        }

        interface Events {
            "Vanilla.Map.DoorStatusChange": DoorStatusChange;
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
            const type = doorTypemap[await BitHelper.readByte(data)];
            const size = doorSizeTypemap[await BitHelper.readByte(data)];

            doors.set(id, {
                id,
                dimension, position, rotation,
                serialNumber, isCheckpoint, type, size,
            });
        }

        if (header.has("Vanilla.Map.Doors")) throw new DuplicateHeaderData("Doors was already written.");
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
            const weakDoors = snapshot.getOrDefault("Vanilla.Map.WeakDoor", () => new Map());
    
            if (!weakDoors.has(id)) throw new DoorNotFound(`WeakDoor of id '${id}' was not found.`);
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
            const weakDoors = snapshot.getOrDefault("Vanilla.Map.WeakDoor", () => new Map());
        
            if (weakDoors.has(id)) throw new DuplicateDoor(`WeakDoor of id '${id}' already exists.`);
            weakDoors.set(id, { 
                id, ...data,
                health: data.maxHealth
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const weakDoors = snapshot.getOrDefault("Vanilla.Map.WeakDoor", () => new Map());

            if (!weakDoors.has(id)) throw new DoorNotFound(`WeakDoor of id '${id}' did not exist.`);
            weakDoors.delete(id);
        }
    }
});

ModuleLoader.registerEvent("Vanilla.Map.DoorStatusChange", "0.0.1", {
    parse: async (data) => {
        return {
            id: await BitHelper.readInt(data),
            status: doorStatusTypemap[await BitHelper.readByte(data)]
        };
    },
    exec: (data, snapshot) => {
        const doors = snapshot.getOrDefault("Vanilla.Map.DoorState", () => new Map());

        const { id, status } = data;
        const exists = doors.has(id);
        if (!exists) doors.set(id, { id, status });
        const door = doors.get(id)!;
        if (exists && door.status === status) throw new Error("Door state event triggered when door state hasn't changed.");
        if (door.status !== "Glued") {
            door.change = snapshot.time();
        }
        door.status = status;
    }
});

class DoorNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

class DuplicateDoor extends Error {
    constructor(message?: string) {
        super(message);
    }
}