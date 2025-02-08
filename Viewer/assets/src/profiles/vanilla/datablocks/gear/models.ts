import { Vector3Like } from "@esm/three";
import { Identifier } from "../../parser/identifier.js";
import { GearFoldAnimation } from "../../renderer/animations/gearfold.js";
import { HumanAnimation } from "../../renderer/animations/human.js";
import { GearModel } from "../../renderer/models/gear.js";
import { AlignType, ComponentType, componentTypes, GearComp, GearJSON } from "../../renderer/models/gearjson.js";
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

// NOTE(randomuserhi): Tracks gear category to handle reskins
class ExtendedGearDatablock {
    datablock = new Datablock<Identifier, GearDatablock>((identifier) => {
        if (identifier.type !== "Unknown" && identifier.type !== "Gear") throw new Error(`Identifier did not represent gear: ${identifier.hash}`);
        return identifier.stringKey;
    });
    categories = new Map<number, GearDatablock>();

    public category(id: Identifier): number | undefined {
        if (id.type === "Unknown") return undefined;
        if (id.type !== "Gear") throw new Error(`Identifier did not represent gear: ${id.hash}`);
        const schematic = JSON.parse(id.stringKey).Packet as GearJSON;

        let category: number | undefined = undefined;
        for (const key in schematic.Comps) {
            if (key === "Length") continue;
            const component = schematic.Comps[key as keyof GearJSON["Comps"]] as GearComp;
            
            const type = componentTypes[component.c];
            switch (type) {
            case "Category": {
                category = component.v;
            } break;
            }

            if (category !== undefined) break;
        }
            
        return category;
    }

    public get(key: Identifier) {
        return this.datablock.get(key);
    }

    public matchCategory(key: Identifier) {
        return this.categories.get(this.category(key)!);
    }

    public getOrMatchCategory(key: Identifier) {
        let result = this.get(key);
        if (result === undefined) {
            // Possibly a reskin of another gear -> try match category
            result = this.matchCategory(key);
        }
        return result;
    }

    public set(key: Identifier, value: GearDatablock) {
        this.datablock.set(key, value);
        const category = this.category(key);
        if (category === undefined) {
            console.warn(`Identifier for gear did not have a category: ${key.hash}. Reskins may fail to load as a result.`);
            return;
        }
        this.categories.set(category, value);
    }

    public delete(key: Identifier) {
        this.datablock.delete(key);
        const category = this.category(key);
        if (category === undefined) {
            console.warn(`Identifier for gear did not have a category: ${key.hash}. Reskins may fail to load as a result.`);
            return;
        }
        this.categories.delete(category);
    }

    public clear() {
        this.datablock.clear();
        this.categories.clear();
    }
}

export const GearDatablock = new ExtendedGearDatablock();
