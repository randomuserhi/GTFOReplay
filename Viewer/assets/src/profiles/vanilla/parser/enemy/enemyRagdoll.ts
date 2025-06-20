// NOTE(randomuserhi): The renderer for ragdolls is integrated into vanilla player model for ease of implementation

import { Enemy } from "@asl/vanilla/parser/enemy/enemy.js";
import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Factory } from "../../library/factory.js";
import { DynamicTransform } from "../../library/helpers.js";
import { HumanJoints } from "../../renderer/animations/human.js";
import { Identifier, IdentifierData } from "../identifier.js";
import { AnimHandles } from "./animation.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Enemy.Ragdoll": {
                parse: DynamicTransform.Parse & {
                    avatar: EnemyRagdoll["avatar"];
                };
                spawn: DynamicTransform.Spawn & {
                    animHandle?: AnimHandles.Flags;
                    scale: number;
                    type: Identifier;
                    maxHealth: number;
                    head: boolean;
                    avatar: EnemyRagdoll["avatar"];
                };
                despawn: void;
            };
        }
    
        interface Data {
            "Vanilla.Enemy.Ragdoll": Map<number, EnemyRagdoll>
        }
    }
}

export interface EnemyRagdoll extends Enemy, DynamicTransform.Type {
    avatar: Partial<Record<HumanJoints, Pod.Vector>>;
}

let enemyRagdoll = ModuleLoader.registerDynamic("Vanilla.Enemy.Ragdoll", "0.0.1", {
    main: {
        parse: async (data) => {
            const transform = await DynamicTransform.parse(data);
            return {
                ...transform,
                avatar: {
                    hip: await BitHelper.readHalfVector(data),

                    leftUpperLeg: await BitHelper.readHalfVector(data),
                    leftLowerLeg: await BitHelper.readHalfVector(data),
                    leftFoot: await BitHelper.readHalfVector(data),

                    rightUpperLeg: await BitHelper.readHalfVector(data),
                    rightLowerLeg: await BitHelper.readHalfVector(data),
                    rightFoot: await BitHelper.readHalfVector(data),

                    spine1: await BitHelper.readHalfVector(data),

                    leftShoulder:await BitHelper.readHalfVector(data),
                    leftUpperArm: await BitHelper.readHalfVector(data),
                    leftLowerArm: await BitHelper.readHalfVector(data),
                    leftHand: await BitHelper.readHalfVector(data),

                    rightShoulder: await BitHelper.readHalfVector(data),
                    rightUpperArm:await BitHelper.readHalfVector(data),
                    rightLowerArm: await BitHelper.readHalfVector(data),
                    rightHand: await BitHelper.readHalfVector(data),

                    neck: await BitHelper.readHalfVector(data),
                    head: await BitHelper.readHalfVector(data),
                }
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const ragdolls = snapshot.getOrDefault("Vanilla.Enemy.Ragdoll", Factory("Map"));

            if (!ragdolls.has(id)) throw new Error(`Dynamic of id '${id}' did not exist.`);
            const ragdoll = ragdolls.get(id)!;

            DynamicTransform.lerp(ragdoll, data, lerp);

            for (const joint of HumanJoints) {
                if (ragdoll.avatar[joint] === undefined || data.avatar[joint] === undefined) continue;
                Pod.Vec.lerp(ragdoll.avatar[joint]!, ragdoll.avatar[joint]!, data.avatar[joint]!, lerp);
            }
        }
    },
    spawn: {
        parse: async (data, snapshot) => {
            const spawn = await DynamicTransform.spawn(data);
            return {
                ...spawn,
                animHandle: AnimHandles.FlagMap.get(await BitHelper.readUShort(data)),
                scale: await BitHelper.readHalf(data),
                type: await Identifier.parse(IdentifierData(snapshot), data),
                maxHealth: await BitHelper.readHalf(data),
                head: true,
                avatar: {
                    hip: await BitHelper.readHalfVector(data),

                    leftUpperLeg: await BitHelper.readHalfVector(data),
                    leftLowerLeg: await BitHelper.readHalfVector(data),
                    leftFoot: await BitHelper.readHalfVector(data),

                    rightUpperLeg: await BitHelper.readHalfVector(data),
                    rightLowerLeg: await BitHelper.readHalfVector(data),
                    rightFoot: await BitHelper.readHalfVector(data),

                    spine1: await BitHelper.readHalfVector(data),

                    leftShoulder:await BitHelper.readHalfVector(data),
                    leftUpperArm: await BitHelper.readHalfVector(data),
                    leftLowerArm: await BitHelper.readHalfVector(data),
                    leftHand: await BitHelper.readHalfVector(data),

                    rightShoulder: await BitHelper.readHalfVector(data),
                    rightUpperArm:await BitHelper.readHalfVector(data),
                    rightLowerArm: await BitHelper.readHalfVector(data),
                    rightHand: await BitHelper.readHalfVector(data),

                    neck: await BitHelper.readHalfVector(data),
                    head: await BitHelper.readHalfVector(data),
                }
            };
        },
        exec: (id, data, snapshot) => {
            const ragdolls = snapshot.getOrDefault("Vanilla.Enemy.Ragdoll", Factory("Map"));
        
            if (ragdolls.has(id)) throw new Error(`Dynamic of id '${id}' already exists.`);
            ragdolls.set(id, { 
                id, 
                ...data, 
                health: 0,
                players: new Set(),
                tagged: false,
                consumedPlayerSlotIndex: 255,
                targetPlayerSlotIndex: 255,
                stagger: Infinity,
                canStagger: true 
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const ragdolls = snapshot.getOrDefault("Vanilla.Enemy.Ragdoll", Factory("Map"));

            if (!ragdolls.has(id)) throw new Error(`Dynamic of id '${id}' did not exist.`);
            ragdolls.delete(id);
        }
    }
});
enemyRagdoll = ModuleLoader.registerDynamic("Vanilla.Enemy.Ragdoll", "0.0.2", {
    ...enemyRagdoll,
    spawn: {
        ...enemyRagdoll.spawn,
        parse: async (data, snapshot) => {
            const spawn = await DynamicTransform.spawn(data);
            return {
                ...spawn,
                animHandle: AnimHandles.FlagMap.get(await BitHelper.readUShort(data)),
                scale: await BitHelper.readHalf(data),
                type: await Identifier.parse(IdentifierData(snapshot), data),
                maxHealth: await BitHelper.readHalf(data),
                head: await BitHelper.readBool(data),
                avatar: {
                    hip: await BitHelper.readHalfVector(data),

                    leftUpperLeg: await BitHelper.readHalfVector(data),
                    leftLowerLeg: await BitHelper.readHalfVector(data),
                    leftFoot: await BitHelper.readHalfVector(data),

                    rightUpperLeg: await BitHelper.readHalfVector(data),
                    rightLowerLeg: await BitHelper.readHalfVector(data),
                    rightFoot: await BitHelper.readHalfVector(data),

                    spine1: await BitHelper.readHalfVector(data),

                    leftShoulder:await BitHelper.readHalfVector(data),
                    leftUpperArm: await BitHelper.readHalfVector(data),
                    leftLowerArm: await BitHelper.readHalfVector(data),
                    leftHand: await BitHelper.readHalfVector(data),

                    rightShoulder: await BitHelper.readHalfVector(data),
                    rightUpperArm:await BitHelper.readHalfVector(data),
                    rightLowerArm: await BitHelper.readHalfVector(data),
                    rightHand: await BitHelper.readHalfVector(data),

                    neck: await BitHelper.readHalfVector(data),
                    head: await BitHelper.readHalfVector(data),
                }
            };
        },
    },
});