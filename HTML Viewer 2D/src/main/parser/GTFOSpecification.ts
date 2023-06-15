// TODO(randomuserhi): Load from file and sync with C# spec sheet

interface GTFOSpecification
{
    player: {
        maxHealth: number
    },
    enemies: string[]
}

let GTFOSpecification: GTFOSpecification = {
    player: {
        maxHealth: 25
    },
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
        "Snatcher"
    ]
}