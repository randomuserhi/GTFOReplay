import { AnimFunc } from "../../library/animations/lib.js";
import { loadAllClips } from "../../library/animations/loaders.js";
import { GearFoldJoints } from "../../renderer/animations/gearfold.js";

if (module.metadata.isParser) console.warn("Datablocks should not be loaded by the parser. This degrades performance greatly.");

// NOTE(randomuserhi): These are static datablocks -> They are not designed to be changed or updated

export const GearAnimDatablock: Record<GearFoldAnimations, AnimFunc<GearFoldJoints>> = {} as any;

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
    if (key in GearAnimDatablock) throw new Error(`Duplicate clip '${key}' being loaded.`);
    GearAnimDatablock[key as GearFoldAnimations] = anim;
}