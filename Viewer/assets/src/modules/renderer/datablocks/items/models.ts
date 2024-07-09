import { ItemModelDatablock } from "../../../datablocks/items/models.js";
import { Identifier } from "../../../parser/identifier.js";

ItemModelDatablock.set(
    Identifier.create("Item", 102), {
        model: () => new EquippableModel(),
    }
);