import { Color, ColorRepresentation, Group, Matrix4, Quaternion, Vector3 } from "three";
import * as BitHelper from "../../replay/bithelper.js";
import { getInstance } from "../../replay/instancing.js";
import { ModuleLoader } from "../../replay/moduleloader.js";
import * as Pod from "../../replay/pod.js";
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
                    state: PlayerState;
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

            "Vanilla.Player.Model": {
                parse: PlayerSkeleton;
                spawn: PlayerSkeleton;
                despawn: void;
            };
        }
    
        interface Events {
            "Vanilla.Player.Melee": {
                id: number;
                melee: MeleeState;
            }
            "Vanilla.Player.MeleeShove": {
                id: number;
            }
            "Vanilla.Player.MeleeSwing": {
                id: number;
            }
        }

        interface Data {
            "Vanilla.Player": Map<number, Player>
            "Vanilla.Player.Model": Map<number, PlayerSkeleton>
        }
    }
}

export interface PlayerSkeleton extends Skeleton {
    wieldedPos: Pod.Vector;
    wieldedRot: Pod.Quaternion;
}

export interface Player extends DynamicTransform {
    snet: bigint;
    slot: number;
    nickname: string;
    state: PlayerState;
    equippedId: number;

    melee: MeleeState;
    meleeShove?: number;
    meleeSwing?: number; 
}

type PlayerState = 
    "Default" |
    "Crouch" |
    "Downed" |
    "Jump/Fall"; 
const playerStateTypemap: PlayerState[] = [
    "Default",
    "Crouch",
    "Downed",
    "Jump/Fall"
];

type MeleeState = 
    "Idle" |
    "Charge";
const meleeStateTypemap: MeleeState[] = [
    "Idle",
    "Charge"
];

ModuleLoader.registerDynamic("Vanilla.Player", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicTransform.parse(data);
            return {
                ...result,
                state: playerStateTypemap[await BitHelper.readByte(data)],
                equippedId: await BitHelper.readUShort(data)
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
    
            if (!players.has(id)) throw new PlayerNotFound(`Dynamic of id '${id}' was not found.`);
            const player = players.get(id)!;
            DynamicTransform.lerp(player, data, lerp);
            player.state = data.state;
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
                state: "Default", 
                melee: "Idle", 
                equippedId: 0 
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
                wieldedPos: await BitHelper.readHalfVector(data),
                wieldedRot: await BitHelper.readHalfQuaternion(data)
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const skeletons = snapshot.getOrDefault("Vanilla.Player.Model", () => new Map());
    
            if (!skeletons.has(id)) throw new DynamicNotFound(`Skeleton of id '${id}' was not found.`);
            const skeleton = skeletons.get(id)!;
            Skeleton.lerp(skeleton, data, lerp);
            skeleton.wieldedPos = Pod.Vec.lerp(skeleton.wieldedPos, data.wieldedPos, lerp);
            skeleton.wieldedRot = Pod.Quat.slerp(skeleton.wieldedRot, data.wieldedRot, lerp);
        }
    },
    spawn: {
        parse: async (data) => {
            const skeleton = await Skeleton.parse(data);
            return {
                ...skeleton,
                wieldedPos: await BitHelper.readHalfVector(data),
                wieldedRot: await BitHelper.readHalfQuaternion(data)
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

ModuleLoader.registerEvent("Vanilla.Player.Melee", "0.0.1", {
    parse: async (data) => {
        return {
            id: await BitHelper.readInt(data),
            melee: meleeStateTypemap[await BitHelper.readByte(data)]
        };
    },
    exec: (data, snapshot) => {
        const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());

        const { id, melee } = data;
        if (!players.has(id)) throw new PlayerNotFound(`Player of id '${id}' did not exist.`);
        players.get(id)!.melee = melee;
    }
});

ModuleLoader.registerEvent("Vanilla.Player.MeleeShove", "0.0.1", {
    parse: async (data) => {
        return {
            id: await BitHelper.readInt(data)
        };
    },
    exec: (data, snapshot) => {
        const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());

        const { id } = data;
        if (!players.has(id)) throw new PlayerNotFound(`Player of id '${id}' did not exist.`);
        players.get(id)!.meleeShove = snapshot.time();
    }
});

ModuleLoader.registerEvent("Vanilla.Player.MeleeSwing", "0.0.1", {
    parse: async (data) => {
        return {
            id: await BitHelper.readInt(data)
        };
    },
    exec: (data, snapshot) => {
        const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());

        const { id } = data;
        if (!players.has(id)) throw new PlayerNotFound(`Player of id '${id}' did not exist.`);
        players.get(id)!.meleeSwing = snapshot.time();
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

    equippedModel: Equippable;

    constructor(color: Color) {
        super(color);

        this.equipped = new Group();

        this.group.add(this.equipped);

        this.equippedModel = { id: 0 };
    }

    public update(skeleton: PlayerSkeleton): void {
        if (!this.group.visible) return;

        super.update(skeleton);

        const x = this.group.position.x;
        const y = this.group.position.y;
        const z = this.group.position.z;

        this.equipped.position.set(skeleton.wieldedPos.x, skeleton.wieldedPos.y, skeleton.wieldedPos.z);
        this.equipped.quaternion.set(skeleton.wieldedRot.x, skeleton.wieldedRot.y, skeleton.wieldedRot.z, skeleton.wieldedRot.w);

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

    public morph(player: Player): void {
        this.group.position.set(player.position.x, player.position.y, player.position.z);

        if (this.equippedModel.model != undefined) {
            this.equipped.remove(this.equippedModel.model.group);
        }

        if (this.equippedModel.model == undefined || player.equippedId != this.equippedModel.id) {
            this.equippedModel.id = player.equippedId;
            this.equippedModel.model = specification.equippable.get(player.equippedId)?.model();
        }

        if (this.equippedModel.model != undefined) {
            this.equipped.add(this.equippedModel.model.group);
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
                    model.morph(player);
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