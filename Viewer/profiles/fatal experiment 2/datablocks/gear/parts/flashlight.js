const { GearAnimDatablock } = await require("../../../../vanilla/datablocks/gear/animation.js", "asl");
const { GearPartFlashlightDatablock } = await require("../../../../vanilla/datablocks/gear/parts/flashlight.js", "asl");
const { mergeAnims } = await require("@asl/vanilla/library/animations/lib.js", "asl");
GearPartFlashlightDatablock.clear();
const root = `../js3party/models/GearParts/Flashlight`;
GearPartFlashlightDatablock.set(2, {
  path: `${root}/Flashlight_A.glb`,
  aligns: []
});
GearPartFlashlightDatablock.set(3, {
  path: `${root}/Flashlight_B.glb`,
  aligns: []
});
GearPartFlashlightDatablock.set(4, {
  path: `${root}/Flashlight_C.glb`,
  aligns: []
});
GearPartFlashlightDatablock.set(5, {
  path: `${root}/Flashlight_E.glb`,
  aligns: []
});
GearPartFlashlightDatablock.set(6, {
  path: `${root}/Flashlight_D.glb`,
  aligns: []
});
