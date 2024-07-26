import { Vector3Like } from "@esm/three";
import { Identifier } from "../../parser/identifier.js";
import { GearFoldAnimation } from "../../renderer/animations/gearfold.js";
import { HumanAnimation } from "../../renderer/animations/human.js";
import { GearModel } from "../../renderer/models/gear.js";
import { AlignType, ComponentType } from "../../renderer/models/gearbuilder.js";
import { Archetype } from "../items/item.js";
import { Datablock } from "../lib.js";

if (module.metadata.isParser) console.warn("Datablocks should not be loaded by the parser. This degrades performance greatly.");

export interface MeleeArchetype {
    equipAnim: HumanAnimation,
    movementAnim: HumanAnimation,
    jumpAnim: HumanAnimation,
    fallAnim: HumanAnimation,
    landAnim: HumanAnimation,
    attackAnim: HumanAnimation,
    chargeAnim: HumanAnimation,
    chargeIdleAnim: HumanAnimation,
    releaseAnim: HumanAnimation,
    shoveAnim: HumanAnimation,
}

export interface GunArchetype {
    gunFoldAnim: GearFoldAnimation;
    offset?: Vector3Like;
}


export interface GearDatablock {
    model: (gearJSON: string) => GearModel;
    type?: Archetype;
    name?: string;
    meleeArchetype?: MeleeArchetype;
    gunArchetype?: GunArchetype;

    // NOTE(randomuserhi): Only relevant to gear builder
    partAlignPriority?: {
        alignType: AlignType;
        partPrio: ComponentType[];
    }[]
}

export const GearDatablock = new Datablock<Identifier, GearDatablock>((identifier) => {
    if (identifier.type === "Unknown") return undefined;
    if (identifier.type !== "Gear") throw new Error(`Identifier did not represent gear: ${identifier.hash}`);
    return identifier.stringKey;
});