import { Anim, AnimBlend, Avatar, AvatarLike, AvatarMask, AvatarSkeleton, AvatarStructure } from "./animation.js";

export const HumanJoints = [
    "hip",

    "leftUpperLeg",
    "leftLowerLeg",
    "leftFoot",

    "rightUpperLeg",
    "rightLowerLeg",
    "rightFoot",

    "spine0",
    "spine1",
    "spine2",

    "leftShoulder",
    "leftUpperArm",
    "leftLowerArm",
    "leftHand",

    "rightShoulder",
    "rightUpperArm",
    "rightLowerArm",
    "rightHand",

    "neck",
    "head",
] as const;
export type HumanJoints = typeof HumanJoints[number];

export type HumanAvatar = Avatar<HumanJoints>;
export type HumanAvatarLike = AvatarLike<HumanJoints>;
export type HumanAnim = Anim<HumanJoints>;
export type HumanAnimBlend = AnimBlend<HumanJoints>;
export type HumanAnimation = HumanAnim | HumanAnimBlend;
export type HumanSkeleton = AvatarSkeleton<HumanJoints>;
export type HumanMask = AvatarMask<HumanJoints>;

export const defaultHumanStructure: AvatarStructure<HumanJoints> = {hip:{x:0,y:1.04,z:0},leftUpperLeg:{x:0.09999999,y:0,z:0},leftLowerLeg:{x:1.776357E-17,y:-0.49,z:0},leftFoot:{x:0,y:-0.44,z:0},rightUpperLeg:{x:-0.09999999,y:1.421085E-16,z:0},rightLowerLeg:{x:-1.776357E-17,y:-0.49,z:0},rightFoot:{x:-1.887379E-17,y:-0.44,z:0},spine0:{x:0,y:0.11,z:0},spine1:{x:0,y:0.11,z:0},spine2:{x:0,y:0.11,z:0},leftShoulder:{x:0.03,y:0.19,z:0},leftUpperArm:{x:0.18,y:-2.842171E-16,z:0},leftLowerArm:{x:0.33,y:-4.662936E-16,z:0},leftHand:{x:0.29,y:2.431388E-16,z:-9.769963E-17},rightShoulder:{x:-0.03,y:0.19,z:0},rightUpperArm:{x:-0.18,y:0,z:0},rightLowerArm:{x:-0.33,y:0,z:0},rightHand:{x:-0.29,y:-2.842171E-16,z:0},neck:{x:0,y:0.275,z:0.02499937},head:{x:0,y:0.09999999,z:0}};