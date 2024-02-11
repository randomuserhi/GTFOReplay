// TODO(randomuserhi): Load from file and sync with C# spec sheet

interface GTFOSpecification
{
    player: {
        maxHealth: number
    },
    mines: string[],
    enemies: string[],
    enemyData: { [k: string]: { 
        maxHealth?: number 
    } },
    items: string[]
}

let GTFOSpecification: GTFOSpecification = {
    player: {
        maxHealth: 25
    },
    mines: [
        "Explosive Mine",
        "C-foam Mine"
    ],
    enemies: [
        "Unknown",
        
        "Scout",
        "Shadow Scout",
        "Charger Scout",
        
        "Shadow",
        "Big Shadow",

        "Baby",
        "Striker",
        "Big Striker",

        "Shooter",
        "Big Shooter",

        "Hybrid",

        "Charger",
        "Big Charger",

        "Tank",
        "Mother",
        "Big Mother",
        "Snatcher",

        "Immortal Tank",

        "Flyer",
        "Big Flyer",

        "Squid",
        "Squid Boss",

        "Nightmare Striker",
        "Nightmare Shooter",
        "Nightmare Scout"
    ],
    enemyData: {
        "Unknown": {
            maxHealth: undefined
        },

        "Scout": {
            maxHealth: 42
        },
        "Shadow Scout": {
            maxHealth: 42
        },
        "Charger Scout": {
            maxHealth: 60
        },
        
        "Shadow": {
            maxHealth: 20
        },
        "Big Shadow": {
            maxHealth: 120
        },

        "Baby": {
            maxHealth: 5
        },
        "Striker": {
            maxHealth: 20
        },
        "Big Striker": {
            maxHealth: 120
        },

        "Shooter": {
            maxHealth: 30
        },
        "Big Shooter": {
            maxHealth: 150
        },

        "Hybrid": {
            maxHealth: 150
        },

        "Charger": {
            maxHealth: 30
        },
        "Big Charger": {
            maxHealth: 120
        },

        "Tank": {
            maxHealth: 1000
        },
        "Mother": {
            maxHealth: 1000
        },
        "Big Mother": {
            maxHealth: 2500
        },
        "Snatcher": {
            maxHealth: 225
        },

        "Immortal Tank": {
            maxHealth: undefined
        },

        "Flyer": {
            maxHealth: 16.2
        },
        "Big Flyer": {
            maxHealth: 150
        },

        "Squid": {
            maxHealth: 6000
        },
        "Squid Boss": {
            maxHealth: 6000
        },

        "Nightmare Striker": {
            maxHealth: 37
        },
        "Nightmare Shooter": {
            maxHealth: 18
        },
        "Nightmare Scout": {
            maxHealth: 161
        },
    },
    items: [
        "Unknown",
        
        // Primary
        "Shelling S49",
        "Shelling Nano",
        "Bataldo 3RB",
        "Raptus Treffen 2",
        "Raptus Steigro",
        "Accrat Golok DA",
        "Van Auken LTC5",
        "Accrat STB",
        "Accrat ND6",
        "Van Auken CAB F4",
        "TR22 Hanaway",
        "Hanaway PSB",
        "Malatack LX",
        "Malatack CH 4",
        "Drekker Pres MOD 556",
        "Buckland SBS III",
        "Bataldo J 300",
        "Bataldo Custom K330",

        // Secondary
        "Malatack HXC",
        "Drekker CLR",
        "Buckland S870",
        "Buckland AF6",
        "Drekker INEX DREI",
        "Buckland XDist2",
        "Mastaba R66",
        "Techman Arbalist V",
        "Techman Veruta XII",
        "Techman Klust 6",
        "Omneco exp 1",
        "Shelling Arid 5",
        "Drekker DEL P1",
        "Koning PR 11",
        "Omneco LRG 42",

        // Tool
        "D-Tek Optron IV",
        "Stalwart Flow G2",
        "Krieger O4",
        "Mechatronic SGB3",
        "RAD Labs Meduza",
        "Autotek 51 RSG",
        "Mechatronic B5 LFR",

        // Melee Weapon
        "Santonian HDH",
        "Omneco Maul",
        "Mastaba Fixed Blade",
        "Wox Compact",
        "Kovac Peacekeeper",
        "Attroc Titanium",
        "Maco Drillhead",
        "ISOCO Stinger",
        "Kovac Sledgehammer",
        "Santonian Mallet",

        // Hacking Tool
        "Hacking Tool",

        // Packs
        "Medipack",
        "Ammo pack",
        "Tool refill pack",
        "Disinfect pack",

        // Consumables
        "Glowsticks",
        "Long range flashlight",
        "I2-LP Syringe",
        "IIX Syringe",
        "Cfoam Grenade",
        "Lock melter",
        "Fog repeller",
        "Explosive tripmine",
        "Cfoam tripmine",

        // Big pickup
        "Powercell",
        "Fog repeller",
        "Neonate",
        "Matter Wave Projector",
        "Data Sphere",
        "Cargo Crate",
        "Cryo",
        "Collection Case",
    ]
}