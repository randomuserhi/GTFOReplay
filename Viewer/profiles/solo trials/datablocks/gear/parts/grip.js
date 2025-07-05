const { GearAnimDatablock } = await require("../../../../vanilla/datablocks/gear/animation.js", "asl");
const { GearPartGripDatablock } = await require("../../../../vanilla/datablocks/gear/parts/grip.js", "asl");
const { mergeAnims } = await require("@asl/vanilla/library/animations/lib.js", "asl");
GearPartGripDatablock.clear();
const root = `../js3party/models/GearParts/Grip`;
GearPartGripDatablock.set(2, {
  path: `${root}/Grip_1.glb`,
  aligns: [{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartGripDatablock.set(3, {
  path: `${root}/Grip_2.glb`,
  aligns: [{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartGripDatablock.set(5, {
  path: `${root}/Grip_3.glb`,
  aligns: [{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartGripDatablock.set(6, {
  path: `${root}/Grip_4.glb`,
  aligns: [{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"RightHand",alignName:"RightHand"}]
});
