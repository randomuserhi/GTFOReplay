import { mergeAnims } from "../../../library/animations/lib.js";
import { GearFoldAnim } from "../../../renderer/animations/gearfold.js";
import { GearAnimDatablock } from "../animation.js";
import { GearPartFrontDatablock } from "./front.js";

GearPartFrontDatablock.clear();

const root = `../js3party/models/GearParts/Front`;

GearPartFrontDatablock.set(12, {
    path: `${root}/Front_AutoShotgun_1.glb`,
    foldAnim: GearAnimDatablock.Front_AutoShotgun_1_animation_reload_0,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"a_mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(32, {
    path: `${root}/Front_AutoShotgun_2.glb`,
    foldAnim: GearAnimDatablock.Front_AutoShotgun_2_Parts_Reload,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"Front_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(11, {
    path: `${root}/Front_AutoShotgun_3.glb`,
    foldAnim: GearAnimDatablock.Front_AutoShotgun_3_reload_0,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"a_mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"},{alignType:"RightHand", alignName:"RightHand"}]
});
GearPartFrontDatablock.set(13, {
    path: `${root}/Front_AutoShotgun_4.glb`,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"Front_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(28, {
    path: `${root}/Front_Rifle_1.glb`,
    foldAnim: GearAnimDatablock.Front_Rifle_1_GripAlign_reload,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"a_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"},{alignType:"RightHand", alignName:"RightHand"}]
});
GearPartFrontDatablock.set(15, {
    path: `${root}/Front_Rifle_2.glb`,
    foldAnim: GearAnimDatablock.Front_Rifle_2_reload_0,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"a_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(14, {
    path: `${root}/Front_Rifle_3.glb`,
    foldAnim: GearAnimDatablock.Front_Rifle_3_reload_animation_1,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"Front_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(17, {
    path: `${root}/Front_Rifle_4.glb`,
    foldAnim: GearAnimDatablock.Front_Rifle_4_reload_0,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"a_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(18, {
    path: `${root}/Front_MachineGun_1.glb`,
    foldAnim: GearAnimDatablock.Machinegun_1_reload_1,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"rig:a_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(27, {
    path: `${root}/Front_MachineGun_2.glb`,
    foldAnim: GearAnimDatablock.Front_Machinegun_2_Animation_reload_1,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"a_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(21, {
    path: `${root}/Front_Precision_1.glb`,
    foldAnim: GearAnimDatablock.Front_Precision_1_reload_1,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"a_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(29, {
    path: `${root}/Front_Precision_2.glb`,
    foldAnim: GearAnimDatablock.Front_Precision_2_reload_1,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"a_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(19, {
    path: `${root}/Front_Precision_3.glb`,
    foldAnim: GearAnimDatablock.Front_Precision_3_Parts_Reload,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"a_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(22, {
    path: `${root}/Front_Shotgun_1.glb`,
    foldAnim: mergeAnims(GearAnimDatablock.Front_Shotgun_1_animation_reload_1 as GearFoldAnim, GearAnimDatablock.Front_Shotgun_1_pump_0 as GearFoldAnim),
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"Front_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(33, {
    path: `${root}/Front_Shotgun_2.glb`,
    foldAnim: GearAnimDatablock.Shotgun_front_2_reloadPump_1,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"Front_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(20, {
    path: `${root}/Front_Shotgun_3.glb`,
    foldAnim: GearAnimDatablock.Front_Shotgun_3_reload_0,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"Front_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"},{alignType:"RightHand", alignName:"RightHand"}]
});
GearPartFrontDatablock.set(24, {
    path: `${root}/Front_SMG_1.glb`,
    foldAnim: GearAnimDatablock.SMG_Front_1_Reload_1,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"Front_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(25, {
    path: `${root}/Front_SMG_2.glb`,
    foldAnim: GearAnimDatablock.SMG_Front_2_Reload_1,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"a_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(26, {
    path: `${root}/Front_SMG_3.glb`,
    foldAnim: GearAnimDatablock.SMG_Front_3_Reload_1,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"a_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(23, {
    path: `${root}/Front_SMG_4.glb`,
    foldAnim: GearAnimDatablock.SMG_Front_4_Reload_1,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"a_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"},{alignType:"RightHand", alignName:"RightHand"}]
});
GearPartFrontDatablock.set(36, {
    path: `${root}/Front_Revolver_1_Gripalign.glb`,
    fold: "a_RevolverFold",
    baseFoldRot: {
        x: 0,
        y: 0,
        z: 0.7071,
        w: 0.7071,
    },
    foldOffsetRot: {
        x: 0,
        y: 0,
        z: 0.7071,
        w: 0.7071,
    },
    foldAnim: GearAnimDatablock.Revolver_Front_1_Reload_1,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"Front_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"},{alignType:"SightLook", alignName:"Sight_align"},{alignType:"RightHand", alignName:"RightHand"}]
});
GearPartFrontDatablock.set(35, {
    path: `${root}/Front_Revolver_2.glb`,
    fold: "a_Fold",
    baseFoldRot: {
        x: 0.7071,
        y: 0,
        z: 0,
        w: 0.7071
    },
    foldAnim: GearAnimDatablock.Front_Revolver_2_Reload_0,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"a_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"},{alignType:"SightLook", alignName:"Sight_align"}]
});
GearPartFrontDatablock.set(37, {
    path: `${root}/Front_Short_Shotgun_1.glb`,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"Front_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"},{alignType:"Sight", alignName:"Receiver_Sight"},{alignType:"SightLook", alignName:"Receiver_Sight"}]
});
GearPartFrontDatablock.set(47, {
    path: `${root}/Front_Short_Shotgun_2.glb`,
    fold: "BreakPoint",
    foldAnim: GearAnimDatablock.Short_Shotgun_2_Parts_Reload,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"Front_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"Sight", alignName:"Front_Sight"},{alignType:"SightLook", alignName:"Sight_align"},{alignType:"RightHand", alignName:"RightHand"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(40, {
    path: `${root}/Front_UZI_1.glb`,
    aligns: [{alignType:"Muzzle", alignName:"Receiver_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"Front_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"},{alignType:"SightLook", alignName:"Sight_align"},{alignType:"Sight", alignName:"Receiver_Sight"}]
});
GearPartFrontDatablock.set(39, {
    path: `${root}/Front_UZI_2.glb`,
    aligns: [{alignType:"Muzzle", alignName:"Receiver_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"Front_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"SightLook", alignName:"Sight_align"},{alignType:"Sight", alignName:"Receiver_Sight"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(41, {
    path: `${root}/Front_Bullpop_1.glb`,
    aligns: [{alignType:"Muzzle", alignName:"Receiver_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"Sight", alignName:"Receiver_Sight"},{alignType:"Magazine", alignName:"Front_Mag"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(38, {
    path: `${root}/Front_Pistol_1.glb`,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"SightLook", alignName:"Sight_align"},{alignType:"Magazine", alignName:"Front_Mag"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(45, {
    path: `${root}/Front_Pistol_2.glb`,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"Front_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"},{alignType:"SightLook", alignName:"Sight_align"}]
});
GearPartFrontDatablock.set(49, {
    path: `${root}/Front_Pistol_4.glb`,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"Front_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"},{alignType:"SightLook", alignName:"Sight_align"}]
});
GearPartFrontDatablock.set(46, {
    path: `${root}/Front_Bullpop_2.glb`,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"Front_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"},{alignType:"Magazine", alignName:"Receiver_Sight"}]
});
GearPartFrontDatablock.set(48, {
    path: `${root}/Front_Bullpop_2.glb`,
    aligns: [{alignType:"Muzzle", alignName:"Front_M"},{alignType:"ShellEject", alignName:"Front_SE"},{alignType:"Magazine", alignName:"Front_Mag"},{alignType:"Flashlight", alignName:"Front_Flash"},{alignType:"LeftHand", alignName:"LeftHand"},{alignType:"Magazine", alignName:"Receiver_Sight"}]
});