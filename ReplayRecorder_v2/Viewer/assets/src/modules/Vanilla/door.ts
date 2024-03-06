import { BoxGeometry, Mesh, MeshPhongMaterial, Quaternion, Vector3 } from "three";
import * as BitHelper from "../../replay/bithelper.js";
import { ModuleLoader } from "../../replay/moduleloader.js";
import { DuplicateHeaderData, Dynamic, DynamicTransform, HeaderNotFound } from "../replayrecorder.js";

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

export interface Door extends DynamicTransform {
    serialNumber: number;
    isCheckpoint: boolean;
    type: DoorType;
    size: DoorSize;
    status: DoorStatus;
}

export interface WeakDoor extends Dynamic {
    maxHealth: number;
    health: number;
}

export interface DoorStatusChange {
    id: number;
    status: DoorStatus;
}

declare module "../../replay/moduleloader.js" {
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
                };
                spawn: {
                    maxHealth: number;
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Map.WeakDoor": Map<number, WeakDoor>
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
                status: "Closed"
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
                health: await BitHelper.readByte(data)
            };
        }, 
        exec: (id, data, snapshot) => {
            const weakDoors = snapshot.getOrDefault("Vanilla.Map.WeakDoor", () => new Map());
    
            if (!weakDoors.has(id)) throw new DoorNotFound(`WeakDoor of id '${id}' was not found.`);
            const weakDoor = weakDoors.get(id)!;
            weakDoor.health = (data.health / 255) * weakDoor.maxHealth;
        }
    },
    spawn: {
        parse: async (data) => {
            return {
                maxHealth: await BitHelper.readHalf(data)
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
        const doors = snapshot.header.get("Vanilla.Map.Doors");
        if (doors === undefined) throw new HeaderNotFound(`Could not find header 'Vanilla.Map.Doors'.`); 

        const { id, status } = data;
        if (!doors.has(id)) throw new DoorNotFound(`Door of id '${id}' did not exist.`);
        doors.get(id)!.status = status;
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

// --------------------------- RENDERING ---------------------------

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.Doors": void;
        }

        interface RenderData {
            "Doors": Map<number, Mesh>;
            "DoorDimension": number;
        }
    }
}

// TODO(randomuserhi): Proper door models
ModuleLoader.registerRender("Vanilla.Doors", (name, api) => {
    const initPasses = api.getInitPasses();
    api.setInitPasses([{ 
        name, pass: (renderer, header) => {
            const doors = header.getOrDefault("Vanilla.Map.Doors", () => new Map());
            const models = renderer.getOrDefault("Doors", () => new Map());
            for (const [id, door] of doors) {
                if (!models.has(id)) {
                    const geometry = new BoxGeometry( 0.5, 0.5, 0.5 );
                    const material = new MeshPhongMaterial({
                        color: 0x00ff00
                    });

                    const model = new Mesh(geometry, material);
                    model.castShadow = true;
                    model.receiveShadow = true;

                    models.set(id, model);
                    renderer.scene.add(model);
                }

                const model = models.get(id)!;
                const offset = new Vector3(0, 1, 0);
                model.position.set(door.position.x, door.position.y, door.position.z);
                model.position.add(offset);
                model.setRotationFromQuaternion(new Quaternion(door.rotation.x, door.rotation.y, door.rotation.z, door.rotation.w));
                model.visible = false;
            }
        } 
    }, ...initPasses]);

    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([{ 
        name, pass: (renderer, snapshot) => {
            const doors = snapshot.header.getOrDefault("Vanilla.Map.Doors", () => new Map());
            const models = renderer.getOrDefault("Doors", () => new Map());
            for (const [id, door] of doors) {
                const model = models.get(id)!;
                let color = 0x00ff00;
                switch (door.status) {
                case "Open": color = 0xff0000; break;
                case "Closed": color = 0x00ff; break;
                case "Glued": color = 0x0000ff; break;
                case "Destroyed": color = 0x000000; break;
                }
                (model.material as MeshPhongMaterial).color.setHex(color);
                model.visible = door.dimension === renderer.get("Dimension");
            }
        } 
    }, ...renderLoop]);
});