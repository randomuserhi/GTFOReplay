import { Identifier } from "../../parser/identifier";
import { Datablock } from "../lib";

export interface EnemyDatablock {
    maxHealth?: number;
    name?: string;
}

export const EnemyDatablock: Datablock<Identifier, EnemyDatablock> = new Datablock((identifier) => {
    if (identifier.type !== "Enemy") throw new Error(`Identifier did not represent an enemy: ${identifier.hash}`);
    return identifier.id;
});