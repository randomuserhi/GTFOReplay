import { Datablock } from "../lib.js";

if (module.metadata.isParser) console.warn("Datablocks should not be loaded by the parser. This degrades performance greatly.");

export const BoosterCategory = {
    "Muted": "../js3party/images/basic_shape.png",
    "Bold": "../js3party/images/advanced_shape.png",
    "Aggressive": "../js3party/images/specialized_shape.png",
} as const;

export type BoosterCategory = keyof typeof BoosterCategory;

export const BoosterIcon = {
    "Health": "../js3party/images/basic_icon_health.png",
    "ProcessingSpeed": {
        "Muted": "../js3party/images/basic_icon_tech.png",
        "Bold": "../js3party/images/advanced_icon_tech.png",
        "Aggressive": "../js3party/images/advanced_icon_tech.png",
    },
    "InitialState": {
        "Muted": "../js3party/images/basic_icon_brain.png",
        "Bold": "../js3party/images/advanced_icon_brain.png",
        "Aggressive": "../js3party/images/advanced_icon_brain.png"
    },
    "Damage": "../js3party/images/basic_icon_damage.png",
    "Tool": {
        "Muted": "../js3party/images/basic_icon_tool2.png",
        "Bold": "../js3party/images/advanced_icon_tool2.png",
        "Aggressive": "../js3party/images/advanced_icon_tool2.png",
    },
} as const;

export type BoosterIcon = keyof typeof BoosterIcon;

export interface BoosterDatablock {
    category: BoosterCategory;
    mainEffectType: BoosterIcon;
}

export const BoosterDatablock = new Datablock<number, BoosterDatablock>();

export interface BoosterEffectDatablock {
    name: string;
}

export const BoosterEffectDatablock = new Datablock<number, BoosterEffectDatablock>();

export interface BoosterConditionDatablock {
    name: string;
}

export const BoosterConditionDatablock = new Datablock<number, BoosterConditionDatablock>();