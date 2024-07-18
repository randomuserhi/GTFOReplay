import { Identifier } from "../../parser/identifier.js";
import { HumanAnimation } from "../../renderer/animations/human.js";
import { ItemModel } from "../../renderer/models/items.js";
import { Datablock } from "../lib.js";

if (module.metadata.isParser) console.warn("Datablocks should not be loaded by the parser. This degrades performance greatly.");

export type Archetype = 
    "melee" |
    "pistol" |
    "rifle" |
    "consumable";

export interface ItemArchetype {
    equipAnim?: HumanAnimation;
    throwAnim?: HumanAnimation;
    chargeAnim?: HumanAnimation;
    chargeIdleAnim?: HumanAnimation;
}
    
export interface ItemDatablock {
    type?: Archetype,
    name?: string;
    serial?: string,
    model?: () => ItemModel;
    archetype?: ItemArchetype;
}

export const ItemDatablock = new Datablock<Identifier, ItemDatablock>((identifier) => {
    if (identifier.type === "Unknown") return undefined;
    if (identifier.type !== "Item") throw new Error(`Identifier did not represent an item: ${identifier.hash}`);
    return identifier.id;
});