import { Identifier } from "../../parser/identifier.js";
import { Datablock } from "../lib.js";

export type Archetype = 
    "melee" |
    "pistol" |
    "rifle" |
    "consumable";

export interface ItemDatablock {
    type: Archetype,
    name?: string;
    serial?: string,
}

export const ItemDatablock = new Datablock<Identifier, ItemDatablock>((identifier) => {
    if (identifier.type === "Unknown") return undefined;
    if (identifier.type !== "Item") throw new Error(`Identifier did not represent an item: ${identifier.hash}`);
    return identifier.id;
});