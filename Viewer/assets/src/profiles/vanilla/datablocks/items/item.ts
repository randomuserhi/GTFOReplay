import { Identifier } from "../../parser/identifier.js";
import { Datablock } from "../lib.js";

export type Archetype = 
    "melee" |
    "pistol" |
    "rifle" |
    "consumable";

export interface ItemDatablock {
    type?: Archetype,
    name?: string;
    serial?: string,
}

export const ItemDatablock = new Datablock<Identifier, ItemDatablock>((identifier) => {
    if (identifier.type === "Unknown") return undefined;
    if (identifier.type !== "Item") throw new Error(`Identifier did not represent an item: ${identifier.hash}`);
    return identifier.id;
});

ItemDatablock.set(Identifier.create("Item", 102), {
    type: "consumable",
    serial: "MEDIPACK"
});

ItemDatablock.set(Identifier.create("Item", 101), {
    type: "consumable",
    serial: "AMMOPACK"
});

ItemDatablock.set(Identifier.create("Item", 127), {
    type: "consumable",
    serial: "TOOL_REFILL"
});

ItemDatablock.set(Identifier.create("Item", 132), {
    type: "consumable",
    serial: "DISINFECT_PACK"
});

const GlowSticks: ItemDatablock = {
    type: "consumable",
    name: "Glow Sticks"
};
ItemDatablock.set(Identifier.create("Item", 114), GlowSticks);
ItemDatablock.set(Identifier.create("Item", 174), GlowSticks);

ItemDatablock.set(Identifier.create("Item", 30), {
    type: "consumable",
    name: "Long Range Flashlight",
});

ItemDatablock.set(Identifier.create("Item", 140), {
    type: "consumable",
    name: "I2-LP Syringe",
});

ItemDatablock.set(Identifier.create("Item", 142), {
    type: "consumable",
    name: "IIX Syringe",
});

ItemDatablock.set(Identifier.create("Item", 115), {
    type: "consumable",
    name: "Cfoam Grenade",
});

ItemDatablock.set(Identifier.create("Item", 116), {
    type: "consumable",
    name: "Lock Melter",
});

ItemDatablock.set(Identifier.create("Item", 117), {
    type: "consumable",
    name: "Fog Repeller",
});

ItemDatablock.set(Identifier.create("Item", 139), {
    type: "consumable",
    name: "Explosive Tripmine",
});

ItemDatablock.set(Identifier.create("Item", 144), {
    type: "consumable",
    name: "Cfoam Tripmine",
});

ItemDatablock.set(Identifier.create("Item", 131), {
    type: "rifle",
    name: "Power Cell",
    serial: "CELL",
});

ItemDatablock.set(Identifier.create("Item", 133), {
    type: "rifle",
    name: "Fog Turbine",
    serial: "FOG_TURBINE",
});

const Neonate: ItemDatablock = {
    type: "rifle",
    name: "Neonate",
    serial: "NEONATE",
};
ItemDatablock.set(Identifier.create("Item", 137), Neonate);
ItemDatablock.set(Identifier.create("Item", 141), Neonate);
ItemDatablock.set(Identifier.create("Item", 143), Neonate);
ItemDatablock.set(Identifier.create("Item", 170), Neonate);
ItemDatablock.set(Identifier.create("Item", 145), Neonate);
ItemDatablock.set(Identifier.create("Item", 175), Neonate);
ItemDatablock.set(Identifier.create("Item", 177), Neonate);

const MatterWaveProjector: ItemDatablock = {
    type: "rifle",
    name: "Matter Wave Projector",
    serial: "MATTER_WAVE_PROJECTOR",
};
ItemDatablock.set(Identifier.create("Item", 164), MatterWaveProjector);
ItemDatablock.set(Identifier.create("Item", 166), MatterWaveProjector);

const DataSphere: ItemDatablock = {
    type: "rifle",
    name: "Data Sphere",
    serial: "DATA_SPHERE",
};
ItemDatablock.set(Identifier.create("Item", 151), DataSphere);
ItemDatablock.set(Identifier.create("Item", 181), DataSphere);

const CargoCrate: ItemDatablock = {
    type: "rifle",
    name: "Cargo Crate",
    serial: "CARGO",
};
ItemDatablock.set(Identifier.create("Item", 138), CargoCrate);
ItemDatablock.set(Identifier.create("Item", 176), CargoCrate);

const HisecCargoCrate: ItemDatablock = {
    type: "rifle",
    name: "Hisec Cargo Crate",
    serial: "CARGO",
};
ItemDatablock.set(Identifier.create("Item", 154), HisecCargoCrate);
ItemDatablock.set(Identifier.create("Item", 155), HisecCargoCrate);

ItemDatablock.set(Identifier.create("Item", 148), {
    type: "rifle",
    name: "Cryo",
    serial: "CRYO",
});

ItemDatablock.set(Identifier.create("Item", 173), {
    type: "rifle",
    name: "Collection Case",
    serial: "COLLECTION_CASE",
});

const DataCube: ItemDatablock = {
    type: "rifle",
    name: "Data Cube",
    serial: "DATA_CUBE",
};
ItemDatablock.set(Identifier.create("Item", 168), DataCube);
ItemDatablock.set(Identifier.create("Item", 165), DataCube);
ItemDatablock.set(Identifier.create("Item", 179), DataCube);
ItemDatablock.set(Identifier.create("Item", 178), DataCube);

ItemDatablock.set(Identifier.create("Item", 146), {
    type: "rifle",
    name: "Bulkhead Key",
    serial: "BULKHEAD_KEY",
});

ItemDatablock.set(Identifier.create("Item", 27), {
    type: "rifle",
    name: "Key Red",
    serial: "KEY_RED",
});
ItemDatablock.set(Identifier.create("Item", 85), {
    type: "rifle",
    name: "Key Blue",
    serial: "KEY_BLUE",
});
ItemDatablock.set(Identifier.create("Item", 86), {
    type: "rifle",
    name: "Key Green",
    serial: "KEY_GREEN",
});
ItemDatablock.set(Identifier.create("Item", 87), {
    type: "rifle",
    name: "Key Yellow",
    serial: "KEY_YELLOW",
});
ItemDatablock.set(Identifier.create("Item", 88), {
    type: "rifle",
    name: "Key White",
    serial: "KEY_WHITE",
});
ItemDatablock.set(Identifier.create("Item", 89), {
    type: "rifle",
    name: "Key Black",
    serial: "KEY_BLACK",
});
ItemDatablock.set(Identifier.create("Item", 90), {
    type: "rifle",
    name: "Key Grey",
    serial: "KEY_GREY",
});
ItemDatablock.set(Identifier.create("Item", 91), {
    type: "rifle",
    name: "Key Orange",
    serial: "KEY_ORANGE",
});
ItemDatablock.set(Identifier.create("Item", 92), {
    type: "rifle",
    name: "Key Purple",
    serial: "KEY_PURPLE",
});

ItemDatablock.set(Identifier.create("Item", 128), {
    type: "rifle",
    name: "Personnel Id",
    serial: "PID",
});

ItemDatablock.set(Identifier.create("Item", 129), {
    type: "rifle",
    name: "Partial Decoder",
    serial: "PD",
});

const HardDrive: ItemDatablock = {
    type: "rifle",
    name: "Hard Drive",
};
ItemDatablock.set(Identifier.create("Item", 147), HardDrive);
ItemDatablock.set(Identifier.create("Item", 180), HardDrive);
ItemDatablock.set(Identifier.create("Item", 183), HardDrive);

ItemDatablock.set(Identifier.create("Item", 149), {
    type: "rifle",
    name: "GLP 1",
    serial: "GLP",
});
ItemDatablock.set(Identifier.create("Item", 169), {
    type: "rifle",
    name: "GLP 2",
    serial: "GLP",
});

ItemDatablock.set(Identifier.create("Item", 150), {
    type: "rifle",
    name: "OSIP",
    serial: "OSIP",
});

ItemDatablock.set(Identifier.create("Item", 153), {
    type: "rifle",
    name: "Plant Sample",
});

const MemoryStick: ItemDatablock = {
    type: "rifle",
    name: "Memory Stick",
};
ItemDatablock.set(Identifier.create("Item", 171), MemoryStick);
ItemDatablock.set(Identifier.create("Item", 172), MemoryStick);