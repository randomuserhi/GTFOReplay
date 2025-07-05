const { GearAnimDatablock } = await require("../../../../vanilla/datablocks/gear/animation.js", "asl");
const { GearPartStockDatablock } = await require("../../../../vanilla/datablocks/gear/parts/stock.js", "asl");
const { mergeAnims } = await require("@asl/vanilla/library/animations/lib.js", "asl");
GearPartStockDatablock.clear();
const root = `../js3party/models/GearParts/Stock`;
GearPartStockDatablock.set(12, {
  path: `${root}/Stock_Precision_1.glb`,
  aligns: [{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartStockDatablock.set(1, {
  path: `${root}/Stock_Precision_2.glb`,
  aligns: [{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartStockDatablock.set(11, {
  path: `${root}/Stock_Precision_3.glb`,
  aligns: [{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartStockDatablock.set(2, {
  path: `${root}/Stock_Precision_4.glb`,
  aligns: [{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartStockDatablock.set(5, {
  path: `${root}/Stock_SMG_1.glb`,
  aligns: [{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartStockDatablock.set(9, {
  path: `${root}/Stock_SMG_2.glb`,
  aligns: [{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartStockDatablock.set(7, {
  path: `${root}/Stock_Rifle_1.glb`,
  aligns: [{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartStockDatablock.set(3, {
  path: `${root}/Stock_Rifle_2.glb`,
  aligns: [{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartStockDatablock.set(8, {
  path: `${root}/Stock_Rifle_3.glb`,
  aligns: [{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartStockDatablock.set(13, {
  path: `${root}/Stock_Shootgun_1.glb`,
  aligns: [{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartStockDatablock.set(10, {
  path: `${root}/Stock_Shootgun_2.glb`,
  aligns: [{alignType:"RightHand",alignName:"RightHand"}]
});
GearPartStockDatablock.set(14, {
  path: `${root}/Stock_Revolver_1.glb`,
  aligns: [{alignType:"RightHand",alignName:"RightHand"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartStockDatablock.set(15, {
  path: `${root}/Stock_Revolver_2.glb`,
  aligns: [{alignType:"RightHand",alignName:"RightHand"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartStockDatablock.set(16, {
  path: `${root}/Stock_Short_Shotgun_2.glb`,
  aligns: [{alignType:"RightHand",alignName:"RightHand"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartStockDatablock.set(21, {
  path: `${root}/Stock_Short_Shotgun_2.glb`,
  aligns: [{alignType:"RightHand",alignName:"RightHand"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartStockDatablock.set(17, {
  path: `${root}/Stock_Bullpop_1.glb`,
  aligns: [{alignType:"Magazine",alignName:"a_Mag"},{alignType:"RightHand",alignName:"RightHand"},{alignType:"LeftHand",alignName:"LeftHand"}],
  foldAnim: GearAnimDatablock.Stock_Bullpup_1_reload_1
});
GearPartStockDatablock.set(18, {
  path: `${root}/Stock_Pistol_1.glb`,
  aligns: [{alignType:"RightHand",alignName:"RightHand"},{alignType:"Magazine",alignName:"a_mag"},{alignType:"LeftHand",alignName:"LeftHand"}],
  foldAnim: GearAnimDatablock.Stock_Pistol_1_reload_1
});
GearPartStockDatablock.set(19, {
  path: `${root}/Stock_UZI_2.glb`,
  aligns: [{alignType:"RightHand",alignName:"RightHand"},{alignType:"LeftHand",alignName:"LeftHand_Stock"},{alignType:"Magazine",alignName:"Front_Mag"}]
});
GearPartStockDatablock.set(20, {
  path: `${root}/Stock_UZI_1.glb`,
  aligns: [{alignType:"RightHand",alignName:"RightHand"},{alignType:"LeftHand",alignName:"LeftHand_Stock"},{alignType:"Magazine",alignName:"Front_Mag"}]
});
GearPartStockDatablock.set(4, {
  path: `${root}/Stock_MotionTracker_c.glb`,
  aligns: [{alignType:"RightHand",alignName:"RightHand"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartStockDatablock.set(22, {
  path: `${root}/STOCK_93R_1.glb`,
  aligns: [{alignType:"RightHand",alignName:"RightHand"},{alignType:"Magazine",alignName:"a_mag"},{alignType:"LeftHand",alignName:"LeftHand"}]
});
GearPartStockDatablock.set(144, {
  path: `${root}/Stock_Bullpop_1.glb`,
  aligns: [{alignType:"Magazine",alignName:"a_Mag"},{alignType:"RightHand",alignName:"RightHand"},{alignType:"LeftHand",alignName:"LeftHand"}],
  foldAnim: GearAnimDatablock.Stock_Bullpup_1_reload_1
});
