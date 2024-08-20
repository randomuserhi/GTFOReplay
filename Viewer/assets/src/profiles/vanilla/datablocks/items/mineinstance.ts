import { Color, ColorRepresentation, Group } from "@esm/three";
import { Identifier } from "../../parser/identifier.js";
import { Datablock } from "../lib.js";

if (module.metadata.isParser) console.warn("Datablocks should not be loaded by the parser. This degrades performance greatly.");
    
export interface MineInstanceDatablock {
    model?: (model: Group, playerColor: Color) => void;
    laserColor?: ColorRepresentation; 
}

export const MineInstanceDatablock = new Datablock<Identifier, MineInstanceDatablock>((identifier) => {
    if (identifier.type !== "Unknown" && identifier.type !== "Item") throw new Error(`Identifier did not represent an item: ${identifier.hash}`);
    return identifier.id;
});