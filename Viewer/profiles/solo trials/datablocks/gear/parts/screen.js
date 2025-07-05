const { GearAnimDatablock } = await require("../../../../vanilla/datablocks/gear/animation.js", "asl");
const { GearPartScreenDatablock } = await require("../../../../vanilla/datablocks/gear/parts/screen.js", "asl");
const { mergeAnims } = await require("@asl/vanilla/library/animations/lib.js", "asl");
GearPartScreenDatablock.clear();
const root = `../js3party/models/GearParts/Screen`;
GearPartScreenDatablock.set(2, {
  path: `${root}/Screen_1.glb`,
  aligns: []
});
GearPartScreenDatablock.set(3, {
  path: `${root}/Screen_2.glb`,
  aligns: []
});
GearPartScreenDatablock.set(5, {
  path: `${root}/Screen_3.glb`,
  aligns: []
});
GearPartScreenDatablock.set(6, {
  path: `${root}/Screen_4.glb`,
  aligns: []
});
GearPartScreenDatablock.set(7, {
  path: `${root}/Screen_5.glb`,
  aligns: []
});
GearPartScreenDatablock.set(8, {
  path: `${root}/Screen_6.glb`,
  aligns: []
});
GearPartScreenDatablock.set(9, {
  path: `${root}/../Front/Front_Bullpop_1.glb`,
  aligns: [{alignType:"Sight",alignName:"Receiver_Sight"}]
});
GearPartScreenDatablock.set(16, {
  path: `${root}/../Front/Front_AutoShotgun_1.glb`,
  aligns: [{alignType:"Muzzle",alignName:"Front_M"},{alignType:"ShellEject",alignName:"Front_SE"},{alignType:"Magazine",alignName:"a_mag"},{alignType:"Flashlight",alignName:"Front_Flash"},{alignType:"LeftHand",alignName:"LeftHand"}],
  foldAnim: GearAnimDatablock.Front_AutoShotgun_1_animation_reload_0
});
GearPartScreenDatablock.set(14, {
  path: `${root}/../Front/Front_Rifle_3.glb`,
  aligns: [],
  foldAnim: GearAnimDatablock.Front_Rifle_3_reload_animation_1
});
GearPartScreenDatablock.set(17, {
  path: `${root}/Consumable_MediumFlashlight.glb`,
  aligns: []
});
GearPartScreenDatablock.set(12, {
  path: `${root}/../Head/Head_Knife_1.glb`,
  aligns: []
});
