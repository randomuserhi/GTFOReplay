import { StickModelDatablock } from "../../datablocks/models/stickfigure";
import { Cylinder, Sphere } from "../../library/models/primitives";

export type StickModelType = 
    "Sphere" |
    "Cylinder" |
    "Shooter" |
    "Hybrid" |
    "Charger";

StickModelDatablock.set("Sphere", { geometry: Sphere });
StickModelDatablock.set("Shooter", { path: "../js3party/models/shooter_head.glb" });
StickModelDatablock.set("Hybrid", { path: "../js3party/models/hybrid_head.glb" });
StickModelDatablock.set("Charger", { path: "../js3party/models/charger_head.glb" });
StickModelDatablock.set("Cylinder", { geometry: Cylinder });