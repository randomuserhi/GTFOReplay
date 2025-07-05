const { GearAnimDatablock } = await require("../../../../vanilla/datablocks/gear/animation.js", "asl");
const { GearPartMainDatablock } = await require("../../../../vanilla/datablocks/gear/parts/main.js", "asl");
const { mergeAnims } = await require("@asl/vanilla/library/animations/lib.js", "asl");
GearPartMainDatablock.clear();
const root = `../js3party/models/GearParts/Main`;
GearPartMainDatablock.set(1, {
  path: `${root}/Bio_Tracker_1.glb`,
  aligns: []
});
GearPartMainDatablock.set(2, {
  path: `${root}/Glue_Distance_4.glb`,
  aligns: []
});
GearPartMainDatablock.set(3, {
  path: `${root}/Glue_Direct_2.glb`,
  aligns: []
});
GearPartMainDatablock.set(4, {
  path: `${root}/Map_Device_1.glb`,
  aligns: []
});
GearPartMainDatablock.set(5, {
  path: `${root}/Med_Direct_3.glb`,
  aligns: []
});
GearPartMainDatablock.set(6, {
  path: `${root}/Med_Distance_4.glb`,
  aligns: []
});
GearPartMainDatablock.set(9, {
  path: `${root}/Turret_Base_1.glb`,
  aligns: [{alignType:"LeftHand",alignName:"LeftHand"},{alignType:"RightHand",alignName:"RightHand"},{alignType:"ToolTargeting",alignName:"a_targeting"},{alignType:"ToolScreen",alignName:"a_screen"},{alignType:"Receiver",alignName:"Turret_Rifle_Align"},{alignType:"Front ",alignName:"Turret_Rifle_Align"},{alignType:"ToolScanning",alignName:"a_targeting"},{alignType:"ToolDetection",alignName:"aim_reference"},{alignType:"RotationPivot",alignName:"aim_reference"},{alignType:"GroundPlacement",alignName:"Ground_PlacementAlign"}]
});
GearPartMainDatablock.set(10, {
  path: `${root}/Main_Tracker_1.glb`,
  aligns: []
});
GearPartMainDatablock.set(12, {
  path: `${root}/Main_Mine_1.glb`,
  aligns: []
});
GearPartMainDatablock.set(15, {
  path: `${root}/Main_Glue_Distance_1.glb`,
  aligns: []
});
GearPartMainDatablock.set(16, {
  path: `${root}/Main_Nano_Swarm_1.glb`,
  aligns: [{alignType:"ToolTargeting",alignName:"Geo_Tracker_1_Targeting"},{alignType:"ToolScreen",alignName:"Geo_Tracker_1_Screen"}]
});
GearPartMainDatablock.set(17, {
  path: `${root}/Main_Nano_Swarm_1.glb`,
  aligns: [{alignType:"ToolTargeting",alignName:"Geo_Tracker_1_Targeting"},{alignType:"ToolScreen",alignName:"Geo_Tracker_1_Screen"}]
});
