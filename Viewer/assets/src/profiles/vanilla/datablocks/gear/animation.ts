import { AnimFunc } from "../../library/animations/lib.js";
import { loadAllClips } from "../../library/animations/loaders.js";
import { GearFoldJoints } from "../../renderer/animations/gearfold.js";

if (module.metadata.isParser) console.warn("Datablocks should not be loaded by the parser. This degrades performance greatly.");

// NOTE(randomuserhi): These are static datablocks -> They are not designed to be changed or updated

export const GearAnimDatablock: Record<GearFoldAnimations, AnimFunc<GearFoldJoints>> = {} as any;

const gearFoldAnimationNames = [
    "Front_AutoShotgun_1_animation_reload_0",
    "Front_AutoShotgun_2_Parts_Reload",
    "Front_AutoShotgun_3_reload_0",
    "Machinegun_1_reload_1",
    "Front_Machinegun_2_Animation_reload_1",
    "Front_Pistol_1_reload",
    "Front_Precision_1_reload_1",
    "Front_Precision_2_reload_1",
    "Front_Precision_3_Parts_Reload",
    "Revolver_Front_1_Reload_1",
    "Front_Revolver_2_Reload_0",
    "Front_Rifle_1_GripAlign_reload",
    "Front_Rifle_2_reload_0",
    "Front_Rifle_3_reload_animation_1",
    "Front_Rifle_4_reload_0",
    "Front_Shotgun_1_animation_reload_1",
    "Front_Shotgun_1_pump_0",
    "Shotgun_front_2_reloadPump_1",
    "Front_Shotgun_3_reload_0",
    "SMG_Front_1_Reload_1",
    "SMG_Front_2_Reload_1",
    "SMG_Front_3_Reload_1",
    "SMG_Front_4_Reload_1",
    "Short_Shotgun_2_Parts_Reload",
    "Stock_Bullpup_1_reload_1",
    "Stock_Pistol_1_reload_1"
] as const;
type GearFoldAnimations = typeof gearFoldAnimationNames[number];
const gearFoldAnimations = await loadAllClips(GearFoldJoints, gearFoldAnimationNames);

for (const [key, anim] of Object.entries(gearFoldAnimations)) {
    if (key in GearAnimDatablock) throw new Error(`Duplicate clip '${key}' being loaded.`);
    GearAnimDatablock[key as GearFoldAnimations] = anim;
}