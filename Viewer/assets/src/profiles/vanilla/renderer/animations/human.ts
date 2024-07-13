import { QuaternionLike } from "@esm/three";
import { Anim, AnimBlend, AnimFunc, Avatar, AvatarLike, AvatarMask, AvatarSkeleton, AvatarStructure } from "../../library/animations/lib.js";

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
export type HumanAnimation = AnimFunc<HumanJoints>;
export type HumanSkeleton = AvatarSkeleton<HumanJoints>;
export type HumanMask = AvatarMask<HumanJoints>;

export const defaultHumanStructure: AvatarStructure<HumanJoints> = {hip:{x:0,y:1.04,z:0},leftUpperLeg:{x:0.09999999,y:0,z:0},leftLowerLeg:{x:1.776357E-17,y:-0.49,z:0},leftFoot:{x:0,y:-0.44,z:0},rightUpperLeg:{x:-0.09999999,y:1.421085E-16,z:0},rightLowerLeg:{x:-1.776357E-17,y:-0.49,z:0},rightFoot:{x:-1.887379E-17,y:-0.44,z:0},spine0:{x:0,y:0.11,z:0},spine1:{x:0,y:0.11,z:0},spine2:{x:0,y:0.11,z:0},leftShoulder:{x:0.03,y:0.19,z:0},leftUpperArm:{x:0.18,y:-2.842171E-16,z:0},leftLowerArm:{x:0.33,y:-4.662936E-16,z:0},leftHand:{x:0.29,y:2.431388E-16,z:-9.769963E-17},rightShoulder:{x:-0.03,y:0.19,z:0},rightUpperArm:{x:-0.18,y:0,z:0},rightLowerArm:{x:-0.33,y:0,z:0},rightHand:{x:-0.29,y:-2.842171E-16,z:0},neck:{x:0,y:0.275,z:0.02499937},head:{x:0,y:0.09999999,z:0}};
export const defaultHumanPose: AvatarStructure<HumanJoints, QuaternionLike> = {hip:{x:0,y:0,z:0,w:1},leftUpperLeg:{x:0,y:0,z:0.02617695,w:0.9996573},leftLowerLeg:{x:0.04361939,y:0,z:0,w:0.9990482},leftFoot:{x:0.2756374,y:0,z:0,w:0.9612617},rightUpperLeg:{x:0,y:0,z:-0.02617695,w:0.9996573},rightLowerLeg:{x:0.04361939,y:0,z:0,w:0.9990482},rightFoot:{x:0.2756374,y:0,z:0,w:0.9612617},spine0:{x:0,y:0,z:0,w:1},spine1:{x:0,y:0,z:0,w:1},spine2:{x:0,y:0,z:0,w:1},leftShoulder:{x:0,y:0,z:0,w:1},leftUpperArm:{x:0,y:0,z:-0.5446391,w:0.8386706},leftLowerArm:{x:0,y:-0.199368,z:0,w:0.9799247},leftHand:{x:0.004106232,y:0.07835157,z:-0.05217462,w:0.9955511},rightShoulder:{x:0,y:0,z:0,w:1},rightUpperArm:{x:0,y:0,z:0.5446391,w:0.8386706},rightLowerArm:{x:0,y:0.199368,z:0,w:0.9799247},rightHand:{x:0.07835157,y:0.004106232,z:-0.9955511,w:0.05217462},neck:{x:0.1736482,y:0,z:0,w:0.9848078},head:{x:-0.1736482,y:0,z:0,w:0.9848078}};