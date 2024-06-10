import { QuaternionLike } from "three";

import { Anim, AnimBlend, AnimFunc, Avatar, AvatarLike, AvatarMask, AvatarSkeleton, AvatarStructure } from "./animation.js";

export declare const HumanJoints: readonly ["hip", "leftUpperLeg", "leftLowerLeg", "leftFoot", "rightUpperLeg", "rightLowerLeg", "rightFoot", "spine0", "spine1", "spine2", "leftShoulder", "leftUpperArm", "leftLowerArm", "leftHand", "rightShoulder", "rightUpperArm", "rightLowerArm", "rightHand", "neck", "head"];

export type HumanJoints = typeof HumanJoints[number];

export type HumanAvatar = Avatar<HumanJoints>;

export type HumanAvatarLike = AvatarLike<HumanJoints>;

export type HumanAnim = Anim<HumanJoints>;

export type HumanAnimBlend = AnimBlend<HumanJoints>;

export type HumanAnimation = AnimFunc<HumanJoints>;

export type HumanSkeleton = AvatarSkeleton<HumanJoints>;

export type HumanMask = AvatarMask<HumanJoints>;

export declare const defaultHumanStructure: AvatarStructure<HumanJoints>;

export declare const defaultHumanPose: AvatarStructure<HumanJoints, QuaternionLike>;

