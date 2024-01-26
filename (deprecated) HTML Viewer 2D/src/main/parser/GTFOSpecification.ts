// TODO(randomuserhi): Load from file and sync with C# spec sheet

interface GTFOSpecification
{
    player: {
        maxHealth: number
    },
    mines: string[],
    enemies: string[],
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
    items: [
        //"Unknown",
        "Shelling S49",
        "Bataldo 3RB",
        "Raptus Treffen 2",
        "Raptus Steigro",
        "Accrat Golok DA",
        "Van Auken LTC5",
        "Accrat STB",
        "Van Auken CAB F4",
        "TR22 Hanaway",
        "Malatack LX",
        "Malatack CH 4",
        "Drekker Pres MOD 556",
        "Bataldo J 300",
        //"Accrat ND6",
        "Malatack HXC",
        "Buckland s870",
        "Buckland AF6",
        "Buckland XDist2",
        "Mastaba R66",
        "TechMan Arbalist V",
        "TechMan Veruta XII",
        "TechMan Klust 6",
        "Omneco EXP1",
        "Shelling Arid 5",
        "Drekker Del P1",
        "Köning PR 11",
        "Omneco LRG",
        "Santonian HDH",
        "Mastaba Fixed Blade",
        "Kovac Peacekeeper",
        "MACO Drillhead",
        "Mechatronic SGB3",
        "Mechatronic B5 LFR",
        "Autotek 51 RSG",
        "Rad Labs Meduza",
        "D-tek Optron IV",
        "Stalwart Flow G2",
        "Krieger O4",
        "Ammo Pack",
        "Tool Refill Pack",
        "MediPack",
        //"Hacking Tool",
        //"Long Range Flashlight",
        //"Lock Melter",
        //"Glow Stick",
        //"Explosive Mine"
    ]
}