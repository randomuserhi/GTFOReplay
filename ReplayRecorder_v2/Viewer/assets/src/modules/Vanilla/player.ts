import { Color, ColorRepresentation, Group, Matrix4, Quaternion, Vector3 } from "three";
import * as BitHelper from "../../replay/bithelper.js";
import { getInstance } from "../../replay/instancing.js";
import { ModuleLoader } from "../../replay/moduleloader.js";
import * as Pod from "../../replay/pod.js";
import { ByteStream } from "../../replay/stream.js";
import { DuplicateDynamic, DynamicNotFound, DynamicTransform } from "../replayrecorder.js";
import { Equippable } from "./equippable.js";
import { Skeleton, SkeletonModel, upV, zeroQ, zeroV } from "./model.js";
import { specification } from "./specification.js";

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Player": {
                parse: {
                    dimension: number;
                    absolute: boolean;
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                    equippedId: number;
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
            
            "Vanilla.Player.Backpack": {
                parse: {
                    slots: number[];
                };
                spawn: {
                    slots: number[];
                };
                despawn: void;
            };

            "Vanilla.Player.Model": {
                parse: PlayerSkeleton;
                spawn: PlayerSkeleton;
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Player": Map<number, Player>;
            "Vanilla.Player.Backpack": Map<number, PlayerBackpack>;
            "Vanilla.Player.Model": Map<number, PlayerSkeleton>;
        }
    }
}

export interface PlayerSkeleton extends Skeleton {
    backpackPos: Pod.Vector;
    backpackRot: Pod.Quaternion;

    wieldedPos: Pod.Vector;
    wieldedRot: Pod.Quaternion;
    foldRot: Pod.Quaternion;
}

export type InventorySlot = 
    "melee" |
    "main"  |
    "special" |
    "tool" |
    "pack";
export const inventorySlots: InventorySlot[] = [
    "melee",
    "main",
    "special",
    "tool",
    "pack"
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

            if (!backpacks.has(id)) throw new BackpackNotFound(`Player of id '${id}' did not exist.`);
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

export interface Player extends DynamicTransform {
    snet: bigint;
    slot: number;
    nickname: string;
    equippedId: number;

    meleeShove?: number;
    meleeSwing?: number; 
}

ModuleLoader.registerDynamic("Vanilla.Player", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicTransform.parse(data);
            return {
                ...result,
                equippedId: await BitHelper.readUShort(data),
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
    
            if (!players.has(id)) throw new PlayerNotFound(`Dynamic of id '${id}' was not found.`);
            const player = players.get(id)!;
            DynamicTransform.lerp(player, data, lerp);
            player.equippedId = data.equippedId;
        }
    },
    spawn: {
        parse: async (data) => {
            const spawn = await DynamicTransform.parseSpawn(data);
            const result = {
                ...spawn,
                snet: await BitHelper.readULong(data),
                slot: await BitHelper.readByte(data),
                nickname: await BitHelper.readString(data)
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
        
            const { snet } = data;
        
            if (players.has(id)) throw new DuplicatePlayer(`Player of id '${id}(${snet})' already exists.`);
            players.set(id, { 
                id, ...data,
                equippedId: 0,
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());

            if (!players.has(id)) throw new PlayerNotFound(`Player of id '${id}' did not exist.`);
            players.delete(id);
        }
    }
});

ModuleLoader.registerDynamic("Vanilla.Player.Model", "0.0.1", {
    main: {
        parse: async (data) => {
            const skeleton = await Skeleton.parse(data);
            return {
                ...skeleton,
                backpackPos: await BitHelper.readHalfVector(data),
                backpackRot: await BitHelper.readHalfQuaternion(data),

                wieldedPos: await BitHelper.readHalfVector(data),
                wieldedRot: await BitHelper.readHalfQuaternion(data),
                foldRot: await BitHelper.readHalfQuaternion(data)
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const skeletons = snapshot.getOrDefault("Vanilla.Player.Model", () => new Map());
    
            if (!skeletons.has(id)) throw new DynamicNotFound(`Skeleton of id '${id}' was not found.`);
            const skeleton = skeletons.get(id)!;
            Skeleton.lerp(skeleton, data, lerp);
            skeleton.backpackPos = Pod.Vec.lerp(skeleton.backpackPos, data.backpackPos, lerp);
            skeleton.backpackRot = Pod.Quat.slerp(skeleton.backpackRot, data.backpackRot, lerp);

            skeleton.wieldedPos = Pod.Vec.lerp(skeleton.wieldedPos, data.wieldedPos, lerp);
            skeleton.wieldedRot = Pod.Quat.slerp(skeleton.wieldedRot, data.wieldedRot, lerp);
            skeleton.foldRot = Pod.Quat.slerp(skeleton.foldRot, data.foldRot, lerp);
        }
    },
    spawn: {
        parse: async (data) => {
            const skeleton = await Skeleton.parse(data);
            return {
                ...skeleton,
                backpackPos: await BitHelper.readHalfVector(data),
                backpackRot: await BitHelper.readHalfQuaternion(data),
                
                wieldedPos: await BitHelper.readHalfVector(data),
                wieldedRot: await BitHelper.readHalfQuaternion(data),
                foldRot: await BitHelper.readHalfQuaternion(data)
            };
        },
        exec: (id, data, snapshot) => {
            const skeletons = snapshot.getOrDefault("Vanilla.Player.Model", () => new Map());
        
            if (skeletons.has(id)) throw new DuplicateDynamic(`Skeleton of id '${id}' already exists.`);
            skeletons.set(id, data);
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const skeletons = snapshot.getOrDefault("Vanilla.Player.Model", () => new Map());

            if (!skeletons.has(id)) throw new DynamicNotFound(`Skeleton of id '${id}' did not exist.`);
            skeletons.delete(id);
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

// --------------------------- RENDERING ---------------------------


declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Players": void;
        }

        interface RenderData {
            "Players": Map<number, PlayerModel>;
        }
    }
}

class PlayerModel extends SkeletonModel {
    equipped: Group;

    slots: Equippable[];
    backpack: Group;
    backpackAligns: Group[];

    constructor(color: Color) {
        super(color);

        this.equipped = new Group();
        this.backpack = new Group();
        this.group.add(this.equipped, this.backpack);
        
        this.slots = new Array(inventorySlots.length);
        this.backpackAligns = new Array(inventorySlots.length);
        for (let i = 0; i < inventorySlots.length; ++i) {
            this.slots[i] = { id: 0 };

            this.backpackAligns[i] = new Group();
            this.backpack.add(this.backpackAligns[i]);
        }

        this.backpackAligns[inventorySlotMap.get("melee")!].position.set(0.03, 0.01130009, -0.5089508);
        this.backpackAligns[inventorySlotMap.get("melee")!].rotateX(Math.PI);

        this.backpackAligns[inventorySlotMap.get("main")!].position.set(-0.15, 0.078, -0.395);
        this.backpackAligns[inventorySlotMap.get("main")!].quaternion.set(0.5, -0.5, 0.5, 0.5);

        this.backpackAligns[inventorySlotMap.get("special")!].position.set(0.159, 0.07800007, -0.223);
        this.backpackAligns[inventorySlotMap.get("special")!].quaternion.set(0.704416037, 0.0616284497, -0.0616284497, 0.704416037);

        this.backpackAligns[inventorySlotMap.get("tool")!].position.set(-0.295, 0.07800007, -0.318);
        this.backpackAligns[inventorySlotMap.get("tool")!].quaternion.set(0.0979499891, 0.700289905, -0.700289726, 0.0979499221);

        this.backpackAligns[inventorySlotMap.get("pack")!].position.set(-0.003, -0.2, -0.24);
        this.backpackAligns[inventorySlotMap.get("pack")!].quaternion.set(0, -0.263914526, 0, 0.964546144);
        this.backpackAligns[inventorySlotMap.get("pack")!].scale.set(0.7, 0.7, 0.7);
    }

    public update(skeleton: PlayerSkeleton): void {
        if (!this.group.visible) return;

        super.update(skeleton);

        const x = this.group.position.x;
        const y = this.group.position.y;
        const z = this.group.position.z;

        this.backpack.position.set(skeleton.backpackPos.x, skeleton.backpackPos.y, skeleton.backpackPos.z);
        this.backpack.quaternion.set(skeleton.backpackRot.x, skeleton.backpackRot.y, skeleton.backpackRot.z, skeleton.backpackRot.w);

        this.equipped.position.set(skeleton.wieldedPos.x, skeleton.wieldedPos.y, skeleton.wieldedPos.z);
        this.equipped.quaternion.set(skeleton.wieldedRot.x, skeleton.wieldedRot.y, skeleton.wieldedRot.z, skeleton.wieldedRot.w);
        for (let i = 0; i < this.slots.length; ++i) {
            const item = this.slots[i];
            if (item.model !== undefined) {
                const isEquipped = item.model.group.parent !== null && item.model.group.parent.id == this.equipped.id;
                item.model.update(isEquipped ? skeleton.foldRot : item.model.baseFoldRot);
            }
        }

        const radius = 0.05;
        const sM = new Vector3(radius, radius, radius);

        const bodyTop = Pod.Vec.mid(skeleton.LULeg, skeleton.RULeg);
        bodyTop.x += x;
        bodyTop.y += y;
        bodyTop.z += z;
        const bodyBottom = { x: skeleton.head.x + x, y: skeleton.head.y + y, z: skeleton.head.z + z };

        const pM = new Matrix4();
        pM.lookAt(new Vector3(bodyBottom.x, bodyBottom.y, bodyBottom.z).sub(bodyTop), zeroV, upV);
        getInstance("Cylinder.MeshPhong").setMatrixAt(this.parts[0], pM.compose(new Vector3(bodyTop.x, bodyTop.y, bodyTop.z), new Quaternion().setFromRotationMatrix(pM), new Vector3(radius, radius, Pod.Vec.dist(bodyTop, bodyBottom) * 0.7)));

        const spheres = getInstance("Sphere.MeshPhong");
        spheres.setMatrixAt(this.points[0], pM.compose(new Vector3(bodyTop.x, bodyTop.y, bodyTop.z), zeroQ, sM));
        spheres.setMatrixAt(this.points[1], pM.compose(new Vector3(bodyTop.x + (bodyBottom.x - bodyTop.x) * 0.7, bodyTop.y + (bodyBottom.y - bodyTop.y) * 0.7, bodyTop.z + (bodyBottom.z - bodyTop.z) * 0.7), zeroQ, sM));
    }

    public morph(player: Player, backpack?: PlayerBackpack): void {
        this.group.position.set(player.position.x, player.position.y, player.position.z);

        if (backpack === undefined) return;

        for (let i = 0; i < this.slots.length; ++i) {
            const item = this.slots[i];
            if (item.model !== undefined) {
                item.model.group.removeFromParent();
            }

            if (item.model === undefined || backpack.slots[i] !== item.id) {
                item.id = backpack.slots[i];
                item.model = specification.equippable.get(backpack.slots[i])?.model();
            }

            if (item.model !== undefined) {
                if (item.id === player.equippedId) {
                    this.equipped.add(item.model.group);
                    item.model.group.position.set(0, 0, 0);
                    item.model.group.quaternion.set(0, 0, 0, 1);
                } else {
                    this.backpackAligns[i].add(item.model.group);
                    item.model.group.position.copy(item.model.offsetPos);
                    item.model.group.quaternion.copy(item.model.offsetRot);
                }
            }
        }
    }
}

export const playerColors: ColorRepresentation[] = [
    0xc21f4e,
    0x18935e,
    0x20558c,
    0x7a1a8e
];

ModuleLoader.registerRender("Players", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Players", () => new Map());
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
            const backpacks = snapshot.getOrDefault("Vanilla.Player.Backpack", () => new Map());
            const skeletons = snapshot.getOrDefault("Vanilla.Player.Model", () => new Map());
            for (const [id, player] of players) {
                if (!models.has(id)) {
                    const model = new PlayerModel(new Color(playerColors[player.slot]));
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                const skeleton = skeletons.get(id);
                if (skeleton !== undefined) {
                    model.morph(player, backpacks.get(id));
                    model.update(skeleton);
                } else {
                    // TODO
                }
                model.setVisible(player.dimension === renderer.get("Dimension"));
            }

            for (const [id, model] of [...models.entries()]) {
                if (!players.has(id)) {
                    model.removeFromScene(renderer.scene);
                    models.delete(id);
                }
            }
        } 
    }]);
});