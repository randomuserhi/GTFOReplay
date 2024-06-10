import { Anim, AnimBlend, Avatar, AvatarLike, AvatarMask, AvatarSkeleton } from "./animation.js";

export declare const GearFoldJoints: readonly ["fold"];

export type GearFoldJoints = typeof GearFoldJoints[number];

export type GearFoldAvatar = Avatar<GearFoldJoints>;

export type GearFoldAvatarLike = AvatarLike<GearFoldJoints>;

export type GearFoldAnim = Anim<GearFoldJoints>;

export type GearFoldAnimBlend = AnimBlend<GearFoldJoints>;

export type GearFoldAnimation = GearFoldAnim | GearFoldAnimBlend;

export type GearFoldSkeleton = AvatarSkeleton<GearFoldJoints>;

export type GearFoldMask = AvatarMask<GearFoldJoints>;

