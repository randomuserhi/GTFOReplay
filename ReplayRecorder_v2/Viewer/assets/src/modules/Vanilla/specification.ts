import { Vector3Like } from "three";
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
import { gearFoldAnimations, playerAnimationClips, playerAnimations } from "./animations/assets.js";
import { GearFoldAnimation } from "./animations/gearfold.js";
import { HumanAnimation } from "./animations/human.js";

export type Archetype = 
    "melee" |
    "pistol" |
    "rifle" |
    "consumable";

type Id<T> = { id: number } & T;

export interface Equippable {
    id: number;
    name?: string;
    archetype: Archetype;
    model(): Model;
}

export interface Specification {
    player: {
        maxHealth: number
    }
    equippable: Map<number, Equippable>;
    meleeArchetype: Map<number, Id<MeleeArchetype>>; 
    consumableArchetype: Map<number, Id<ConsumableArchetype>>;
    gearArchetype: Map<number, Id<GearArchetype>>;
    enemies: Map<number, EnemySpecification>;
}

export interface EnemySpecification {
    id: number;
    name?: string;
    maxHealth: number;
    height?: number;
    neckScale?: Vector3Like;
    headScale?: Vector3Like;
    chestScale?: Vector3Like;
    armScale?: Vector3Like;
    legScale?: Vector3Like;
}

export interface MeleeArchetype {
    equipAnim: HumanAnimation,
    movementAnim: HumanAnimation,
    jumpAnim: HumanAnimation,
    fallAnim: HumanAnimation,
    landAnim: HumanAnimation,
    attackAnim: HumanAnimation,
    chargeAnim: HumanAnimation,
    chargeIdleAnim: HumanAnimation,
    releaseAnim: HumanAnimation,
    shoveAnim: HumanAnimation,
}

export interface ConsumableArchetype {
    equipAnim?: HumanAnimation;
    throwAnim?: HumanAnimation;
    chargeAnim?: HumanAnimation;
    chargeIdleAnim?: HumanAnimation;
}

export interface GearArchetype {
    reloadDuration: number; // NOTE(randomuserhi): in seconds
    leftHandAnim?: HumanAnimation;
    gunFoldAnim?: GearFoldAnimation;
}

export const hammerArchetype: MeleeArchetype = {
    equipAnim: playerAnimationClips.Equip_Melee,
    movementAnim: playerAnimations.hammerMovement,
    jumpAnim: playerAnimationClips.SledgeHammer_Jump,
    fallAnim:  playerAnimationClips.SledgeHammer_Fall,
    landAnim:  playerAnimationClips.SledgeHammer_Land,
    attackAnim: playerAnimations.hammerSwing,
    chargeAnim: playerAnimations.hammerCharge,
    chargeIdleAnim: playerAnimations.hammerChargeIdle,
    releaseAnim: playerAnimations.hammerRelease,
    shoveAnim: playerAnimations.hammerShove,
};

const _melee: Id<MeleeArchetype>[] = [{
    id: 41,
    ...hammerArchetype
}, {
    id: 74,
    ...hammerArchetype
}, {
    id: 42,
    ...hammerArchetype
}, {
    id: 49,
    ...hammerArchetype
}, {
    id: 50,
    ...hammerArchetype
}, {
    id: 51,
    ...hammerArchetype
}];

const _consumable: Id<ConsumableArchetype>[] = [{
    id: 63,
    equipAnim: playerAnimationClips.Fogrepeller_Throw_Equip,
    throwAnim: playerAnimationClips.Fogrepeller_Throw,
    chargeAnim: playerAnimationClips.Fogrepeller_Throw_Charge,
    chargeIdleAnim: playerAnimationClips.Fogrepeller_Throw_Charge_Idle
}];

const _gearArchetype: Id<GearArchetype>[] = [{
    id: 1,
    gunFoldAnim: undefined,
    leftHandAnim: playerAnimationClips.Stock_Pistol_1_reload,
    reloadDuration: 1.3
}, {
    id: 3,
    gunFoldAnim: gearFoldAnimations.Front_Revolver_2_Reload_0,
    leftHandAnim: playerAnimationClips.Front_Revolver_2_Reload,
    reloadDuration: 2.3
}, {
    id: 25,
    gunFoldAnim: gearFoldAnimations.Revolver_Front_1_Reload_1,
    leftHandAnim: playerAnimationClips.Front_Revolver_1_reload,
    reloadDuration: 1.75
}];

const _equippable: Equippable[] = [{
    id: 43,
    name: "knife",
    archetype: "melee",
    model: () => new Knife()
}, {
    id: 44,
    name: "knife",
    archetype: "melee",
    model: () => new Knife()
}, {
    id: 45,
    name: "Bat",
    archetype: "melee",
    model: () => new Bat()
}, {
    id: 46,
    name: "Bat",
    archetype: "melee",
    model: () => new Bat()
}, {
    id: 48,
    name: "Spear",
    archetype: "melee",
    model: () => new Spear()
}, {
    id: 47,
    name: "Spear",
    archetype: "melee",
    model: () => new Spear()
}, {
    id: 41,
    name: "Hammer",
    archetype: "melee",
    model: () => new Hammer()
}, {
    id: 74,
    name: "Hammer",
    archetype: "melee",
    model: () => new Hammer()
}, {
    id: 42,
    name: "Hammer",
    archetype: "melee",
    model: () => new Hammer()
}, {
    id: 49,
    name: "Hammer",
    archetype: "melee",
    model: () => new Hammer()
}, {
    id: 50,
    name: "Hammer",
    archetype: "melee",
    model: () => new Hammer()
}, {
    id: 51,
    name: "Hammer",
    archetype: "melee",
    model: () => new Hammer()
}, {
    id: 53,
    archetype: "consumable",
    model: () => new Pack(0xff0000)
}, {
    id: 54,
    archetype: "consumable",
    model: () => new Pack(0x00ff00)
}, {
    id: 55,
    archetype: "consumable",
    model: () => new Pack(0x0000ff)
}, {
    id: 56,
    archetype: "consumable",
    model: () => new Pack(0xffffff)
}, {
    id: 37,
    archetype: "rifle",
    name: "Burst Sentry",
    model: () => new Sentry()
}, {
    id: 38,
    name: "Shotgun Sentry",
    archetype: "rifle",
    model: () => new Sentry()
}, {
    id: 39,
    name: "Auto Sentry",
    archetype: "rifle",
    model: () => new Sentry()
}, {
    id: 40,
    name: "Sniper Sentry",
    archetype: "rifle",
    model: () => new Sentry()
}, {
    id: 34,
    name: "Bio Tracker",
    archetype: "rifle",
    model: () => new Biotracker()
}, {
    id: 35,
    name: "C-Foam Launcher",
    archetype: "rifle",
    model: () => new CfoamLauncher()
}, {
    id: 36,
    name: "Mine Deployer",
    archetype: "rifle",
    model: () => new MineDeployer()
}, {
    id: 1,
    name: "Pistol",
    archetype: "pistol",
    model: () => new Pistol()
}, {
    id: 2,
    name: "Burst Pistol",
    archetype: "pistol",
    model: () => new BurstPistol()
}, {
    id: 3,
    name: "Hel Revolver",
    archetype: "pistol",
    model: () => new HelRevolver()
}, {
    id: 4,
    name: "Machine Pistol",
    archetype: "pistol",
    model: () => new MachinePistol()
}, {
    id: 5,
    name: "Auto Pistol",
    archetype: "pistol",
    model: () => new AutoPistol()
}, {
    id: 6,
    name: "Bullpup",
    archetype: "rifle",
    model: () => new Bullpup()
}, {
    id: 7,
    name: "Smg",
    archetype: "rifle",
    model: () => new Smg()
}, {
    id: 8,
    name: "PDW",
    archetype: "rifle",
    model: () => new PDW()
}, {
    id: 9,
    name: "Heavy Smg",
    archetype: "rifle",
    model: () => new HeavySmg()
}, {
    id: 10,
    name: "Carbine",
    archetype: "rifle",
    model: () => new Carbine()
}, {
    id: 11,
    name: "Dmr",
    archetype: "rifle",
    model: () => new Dmr()
}, {
    id: 12,
    name: "Double Tap",
    archetype: "rifle",
    model: () => new DoubleTap()
}, {
    id: 13,
    name: "Assault Rifle",
    archetype: "rifle",
    model: () => new AssaultRifle()
}, {
    id: 14,
    name: "Burst Rifle",
    archetype: "rifle",
    model: () => new BurstRifle()
}, {
    id: 15,
    name: "Rifle",
    archetype: "rifle",
    model: () => new Rifle()
}, {
    id: 16,
    name: "Sawed Off",
    archetype: "pistol",
    model: () => new SawedOff()
}, {
    id: 17,
    name: "Hel Shotgun",
    archetype: "rifle",
    model: () => new HelShotgun()
}, {
    id: 18,
    name: "Slug Shotgun",
    archetype: "rifle",
    model: () => new SlugShotgun()
}, {
    id: 19,
    name: "Heavy Assault Rifle",
    archetype: "rifle",
    model: () => new HeavyAssaultRifle()
}, {
    id: 20,
    name: "Short Rifle",
    archetype: "rifle",
    model: () => new ShortRifle()
}, {
    id: 21,
    name: "Shotgun",
    archetype: "rifle",
    model: () => new Shotgun()
}, {
    id: 22,
    name: "Combat Shotgun",
    archetype: "rifle",
    model: () => new CombatShotgun()
}, {
    id: 23,
    name: "Scatter Gun",
    archetype: "rifle",
    model: () => new ScatterGun()
}, {
    id: 24,
    name: "Choke Mod Shotgun",
    archetype: "rifle",
    model: () => new ChokeModShotgun()
}, {
    id: 25,
    name: "Revolver",
    archetype: "pistol",
    model: () => new Revolver()
}, {
    id: 26,
    name: "Machine Gun",
    archetype: "rifle",
    model: () => new MachineGun0()
}, {
    id: 27,
    name: "Machine Gun",
    archetype: "rifle",
    model: () => new MachineGun1()
}, {
    id: 28,
    name: "Burst Cannon",
    archetype: "rifle",
    model: () => new BurstCannon()
}, {
    id: 29,
    name: "Hel Gun",
    archetype: "rifle",
    model: () => new HelGun()
}, {
    id: 30,
    name: "High Cal",
    archetype: "rifle",
    model: () => new HighCal()
}, {
    id: 31,
    name: "Precision Rifle",
    archetype: "rifle",
    model: () => new PrecisionRifle()
}, {
    id: 32,
    name: "Sniper",
    archetype: "rifle",
    model: () => new Sniper()
}, {
    id: 33,
    name: "Hel Rifle",
    archetype: "rifle",
    model: () => new HelRifle()
}, { 
    id: 57,
    name: "Glow Sticks",
    archetype: "consumable",
    model: () => new Pistol() // TODO 
}, { 
    id: 58,
    name: "Long Range Flashlight",
    archetype: "consumable",
    model: () => new Pistol() // TODO 
}, { 
    id: 59,
    name: "I2-LP Syringe",
    archetype: "consumable",
    model: () => new Pistol() // TODO 
}, { 
    id: 60,
    name: "IIX Syringe",
    archetype: "consumable",
    model: () => new Pistol() // TODO  
}, { 
    id: 61,
    name: "Cfoam Grenade",
    archetype: "consumable",
    model: () => new Pistol() // TODO  
}, { 
    id: 62,
    name: "Lock Melter",
    archetype: "consumable",
    model: () => new Pistol() // TODO  

}, { 
    id: 63,
    name: "Fog Repeller",
    archetype: "consumable",
    model: () => new Pistol() // TODO   
}, { 
    id: 64,
    name: "Explosive Tripmine",
    archetype: "consumable",
    model: () => new Pistol() // TODO   
}, { 
    id: 65,
    name: "Cfoam Tripmine",
    archetype: "consumable",
    model: () => new Pistol() // TODO   
}];

const _enemies: EnemySpecification[] = [{
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
    meleeArchetype: new Map(_melee.map(g => [g.id, g])),
    consumableArchetype: new Map(_consumable.map(g => [g.id, g])),
    gearArchetype: new Map(_gearArchetype.map(g => [g.id, g])),
    enemies: new Map(_enemies.map(e => [e.id, e]))
};