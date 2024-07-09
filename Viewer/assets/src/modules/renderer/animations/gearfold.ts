import { Anim, AnimBlend, Avatar, AvatarLike, AvatarMask, AvatarSkeleton } from "../../library/animations/lib.js";

export const GearFoldJoints = [
    "fold",
] as const;
export type GearFoldJoints = typeof GearFoldJoints[number];

export type GearFoldAvatar = Avatar<GearFoldJoints>;
export type GearFoldAvatarLike = AvatarLike<GearFoldJoints>;
export type GearFoldAnim = Anim<GearFoldJoints>;
export type GearFoldAnimBlend = AnimBlend<GearFoldJoints>;
export type GearFoldAnimation = GearFoldAnim | GearFoldAnimBlend;
export type GearFoldSkeleton = AvatarSkeleton<GearFoldJoints>;
export type GearFoldMask = AvatarMask<GearFoldJoints>;