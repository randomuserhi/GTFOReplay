import { AnimFunc } from "../../library/animations/lib.js";
import { loadAllClips } from "../../library/animations/loaders.js";
import { GearFoldJoints } from "../../renderer/animations/gearfold.js";
import { Datablock } from "../lib.js";

export const GearAnimDatablock = new Datablock<GearFoldAnimations, AnimFunc<GearFoldJoints>>();

const gearFoldAnimationNames = [
    "Revolver_Front_1_Reload_1",
    "Front_Revolver_2_Reload_0",
    "Stock_Pistol_1_reload_1",
    "SMG_Front_4_Reload_1",
    "Front_AutoShotgun_1_animation_reload_0",
    "Front_AutoShotgun_2_Parts_Reload",
    "Front_AutoShotgun_3_reload_0",
    "Front_Precision_1_reload_1",
    "Front_Precision_2_reload_1",
    "Front_Precision_3_Parts_Reload",
    "Front_Shotgun_1_animation_reload_1",
    "Front_Shotgun_3_reload_0",
] as const;
type GearFoldAnimations = typeof gearFoldAnimationNames[number];
const gearFoldAnimations = await loadAllClips(GearFoldJoints, gearFoldAnimationNames);

for (const [key, anim] of Object.entries(gearFoldAnimations)) {
    if (GearAnimDatablock.has(key as any)) throw new Error(`Duplicate clip '${key}' being loaded.`);
    GearAnimDatablock.set(key as any, anim);
}