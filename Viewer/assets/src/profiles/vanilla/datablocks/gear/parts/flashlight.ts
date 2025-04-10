import { Datablock } from "../../lib.js";
import { GearPartDatablock } from "./lib.js";

if (module.metadata.isParser) console.warn("Datablocks should not be loaded by the parser. This degrades performance greatly.");

export const GearPartFlashlightDatablock = new Datablock<number, GearPartDatablock>();