const { GearAnimDatablock } = await require("../../../../vanilla/datablocks/gear/animation.js", "asl");
const { GearPartReceiverDatablock } = await require("../../../../vanilla/datablocks/gear/parts/receiver.js", "asl");
const { mergeAnims } = await require("@asl/vanilla/library/animations/lib.js", "asl");
GearPartReceiverDatablock.clear();
const root = `../js3party/models/GearParts/Receiver`;
GearPartReceiverDatablock.set(1, {
  path: `${root}/Receiver_Machinegun_1.glb`,
  aligns: [{alignType:"Sight",alignName:"Receiver_Sight"}]
});
GearPartReceiverDatablock.set(3, {
  path: `${root}/Receiver_Machinegun_3.glb`,
  aligns: [{alignType:"Sight",alignName:"Receiver_Sight"}]
});
GearPartReceiverDatablock.set(2, {
  path: `${root}/Receiver_SMG_3.glb`,
  aligns: [{alignType:"Sight",alignName:"Receiver_Sight"}]
});
GearPartReceiverDatablock.set(4, {
  path: `${root}/Receiver_MotionTracker_display_c.glb`,
  aligns: [{alignType:"Sight",alignName:"Receiver_Sight"}]
});
GearPartReceiverDatablock.set(5, {
  path: `${root}/Receiver_MapperDisplay_c.glb`,
  aligns: [{alignType:"Sight",alignName:"Receiver_Sight"}]
});
GearPartReceiverDatablock.set(6, {
  path: `${root}/Receiver_SMG_2.glb`,
  aligns: [{alignType:"Sight",alignName:"Receiver_Sight"}]
});
GearPartReceiverDatablock.set(7, {
  path: `${root}/Receiver_SMG_4.glb`,
  aligns: [{alignType:"Sight",alignName:"Receiver_Sight"}]
});
GearPartReceiverDatablock.set(8, {
  path: `${root}/Receiver_Rifle_1.glb`,
  aligns: [{alignType:"Sight",alignName:"Receiver_Sight"}]
});
GearPartReceiverDatablock.set(9, {
  path: `${root}/Receiver_Rifle_2.glb`,
  aligns: [{alignType:"Sight",alignName:"Receiver_Sight"}]
});
GearPartReceiverDatablock.set(10, {
  path: `${root}/Receiver_Machinegun_2.glb`,
  aligns: [{alignType:"Sight",alignName:"Receiver_Sight"}]
});
GearPartReceiverDatablock.set(11, {
  path: `${root}/Receiver_Machinegun_1.glb`,
  aligns: [{alignType:"Sight",alignName:"Receiver_Sight"}]
});
GearPartReceiverDatablock.set(12, {
  path: `${root}/Receiver_SMG_1.glb`,
  aligns: [{alignType:"Sight",alignName:"Receiver_Sight"}]
});
GearPartReceiverDatablock.set(13, {
  path: `${root}/Receiver_Rifle_3.glb`,
  aligns: [{alignType:"Sight",alignName:"Receiver_Sight"}]
});
GearPartReceiverDatablock.set(14, {
  path: `${root}/Receiver_Machinegun_3.glb`,
  aligns: [{alignType:"Sight",alignName:"Receiver_Sight"}]
});
GearPartReceiverDatablock.set(15, {
  path: `${root}/Receiver_Short_Shotgun_2.glb`,
  aligns: [{alignType:"Flashlight",alignName:"Receiver_Flash"},{alignType:"Sight",alignName:"Receiver_Sight"}],
  foldAnim: GearAnimDatablock.Short_Shotgun_2_Parts_Reload,
  fold: "BreakPoint"
});
GearPartReceiverDatablock.set(22, {
  path: `${root}/Receiver_Short_Shotgun_2.glb`,
  aligns: [{alignType:"Flashlight",alignName:"Receiver_Flash"},{alignType:"Sight",alignName:"Receiver_Sight"}],
  foldAnim: GearAnimDatablock.Short_Shotgun_2_Parts_Reload,
  fold: "BreakPoint"
});
GearPartReceiverDatablock.set(16, {
  path: `${root}/Receiver_Revolver_1_GripAlign.glb`,
  aligns: [{alignType:"SightLook",alignName:"Receiver_Sight"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"Sight",alignName:"Receiver_Sight"}],
  foldAnim: GearAnimDatablock.Revolver_Front_1_Reload_1,
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
  }
});
GearPartReceiverDatablock.set(17, {
  path: `${root}/Receiver_Revolver_2.glb`,
  aligns: [{alignType:"SightLook",alignName:"Receiver_Sight"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"Sight",alignName:"Receiver_Sight"}],
  foldAnim: GearAnimDatablock.Front_Revolver_2_Reload_0,
  fold: "a_Fold",
  baseFoldRot: {
    x: 0.7071,
    y: 0,
    z: 0,
    w: 0.7071
  }
});
GearPartReceiverDatablock.set(18, {
  path: `${root}/Receiver_UZI_1.glb`,
  aligns: [{alignType:"Sight",alignName:"Receiver_Sight"}]
});
GearPartReceiverDatablock.set(19, {
  path: `${root}/Receiver_UZI_2.glb`,
  aligns: [{alignType:"Sight",alignName:"Receiver_Sight"}]
});
GearPartReceiverDatablock.set(20, {
  path: `${root}/Receiver_Bullpop_1.glb`,
  aligns: [{alignType:"Sight",alignName:"Receiver_Sight"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartReceiverDatablock.set(21, {
  path: `${root}/Receiver_Pistol_1.glb`,
  aligns: [{alignType:"Sight",alignName:"Receiver_Sight"},{alignType:"Flashlight",alignName:"Front_Flash"}]
});
GearPartReceiverDatablock.set(23, {
  path: `${root}/RECIEVER_SOCOM.glb`,
  aligns: [{alignType:"Flashlight",alignName:"Front_Flash"}]
});
