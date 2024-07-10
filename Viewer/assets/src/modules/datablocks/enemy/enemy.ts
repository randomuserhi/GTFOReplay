import { Identifier } from "../../parser/identifier.js";
import { Datablock } from "../lib.js";

export interface EnemyDatablock {
    maxHealth?: number;
    name?: string;
}

export const EnemyDatablock = new Datablock<Identifier, EnemyDatablock>((identifier) => {
    if (identifier.type === "Unknown") return undefined;
    if (identifier.type !== "Enemy") throw new Error(`Identifier did not represent an enemy: ${identifier.hash}`);
    return identifier.id;
});


EnemyDatablock.set(Identifier.create("Enemy", 0), {
    name: "Unknown",
    maxHealth: Infinity
});

EnemyDatablock.set(Identifier.create("Enemy", 20), {
    name: "Scout",
    maxHealth: 42
});

EnemyDatablock.set(Identifier.create("Enemy", 40), {
    name: "Shadow Scout",
    maxHealth: 42
});

EnemyDatablock.set(Identifier.create("Enemy", 41), {
    name: "Charger Scout",
    maxHealth: 60
});

EnemyDatablock.set(Identifier.create("Enemy", 21), {
    name: "Shadow",
    maxHealth: 20
});

EnemyDatablock.set(Identifier.create("Enemy", 35), {
    name: "Big Shadow",
    maxHealth: 120
});

const Baby: EnemyDatablock = {
    name: "Baby",
    maxHealth: 5
};
EnemyDatablock.set(Identifier.create("Enemy", 38), Baby);
EnemyDatablock.set(Identifier.create("Enemy", 48), Baby);

const Striker: EnemyDatablock = {
    name: "Striker",
    maxHealth: 20
};
EnemyDatablock.set(Identifier.create("Enemy", 13), Striker);
EnemyDatablock.set(Identifier.create("Enemy", 31), Striker);
EnemyDatablock.set(Identifier.create("Enemy", 32), Striker);
EnemyDatablock.set(Identifier.create("Enemy", 24), Striker);
EnemyDatablock.set(Identifier.create("Enemy", 49), Striker);

const BigStriker: EnemyDatablock = {
    name: "BigStriker",
    maxHealth: 120
};
EnemyDatablock.set(Identifier.create("Enemy", 16), BigStriker);
EnemyDatablock.set(Identifier.create("Enemy", 28), BigStriker);
EnemyDatablock.set(Identifier.create("Enemy", 50), BigStriker);

const Shooter: EnemyDatablock = {
    name: "Shooter",
    maxHealth: 30
};
EnemyDatablock.set(Identifier.create("Enemy", 26), Shooter);
EnemyDatablock.set(Identifier.create("Enemy", 51), Shooter);
EnemyDatablock.set(Identifier.create("Enemy", 11), Shooter);

EnemyDatablock.set(Identifier.create("Enemy", 18), {
    name: "Big Shooter",
    maxHealth: 150
});

EnemyDatablock.set(Identifier.create("Enemy", 33), {
    name: "Hybrid",
    maxHealth: 150
});

EnemyDatablock.set(Identifier.create("Enemy", 30), {
    name: "Charger",
    maxHealth: 150
});

EnemyDatablock.set(Identifier.create("Enemy", 39), {
    name: "Big Charger",
    maxHealth: 120
});

EnemyDatablock.set(Identifier.create("Enemy", 29), {
    name: "Tank",
    maxHealth: 1000
});

EnemyDatablock.set(Identifier.create("Enemy", 36), {
    name: "Mother",
    maxHealth: 1000
});

EnemyDatablock.set(Identifier.create("Enemy", 37), {
    name: "Big Mother",
    maxHealth: 2500
});

EnemyDatablock.set(Identifier.create("Enemy", 46), {
    name: "Snatcher",
    maxHealth: 225
});

EnemyDatablock.set(Identifier.create("Enemy", 47), {
    name: "Immortal Tank",
    maxHealth: Infinity
});

EnemyDatablock.set(Identifier.create("Enemy", 42), {
    name: "Flyer",
    maxHealth: 16.2
});

EnemyDatablock.set(Identifier.create("Enemy", 45), {
    name: "Big Flyer",
    maxHealth: 150
});

EnemyDatablock.set(Identifier.create("Enemy", 43), {
    name: "Squid",
    maxHealth: 6000
});

EnemyDatablock.set(Identifier.create("Enemy", 44), {
    name: "Squid",
    maxHealth: 6000
});

EnemyDatablock.set(Identifier.create("Enemy", 53), {
    name: "Nightmare Striker",
    maxHealth: 37
});

EnemyDatablock.set(Identifier.create("Enemy", 52), {
    name: "Nightmare Shooter",
    maxHealth: 18
});

EnemyDatablock.set(Identifier.create("Enemy", 54), {
    name: "Zoomer Scout",
    maxHealth: 42
});

EnemyDatablock.set(Identifier.create("Enemy", 55), {
    name: "Mega Mother",
    maxHealth: 5000
});

EnemyDatablock.set(Identifier.create("Enemy", 56), {
    name: "Nightmare Scout",
    maxHealth: 161
});

EnemyDatablock.set(Identifier.create("Enemy", 62), {
    name: "Potatoe",
    maxHealth: 640
});

EnemyDatablock.set(Identifier.create("Enemy", 63), {
    name: "Nightmare Baby",
    maxHealth: 5
});