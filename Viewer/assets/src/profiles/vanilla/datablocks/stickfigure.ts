import { BufferGeometry } from "@esm/three";
import { Cylinder, Sphere } from "../library/models/primitives.js";
import { Datablock } from "./lib.js";

if (module.metadata.isParser) console.warn("Datablocks should not be loaded by the parser. This degrades performance greatly.");

export interface StickModelDatablock {
    path?: string;
    geometry?: BufferGeometry;
}

export const StickModelDatablock = new Datablock<StickModelType, StickModelDatablock>();

export type StickModelType = 
    "Sphere" |
    "Cylinder" |
    "Shooter" |
    "Hybrid" |
    "Charger" |
    "Tendril";

StickModelDatablock.set("Sphere", { geometry: Sphere });
StickModelDatablock.set("Shooter", { path: "../js3party/models/shooter_head.glb" });
StickModelDatablock.set("Hybrid", { path: "../js3party/models/hybrid_head.glb" });
StickModelDatablock.set("Charger", { path: "../js3party/models/charger_head.glb" });
StickModelDatablock.set("Cylinder", { geometry: Cylinder });
StickModelDatablock.set("Tendril", { geometry: Cylinder });