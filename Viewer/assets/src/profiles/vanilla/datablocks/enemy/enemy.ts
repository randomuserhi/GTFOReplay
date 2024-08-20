import { Model } from "../../library/models/lib.js";
import { EnemyAnimState } from "../../parser/enemy/animation.js";
import type { Enemy } from "../../parser/enemy/enemy.js";
import { Identifier } from "../../parser/identifier.js";
import type { EnemyModelWrapper } from "../../renderer/enemy/lib.js";
import { Datablock } from "../lib.js";

if (module.metadata.isParser) console.warn("Datablocks should not be loaded by the parser. This degrades performance greatly.");

export interface EnemyDatablock {
    maxHealth?: number;
    name?: string;
    model?: (wrapper: EnemyModelWrapper, enemy: Enemy) => Model<[enemy: Enemy, anim: EnemyAnimState]>;
    tmpHeight?: number;
}

export const EnemyDatablock = new Datablock<Identifier, EnemyDatablock>((identifier) => {
    if (identifier.type !== "Unknown" && identifier.type !== "Enemy") throw new Error(`Identifier did not represent an enemy: ${identifier.hash}`);
    return identifier.id;
});