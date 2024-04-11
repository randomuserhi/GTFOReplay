import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";
import { DuplicateDynamic, DynamicNotFound, DynamicTransform } from "../../replayrecorder.js";
import { Skeleton } from "../humanmodel.js";

declare module "../../../replay/moduleloader.js" {
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

            "Vanilla.Player.Model": {
                parse: PlayerSkeleton;
                spawn: PlayerSkeleton;
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Player": Map<number, Player>;
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
                nickname: (await BitHelper.readString(data)).replace(/<\/?[^>]+(>|$)/g, "")
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
    
            if (!skeletons.has(id)) return;//throw new DynamicNotFound(`Skeleton of id '${id}' was not found.`);
            const skeleton = skeletons.get(id)!;
            Skeleton.lerp(skeleton, data, lerp);
            Pod.Vec.lerp(skeleton.backpackPos, skeleton.backpackPos, data.backpackPos, lerp);
            Pod.Quat.slerp(skeleton.backpackRot, skeleton.backpackRot, data.backpackRot, lerp);

            Pod.Vec.lerp(skeleton.wieldedPos, skeleton.wieldedPos, data.wieldedPos, lerp);
            Pod.Quat.slerp(skeleton.wieldedRot, skeleton.wieldedRot, data.wieldedRot, lerp);
            Pod.Quat.slerp(skeleton.foldRot, skeleton.foldRot, data.foldRot, lerp);
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