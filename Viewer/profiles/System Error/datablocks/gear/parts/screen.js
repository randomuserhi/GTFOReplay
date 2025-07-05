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
  path: `${root}/Screen_7.glb`,
  aligns: []
});
