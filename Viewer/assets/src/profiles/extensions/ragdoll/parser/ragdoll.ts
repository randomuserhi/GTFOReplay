// NOTE(randomuserhi): The renderer for ragdolls is integrated into vanilla player model for ease of implementation

import { AvatarLike } from "@asl/vanilla/library/animations/lib.js";
import { Factory } from "@asl/vanilla/library/factory.js";
import { HumanJoints } from "@asl/vanilla/renderer/animations/human.js";
import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "RagdollMode.Ragdoll": {
                parse: {
                    enabled: boolean;
                    avatar?: AvatarLike<HumanJoints>;
                };
                spawn: void;
                despawn: void;
            };
        }
    
        interface Data {
            "RagdollMode.Ragdoll": Map<number, Ragdoll>
        }
    }
}

export interface Ragdoll {
    enabled: boolean;
    avatar?: AvatarLike<HumanJoints>;
}

ModuleLoader.registerDynamic("RagdollMode.Ragdoll", "0.0.1", {
    main: {
        parse: async (data) => {
            const result: Ragdoll = {
                enabled: await BitHelper.readBool(data),
            };
            if (result.enabled) {
                result.avatar = {
                    root: { x: 0, y: 0, z: 0 },
                    joints: {
                        hip: await BitHelper.readHalfQuaternion(data),

                        leftUpperLeg: await BitHelper.readHalfQuaternion(data),
                        leftLowerLeg: await BitHelper.readHalfQuaternion(data),
                        leftFoot: await BitHelper.readHalfQuaternion(data),

                        rightUpperLeg: await BitHelper.readHalfQuaternion(data),
                        rightLowerLeg: await BitHelper.readHalfQuaternion(data),
                        rightFoot: await BitHelper.readHalfQuaternion(data),

                        spine0: await BitHelper.readHalfQuaternion(data),
                        spine1: await BitHelper.readHalfQuaternion(data),
                        spine2: await BitHelper.readHalfQuaternion(data),

                        leftShoulder: await BitHelper.readHalfQuaternion(data),
                        leftUpperArm: await BitHelper.readHalfQuaternion(data),
                        leftLowerArm: await BitHelper.readHalfQuaternion(data),
                        leftHand: await BitHelper.readHalfQuaternion(data),

                        rightShoulder: await BitHelper.readHalfQuaternion(data),
                        rightUpperArm: await BitHelper.readHalfQuaternion(data),
                        rightLowerArm: await BitHelper.readHalfQuaternion(data),
                        rightHand: await BitHelper.readHalfQuaternion(data),

                        neck: await BitHelper.readHalfQuaternion(data),
                        head: await BitHelper.readHalfQuaternion(data),
                    }
                };
            }
            return result;
        }, 
        exec: (id, data, snapshot, lerp) => {
            const ragdolls = snapshot.getOrDefault("RagdollMode.Ragdoll", Factory("Map"));

            if (!ragdolls.has(id)) throw new Error(`Dynamic of id '${id}' did not exist.`);
            const ragdoll = ragdolls.get(id)!;

            ragdoll.enabled = data.enabled;

            if (ragdoll.avatar === undefined || data.avatar === undefined) {
                ragdoll.avatar = data.avatar;
            } else {
                for (const joint of HumanJoints) {
                    Pod.Quat.slerp(ragdoll.avatar.joints[joint], ragdoll.avatar.joints[joint], data.avatar.joints[joint], lerp);
                }
            }
        }
    },
    spawn: {
        parse: async () => {
        },
        exec: (id, data, snapshot) => {
            const ragdolls = snapshot.getOrDefault("RagdollMode.Ragdoll", Factory("Map"));
        
            if (ragdolls.has(id)) throw new Error(`Dynamic of id '${id}' already exists.`);
            ragdolls.set(id, { enabled: false });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const ragdolls = snapshot.getOrDefault("RagdollMode.Ragdoll", Factory("Map"));

            if (!ragdolls.has(id)) throw new Error(`Dynamic of id '${id}' did not exist.`);
            ragdolls.delete(id);
        }
    }
});