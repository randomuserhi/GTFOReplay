const { ItemDatablock } = await require("@asl/vanilla/datablocks/items/item.js", "asl");
const { PlayerAnimDatablock } = await require("@asl/vanilla/datablocks/player/animation.js", "asl");
const { Identifier } = await require("@asl/vanilla/parser/identifier.js", "asl");
const { ItemModel } = await require("@asl/vanilla/renderer/models/items.js", "asl");
const { NativeItemModel } = await require("@asl/vanilla/renderer/models/prebuilt/nativeItem.js", "asl");
ItemDatablock.clear();
ItemDatablock.set(Identifier.create("Item", 162), {
    type: "melee",
    name: "GEAR_Spear",
    model: () => {
        const model = new ItemModel();
        model.equipOffsetPos = { x: 0.1, y: 0.3, z: 0 };
        model.equipOffsetRot = { x: 0, y: 0, z: -0.1736482, w: 0.9848078 };
        return model;
    }
});
ItemDatablock.set(Identifier.create("Item", 163), {
    type: "melee",
    name: "GEAR_Bat",
    model: () => {
        const model = new ItemModel();
        return model;
    }
});
ItemDatablock.set(Identifier.create("Item", 161), {
    type: "melee",
    name: "GEAR_Knife",
    model: () => {
        const model = new ItemModel();
        return model;
    }
});
ItemDatablock.set(Identifier.create("Item", 100), {
    type: "melee",
    name: "GEAR_SledgeHammer",
    model: () => {
        const model = new ItemModel();
        return model;
    }
});
ItemDatablock.set(Identifier.create("Item", 102), {
    type: "consumable",
    serial: "MEDIPACK",
    model: () => new NativeItemModel(102)
});
ItemDatablock.set(Identifier.create("Item", 101), {
    type: "consumable",
    serial: "AMMOPACK",
    model: () => new NativeItemModel(101)
});
ItemDatablock.set(Identifier.create("Item", 127), {
    type: "consumable",
    serial: "TOOL_REFILL",
    model: () => new NativeItemModel(127)
});
ItemDatablock.set(Identifier.create("Item", 132), {
    type: "consumable",
    serial: "DISINFECT_PACK",
    model: () => new NativeItemModel(132)
});
ItemDatablock.set(Identifier.create("Item", 114), {
    type: "consumable",
    name: "Glow Sticks",
    model: () => new NativeItemModel(114)
});
ItemDatablock.set(Identifier.create("Item", 200), {
    type: "consumable",
    name: "Teal Glow Sticks",
    model: () => new NativeItemModel(114)
});
ItemDatablock.set(Identifier.create("Item", 201), {
    type: "consumable",
    name: "White Glow Sticks",
    model: () => new NativeItemModel(114)
});
ItemDatablock.set(Identifier.create("Item", 202), {
    type: "consumable",
    name: "Blue Glow Sticks",
    model: () => new NativeItemModel(114)
});
ItemDatablock.set(Identifier.create("Item", 203), {
    type: "consumable",
    name: "Yellow Glow Sticks",
    model: () => new NativeItemModel(114)
});
ItemDatablock.set(Identifier.create("Item", 204), {
    type: "consumable",
    name: "Pink Glow Sticks",
    model: () => new NativeItemModel(114)
});
ItemDatablock.set(Identifier.create("Item", 205), {
    type: "consumable",
    name: "Red Glow Sticks",
    model: () => new NativeItemModel(114)
});
ItemDatablock.set(Identifier.create("Item", 206), {
    type: "consumable",
    name: "Green Glow Sticks",
    model: () => new NativeItemModel(114)
});
ItemDatablock.set(Identifier.create("Item", 207), {
    type: "consumable",
    name: "Throwable Sun",
    model: () => new NativeItemModel(114)
});
ItemDatablock.set(Identifier.create("Item", 208), {
    type: "consumable",
    name: "Throwable Void",
    model: () => new NativeItemModel(114)
});
ItemDatablock.set(Identifier.create("Item", 209), {
    type: "consumable",
    name: "Absolution",
    model: () => new NativeItemModel(114)
});
ItemDatablock.set(Identifier.create("Item", 210), {
    type: "consumable",
    name: "Retribution",
    model: () => new NativeItemModel(114)
});
ItemDatablock.set(Identifier.create("Item", 30), {
    type: "consumable",
    name: "Long Range Flashlight",
    model: () => new NativeItemModel(30)
});
ItemDatablock.set(Identifier.create("Item", 140), {
    type: "consumable",
    name: "I2-LP Syringe",
    model: () => new NativeItemModel(140)
});
ItemDatablock.set(Identifier.create("Item", 142), {
    type: "consumable",
    name: "IIX Syringe",
    model: () => new NativeItemModel(142)
});
ItemDatablock.set(Identifier.create("Item", 231), {
    type: "consumable",
    name: "REC Syringe",
    model: () => new NativeItemModel(140)
});
ItemDatablock.set(Identifier.create("Item", 241), {
    type: "consumable",
    name: "REC_II Syringe",
    model: () => new NativeItemModel(140)
});
ItemDatablock.set(Identifier.create("Item", 227), {
    type: "consumable",
    name: "IV-LP Syringe",
    model: () => new NativeItemModel(140)
});
ItemDatablock.set(Identifier.create("Item", 224), {
    type: "consumable",
    name: "SPD Syringe",
    model: () => new NativeItemModel(140)
});
ItemDatablock.set(Identifier.create("Item", 225), {
    type: "consumable",
    name: "ADR Syringe",
    model: () => new NativeItemModel(140)
});
ItemDatablock.set(Identifier.create("Item", 228), {
    type: "consumable",
    name: "Virus Syringe",
    model: () => new NativeItemModel(140)
});
ItemDatablock.set(Identifier.create("Item", 232), {
    type: "consumable",
    name: "RGE Syringe",
    model: () => new NativeItemModel(140)
});
ItemDatablock.set(Identifier.create("Item", 234), {
    type: "consumable",
    name: "Hallowed Virus Syringe",
    model: () => new NativeItemModel(140)
});
ItemDatablock.set(Identifier.create("Item", 229), {
    type: "consumable",
    name: "Antibiotic Syringe",
    model: () => new NativeItemModel(140)
});
ItemDatablock.set(Identifier.create("Item", 115), {
    type: "consumable",
    name: "Cfoam Grenade",
    model: () => new NativeItemModel(115)
});
ItemDatablock.set(Identifier.create("Item", 214), {
    type: "consumable",
    name: "Cfoam Grenade",
    model: () => new NativeItemModel(115)
});
ItemDatablock.set(Identifier.create("Item", 116), {
    type: "consumable",
    name: "Lock Melter",
    model: () => new NativeItemModel(116)
});
ItemDatablock.set(Identifier.create("Item", 117), {
    type: "consumable",
    name: "Fog Repeller",
    model: () => new NativeItemModel(117),
    archetype: {
        equipAnim: PlayerAnimDatablock.Fogrepeller_Throw_Equip,
        throwAnim: PlayerAnimDatablock.Fogrepeller_Throw,
        chargeAnim: PlayerAnimDatablock.Fogrepeller_Throw_Charge,
        chargeIdleAnim: PlayerAnimDatablock.Fogrepeller_Throw_Charge_Idle
    }
});
ItemDatablock.set(Identifier.create("Item", 239), {
    type: "consumable",
    name: "Fog Repeller",
    model: () => new NativeItemModel(117),
    archetype: {
        equipAnim: PlayerAnimDatablock.Fogrepeller_Throw_Equip,
        throwAnim: PlayerAnimDatablock.Fogrepeller_Throw,
        chargeAnim: PlayerAnimDatablock.Fogrepeller_Throw_Charge,
        chargeIdleAnim: PlayerAnimDatablock.Fogrepeller_Throw_Charge_Idle
    }
});
ItemDatablock.set(Identifier.create("Item", 139), {
    type: "consumable",
    name: "Explosive Tripmine",
    model: () => new NativeItemModel(139)
});
ItemDatablock.set(Identifier.create("Item", 219), {
    type: "consumable",
    name: "Explosive Tripmine Bundle",
    model: () => new NativeItemModel(139)
});
ItemDatablock.set(Identifier.create("Item", 144), {
    type: "consumable",
    name: "Cfoam Tripmine",
    model: () => new NativeItemModel(144)
});
ItemDatablock.set(Identifier.create("Item", 131), {
    type: "rifle",
    name: "Power Cell",
    serial: "CELL",
    model: () => new NativeItemModel(131)
});
ItemDatablock.set(Identifier.create("Item", 133), {
    type: "rifle",
    name: "Fog Turbine",
    serial: "FOG_TURBINE",
    model: () => new NativeItemModel(133)
});
ItemDatablock.set(Identifier.create("Item", 137), {
    type: "rifle",
    name: "Neonate",
    serial: "NEONATE",
    model: () => new NativeItemModel(137)
});
ItemDatablock.set(Identifier.create("Item", 141), {
    type: "rifle",
    name: "Neonate",
    serial: "NEONATE",
    model: () => new NativeItemModel(141)
});
ItemDatablock.set(Identifier.create("Item", 143), {
    type: "rifle",
    name: "Neonate",
    serial: "NEONATE",
    model: () => new NativeItemModel(143)
});
ItemDatablock.set(Identifier.create("Item", 170), {
    type: "rifle",
    name: "Neonate",
    serial: "NEONATE",
    model: () => new NativeItemModel(170)
});
ItemDatablock.set(Identifier.create("Item", 145), {
    type: "rifle",
    name: "Neonate",
    serial: "NEONATE",
    model: () => new NativeItemModel(145)
});
ItemDatablock.set(Identifier.create("Item", 175), {
    type: "rifle",
    name: "Neonate",
    serial: "NEONATE",
    model: () => new NativeItemModel(175)
});
ItemDatablock.set(Identifier.create("Item", 177), {
    type: "rifle",
    name: "Neonate",
    serial: "NEONATE",
    model: () => new NativeItemModel(177)
});
ItemDatablock.set(Identifier.create("Item", 164), {
    type: "rifle",
    name: "Matter Wave Projector",
    serial: "MATTER_WAVE_PROJECTOR",
    model: () => new NativeItemModel(164)
});
ItemDatablock.set(Identifier.create("Item", 166), {
    type: "rifle",
    name: "Matter Wave Projector",
    serial: "MATTER_WAVE_PROJECTOR",
    model: () => new NativeItemModel(166)
});
ItemDatablock.set(Identifier.create("Item", 151), {
    type: "rifle",
    name: "Data Sphere",
    serial: "DATA_SPHERE",
    model: () => new NativeItemModel(151)
});
ItemDatablock.set(Identifier.create("Item", 222), {
    type: "rifle",
    name: "Purple Data Sphere",
    serial: "PURPLE_DATA_SPHERE",
    model: () => new NativeItemModel(151)
});
ItemDatablock.set(Identifier.create("Item", 235), {
    type: "rifle",
    name: "Corroding Sphere",
    serial: "CORRODING_SPHERE",
    model: () => new NativeItemModel(151)
});
ItemDatablock.set(Identifier.create("Item", 240), {
    type: "rifle",
    name: "Empty Data Sphere",
    serial: "EMPTY_DATA_SPHERE",
    model: () => new NativeItemModel(151)
});
ItemDatablock.set(Identifier.create("Item", 138), {
    type: "rifle",
    name: "Cargo Crate",
    serial: "CARGO",
    model: () => new NativeItemModel(138)
});
ItemDatablock.set(Identifier.create("Item", 176), {
    type: "rifle",
    name: "Cargo Crate",
    serial: "CARGO",
    model: () => new NativeItemModel(176)
});
ItemDatablock.set(Identifier.create("Item", 154), {
    type: "rifle",
    name: "Hisec Cargo Crate",
    serial: "CARGO",
    model: () => new NativeItemModel(154)
});
ItemDatablock.set(Identifier.create("Item", 155), {
    type: "rifle",
    name: "Hisec Cargo Crate",
    serial: "CARGO",
    model: () => new NativeItemModel(155)
});
ItemDatablock.set(Identifier.create("Item", 148), {
    type: "rifle",
    name: "Cryo",
    serial: "CRYO",
    model: () => new NativeItemModel(148)
});
ItemDatablock.set(Identifier.create("Item", 173), {
    type: "rifle",
    name: "Collection Case",
    serial: "COLLECTION_CASE",
    model: () => new NativeItemModel(173)
});
ItemDatablock.set(Identifier.create("Item", 168), {
    type: "rifle",
    name: "Data Cube",
    serial: "DATA_CUBE",
    model: () => new NativeItemModel(168)
});
ItemDatablock.set(Identifier.create("Item", 165), {
    type: "rifle",
    name: "Data Cube",
    serial: "DATA_CUBE",
    model: () => new NativeItemModel(165)
});
ItemDatablock.set(Identifier.create("Item", 179), {
    type: "rifle",
    name: "Data Cube",
    serial: "DATA_CUBE",
    model: () => new NativeItemModel(179)
});
ItemDatablock.set(Identifier.create("Item", 178), {
    type: "rifle",
    name: "Data Cube",
    serial: "DATA_CUBE",
    model: () => new NativeItemModel(178)
});
ItemDatablock.set(Identifier.create("Item", 146), {
    type: "rifle",
    name: "Bulkhead Key",
    serial: "BULKHEAD_KEY",
    model: () => new NativeItemModel(146)
});
ItemDatablock.set(Identifier.create("Item", 27), {
    type: "rifle",
    name: "Key Red",
    serial: "KEY_RED",
    model: () => new NativeItemModel(27)
});
ItemDatablock.set(Identifier.create("Item", 85), {
    type: "rifle",
    name: "Key Blue",
    serial: "KEY_BLUE",
    model: () => new NativeItemModel(85)
});
ItemDatablock.set(Identifier.create("Item", 86), {
    type: "rifle",
    name: "Key Green",
    serial: "KEY_GREEN",
    model: () => new NativeItemModel(86)
});
ItemDatablock.set(Identifier.create("Item", 87), {
    type: "rifle",
    name: "Key Yellow",
    serial: "KEY_YELLOW",
    model: () => new NativeItemModel(87)
});
ItemDatablock.set(Identifier.create("Item", 88), {
    type: "rifle",
    name: "Key White",
    serial: "KEY_WHITE",
    model: () => new NativeItemModel(88)
});
ItemDatablock.set(Identifier.create("Item", 89), {
    type: "rifle",
    name: "Key Black",
    serial: "KEY_BLACK",
    model: () => new NativeItemModel(89)
});
ItemDatablock.set(Identifier.create("Item", 90), {
    type: "rifle",
    name: "Key Grey",
    serial: "KEY_GREY",
    model: () => new NativeItemModel(90)
});
ItemDatablock.set(Identifier.create("Item", 91), {
    type: "rifle",
    name: "Key Orange",
    serial: "KEY_ORANGE",
    model: () => new NativeItemModel(91)
});
ItemDatablock.set(Identifier.create("Item", 92), {
    type: "rifle",
    name: "Key Purple",
    serial: "KEY_PURPLE",
    model: () => new NativeItemModel(92)
});
ItemDatablock.set(Identifier.create("Item", 128), {
    type: "rifle",
    name: "Personnel Id",
    serial: "PID",
    model: () => new NativeItemModel(128)
});
ItemDatablock.set(Identifier.create("Item", 129), {
    type: "rifle",
    name: "Partial Decoder",
    serial: "PD",
    model: () => new NativeItemModel(129)
});
ItemDatablock.set(Identifier.create("Item", 147), {
    type: "rifle",
    name: "Hard Drive",
    model: () => new NativeItemModel(147)
});
ItemDatablock.set(Identifier.create("Item", 180), {
    type: "rifle",
    name: "Hard Drive",
    model: () => new NativeItemModel(180)
});
ItemDatablock.set(Identifier.create("Item", 183), {
    type: "rifle",
    name: "Hard Drive",
    model: () => new NativeItemModel(183)
});
ItemDatablock.set(Identifier.create("Item", 149), {
    type: "rifle",
    name: "GLP 1",
    serial: "GLP",
    model: () => new NativeItemModel(149)
});
ItemDatablock.set(Identifier.create("Item", 169), {
    type: "rifle",
    name: "GLP 2",
    serial: "GLP",
    model: () => new NativeItemModel(169)
});
ItemDatablock.set(Identifier.create("Item", 150), {
    type: "rifle",
    name: "OSIP",
    serial: "OSIP",
    model: () => new NativeItemModel(150)
});
ItemDatablock.set(Identifier.create("Item", 153), {
    type: "rifle",
    name: "Plant Sample",
    model: () => new NativeItemModel(153)
});
ItemDatablock.set(Identifier.create("Item", 171), {
    type: "rifle",
    name: "Memory Stick",
    model: () => new NativeItemModel(171)
});
ItemDatablock.set(Identifier.create("Item", 172), {
    type: "rifle",
    name: "Memory Stick",
    model: () => new NativeItemModel(172)
});
