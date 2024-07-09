import { Vector3Like } from "@esm/three";
import { Model } from "../../library/models/lib.js";
import { Identifier } from "../../parser/identifier.js";
import { GearFoldAnimation } from "../../renderer/animations/gearfold.js";
import { HumanAnimation } from "../../renderer/animations/human.js";
import { Datablock } from "../lib.js";

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
    offset: Vector3Like;
}


export interface GearModelDatablock {
    model: () => Model;
    meleeArchetype?: MeleeArchetype;
    gunArchetype?: GunArchetype;
}

export const GearModelDatablock = new Datablock<Identifier, GearModelDatablock>((identifier) => {
    if (identifier.type === "Unknown") return undefined;
    if (identifier.type !== "Gear") throw new Error(`Identifier did not represent gear: ${identifier.hash}`);
    return identifier.stringKey;
});