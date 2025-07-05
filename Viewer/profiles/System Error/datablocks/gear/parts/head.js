const { GearAnimDatablock } = await require("../../../../vanilla/datablocks/gear/animation.js", "asl");
const { GearPartHeadDatablock } = await require("../../../../vanilla/datablocks/gear/parts/head.js", "asl");
const { mergeAnims } = await require("@asl/vanilla/library/animations/lib.js", "asl");
GearPartHeadDatablock.clear();
const root = `../js3party/models/GearParts/Head`;
GearPartHeadDatablock.set(2, {
  path: `${root}/Head_Hammer_5.glb`,
  aligns: []
});
GearPartHeadDatablock.set(13, {
  path: `${root}/Head_Spear_1.glb`,
  aligns: []
});
GearPartHeadDatablock.set(19, {
  path: `${root}/Head_Spear_2.glb`,
  aligns: []
});
GearPartHeadDatablock.set(14, {
  path: `${root}/Head_Bat_1.glb`,
  aligns: []
});
GearPartHeadDatablock.set(12, {
  path: `${root}/Head_Knife_1.glb`,
  aligns: []
});
GearPartHeadDatablock.set(3, {
  path: `${root}/Head_Hammer_7.glb`,
  aligns: []
});
GearPartHeadDatablock.set(4, {
  path: `${root}/Head_Hammer_11.glb`,
  aligns: []
});
GearPartHeadDatablock.set(5, {
  path: `${root}/Head_Hammer_10.glb`,
  aligns: []
});
GearPartHeadDatablock.set(6, {
  path: `${root}/Head_Hammer_6.glb`,
  aligns: []
});
GearPartHeadDatablock.set(7, {
  path: `${root}/Head_Hammer_9.glb`,
  aligns: []
});
GearPartHeadDatablock.set(8, {
  path: `${root}/Head_Hammer_2.glb`,
  aligns: []
});
GearPartHeadDatablock.set(9, {
  path: `${root}/Head_Hammer_12.glb`,
  aligns: []
});
GearPartHeadDatablock.set(11, {
  path: `${root}/Head_Hammer_1.glb`,
  aligns: []
});
GearPartHeadDatablock.set(15, {
  path: `${root}/Crowbar.glb`,
  aligns: []
});
GearPartHeadDatablock.set(16, {
  path: `${root}/Consumable_Syringe.glb`,
  aligns: []
});
GearPartHeadDatablock.set(17, {
  path: `${root}/Melee head 1.glb`,
  aligns: []
});
GearPartHeadDatablock.set(18, {
  path: `${root}/Saw syth.glb`,
  aligns: []
});
