const { GearAnimDatablock } = await require("../../../../vanilla/datablocks/gear/animation.js", "asl");
const { GearPartFrontDatablock } = await require("../../../../vanilla/datablocks/gear/parts/front.js", "asl");
GearPartFrontDatablock.clear();
const root = `../js3party/models/GearParts/Front`;
GearPartFrontDatablock.set(4, {
  path: `${root}/Front_GlueGun.glb`,
  aligns: [{alignType:"Muzzle",alignName:"aMuzzle"},{alignType:"SightLook",alignName:"aSightLook"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(8, {
  path: `${root}/Front_MapperBase_c.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartFrontDatablock.set(9, {
  path: `${root}/Front_MotionTracker_Antenna_c.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(7, {
  path: `${root}/SledgeHammer_a.glb`,
  aligns: [{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"RightHand",alignName:"RightHand"},{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"}]
});
GearPartFrontDatablock.set(42, {
  path: `${root}/SledgeHammer_b.glb`,
  aligns: [{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"RightHand",alignName:"RightHand"},{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"}]
});
GearPartFrontDatablock.set(43, {
  path: `${root}/SledgeHammer_c.glb`,
  aligns: [{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"RightHand",alignName:"RightHand"},{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"}]
});
GearPartFrontDatablock.set(44, {
  path: `${root}/SledgeHammer_d.glb`,
  aligns: [{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"RightHand",alignName:"RightHand"},{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"}]
});
GearPartFrontDatablock.set(12, {
  path: `${root}/Front_AutoShotgun_1.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(32, {
  path: `${root}/Front_AutoShotgun_2.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(11, {
  path: `${root}/Front_AutoShotgun_3.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartFrontDatablock.set(13, {
  path: `${root}/Front_AutoShotgun_4.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(28, {
  path: `${root}/Front_Rifle_1.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartFrontDatablock.set(15, {
  path: `${root}/Front_Rifle_2.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(14, {
  path: `${root}/Front_Rifle_3.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(17, {
  path: `${root}/Front_Rifle_4.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(18, {
  path: `${root}/Front_MachineGun_1.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"rig:a_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(27, {
  path: `${root}/Front_MachineGun_2.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(21, {
  path: `${root}/Front_Precision_1.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(29, {
  path: `${root}/Front_Precision_2.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(19, {
  path: `${root}/Front_Precision_3.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(22, {
  path: `${root}/Front_Shotgun_1.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(33, {
  path: `${root}/Front_Shotgun_2.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(20, {
  path: `${root}/Front_Shotgun_3.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartFrontDatablock.set(24, {
  path: `${root}/Front_SMG_1.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(25, {
  path: `${root}/Front_SMG_2.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(26, {
  path: `${root}/Front_SMG_3.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(23, {
  path: `${root}/Front_SMG_4.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartFrontDatablock.set(36, {
  path: `${root}/Front_Revolver_1_GripAlign.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"SightLook",alignName:"Sight_Align"},{alignType:"RightHand",alignName:"RightHand"}],
    fold: "a_RevolverFold",
    baseFoldRot: {
		x: 0,
		y: 0,
		z: 0.7071,
		w: 0.7071
	},
	foldOffsetRot: {
		x: 0,
		y: 0,
		z: 0.7071,
		w: 0.7071
	},
	foldAnim: GearAnimDatablock.Revolver_Front_1_Reload_1
});
GearPartFrontDatablock.set(35, {
  path: `${root}/Front_Revolver_2.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"SightLook",alignName:"Sight_Align"}],
	fold: "a_Fold",
	baseFoldRot: {
		x: 0.7071,
		y: 0,
		z: 0,
		w: 0.7071
	},
	foldAnim: GearAnimDatablock.Front_Revolver_2_Reload_0
});
GearPartFrontDatablock.set(37, {
  path: `${root}/Front_Short_Shotgun_1.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"Sight",alignName:"Receiver_Sight"},{alignType:"SightLook",alignName:"Receiver_Sight"}]
});
GearPartFrontDatablock.set(47, {
  path: `${root}/Front_Short_Shotgun_2.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"Sight",alignName:"Front_Sight"},{alignType:"SightLook",alignName:"Sight_Align"},{alignType:"RightHand",alignName:"RightHand"},{alignType:"LeftHand",alignName:"LeftHand"}],
	fold: "BreakPoint",
	foldAnim: GearAnimDatablock.Revolver_Front_1_Reload_1
});
GearPartFrontDatablock.set(40, {
  path: `${root}/Front_UZI_1.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Receiver_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"SightLook",alignName:"Sight_Align"},{alignType:"Sight",alignName:"Receiver_Sight"}]
});
GearPartFrontDatablock.set(39, {
  path: `${root}/Front_UZI_2.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Receiver_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"SightLook",alignName:"Sight_Align"},{alignType:"Sight",alignName:"Receiver_Sight"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(41, {
  path: `${root}/Front_Bullpop_1.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Receiver_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"Sight",alignName:"Receiver_Sight"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(38, {
  path: `${root}/Front_Pistol_1.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"SightLook",alignName:"Sight_Align"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(45, {
  path: `${root}/Front_Pistol_2.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"SightLook",alignName:"Sight_Align"}]
});
GearPartFrontDatablock.set(49, {
  path: `${root}/Front_Pistol_4.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"SightLook",alignName:"Sight_Align"}]
});
GearPartFrontDatablock.set(46, {
  path: `${root}/Front_Bullpop_2.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"Magazine",alignName:"Receiver_Sight"}]
});
GearPartFrontDatablock.set(48, {
  path: `${root}/Front_Bullpop_2.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"Magazine",alignName:"Receiver_Sight"}]
});
GearPartFrontDatablock.set(52, {
  path: `${root}/FRONT_SOCOM.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Sight",alignName:"Receiver_Sight"},{alignType:"SightLook",alignName:"Sight_Align"}]
});
GearPartFrontDatablock.set(53, {
  path: `${root}/FRONT_SOCOM_2.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Sight",alignName:"Receiver_Sight"},{alignType:"SightLook",alignName:"Sight_Align"}]
});
GearPartFrontDatablock.set(54, {
  path: `${root}/Front_Rifle_2_alt_sp.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(55, {
  path: `${root}/front_hk91_alt_SP.glb`,
  aligns: [{alignType:"Muzzle",alignName:"front_M"},{alignType:"ShellEject",alignName:"front_SE"},{alignType:"Magazine",alignName:"a_Mag"},{alignType:"Flashlight",alignName:"front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"SightLook",alignName:"Sight_Align"}]
});
GearPartFrontDatablock.set(141, {
  path: `${root}/Front_Rifle_1.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartFrontDatablock.set(142, {
  path: `${root}/Front_Rifle_3.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(143, {
  path: `${root}/Front_AutoShotgun_2.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"Front_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(146, {
  path: `${root}/Front_SMG_4.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartFrontDatablock.set(147, {
  path: `${root}/Front_SMG_1.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(148, {
  path: `${root}/Front_Precision_1.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(149, {
  path: `${root}/Front_Precision_3.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartFrontDatablock.set(151, {
  path: `${root}/Front_Rifle_1.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartFrontDatablock.set(152, {
  path: `${root}/Front_MachineGun_2.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_Mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
