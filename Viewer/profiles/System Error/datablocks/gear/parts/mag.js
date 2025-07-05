const { GearAnimDatablock } = await require("../../../../vanilla/datablocks/gear/animation.js", "asl");
const { GearPartMagDatablock } = await require("../../../../vanilla/datablocks/gear/parts/mag.js", "asl");
const { mergeAnims } = await require("@asl/vanilla/library/animations/lib.js", "asl");
GearPartMagDatablock.clear();
const root = `../js3party/models/GearParts/Mag`;
GearPartMagDatablock.set(2, {
  path: `${root}/Mag_556_30rnds_B.glb`,
  aligns: []
});
GearPartMagDatablock.set(11, {
  path: `${root}/Mag_556_150rnds_A.glb`,
  aligns: []
});
GearPartMagDatablock.set(8, {
  path: `${root}/Mag_9mm_20rdns_A.glb`,
  aligns: []
});
GearPartMagDatablock.set(5, {
  path: `${root}/Mag_9mm_30rdns_A.glb`,
  aligns: []
});
GearPartMagDatablock.set(17, {
  path: `${root}/Mag_9mm_50rdns_A.glb`,
  aligns: []
});
GearPartMagDatablock.set(20, {
  path: `${root}/Mag_556_24rnds.glb`,
  aligns: []
});
GearPartMagDatablock.set(1, {
  path: `${root}/Mag_556_40rnds_A.glb`,
  aligns: []
});
GearPartMagDatablock.set(4, {
  path: `${root}/Mag_556_60rnds_A.glb`,
  aligns: []
});
GearPartMagDatablock.set(15, {
  path: `${root}/Mag_556_80rnds_A.glb`,
  aligns: []
});
GearPartMagDatablock.set(10, {
  path: `${root}/Mag_556_100rnds_A.glb`,
  aligns: []
});
GearPartMagDatablock.set(3, {
  path: `${root}/Mag_762_20rnds_A.glb`,
  aligns: []
});
GearPartMagDatablock.set(14, {
  path: `${root}/Mag_762_40rnds_A.glb`,
  aligns: []
});
GearPartMagDatablock.set(6, {
  path: `${root}/Mag_762_60rnds_A.glb`,
  aligns: []
});
GearPartMagDatablock.set(16, {
  path: `${root}/Mag_762_80rnds_A.glb`,
  aligns: []
});
GearPartMagDatablock.set(7, {
  path: `${root}/Mag_762_100rnds_A.glb`,
  aligns: []
});
GearPartMagDatablock.set(13, {
  path: `${root}/Mag_50_10rnds_A.glb`,
  aligns: []
});
GearPartMagDatablock.set(12, {
  path: `${root}/Mag_50_20rnds_A.glb`,
  aligns: []
});
GearPartMagDatablock.set(19, {
  path: `${root}/Mag_12G_04rnds_A.glb`,
  aligns: []
});
GearPartMagDatablock.set(9, {
  path: `${root}/Mag_12G_10rnds.glb`,
  aligns: []
});
GearPartMagDatablock.set(18, {
  path: `${root}/Mag_12G_20rnds.glb`,
  aligns: []
});
