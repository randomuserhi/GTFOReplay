import { Identifier } from "../../parser/identifier";
import { Datablock } from "../lib";

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

export const ItemDatablock: Datablock<Identifier, ItemDatablock> = new Datablock((identifier) => {
    if (identifier.type !== "Item") throw new Error(`Identifier did not represent an item: ${identifier.hash}`);
    return identifier.id;
});