import { Anim, AnimBlend, AnimFunc, Avatar, AvatarLike, AvatarMask, AvatarSkeleton, empty } from "../../library/animations/lib.js";

export const GearFoldJoints = [
    "fold",
    "mag",
    "leftHand"
] as const;
export type GearFoldJoints = typeof GearFoldJoints[number];

export type GearFoldAvatar = Avatar<GearFoldJoints>;
export type GearFoldAvatarLike = AvatarLike<GearFoldJoints>;
export type GearFoldAnim = Anim<GearFoldJoints>;
export type GearFoldAnimBlend = AnimBlend<GearFoldJoints>;
export type GearFoldAnimation = AnimFunc<GearFoldJoints>;
export type GearFoldSkeleton = AvatarSkeleton<GearFoldJoints>;
export type GearFoldMask = AvatarMask<GearFoldJoints>;

export const gearFoldEmptyAnim: GearFoldAnim = empty(GearFoldJoints);