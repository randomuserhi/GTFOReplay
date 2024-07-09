import { Model } from "../../library/models/lib.js";
import { Identifier } from "../../parser/identifier.js";
import { HumanAnimation } from "../../renderer/animations/human.js";
import { Datablock } from "../lib.js";

export interface ItemArchetype {
    equipAnim?: HumanAnimation;
    throwAnim?: HumanAnimation;
    chargeAnim?: HumanAnimation;
    chargeIdleAnim?: HumanAnimation;
}

export interface ItemModelDatablock {
    model: () => Model;
    archetype: ItemArchetype;
}

export const ItemModelDatablock = new Datablock<Identifier, ItemModelDatablock>((identifier) => {
    if (identifier.type === "Unknown") return undefined;
    if (identifier.type !== "Item") throw new Error(`Identifier did not represent an item: ${identifier.hash}`);
    return identifier.id;
});