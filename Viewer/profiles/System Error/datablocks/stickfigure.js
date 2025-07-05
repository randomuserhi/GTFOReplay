const { StickModelDatablock } = await require("@asl/vanilla/datablocks/stickfigure.js", "asl");
const { Cylinder, Sphere } = await require("@asl/vanilla/library/models/primitives.js", "asl");
StickModelDatablock.clear();
StickModelDatablock.set("Sphere", {
  geometry: Sphere
});
StickModelDatablock.set("Shooter", {
  path: "../js3party/models/shooter_head.glb"
});
StickModelDatablock.set("Hybrid", {
  path: "../js3party/models/hybrid_head.glb"
});
StickModelDatablock.set("Charger", {
  path: "../js3party/models/charger_head.glb"
});
StickModelDatablock.set("Cylinder", {
  geometry: Cylinder
});
StickModelDatablock.set("Tendril", {
  geometry: Cylinder
});