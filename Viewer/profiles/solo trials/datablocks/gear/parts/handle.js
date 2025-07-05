const { GearAnimDatablock } = await require("../../../../vanilla/datablocks/gear/animation.js", "asl");
const { GearPartHandleDatablock } = await require("../../../../vanilla/datablocks/gear/parts/handle.js", "asl");
const { mergeAnims } = await require("@asl/vanilla/library/animations/lib.js", "asl");
GearPartHandleDatablock.clear();
const root = `../js3party/models/GearParts/Handle`;
GearPartHandleDatablock.set(2, {
  path: `${root}/Handle_Hammer_1.glb`,
  aligns: []
});
GearPartHandleDatablock.set(16, {
  path: `${root}/Handle_Bat_1.glb`,
  aligns: []
});
GearPartHandleDatablock.set(15, {
  path: `${root}/Handle_Spear_1.glb`,
  aligns: []
});
GearPartHandleDatablock.set(14, {
  path: `${root}/Handle_Knife_1.glb`,
  aligns: []
});
GearPartHandleDatablock.set(4, {
  path: `${root}/Handle_Hammer_10.glb`,
  aligns: []
});
GearPartHandleDatablock.set(5, {
  path: `${root}/Handle_Hammer_7.glb`,
  aligns: []
});
GearPartHandleDatablock.set(6, {
  path: `${root}/Handle_Hammer_8.glb`,
  aligns: []
});
GearPartHandleDatablock.set(7, {
  path: `${root}/Handle_Hammer_5.glb`,
  aligns: []
});
GearPartHandleDatablock.set(8, {
  path: `${root}/Handle_Hammer_3.glb`,
  aligns: []
});
GearPartHandleDatablock.set(9, {
  path: `${root}/Handle_Hammer_6.glb`,
  aligns: []
});
GearPartHandleDatablock.set(10, {
  path: `${root}/Handle_Hammer_9.glb`,
  aligns: []
});
GearPartHandleDatablock.set(11, {
  path: `${root}/Handle_Hammer_2.glb`,
  aligns: []
});
GearPartHandleDatablock.set(12, {
  path: `${root}/Handle_Hammer_4.glb`,
  aligns: []
});
GearPartHandleDatablock.set(17, {
  path: `${root}/Sword Resized.glb`,
  aligns: []
});
