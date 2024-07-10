import { Model } from "../../library/models/lib.js";
import { Enemy } from "../../parser/enemy/enemy.js";
import { Identifier } from "../../parser/identifier.js";
import type { EnemyModel } from "../../renderer/enemy/lib.js";
import { Datablock } from "../lib.js";

export interface EnemyModelDatablock {
    model: (wrapper: EnemyModel, enemy: Enemy) => Model;
    tmpHeight?: number;
}

export const EnemyModelDatablock = new Datablock<Identifier, EnemyModelDatablock>((identifier) => {
    if (identifier.type === "Unknown") return undefined;
    if (identifier.type !== "Enemy") throw new Error(`Identifier did not represent an Enemy: ${identifier.hash}`);
    return identifier.id;
});