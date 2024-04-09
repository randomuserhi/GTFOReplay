import { AssaultRifle } from "./Equippable/assaultrifle.js";
import { AutoPistol } from "./Equippable/autopistol.js";
import { Bat } from "./Equippable/bat.js";
import { Biotracker } from "./Equippable/biotracker.js";
import { Bullpup } from "./Equippable/bullpup.js";
import { BurstCannon } from "./Equippable/burstcannon.js";
import { BurstPistol } from "./Equippable/burstpistol.js";
import { BurstRifle } from "./Equippable/burstrifle.js";
import { Carbine } from "./Equippable/carbine.js";
import { CfoamLauncher } from "./Equippable/cfoam.js";
import { ChokeModShotgun } from "./Equippable/chokemodshotgun.js";
import { CombatShotgun } from "./Equippable/combatshotgun.js";
import { Dmr } from "./Equippable/dmr.js";
import { DoubleTap } from "./Equippable/doubletap.js";
import { Model } from "./Equippable/equippable.js";
import { Hammer } from "./Equippable/hammer.js";
import { HeavyAssaultRifle } from "./Equippable/heavyassaultrifle.js";
import { HeavySmg } from "./Equippable/heavysmg.js";
import { HelGun } from "./Equippable/helgun.js";
import { HelRevolver } from "./Equippable/helrevolver.js";
import { HelRifle } from "./Equippable/helrifle.js";
import { HelShotgun } from "./Equippable/helshotgun.js";
import { HighCal } from "./Equippable/highcal.js";
import { Knife } from "./Equippable/knife.js";
import { MachineGun0 } from "./Equippable/machinegun0.js";
import { MachineGun1 } from "./Equippable/machinegun1.js";
import { MachinePistol } from "./Equippable/machinepistol.js";
import { MineDeployer } from "./Equippable/minedeployer.js";
import { Pack } from "./Equippable/pack.js";
import { PDW } from "./Equippable/pdw.js";
import { Pistol } from "./Equippable/pistol.js";
import { PrecisionRifle } from "./Equippable/precisionrifle.js";
import { Revolver } from "./Equippable/revolver.js";
import { Rifle } from "./Equippable/rifle.js";
import { SawedOff } from "./Equippable/sawedoff.js";
import { ScatterGun } from "./Equippable/scattergun.js";
import { Sentry } from "./Equippable/sentry.js";
import { ShortRifle } from "./Equippable/shortrifle.js";
import { Shotgun } from "./Equippable/shotgun.js";
import { SlugShotgun } from "./Equippable/slugshotgun.js";
import { Smg } from "./Equippable/smg.js";
import { Sniper } from "./Equippable/sniper.js";
import { Spear } from "./Equippable/spear.js";

export interface Specification {
    player: {
        maxHealth: number
    }
    equippable: Map<number, {
        id: number;
        name?: string;
        model(): Model;
    }>;
    enemies: Map<number, {
        id: number;
        name?: string;
        maxHealth: number;
        height?: number;
    }>;
}

const _equippable = [{
    id: 43,
    name: "knife",
    model: () => new Knife()
}, {
    id: 44,
    name: "knife",
    model: () => new Knife()
}, {
    id: 45,
    name: "Bat",
    model: () => new Bat()
}, {
    id: 46,
    name: "Bat",
    model: () => new Bat()
}, {
    id: 48,
    name: "Spear",
    model: () => new Spear()
}, {
    id: 47,
    name: "Spear",
    model: () => new Spear()
}, {
    id: 41,
    name: "Hammer",
    model: () => new Hammer()
}, {
    id: 74,
    name: "Hammer",
    model: () => new Hammer()
}, {
    id: 42,
    name: "Hammer",
    model: () => new Hammer()
}, {
    id: 49,
    name: "Hammer",
    model: () => new Hammer()
}, {
    id: 50,
    name: "Hammer",
    model: () => new Hammer()
}, {
    id: 51,
    name: "Hammer",
    model: () => new Hammer()
}, {
    id: 53,
    model: () => new Pack(0xff0000)
}, {
    id: 54,
    model: () => new Pack(0x00ff00)
}, {
    id: 55,
    model: () => new Pack(0x0000ff)
}, {
    id: 56,
    model: () => new Pack(0xffffff)
}, {
    id: 37,
    name: "Burst Sentry",
    model: () => new Sentry()
}, {
    id: 38,
    name: "Shotgun Sentry",
    model: () => new Sentry()
}, {
    id: 39,
    name: "Auto Sentry",
    model: () => new Sentry()
}, {
    id: 40,
    name: "Sniper Sentry",
    model: () => new Sentry()
}, {
    id: 34,
    name: "Bio Tracker",
    model: () => new Biotracker()
}, {
    id: 35,
    name: "C-Foam Launcher",
    model: () => new CfoamLauncher()
}, {
    id: 36,
    name: "Mine Deployer",
    model: () => new MineDeployer()
}, {
    id: 1,
    name: "Pistol",
    model: () => new Pistol()
}, {
    id: 2,
    name: "Burst Pistol",
    model: () => new BurstPistol()
}, {
    id: 3,
    name: "Hel Revolver",
    model: () => new HelRevolver()
}, {
    id: 4,
    name: "Machine Pistol",
    model: () => new MachinePistol()
}, {
    id: 5,
    name: "Auto Pistol",
    model: () => new AutoPistol()
}, {
    id: 6,
    name: "Bullpup",
    model: () => new Bullpup()
}, {
    id: 7,
    name: "Smg",
    model: () => new Smg()
}, {
    id: 8,
    name: "PDW",
    model: () => new PDW()
}, {
    id: 9,
    name: "Heavy Smg",
    model: () => new HeavySmg()
}, {
    id: 10,
    name: "Carbine",
    model: () => new Carbine()
}, {
    id: 11,
    name: "Dmr",
    model: () => new Dmr()
}, {
    id: 12,
    name: "Double Tap",
    model: () => new DoubleTap()
}, {
    id: 13,
    name: "Assault Rifle",
    model: () => new AssaultRifle()
}, {
    id: 14,
    name: "Burst Rifle",
    model: () => new BurstRifle()
}, {
    id: 15,
    name: "Rifle",
    model: () => new Rifle()
}, {
    id: 16,
    name: "Sawed Off",
    model: () => new SawedOff()
}, {
    id: 17,
    name: "Hel Shotgun",
    model: () => new HelShotgun()
}, {
    id: 18,
    name: "Slug Shotgun",
    model: () => new SlugShotgun()
}, {
    id: 19,
    name: "Heavy Assault Rifle",
    model: () => new HeavyAssaultRifle()
}, {
    id: 20,
    name: "Short Rifle",
    model: () => new ShortRifle()
}, {
    id: 21,
    name: "Shotgun",
    model: () => new Shotgun()
}, {
    id: 22,
    name: "Combat Shotgun",
    model: () => new CombatShotgun()
}, {
    id: 23,
    name: "Scatter Gun",
    model: () => new ScatterGun()
}, {
    id: 24,
    name: "Choke Mod Shotgun",
    model: () => new ChokeModShotgun()
}, {
    id: 25,
    name: "Revolver",
    model: () => new Revolver()
}, {
    id: 26,
    name: "Machine Gun",
    model: () => new MachineGun0()
}, {
    id: 27,
    name: "Machine Gun",
    model: () => new MachineGun1()
}, {
    id: 28,
    name: "Burst Cannon",
    model: () => new BurstCannon()
}, {
    id: 29,
    name: "Hel Gun",
    model: () => new HelGun()
}, {
    id: 30,
    name: "High Cal",
    model: () => new HighCal()
}, {
    id: 31,
    name: "Precision Rifle",
    model: () => new PrecisionRifle()
}, {
    id: 32,
    name: "Sniper",
    model: () => new Sniper()
}, {
    id: 33,
    name: "Hel Rifle",
    model: () => new HelRifle()
}];

const _enemies = [{
    id: 0,
    name: "Unknown",
    maxHealth: Infinity
}, {
    id: 1,
    name: "Scout",
    maxHealth: 42
}, {
    id: 2,
    name: "Shadow Scout",
    maxHealth: 42
}, {
    id: 3,
    name: "Charger Scout",
    maxHealth: 60
}, {
    id: 4,
    name: "Shadow",
    maxHealth: 20
}, {
    id: 5,
    name: "Big Shadow",
    maxHealth: 20
}, {
    id: 6,
    name: "Baby",
    maxHealth: 5
}, {
    id: 7,
    name: "Striker",
    maxHealth: 20
}, {
    id: 8,
    name: "Big Striker",
    maxHealth: 120
}, {
    id: 9,
    name: "Shooter",
    maxHealth: 30
}, {
    id: 10,
    name: "Big Shooter",
    maxHealth: 150
}, {
    id: 11,
    name: "Hybrid",
    maxHealth: 150
}, {
    id: 12,
    name: "Charger",
    maxHealth: 30
}, {
    id: 13,
    name: "Big Charger",
    maxHealth: 120
}, {
    id: 14,
    name: "Tank",
    maxHealth: 1000
}, {
    id: 15,
    name: "Mother",
    maxHealth: 1000
}, {
    id: 16,
    name: "Big Mother",
    maxHealth: 2500
}, {
    id: 17,
    name: "Snatcher",
    maxHealth: 225
}, {
    id: 18,
    name: "Immortal Tank",
    maxHealth: Infinity
}, {
    id: 19,
    name: "Flyer",
    maxHealth: 16.2
}, {
    id: 20,
    name: "Big Flyer",
    maxHealth: 150
}, {
    id: 21,
    name: "Squid",
    maxHealth: 6000
}, {
    id: 22,
    name: "Squid Boss",
    maxHealth: 6000
}, {
    id: 23,
    name: "Nightmare Striker",
    maxHealth: 37
}, {
    id: 24,
    name: "Nightmare Shooter",
    maxHealth: 18
}, {
    id: 25,
    name: "Nightmare Scout",
    maxHealth: 161
}];

export const specification: Specification = {
    player: {
        maxHealth: 25
    },
    equippable: new Map(_equippable.map(g => [g.id, g])),
    enemies: new Map(_enemies.map(e => [e.id, e]))
};