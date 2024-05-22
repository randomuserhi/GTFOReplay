import { Color, Vector3, Vector3Like } from "three";
import { AssaultRifle } from "./Equippable/assaultrifle.js";
import { AutoPistol } from "./Equippable/autopistol.js";
import { Bat } from "./Equippable/bat.js";
import { Biotracker } from "./Equippable/biotracker.js";
import { Bullpup } from "./Equippable/bullpup.js";
import { BurstCannon } from "./Equippable/burstcannon.js";
import { BurstPistol } from "./Equippable/burstpistol.js";
import { BurstRifle } from "./Equippable/burstrifle.js";
import { Carbine } from "./Equippable/carbine.js";
import { CargoCrate } from "./Equippable/cargocrate.js";
import { CfoamLauncher } from "./Equippable/cfoam.js";
import { CfoamGrenade } from "./Equippable/cfoamgrenade.js";
import { CfoamTripMine } from "./Equippable/cfoamtripmine.js";
import { ChokeModShotgun } from "./Equippable/chokemodshotgun.js";
import { CollectionCase } from "./Equippable/collectioncase.js";
import { CombatShotgun } from "./Equippable/combatshotgun.js";
import { ConsumableMine } from "./Equippable/consumablemine.js";
import { Cryo } from "./Equippable/cryo.js";
import { Dmr } from "./Equippable/dmr.js";
import { DoubleTap } from "./Equippable/doubletap.js";
import { Model } from "./Equippable/equippable.js";
import { FogRepeller } from "./Equippable/fogrepeller.js";
import { GlowStick } from "./Equippable/glowsticks.js";
import { Hammer } from "./Equippable/hammer.js";
import { HeavyAssaultRifle } from "./Equippable/heavyassaultrifle.js";
import { HeavyFogRepeller } from "./Equippable/heavyfogturbine.js";
import { HeavySmg } from "./Equippable/heavysmg.js";
import { HelGun } from "./Equippable/helgun.js";
import { HelRevolver } from "./Equippable/helrevolver.js";
import { HelRifle } from "./Equippable/helrifle.js";
import { HelShotgun } from "./Equippable/helshotgun.js";
import { HighCal } from "./Equippable/highcal.js";
import { HisecCargoCrate } from "./Equippable/hisec.js";
import { Knife } from "./Equippable/knife.js";
import { LockMelter } from "./Equippable/lockmelter.js";
import { LongRangeFlashlight } from "./Equippable/longrangeflashlight.js";
import { MachineGun0 } from "./Equippable/machinegun0.js";
import { MachineGun1 } from "./Equippable/machinegun1.js";
import { MachinePistol } from "./Equippable/machinepistol.js";
import { MatterWaveProjector } from "./Equippable/matterwaveprojector.js";
import { MineDeployer } from "./Equippable/minedeployer.js";
import { Neonate } from "./Equippable/neonate.js";
import { Pack } from "./Equippable/pack.js";
import { PDW } from "./Equippable/pdw.js";
import { Pistol } from "./Equippable/pistol.js";
import { PowerCell } from "./Equippable/powercell.js";
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
import { Syringe } from "./Equippable/syringe.js";
import { enemyAnimations, gearFoldAnimations, playerAnimationClips, playerAnimations } from "./animations/assets.js";
import { GearFoldAnimation } from "./animations/gearfold.js";
import { HumanAnimation } from "./animations/human.js";
import { AnimHandles, EnemyModel } from "./enemy/enemy.js";

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
    enemyAnimHandles: Map<AnimHandles.Flags, EnemyAnimHandle>;
}

export interface EnemyAnimHandle {
    name: AnimHandles.Flags;
    movement: HumanAnimation;
    abilityFire: HumanAnimation[];
}

const _enemyAnimHandles: EnemyAnimHandle[] = [{
    name: "enemyRunner",
    movement: enemyAnimations.enemyRunnerMovement,
    abilityFire: [
        enemyAnimations.Ability_Fire_0,
        enemyAnimations.Ability_Fire_0,
        enemyAnimations.Ability_Fire_2
    ]
}, {
    name: "enemyLow",
    movement: enemyAnimations.enemyLowMovement,
    abilityFire: [
        enemyAnimations.LO_Ability_Fire_A,
        enemyAnimations.LO_Ability_Fire_B,
        enemyAnimations.LO_Ability_Fire_C
    ]
}, {
    name: "enemyFiddler",
    movement: enemyAnimations.enemyFiddleMovement,
    abilityFire: [
        enemyAnimations.FD_Ability_Fire_A,
        enemyAnimations.FD_Ability_Fire_B,
        enemyAnimations.FD_Ability_Fire_B
    ]
}, {
    name: "enemyCrawl",
    movement: enemyAnimations.enemyCrawlMovement,
    abilityFire: [
        enemyAnimations.CA_Ability_Fire_A,
        enemyAnimations.CA_Ability_Fire_B,
        enemyAnimations.CA_Ability_Fire_B
    ]
}, {
    name: "enemyCrawlFlip",
    movement: enemyAnimations.enemyCrawlFlipMovement,
    abilityFire: [
        enemyAnimations.CF_Ability_Fire_A,
        enemyAnimations.CF_Ability_Fire_B,
        enemyAnimations.CF_Ability_Fire_B
    ]
}, {
    name: "enemyCripple",
    movement: enemyAnimations.enemyCrippleMovement,
    abilityFire: [
        enemyAnimations.CR_Ability_Fire_A,
        enemyAnimations.CR_Ability_Fire_B,
        enemyAnimations.CR_Ability_Fire_C
    ]
}, {
    name: "enemyBig",
    movement: enemyAnimations.enemyBigMovement,
    abilityFire: [
        enemyAnimations.Enemy_Big_Fire_A,
        enemyAnimations.Enemy_Big_Fire_B
    ]
}, {
    name: "enemyGiant",
    movement: enemyAnimations.enemyGiantMovement,
    abilityFire: [
        enemyAnimations.Monster_Tentacle,
        enemyAnimations.Monster_Tentacle, 
    ]
}, {
    name: "enemyPouncer",
    movement: enemyAnimations.enemyPouncerMovement,
    abilityFire: []
}, {
    name: "enemyBirtherCrawlFlip",
    movement: enemyAnimations.enemyCrawlFlipMovement,
    abilityFire: [
        enemyAnimations.CF_Ability_Fire_A, 
        enemyAnimations.CF_Ability_Fire_B,
        enemyAnimations.CF_Ability_Fire_B
    ]
}];

export interface EnemySpecification {
    id: number;
    maxHealth: number;
    name?: string;
    model?: () => EnemyModel;
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
    gunFoldAnim?: GearFoldAnimation;
    offset?: Vector3Like;
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

export const spearArchetype: MeleeArchetype = {
    equipAnim: playerAnimationClips.Equip_Melee,
    movementAnim: playerAnimations.spearMovement,
    jumpAnim: playerAnimationClips.Spear_Jump,
    fallAnim:  playerAnimationClips.Spear_Fall,
    landAnim:  playerAnimationClips.Spear_Land,
    attackAnim: playerAnimations.spearSwing,
    chargeAnim: playerAnimations.spearCharge,
    chargeIdleAnim: playerAnimations.spearChargeIdle,
    releaseAnim: playerAnimations.spearRelease,
    shoveAnim: playerAnimations.spearShove,
};

export const knifeArchetype: MeleeArchetype = {
    equipAnim: playerAnimationClips.Equip_Melee,
    movementAnim: playerAnimations.knifeMovement,
    jumpAnim: playerAnimationClips.Knife_Jump,
    fallAnim:  playerAnimationClips.Knife_Fall,
    landAnim:  playerAnimationClips.Knife_Land,
    attackAnim: playerAnimations.knifeSwing,
    chargeAnim: playerAnimations.knifeCharge,
    chargeIdleAnim: playerAnimations.knifeChargeIdle,
    releaseAnim: playerAnimations.knifeRelease,
    shoveAnim: playerAnimations.knifeShove,
};

export const batArchetype: MeleeArchetype = {
    equipAnim: playerAnimationClips.Equip_Melee,
    movementAnim: playerAnimations.batMovement,
    jumpAnim: playerAnimationClips.Knife_Jump,
    fallAnim:  playerAnimationClips.Knife_Fall,
    landAnim:  playerAnimationClips.Knife_Land,
    attackAnim: playerAnimations.batSwing,
    chargeAnim: playerAnimations.batCharge,
    chargeIdleAnim: playerAnimations.batChargeIdle,
    releaseAnim: playerAnimations.batRelease,
    shoveAnim: playerAnimations.batShove,
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
}, {
    id: 43,
    ...knifeArchetype
}, {
    id: 44,
    ...knifeArchetype
}, {
    id: 45,
    ...batArchetype
}, {
    id: 46,
    ...batArchetype
}, {
    id: 47,
    ...spearArchetype
}, {
    id: 48,
    ...spearArchetype
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
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
}, {
    id: 2,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
}, {
    id: 3,
    gunFoldAnim: gearFoldAnimations.Front_Revolver_2_Reload_0,
}, {
    id: 4,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
}, {
    id: 5,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.1)
}, {
    id: 6,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
}, {
    id: 7,
    gunFoldAnim: gearFoldAnimations.SMG_Front_4_Reload_1,
}, {
    id: 8,
    gunFoldAnim: gearFoldAnimations.SMG_Front_4_Reload_1,
}, {
    id: 9,
    gunFoldAnim: gearFoldAnimations.SMG_Front_4_Reload_1,
}, {
    id: 10,
    gunFoldAnim: gearFoldAnimations.SMG_Front_4_Reload_1,
}, {
    id: 11,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.2)
}, {
    id: 12,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.2)
}, {
    id: 13,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.2)
}, {
    id: 14,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.2)
}, {
    id: 15,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.2)
}, {
    id: 16,
    gunFoldAnim: gearFoldAnimations.Revolver_Front_1_Reload_1,
}, {
    id: 17,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.2)
}, {
    id: 18,
    gunFoldAnim: gearFoldAnimations.Front_AutoShotgun_2_Parts_Reload,
    offset: new Vector3(0, 0, 0.2)
}, {
    id: 19,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.2)
}, {
    id: 20,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.2)
}, {
    id: 21,
    gunFoldAnim: gearFoldAnimations.Front_AutoShotgun_2_Parts_Reload,
    offset: new Vector3(0, -0.05, 0.2)
}, {
    id: 22,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.2)
}, {
    id: 23,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.2)
}, {
    id: 24,
    gunFoldAnim: gearFoldAnimations.Front_AutoShotgun_2_Parts_Reload,
    offset: new Vector3(0, -0.05, 0.2)
}, {
    id: 25,
    gunFoldAnim: gearFoldAnimations.Revolver_Front_1_Reload_1,
}, {
    id: 26,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.2)
}, {
    id: 27,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.2)
}, {
    id: 28,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.2)
}, {
    id: 29,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.2)
}, {
    id: 30,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
}, {
    id: 31,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.2)
}, {
    id: 32,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.2)
}, {
    id: 33,
    gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.2)
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
    archetype: "pistol",
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
    model: () => new GlowStick()
}, { 
    id: 58,
    name: "Long Range Flashlight",
    archetype: "consumable",
    model: () => new LongRangeFlashlight() 
}, { 
    id: 59,
    name: "I2-LP Syringe",
    archetype: "consumable",
    model: () => new Syringe(new Color(0xff4444)) 
}, { 
    id: 60,
    name: "IIX Syringe",
    archetype: "consumable",
    model: () => new Syringe(new Color(0xffff00))
}, { 
    id: 61,
    name: "Cfoam Grenade",
    archetype: "consumable",
    model: () => new CfoamGrenade()
}, { 
    id: 62,
    name: "Lock Melter",
    archetype: "consumable",
    model: () => new LockMelter()

}, { 
    id: 63,
    name: "Fog Repeller",
    archetype: "consumable",
    model: () => new FogRepeller()   
}, { 
    id: 64,
    name: "Explosive Tripmine",
    archetype: "consumable",
    model: () => new ConsumableMine()
}, { 
    id: 65,
    name: "Cfoam Tripmine",
    archetype: "consumable",
    model: () => new CfoamTripMine()
}, { 
    id: 66,
    name: "Power Cell",
    archetype: "rifle",
    model: () => new PowerCell()
}, { 
    id: 67,
    name: "Fog Repeller",
    archetype: "rifle",
    model: () => new HeavyFogRepeller()
}, { 
    id: 68,
    name: "Neonate",
    archetype: "rifle",
    model: () => new Neonate()
}, { 
    id: 69,
    name: "Matter Wave Projector",
    archetype: "rifle",
    model: () => new MatterWaveProjector()
}, { 
    id: 71,
    name: "Cargo Crate",
    archetype: "rifle",
    model: () => new CargoCrate()
}, { 
    id: 72,
    name: "Hisec Cargo Crate",
    archetype: "rifle",
    model: () => new HisecCargoCrate()
}, { 
    id: 73,
    name: "Cryo",
    archetype: "rifle",
    model: () => new Cryo()
}, { 
    id: 74,
    name: "Collection Case",
    archetype: "rifle",
    model: () => new CollectionCase()
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
    maxHealth: 120,
    headScale: {
        x: 0.65,
        y: 0.65,
        z: 0.65
    },
    armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
    },
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
    enemies: new Map(_enemies.map(e => [e.id, e])),
    enemyAnimHandles: new Map(_enemyAnimHandles.map(e => [e.name, e]))
};