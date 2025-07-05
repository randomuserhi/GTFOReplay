const { GearAnimDatablock } = await require("../../../../vanilla/datablocks/gear/animation.js", "asl");
const { GearPartTargetingDatablock } = await require("../../../../vanilla/datablocks/gear/parts/targeting.js", "asl");
const { mergeAnims } = await require("@asl/vanilla/library/animations/lib.js", "asl");
GearPartTargetingDatablock.clear();
const root = `../js3party/models/GearParts/Targeting`;
GearPartTargetingDatablock.set(1, {
  path: `${root}/Targeting_1.glb`,
  aligns: []
});
GearPartTargetingDatablock.set(2, {
  path: `${root}/Targeting_2.glb`,
  aligns: []
});
GearPartTargetingDatablock.set(3, {
  path: `${root}/Targeting_3.glb`,
  aligns: []
});
GearPartTargetingDatablock.set(4, {
  path: `${root}/Targeting_3.glb`,
  aligns: []
});
