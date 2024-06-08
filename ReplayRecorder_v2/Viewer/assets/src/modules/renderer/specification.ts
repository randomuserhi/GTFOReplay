import { Color, ColorRepresentation, Vector3, Vector3Like } from "three";
import { AnimHandles, MeleeType } from "../parser/enemy/enemy.js";
import { Identifier, IdentifierData } from "../parser/identifier.js";
import { AssaultRifle } from "./Equippable/assaultrifle.js";
import { AutoPistol } from "./Equippable/autopistol.js";
import { Bat } from "./Equippable/bat.js";
import { Biotracker } from "./Equippable/biotracker.js";
import { BulkheadKey } from "./Equippable/bulkheadkey.js";
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
import { DataCube } from "./Equippable/datacube.js";
import { DataSphere } from "./Equippable/datasphere.js";
import { Dmr } from "./Equippable/dmr.js";
import { DoubleTap } from "./Equippable/doubletap.js";
import { Model } from "./Equippable/equippable.js";
import { FogRepeller } from "./Equippable/fogrepeller.js";
import { GlowStick } from "./Equippable/glowsticks.js";
import { GLP1 } from "./Equippable/glp1.js";
import { GLP2 } from "./Equippable/glp2.js";
import { HackingTool } from "./Equippable/hackingtool.js";
import { Hammer } from "./Equippable/hammer.js";
import { HardDrive } from "./Equippable/harddrive.js";
import { HeavyAssaultRifle } from "./Equippable/heavyassaultrifle.js";
import { HeavyFogRepeller } from "./Equippable/heavyfogturbine.js";
import { HeavySmg } from "./Equippable/heavysmg.js";
import { HelGun } from "./Equippable/helgun.js";
import { HelRevolver } from "./Equippable/helrevolver.js";
import { HelRifle } from "./Equippable/helrifle.js";
import { HelShotgun } from "./Equippable/helshotgun.js";
import { HighCal } from "./Equippable/highcal.js";
import { HisecCargoCrate } from "./Equippable/hisec.js";
import { Keycard } from "./Equippable/keycard.js";
import { Knife } from "./Equippable/knife.js";
import { LockMelter } from "./Equippable/lockmelter.js";
import { LongRangeFlashlight } from "./Equippable/longrangeflashlight.js";
import { MachineGun0 } from "./Equippable/machinegun0.js";
import { MachineGun1 } from "./Equippable/machinegun1.js";
import { MachinePistol } from "./Equippable/machinepistol.js";
import { MatterWaveProjector } from "./Equippable/matterwaveprojector.js";
import { MemoryStick } from "./Equippable/memorystick.js";
import { MineDeployer } from "./Equippable/minedeployer.js";
import { Neonate } from "./Equippable/neonate.js";
import { OSIP } from "./Equippable/osip.js";
import { Pack } from "./Equippable/pack.js";
import { PartialDecoder } from "./Equippable/partialdecoder.js";
import { PDW } from "./Equippable/pdw.js";
import { PID } from "./Equippable/pid.js";
import { Pistol } from "./Equippable/pistol.js";
import { PlantSample } from "./Equippable/plantsample.js";
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
import { AvatarStructure, ScaledAnim, mergeAnims } from "./animations/animation.js";
import { enemyAnimationClips, enemyAnimations, gearFoldAnimations, playerAnimationClips, playerAnimations } from "./animations/assets.js";
import { GearFoldAnimation } from "./animations/gearfold.js";
import { HumanAnimation, HumanJoints } from "./animations/human.js";
import { EnemyModel } from "./enemy/enemy.js";
import { BigFlyerModel, FlyerModel, SquidModel } from "./enemy/flyer.js";

// TODO(randomuserhi): Verify all IDs and code cleanup!

export type Archetype = 
    "melee" |
    "pistol" |
    "rifle" |
    "consumable";

export interface ConsumableArchetype {
    equipAnim?: HumanAnimation;
    throwAnim?: HumanAnimation;
    chargeAnim?: HumanAnimation;
    chargeIdleAnim?: HumanAnimation;
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

export interface GearArchetype {
    gunFoldAnim?: GearFoldAnimation;
    offset?: Vector3Like;
}

export interface Equippable<T = Identifier> {
    id: T;
    name?: string;
    type: Archetype;
    gearArchetype?: GearArchetype;
    meleeArchetype?: MeleeArchetype;
    consumableArchetype?: ConsumableArchetype
    model(): Model;
}

export interface EnemyAnimHandle {
    name: AnimHandles.Flags;
    movement: HumanAnimation;
    abilityFire: HumanAnimation[];
    hitLightFwd: HumanAnimation[];
    hitLightBwd: HumanAnimation[];
    hitLightLt: HumanAnimation[];
    hitLightRt: HumanAnimation[];
    hitHeavyFwd: HumanAnimation[];
    hitHeavyBwd: HumanAnimation[];
    hitHeavyLt: HumanAnimation[];
    hitHeavyRt: HumanAnimation[];
    melee?: { [K in MeleeType]: HumanAnimation[] }
    ladderClimb: HumanAnimation;
    jump: [HumanAnimation, HumanAnimation]; // NOTE(randomuserhi): Jump start, Jump end
    screams: HumanAnimation[];
    blend?: number;
    hibernateIn: HumanAnimation;
    hibernateLoop: HumanAnimation;
    heartbeats: HumanAnimation[];
    wakeup: HumanAnimation[];
    wakeupTurns: HumanAnimation[];
    abilityUse?: [HumanAnimation, HumanAnimation, HumanAnimation] // NOTE(randomuserhi): in, loop, out
}

const _enemyAnimHandles: EnemyAnimHandle[] = [{
    name: "enemyRunner",
    abilityUse: [
        enemyAnimationClips.RU_Ability_Use_In_a,
        enemyAnimationClips.RU_Ability_Use_Loop_a,
        enemyAnimationClips.RU_Ability_Use_Out_a,
    ],
    wakeup: [
        enemyAnimationClips.RU_Hibernate_Wakeup_A_0,
        enemyAnimationClips.RU_Hibernate_Wakeup_B_0,
        enemyAnimationClips.RU_Hibernate_Wakeup_C_0,
        enemyAnimationClips.RU_Hibernate_Wakeup_B_0
    ],
    wakeupTurns: [
        enemyAnimationClips.RU_Hibernate_Wakeup_Turn_A
    ],
    movement: enemyAnimations.enemyRunnerMovement,
    hibernateIn: enemyAnimationClips.RU_Hibernate_In,
    hibernateLoop: enemyAnimations.RU_HibernateDetect,
    ladderClimb: enemyAnimationClips.CA_Walk_Fwd_A,
    heartbeats: [
        enemyAnimationClips.RU_Hibernate_Heartbeat_A_0,
        enemyAnimationClips.RU_Hibernate_Heartbeat_B_0,
        enemyAnimationClips.RU_Hibernate_Heartbeat_C,
        enemyAnimationClips.RU_Hibernate_Heartbeat_D,
        enemyAnimationClips.RU_Hibernate_Heartbeat_E_0,
    ],
    screams: [
        enemyAnimationClips.RU_Scream_A,
        enemyAnimationClips.RU_Scream_B,
        enemyAnimationClips.RU_Scream_C,
    ],
    jump: [
        mergeAnims(enemyAnimationClips.RU_Jump_In, enemyAnimationClips.RU_Jump_Air_TimeBlend),
        enemyAnimationClips.RU_Jump_Out
    ],
    melee: {
        "Forward": [enemyAnimations.RU_Melee_Sequence_A_Fast],
        "Backward": [enemyAnimations.RU_Melee_Sequence_A_Fast],
    },
    abilityFire: [
        enemyAnimationClips.Ability_Fire_0_Start,
        enemyAnimationClips.Ability_Fire_0_Start,
        enemyAnimationClips.Ability_Fire_2_Start
    ],
    hitLightBwd: [
        enemyAnimationClips.RU_Hit_Light_Bwd_A,
        enemyAnimationClips.RU_Hit_Light_Bwd_B,
        enemyAnimationClips.RU_Hit_Light_Bwd_C,
        enemyAnimationClips.RU_Hit_Light_Bwd_B
    ],
    hitLightFwd: [
        enemyAnimationClips.RU_Hit_Light_Fwd_A,
        enemyAnimationClips.RU_Hit_Light_Fwd_B,
        enemyAnimationClips.RU_Hit_Light_Fwd_C
    ],
    hitLightLt: [
        enemyAnimationClips.RU_Hit_Light_Lt_A,
        enemyAnimationClips.RU_Hit_Light_Lt_B,
        enemyAnimationClips.RU_Hit_Light_Lt_C
    ],
    hitLightRt: [
        enemyAnimationClips.RU_Hit_Light_Rt_A,
        enemyAnimationClips.RU_Hit_Light_Rt_B,
        enemyAnimationClips.RU_Hit_Light_Rt_C
    ],
    hitHeavyBwd: [
        enemyAnimationClips.RU_Hit_Heavy_Bwd_A,
        enemyAnimationClips.RU_Hit_Heavy_Bwd_B,
        enemyAnimationClips.RU_Hit_Heavy_Bwd_Turn_A,
        enemyAnimationClips.RU_Hit_Heavy_Bwd_C
    ],
    hitHeavyFwd: [
        enemyAnimationClips.RU_Hit_Heavy_Fwd_A,
        enemyAnimationClips.RU_Hit_Heavy_Fwd_B,
        enemyAnimationClips.RU_Hit_Heavy_Fwd_C
    ],
    hitHeavyLt: [
        enemyAnimationClips.RU_Hit_Heavy_Lt_A,
        enemyAnimationClips.RU_Hit_Heavy_Lt_B,
        enemyAnimationClips.RU_Hit_Heavy_Lt_C
    ],
    hitHeavyRt: [
        enemyAnimationClips.RU_Hit_Heavy_Rt_A,
        enemyAnimationClips.RU_Hit_Heavy_Rt_B,
        enemyAnimationClips.RU_Hit_Heavy_Rt_C
    ],
}, {
    name: "enemyLow",
    abilityUse: [
        enemyAnimationClips.LO_Ability_Use_In_A,
        enemyAnimationClips.LO_Ability_Use_Loop_A,
        enemyAnimationClips.LO_Ability_Use_Out_A,
    ],
    wakeup: [
        enemyAnimationClips.LO_Hibernate_Wakeup_A,
        enemyAnimationClips.LO_Hibernate_Wakeup_B,
        enemyAnimationClips.LO_Hibernate_Wakeup_Fwd_C,
        enemyAnimationClips.LO_Hibernate_Wakeup_Fwd_D
    ],
    wakeupTurns: [
        enemyAnimationClips.LO_Hibernate_Wakeup_Turn_A
    ],
    heartbeats: [
        enemyAnimationClips.LO_Hibernate_Heartbeat_A,
        enemyAnimationClips.LO_Hibernate_Heartbeat_B,
        enemyAnimationClips.LO_Hibernate_Heartbeat_C,
        enemyAnimationClips.LO_Hibernate_Heartbeat_D,
        enemyAnimationClips.LO_Hibernate_Heartbeat_E,
    ],
    movement: enemyAnimations.enemyLowMovement,
    hibernateIn: enemyAnimationClips.LO_Hibernate_In_A,
    hibernateLoop: enemyAnimations.LO_HibernateDetect,
    screams: [
        enemyAnimationClips.LO_Scream_A,
        enemyAnimationClips.LO_Scream_B,
        enemyAnimationClips.LO_Scream_C,
    ],
    jump: [
        mergeAnims(enemyAnimationClips.LO_Jump_Start, enemyAnimationClips.LO_Jump_Air),
        enemyAnimationClips.LO_Jump_Land
    ],
    ladderClimb: enemyAnimationClips.CA_Walk_Fwd_A,
    melee: {
        "Forward": [enemyAnimationClips.Melee_Sequence_Fwd],
        "Backward": [enemyAnimationClips.Melee_Sequence_Fwd],
    },
    abilityFire: [
        enemyAnimationClips.LO_Ability_Fire_In_A, 
        enemyAnimationClips.LO_Ability_Fire_In_B,
        enemyAnimationClips.LO_Ability_Fire_In_C
    ],
    hitLightBwd: [
        enemyAnimationClips.LO_Hit_Light_Bwd_A,
        enemyAnimationClips.LO_Hit_Light_Bwd_b,
        enemyAnimationClips.LO_Hit_Light_Bwd_C,
        enemyAnimationClips.LO_Hit_Light_Bwd_Turn_A
    ],
    hitLightFwd: [
        enemyAnimationClips.LO_Hit_Light_Fwd_A,
        enemyAnimationClips.LO_Hit_Light_Fwd_B,
        enemyAnimationClips.LO_Hit_Light_Fwd_C
    ],
    hitLightLt: [
        enemyAnimationClips.LO_Hit_Light_Lt_A,
        enemyAnimationClips.LO_Hit_Light_Lt_B,
        enemyAnimationClips.LO_Hit_Light_Lt_C
    ],
    hitLightRt: [
        enemyAnimationClips.LO_Hit_Light_Rt_A,
        enemyAnimationClips.LO_Hit_Light_Rt_B,
        enemyAnimationClips.LO_Hit_Light_Rt_C
    ],
    hitHeavyBwd: [
        enemyAnimationClips.LO_Hit_Heavy_Bwd_A,
        enemyAnimationClips.LO_Hit_Heavy_Bwd_A,
        enemyAnimationClips.LO_Hit_Heavy_Bwd_A,
        enemyAnimationClips.CR_Hit_Heavy_Bwd_D
    ],
    hitHeavyFwd: [
        enemyAnimationClips.LO_Hit_Heavy_Fwd_A,
        enemyAnimationClips.LO_Hit_Heavy_Fwd_B,
        enemyAnimationClips.LO_Hit_Heavy_Fwd_C
    ],
    hitHeavyLt: [
        enemyAnimationClips.LO_Hit_Heavy_Lt_A,
        enemyAnimationClips.LO_Hit_Heavy_Lt_B,
        enemyAnimationClips.LO_Hit_Heavy_Lt_C
    ],
    hitHeavyRt: [
        enemyAnimationClips.LO_Hit_Heavy_Rt_A,
        enemyAnimationClips.LO_Hit_Heavy_Rt_B,
        enemyAnimationClips.LO_Hit_Heavy_Rt_C
    ],
}, {
    name: "enemyFiddler",
    abilityUse: [
        enemyAnimationClips.FD_Ability_Use_In_A,
        enemyAnimationClips.FD_Ability_Use_Loop_A,
        enemyAnimationClips.FD_Ability_Use_Out_A,
    ],
    wakeup: [
        enemyAnimationClips.FD_Hibernate_Wakeup_A,
        enemyAnimationClips.FD_Hibernate_Wakeup_B,
        enemyAnimationClips.FD_Hibernate_Wakeup_C,
        enemyAnimationClips.FD_Hibernate_Wakeup_B
    ],
    wakeupTurns: [
        enemyAnimationClips.FD_Hibernate_Wakeup_Turn_A
    ],
    heartbeats: [
        enemyAnimationClips.FD_Hibernate_Heartbeat_A,
        enemyAnimationClips.FD_Hibernate_Heartbeat_B,
        enemyAnimationClips.FD_Hibernate_Heartbeat_C,
        enemyAnimationClips.FD_Hibernate_Heartbeat_D,
        enemyAnimationClips.FD_Hibernate_Heartbeat_E,
    ],
    hibernateIn: enemyAnimationClips.FD_Hibernate_In,
    hibernateLoop: enemyAnimations.FD_HibernateDetect,
    screams: [
        enemyAnimationClips.FD_Scream_A,
        enemyAnimationClips.FD_Scream_B,
        enemyAnimationClips.FD_Scream_C,
    ],
    jump: [
        mergeAnims(enemyAnimationClips.FD_Jump_Start, enemyAnimationClips.FD_Jump_Air),
        enemyAnimationClips.FD_Jump_Land
    ],
    movement: enemyAnimations.enemyFiddleMovement,
    ladderClimb: enemyAnimationClips.CA_Walk_Fwd_A,
    abilityFire: [
        enemyAnimationClips.FD_Ability_Fire_In_A, 
        enemyAnimationClips.FD_Ability_Fire_In_B,
        enemyAnimationClips.FD_Ability_Fire_In_B
    ],
    hitLightBwd: [
        enemyAnimationClips.FD_Hit_Light_Bwd_A,
        enemyAnimationClips.FD_Hit_Light_Bwd_B,
        enemyAnimationClips.FD_Hit_Light_Bwd_C,
        enemyAnimationClips.FD_Hit_Light_Bwd_C // Not actually defined in vanilla game
    ],
    hitLightFwd: [
        enemyAnimationClips.FD_Hit_Light_Fwd_A,
        enemyAnimationClips.FD_Hit_Light_Fwd_B,
        enemyAnimationClips.FD_Hit_Light_Fwd_C,
    ],
    hitLightLt: [
        enemyAnimationClips.FD_Hit_Light_Lt_A,
        enemyAnimationClips.FD_Hit_Light_Lt_B,
        enemyAnimationClips.FD_Hit_Light_Lt_C
    ],
    hitLightRt: [
        enemyAnimationClips.FD_Hit_Light_Rt_A,
        enemyAnimationClips.FD_Hit_Light_Rt_B,
        enemyAnimationClips.FD_Hit_Light_Rt_C
    ],
    hitHeavyBwd: [
        enemyAnimationClips.FD_Hit_Heavy_Bwd_A,
        enemyAnimationClips.FD_Hit_Heavy_Bwd_B,
        enemyAnimationClips.FD_Hit_Heavy_Bwd_C,
        enemyAnimationClips.FD_Hit_Heavy_Bwd_C // Not actually defined in vanilla game
    ],
    hitHeavyFwd: [
        enemyAnimationClips.FD_Hit_Heavy_Fwd_A,
        enemyAnimationClips.FD_Hit_Heavy_Fwd_B,
        enemyAnimationClips.FD_Hit_Heavy_Fwd_C
    ],
    hitHeavyLt: [
        enemyAnimationClips.FD_Hit_Heavy_Lt_A,
        enemyAnimationClips.FD_Hit_Heavy_Lt_B,
        enemyAnimationClips.FD_Hit_Heavy_Lt_C
    ],
    hitHeavyRt: [
        enemyAnimationClips.FD_Hit_Heavy_Rt_A,
        enemyAnimationClips.FD_Hit_Heavy_Rt_B,
        enemyAnimationClips.FD_Hit_Heavy_Rt_C
    ],
}, {
    name: "enemyCrawl",
    abilityUse: [
        enemyAnimationClips.CA_Ability_Use_In_A,
        enemyAnimationClips.CA_Ability_Use_Loop_A,
        enemyAnimationClips.CA_Ability_Use_Out_A,
    ],
    wakeup: [
        enemyAnimationClips.CA_Hibernate_Wakeup_A,
        enemyAnimationClips.CA_Hibernate_Wakeup_A,
        enemyAnimationClips.CA_Hibernate_Wakeup_A,
        enemyAnimationClips.CA_Hibernate_Wakeup_A
    ],
    wakeupTurns: [
        enemyAnimationClips.CA_Hibernate_Wakeup_Turn_A
    ],
    heartbeats: [
        enemyAnimationClips.CA_Hibernate_Heartbeat_A,
        enemyAnimationClips.CA_Hibernate_Heartbeat_B,
        enemyAnimationClips.CA_Hibernate_Heartbeat_C,
        enemyAnimationClips.CA_Hibernate_Heartbeat_D,
        enemyAnimationClips.CA_Hibernate_Heartbeat_E,
    ],
    hibernateIn: enemyAnimationClips.CA_Hibernate_In,
    hibernateLoop: enemyAnimations.CA_HibernateDetect,
    screams: [
        enemyAnimationClips.CA_Scream_A,
        enemyAnimationClips.CA_Scream_B,
        enemyAnimationClips.CA_Scream_A,
    ],
    movement: enemyAnimations.enemyCrawlMovement,
    jump: [
        mergeAnims(enemyAnimationClips.CA_Jump_Start, enemyAnimationClips.CA_Jump_Air),
        enemyAnimationClips.CA_Jump_Land
    ],
    ladderClimb: enemyAnimationClips.CA_Walk_Fwd_A,
    abilityFire: [
        enemyAnimationClips.CA_Ability_Fire_In_A, 
        enemyAnimationClips.CA_Ability_Fire_In_B,
        enemyAnimationClips.CA_Ability_Fire_In_B
    ],
    hitLightBwd: [
        enemyAnimationClips.CA_Hit_Light_Bwd_A,
        enemyAnimationClips.CA_Hit_Light_Bwd_B,
        enemyAnimationClips.CA_Hit_Light_Bwd_A,
        enemyAnimationClips.CA_Hit_Light_Bwd_B
    ],
    hitLightFwd: [
        enemyAnimationClips.CA_Hit_Light_Fwd_A,
        enemyAnimationClips.CA_Hit_Light_Fwd_B,
        enemyAnimationClips.CA_Hit_Light_Fwd_A,
    ],
    hitLightLt: [
        enemyAnimationClips.CA_Hit_Light_Lt_A,
        enemyAnimationClips.CA_Hit_Light_Lt_B,
        enemyAnimationClips.CA_Hit_Light_Lt_A
    ],
    hitLightRt: [
        enemyAnimationClips.CA_Hit_Light_Rt_A,
        enemyAnimationClips.CA_Hit_Light_Rt_B,
        enemyAnimationClips.CA_Hit_Light_Rt_A
    ],
    hitHeavyBwd: [
        enemyAnimationClips.CA_Hit_Heavy_Bwd_A,
        enemyAnimationClips.CA_Hit_Heavy_Bwd_A,
        enemyAnimationClips.CA_Hit_Heavy_Bwd_A,
        enemyAnimationClips.CA_Hit_Heavy_Bwd_A
    ],
    hitHeavyFwd: [
        enemyAnimationClips.CA_Hit_Heavy_Fwd_B,
        enemyAnimationClips.CA_Hit_Heavy_Fwd_C,
        enemyAnimationClips.CA_Hit_Heavy_Fwd_C
    ],
    hitHeavyLt: [
        enemyAnimationClips.CA_Hit_Heavy_Lt_A,
        enemyAnimationClips.CA_Hit_Heavy_Lt_B,
        enemyAnimationClips.CA_Hit_Heavy_Lt_A
    ],
    hitHeavyRt: [
        enemyAnimationClips.CA_Hit_Heavy_Rt_A,
        enemyAnimationClips.CA_Hit_Heavy_Rt_B,
        enemyAnimationClips.CA_Hit_Heavy_Rt_A
    ],
}, {
    name: "enemyCrawlFlip",
    abilityUse: [
        enemyAnimationClips.CF_Ability_Use_In_A,
        enemyAnimationClips.CF_Ability_Use_Loop_A,
        enemyAnimationClips.CF_Ability_Use_Out_A,
    ],
    wakeup: [
        enemyAnimationClips.CF_Hibernate_Wakeup_A,
        enemyAnimationClips.CF_Hibernate_Wakeup_A,
        enemyAnimationClips.CF_Hibernate_Wakeup_A,
        enemyAnimationClips.CF_Hibernate_Wakeup_A
    ],
    wakeupTurns: [
        enemyAnimationClips.CF_Hibernate_Wakeup_Turn_A
    ],
    hibernateIn: enemyAnimationClips.CF_Hibernate_In,
    hibernateLoop: enemyAnimations.CF_HibernateDetect,
    heartbeats: [
        enemyAnimationClips.CF_Hibernate_Heartbeat_A,
        enemyAnimationClips.CF_Hibernate_Heartbeat_B,
        enemyAnimationClips.CF_Hibernate_Heartbeat_C,
        enemyAnimationClips.CF_Hibernate_Heartbeat_D,
        enemyAnimationClips.CF_Hibernate_Heartbeat_E,
    ],
    screams: [
        enemyAnimationClips.CF_Scream,
        enemyAnimationClips.CF_Scream,
        enemyAnimationClips.CF_Scream,
    ],
    movement: enemyAnimations.enemyCrawlFlipMovement,
    jump: [
        mergeAnims(enemyAnimationClips.CF_Jump_Start, enemyAnimationClips.CF_Jump_Air),
        enemyAnimationClips.CF_Jump_Land
    ],
    ladderClimb: enemyAnimationClips.CA_Walk_Fwd_A,
    abilityFire: [
        enemyAnimationClips.CF_Ability_Fire_In_A, 
        enemyAnimationClips.CF_Ability_Fire_In_B,
        enemyAnimationClips.CF_Ability_Fire_In_B
    ],
    hitLightBwd: [
        enemyAnimationClips.CF_Hit_Light_A,
        enemyAnimationClips.CF_Hit_Light_B,
        enemyAnimationClips.CF_Hit_Light_A,
        enemyAnimationClips.CF_Hit_Light_B
    ],
    hitLightFwd: [
        enemyAnimationClips.CF_Hit_Light_A,
        enemyAnimationClips.CF_Hit_Light_B,
        enemyAnimationClips.CF_Hit_Light_A,
    ],
    hitLightLt: [
        enemyAnimationClips.CF_Hit_Light_A,
        enemyAnimationClips.CF_Hit_Light_B,
        enemyAnimationClips.CF_Hit_Light_A,
    ],
    hitLightRt: [
        enemyAnimationClips.CF_Hit_Light_A,
        enemyAnimationClips.CF_Hit_Light_B,
        enemyAnimationClips.CF_Hit_Light_A,
    ],
    hitHeavyBwd: [
        enemyAnimationClips.CF_Hit_Light_A,
        enemyAnimationClips.CF_Hit_Light_B,
        enemyAnimationClips.CF_Hit_Light_A,
        enemyAnimationClips.CF_Hit_Light_B,
    ],
    hitHeavyFwd: [
        enemyAnimationClips.CF_Hit_Light_A,
        enemyAnimationClips.CF_Hit_Light_B,
        enemyAnimationClips.CF_Hit_Light_A,
    ],
    hitHeavyLt: [
        enemyAnimationClips.CF_Hit_Light_A,
        enemyAnimationClips.CF_Hit_Light_B,
        enemyAnimationClips.CF_Hit_Light_A,
    ],
    hitHeavyRt: [
        enemyAnimationClips.CF_Hit_Light_A,
        enemyAnimationClips.CF_Hit_Light_B,
        enemyAnimationClips.CF_Hit_Light_A,
    ],
}, {
    name: "enemyCripple",
    abilityUse: [
        enemyAnimationClips.CR_Ability_Use_In_A,
        enemyAnimationClips.CR_Ability_Use_Loop_A,
        enemyAnimationClips.CR_Ability_Use_Out_A,
    ],
    wakeup: [
        enemyAnimationClips.CR_Hibernate_Wakeup_A,
        enemyAnimationClips.CR_Hibernate_Wakeup_B,
        enemyAnimationClips.CR_Hibernate_Wakeup_C,
        enemyAnimationClips.CR_Hibernate_Wakeup_D
    ],
    wakeupTurns: [
        enemyAnimationClips.CR_Hibernate_Wakeup_Turn_A
    ],
    heartbeats: [
        enemyAnimationClips.CR_Hibernate_Heartbeat_A,
        enemyAnimationClips.CR_Hibernate_Heartbeat_B,
        enemyAnimationClips.CR_Hibernate_Heartbeat_C,
        enemyAnimationClips.CR_Hibernate_Heartbeat_D,
        enemyAnimationClips.CR_Hibernate_Heartbeat_E,
    ],
    hibernateIn: enemyAnimationClips.CR_Hibernate_In,
    hibernateLoop: enemyAnimations.CR_HibernateDetect,
    screams: [
        enemyAnimationClips.CR_Scream_A,
        enemyAnimationClips.CR_Scream_B,
        enemyAnimationClips.CR_Scream_C,
    ],
    movement: enemyAnimations.enemyCrippleMovement,
    jump: [
        mergeAnims(enemyAnimationClips.CR_Jump_Start, enemyAnimationClips.CR_Jump_Air),
        enemyAnimationClips.CR_Jump_Land
    ],
    ladderClimb: enemyAnimationClips.CA_Walk_Fwd_A,
    abilityFire: [
        enemyAnimationClips.CR_Ability_Fire_In_A, 
        enemyAnimationClips.CR_Ability_Fire_In_B,
        enemyAnimationClips.CR_Ability_Fire_In_C
    ],
    hitLightBwd: [
        enemyAnimationClips.CR_Hit_Light_Bwd_A,
        enemyAnimationClips.CR_Hit_Light_Bwd_B,
        enemyAnimationClips.CR_Hit_Light_Bwd_C,
        enemyAnimationClips.CR_Hit_Light_Bwd_D
    ],
    hitLightFwd: [
        enemyAnimationClips.CR_Hit_Light_Fwd_A,
        enemyAnimationClips.CR_Hit_Light_Fwd_B,
        enemyAnimationClips.CR_Hit_Light_Fwd_C
    ],
    hitLightLt: [
        enemyAnimationClips.CR_Hit_Light_Lt_A,
        enemyAnimationClips.CR_Hit_Light_Lt_B,
        enemyAnimationClips.CR_Hit_Light_Lt_C
    ],
    hitLightRt: [
        enemyAnimationClips.CR_Hit_Light_Rt_A,
        enemyAnimationClips.CR_Hit_Light_Rt_B,
        enemyAnimationClips.CR_Hit_Light_Rt_C
    ],
    hitHeavyBwd: [
        enemyAnimationClips.CR_Hit_Heavy_Bwd_A_Turn,
        enemyAnimationClips.CR_Hit_Heavy_Bwd_B,
        enemyAnimationClips.CR_Hit_Heavy_Bwd_C_Turn,
        enemyAnimationClips.CR_Hit_Heavy_Bwd_D_0
    ],
    hitHeavyFwd: [
        enemyAnimationClips.CR_Hit_Heavy_Fwd_A,
        enemyAnimationClips.CR_Hit_Heavy_Fwd_B,
        enemyAnimationClips.CR_Hit_Heavy_Fwd_C
    ],
    hitHeavyLt: [
        enemyAnimationClips.CR_Hit_Heavy_Lt_A,
        enemyAnimationClips.CR_Hit_Heavy_Lt_B,
        enemyAnimationClips.CR_Hit_Heavy_Lt_C
    ],
    hitHeavyRt: [
        enemyAnimationClips.CR_Hit_Heavy_Rt_A,
        enemyAnimationClips.CR_Hit_Heavy_Rt_B,
        enemyAnimationClips.CR_Hit_Heavy_Rt_C_0
    ],
}, {
    name: "enemyBig",
    abilityUse: [
        enemyAnimationClips.FD_Ability_Use_In_A,
        enemyAnimationClips.FD_Ability_Use_Loop_A,
        enemyAnimationClips.FD_Ability_Use_Out_A,
    ],
    wakeup: [
        enemyAnimationClips.Enemy_Big_Hibernate_Wakeup_A,
        enemyAnimationClips.Enemy_Big_Hibernate_Wakeup_A,
        enemyAnimationClips.Enemy_Big_Hibernate_Wakeup_A,
        enemyAnimationClips.Enemy_Big_Hibernate_Wakeup_A
    ],
    wakeupTurns: [
        enemyAnimationClips.Enemy_Big_Hibernate_Wakeup_180_B,
    ],
    heartbeats: [
        enemyAnimationClips.Enemy_Big_Hibernate_Heartbeat_1_A,
        enemyAnimationClips.Enemy_Big_Hibernate_Heartbeat_2_A,
        enemyAnimationClips.Enemy_Big_Hibernate_Heartbeat_3_A,
        enemyAnimationClips.Enemy_Big_Hibernate_Heartbeat_4_A,
        enemyAnimationClips.Enemy_Big_Hibernate_Heartbeat_5_A,
    ],
    hibernateIn: enemyAnimationClips.Enemy_Big_Hibernate_In_A,
    hibernateLoop: enemyAnimationClips.Enemy_Big_Hibernate_Loop_A,
    screams: [
        enemyAnimationClips.Enemy_Big_Detect_Front_A,
        enemyAnimationClips.Enemy_Big_Detect_Front_B,
        enemyAnimationClips.Enemy_Big_Detect_Front_A,
    ],
    movement: enemyAnimations.enemyBigMovement,
    jump: [
        mergeAnims(enemyAnimationClips.Enemy_Big_Jump_Start_A, enemyAnimationClips.Enemy_Big_Jump_Loop_A),
        enemyAnimationClips.Enemy_Big_Jump_Land_A
    ],
    ladderClimb: enemyAnimationClips.CA_Walk_Fwd_A,
    abilityFire: [
        enemyAnimationClips.Enemy_Big_Fire_In_A,
        enemyAnimationClips.Enemy_Big_Fire_In_B,
        enemyAnimationClips.Enemy_Big_Fire_In_B
    ],
    hitLightBwd: [
        enemyAnimationClips.Enemy_Big_Hit_Back_A,
        enemyAnimationClips.Enemy_Big_Hit_Back_B,
        enemyAnimationClips.Enemy_Big_Hit_Back_A,
        enemyAnimationClips.Enemy_Big_Hit_Back_B,
    ],
    hitLightFwd: [
        enemyAnimationClips.Enemy_Big_Hit_Front_A,
        enemyAnimationClips.Enemy_Big_Hit_Front_B,
        enemyAnimationClips.Enemy_Big_Hit_Front_A,
    ],
    hitLightLt: [
        enemyAnimationClips.Enemy_Big_Hit_Left_A,
        enemyAnimationClips.Enemy_Big_Hit_Left_B,
        enemyAnimationClips.Enemy_Big_Hit_Left_A,
    ],
    hitLightRt: [
        enemyAnimationClips.Enemy_Big_Hit_Right_A,
        enemyAnimationClips.Enemy_Big_Hit_Right_B,
        enemyAnimationClips.Enemy_Big_Hit_Right_A,
    ],
    hitHeavyBwd: [
        enemyAnimationClips.Enemy_Big_Hit_Back_A,
        enemyAnimationClips.Enemy_Big_Hit_Back_B,
        enemyAnimationClips.Enemy_Big_Hit_Back_A,
        enemyAnimationClips.Enemy_Big_Hit_Back_B,
    ],
    hitHeavyFwd: [
        enemyAnimationClips.Enemy_Big_Hit_Front_A,
        enemyAnimationClips.Enemy_Big_Hit_Front_B,
        enemyAnimationClips.Enemy_Big_Hit_Front_A,
    ],
    hitHeavyLt: [
        enemyAnimationClips.Enemy_Big_Hit_Left_A,
        enemyAnimationClips.Enemy_Big_Hit_Left_B,
        enemyAnimationClips.Enemy_Big_Hit_Left_A,
    ],
    hitHeavyRt: [
        enemyAnimationClips.Enemy_Big_Hit_Right_A,
        enemyAnimationClips.Enemy_Big_Hit_Right_B,
        enemyAnimationClips.Enemy_Big_Hit_Right_A,
    ],
}, {
    name: "enemyGiant",
    abilityUse: [
        enemyAnimationClips.RU_Ability_Use_In_a,
        enemyAnimationClips.RU_Ability_Use_Loop_a,
        enemyAnimationClips.RU_Ability_Use_Out_a,
    ],
    wakeup: [
        enemyAnimationClips.RU_Hibernate_Wakeup_A,
        enemyAnimationClips.RU_Hibernate_Wakeup_B,
        enemyAnimationClips.RU_Hibernate_Wakeup_C,
        enemyAnimationClips.RU_Hibernate_Wakeup_B
    ],
    wakeupTurns: [
        enemyAnimationClips.Monster_Turn_Left_180
    ],
    hibernateIn: enemyAnimationClips.RU_Hibernate_In,
    hibernateLoop: enemyAnimations.RU_HibernateDetect,
    heartbeats: [
        enemyAnimationClips.RU_Hibernate_Heartbeat_A,
        enemyAnimationClips.RU_Hibernate_Heartbeat_B,
        enemyAnimationClips.RU_Hibernate_Heartbeat_C_0,
        enemyAnimationClips.RU_Hibernate_Heartbeat_D_0,
        enemyAnimationClips.RU_Hibernate_Heartbeat_E,
    ],
    blend: 10,
    screams: [
        enemyAnimationClips.Monster_Taunt_01,
        enemyAnimationClips.Monster_Taunt_01,
        enemyAnimationClips.Monster_Taunt_01,
    ],
    ladderClimb: enemyAnimationClips.CA_Walk_Fwd_A,
    melee: {
        "Forward": [enemyAnimationClips.Monster_Attack_06_shortened],
        "Backward": [enemyAnimationClips.Monster_Attack_180_L]
    },
    movement: enemyAnimations.enemyGiantMovement,
    jump: [
        enemyAnimationClips.Giant_Jump_Start,
        enemyAnimationClips.Monster_Fall_Landing_01
    ],
    abilityFire: [
        enemyAnimationClips.Monster_TentacleStart,
        enemyAnimationClips.Monster_TentacleStart, 
        enemyAnimationClips.Monster_TentacleStart, 
    ],
    hitLightBwd: [
        enemyAnimationClips.Monster_Hit_Back_01,
        enemyAnimationClips.Monster_Hit_Back_02,
        enemyAnimationClips.Monster_Hit_Back_04,
        enemyAnimationClips.Monster_Hit_Back_02,
    ],
    hitLightFwd: [
        enemyAnimationClips.Monster_Hit_Front_01,
        enemyAnimationClips.Monster_Hit_Front_02,
        enemyAnimationClips.Monster_Hit_Front_03,
    ],
    hitLightLt: [
        enemyAnimationClips.Monster_Hit_Leg_01,
        enemyAnimationClips.Monster_Hit_Leg_02,
        enemyAnimationClips.Monster_Hit_Leg_03,
    ],
    hitLightRt: [
        enemyAnimationClips.Monster_Hit_Right_01,
        enemyAnimationClips.Monster_Hit_Leg_02,
        enemyAnimationClips.Monster_Hit_Right_01,
    ],
    hitHeavyBwd: [
        enemyAnimationClips.Monster_Hit_Back_01,
        enemyAnimationClips.Monster_Hit_Back_02,
        enemyAnimationClips.Monster_Hit_Back_04,
        enemyAnimationClips.Monster_Hit_Back_01,
    ],
    hitHeavyFwd: [
        enemyAnimationClips.Monster_Hit_Front_04,
        enemyAnimationClips.Monster_Hit_Front_01,
        enemyAnimationClips.Monster_Hit_Leg_02,
    ],
    hitHeavyLt: [
        enemyAnimationClips.Monster_Hit_Leg_01,
        enemyAnimationClips.Monster_Hit_Leg_02,
        enemyAnimationClips.Monster_Hit_Leg_03,
    ],
    hitHeavyRt: [
        enemyAnimationClips.Monster_Hit_Right_01,
        enemyAnimationClips.Monster_Hit_Leg_02,
        enemyAnimationClips.Monster_Hit_Right_01,
    ],
}, {
    name: "enemyPouncer",
    wakeup: [
        enemyAnimationClips.CA_Hibernate_Wakeup_A,
        enemyAnimationClips.CA_Hibernate_Wakeup_A,
        enemyAnimationClips.CA_Hibernate_Wakeup_A,
        enemyAnimationClips.CA_Hibernate_Wakeup_A
    ],
    wakeupTurns: [
        enemyAnimationClips.CA_Hibernate_Wakeup_Turn_A
    ],
    heartbeats: [
        enemyAnimationClips.CA_Hibernate_Heartbeat_A,
        enemyAnimationClips.CA_Hibernate_Heartbeat_B,
        enemyAnimationClips.CA_Hibernate_Heartbeat_C,
        enemyAnimationClips.CA_Hibernate_Heartbeat_D,
        enemyAnimationClips.CA_Hibernate_Heartbeat_E,
    ],
    hibernateIn: enemyAnimationClips.CA_Hibernate_In,
    hibernateLoop: enemyAnimations.CA_HibernateDetect,
    screams: [
        enemyAnimationClips.CA_Scream_A,
        enemyAnimationClips.CA_Scream_B,
        enemyAnimationClips.CA_Scream_A,
    ],
    jump: [
        mergeAnims(enemyAnimationClips.LO_Jump_Start, enemyAnimationClips.LO_Jump_Air),
        enemyAnimationClips.LO_Jump_Land
    ],
    ladderClimb: enemyAnimationClips.CA_Walk_Fwd_A,
    movement: enemyAnimations.enemyPouncerMovement,
    abilityFire: [],
    hitLightBwd: [
        enemyAnimationClips.CA_Hit_Light_Bwd_A,
        enemyAnimationClips.CA_Hit_Light_Bwd_B,
        enemyAnimationClips.CA_Hit_Light_Bwd_A,
        enemyAnimationClips.CA_Hit_Light_Bwd_B
    ],
    hitLightFwd: [
        enemyAnimationClips.CA_Hit_Light_Fwd_A,
        enemyAnimationClips.CA_Hit_Light_Fwd_B,
        enemyAnimationClips.CA_Hit_Light_Fwd_A,
    ],
    hitLightLt: [
        enemyAnimationClips.CA_Hit_Light_Lt_A,
        enemyAnimationClips.CA_Hit_Light_Lt_B,
        enemyAnimationClips.CA_Hit_Light_Lt_A
    ],
    hitLightRt: [
        enemyAnimationClips.CA_Hit_Light_Rt_A,
        enemyAnimationClips.CA_Hit_Light_Rt_B,
        enemyAnimationClips.CA_Hit_Light_Rt_A
    ],
    hitHeavyBwd: [
        enemyAnimationClips.CA_Hit_Heavy_Bwd_A,
        enemyAnimationClips.CA_Hit_Heavy_Bwd_A,
        enemyAnimationClips.CA_Hit_Heavy_Bwd_A,
        enemyAnimationClips.CA_Hit_Heavy_Bwd_A
    ],
    hitHeavyFwd: [
        enemyAnimationClips.CA_Hit_Heavy_Fwd_B,
        enemyAnimationClips.CA_Hit_Heavy_Fwd_C,
        enemyAnimationClips.CA_Hit_Heavy_Fwd_C
    ],
    hitHeavyLt: [
        enemyAnimationClips.CA_Hit_Heavy_Lt_A,
        enemyAnimationClips.CA_Hit_Heavy_Lt_B,
        enemyAnimationClips.CA_Hit_Heavy_Lt_A
    ],
    hitHeavyRt: [
        enemyAnimationClips.CA_Hit_Heavy_Rt_A,
        enemyAnimationClips.CA_Hit_Heavy_Rt_B,
        enemyAnimationClips.CA_Hit_Heavy_Rt_A
    ],
}, {
    name: "enemyBirtherCrawlFlip",
    abilityUse: [
        enemyAnimationClips.CF_Ability_Use_In_A,
        enemyAnimationClips.CF_Ability_Use_Loop_A,
        enemyAnimationClips.CF_Ability_Use_Out_A,
    ],
    wakeup: [
        enemyAnimationClips.CF_Hibernate_Wakeup_A,
        enemyAnimationClips.CF_Hibernate_Wakeup_A,
        enemyAnimationClips.CF_Hibernate_Wakeup_A,
        enemyAnimationClips.CF_Hibernate_Wakeup_A
    ],
    wakeupTurns: [
        enemyAnimationClips.CF_Hibernate_Wakeup_Turn_A
    ],
    heartbeats: [
        enemyAnimationClips.CF_Birther_Heartbeat,
        enemyAnimationClips.CF_Birther_Heartbeat,
        enemyAnimationClips.CF_Birther_Heartbeat,
        enemyAnimationClips.CF_Birther_Heartbeat,
        enemyAnimationClips.CF_Birther_Heartbeat,
    ],
    hibernateIn: enemyAnimationClips.CF_Birther_Hibernate_In,
    hibernateLoop: new ScaledAnim(HumanJoints, enemyAnimationClips.CF_Birther_Hibernate_Loop, 0.2),
    screams: [
        enemyAnimationClips.CF_Scream,
        enemyAnimationClips.CF_Scream,
        enemyAnimationClips.CF_Scream,
    ],
    movement: enemyAnimations.enemyCrawlFlipMovement,
    jump: [
        mergeAnims(enemyAnimationClips.CF_Jump_Start, enemyAnimationClips.CF_Jump_Air),
        enemyAnimationClips.CF_Jump_Land
    ],
    ladderClimb: enemyAnimationClips.CA_Walk_Fwd_A,
    abilityFire: [
        enemyAnimationClips.CF_Ability_Fire_In_A, 
        enemyAnimationClips.CF_Ability_Fire_In_B,
        enemyAnimationClips.CF_Ability_Fire_In_B
    ],
    hitLightBwd: [
        enemyAnimationClips.CF_Hit_Light_A,
        enemyAnimationClips.CF_Hit_Light_B,
        enemyAnimationClips.CF_Hit_Light_A,
        enemyAnimationClips.CF_Hit_Light_B
    ],
    hitLightFwd: [
        enemyAnimationClips.CF_Hit_Light_A,
        enemyAnimationClips.CF_Hit_Light_B,
        enemyAnimationClips.CF_Hit_Light_A,
    ],
    hitLightLt: [
        enemyAnimationClips.CF_Hit_Light_A,
        enemyAnimationClips.CF_Hit_Light_B,
        enemyAnimationClips.CF_Hit_Light_A,
    ],
    hitLightRt: [
        enemyAnimationClips.CF_Hit_Light_A,
        enemyAnimationClips.CF_Hit_Light_B,
        enemyAnimationClips.CF_Hit_Light_A,
    ],
    hitHeavyBwd: [
        enemyAnimationClips.CF_Hit_Light_A,
        enemyAnimationClips.CF_Hit_Light_B,
        enemyAnimationClips.CF_Hit_Light_A,
        enemyAnimationClips.CF_Hit_Light_B,
    ],
    hitHeavyFwd: [
        enemyAnimationClips.CF_Hit_Light_A,
        enemyAnimationClips.CF_Hit_Light_B,
        enemyAnimationClips.CF_Hit_Light_A,
    ],
    hitHeavyLt: [
        enemyAnimationClips.CF_Hit_Light_A,
        enemyAnimationClips.CF_Hit_Light_B,
        enemyAnimationClips.CF_Hit_Light_A,
    ],
    hitHeavyRt: [
        enemyAnimationClips.CF_Hit_Light_A,
        enemyAnimationClips.CF_Hit_Light_B,
        enemyAnimationClips.CF_Hit_Light_A,
    ],
}];

export interface EnemySpecification {
    id: number;
    maxHealth: number;
    transparent?: boolean;
    color?: ColorRepresentation;
    name?: string;
    model?: (data: any) => EnemyModel;
    rotOffset?: Vector3Like;
    neckScale?: Vector3Like;
    headScale?: Vector3Like;
    chestScale?: Vector3Like;
    armScale?: Vector3Like;
    legScale?: Vector3Like;
    scale?: number; 
    structure?: Partial<AvatarStructure<HumanJoints, Vector3>>; 
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

const _gear: Equippable<string>[] = [{
    id: `{"Ver":1,"Name":"Mastaba Fixed Blade","Packet":{"Comps":{"Length":7,"a":{"c":2,"v":27},"b":{"c":3,"v":161},"c":{"c":4,"v":39},"d":{"c":44,"v":12},"e":{"c":48,"v":14},"f":{"c":50,"v":10}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Mastaba Fixed Blade"}}}`,
    name: "knife",
    type: "melee",
    meleeArchetype: knifeArchetype,
    model: () => new Knife()
}, {
    id: `{"Ver":1,"Name":"Wox Compact","Packet":{"Comps":{"Length":5,"a":{"c":2,"v":27},"b":{"c":3,"v":161},"c":{"c":4,"v":39},"d":{"c":48,"v":19}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Wox Compact"}}}`,
    name: "knife",
    type: "melee",
    meleeArchetype: knifeArchetype,
    model: () => new Knife()
}, {
    id: `{"Ver":1,"Name":"Kovac Peacekeeper","Packet":{"Comps":{"Length":7,"a":{"c":2,"v":29},"b":{"c":3,"v":163},"c":{"c":4,"v":41},"d":{"c":44,"v":14},"e":{"c":48,"v":16},"f":{"c":50,"v":12}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Kovac Peacekeeper"}}}`,
    name: "Bat",
    type: "melee",
    meleeArchetype: batArchetype,
    model: () => new Bat()
}, {
    id: `{"Ver":1,"Name":"Attroc Titanium","Packet":{"Comps":{"Length":5,"a":{"c":2,"v":29},"b":{"c":3,"v":163},"c":{"c":4,"v":41},"d":{"c":48,"v":17}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Attroc Titanium"}}}`,
    name: "Bat",
    type: "melee",
    meleeArchetype: batArchetype,
    model: () => new Bat()
}, {
    id: `{"Ver":1,"Name":"MACO Drillhead","Packet":{"Comps":{"Length":7,"a":{"c":2,"v":28},"b":{"c":3,"v":162},"c":{"c":4,"v":40},"d":{"c":44,"v":13},"e":{"c":48,"v":15},"f":{"c":50,"v":11}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"MACO Drillhead"}}}`,
    name: "Spear",
    type: "melee",
    meleeArchetype: spearArchetype,
    model: () => new Spear()
}, {
    id: `{"Ver":1,"Name":"IsoCo Stinger","Packet":{"Comps":{"Length":7,"a":{"c":2,"v":28},"b":{"c":3,"v":162},"c":{"c":4,"v":40},"d":{"c":44,"v":16},"e":{"c":48,"v":18},"f":{"c":50,"v":13}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"IsoCo Stinger"}}}`,
    name: "Spear",
    type: "melee",
    meleeArchetype: spearArchetype,
    model: () => new Spear()
}, {
    id: `{"Ver":1,"Name":"Kovac Sledgehammer","Packet":{"Comps":{"Length":8,"a":{"c":2,"v":14},"b":{"c":3,"v":100},"c":{"c":4,"v":13},"d":{"c":44,"v":11},"e":{"c":46,"v":12},"f":{"c":48,"v":6},"g":{"c":50,"v":4}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Kovac Sledgehammer"}}}`,
    name: "Hammer",
    type: "melee",
    meleeArchetype: hammerArchetype,
    model: () => new Hammer()
}, {
    id: `{"Ver":1,"Name":"Santonian HDH","Packet":{"Comps":{"Length":8,"a":{"c":2,"v":14},"b":{"c":3,"v":100},"c":{"c":4,"v":13},"d":{"c":44,"v":2},"e":{"c":46,"v":4},"f":{"c":48,"v":9},"g":{"c":50,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Santonian HDH"}}}`,
    name: "Hammer",
    type: "melee",
    meleeArchetype: hammerArchetype,
    model: () => new Hammer()
}, {
    id: `{"Ver":1,"Name":"Santonian Mallet","Packet":{"Comps":{"Length":8,"a":{"c":2,"v":14},"b":{"c":3,"v":100},"c":{"c":4,"v":13},"d":{"c":44,"v":6},"e":{"c":46,"v":9},"f":{"c":48,"v":10},"g":{"c":50,"v":8}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Santonian Mallet"}}}`,
    name: "Hammer",
    type: "melee",
    meleeArchetype: hammerArchetype,
    model: () => new Hammer()
}, {
    id: `{"Ver":1,"Name":"MACO Gavel","Packet":{"Comps":{"Length":8,"a":{"c":2,"v":14},"b":{"c":3,"v":100},"c":{"c":4,"v":13},"d":{"c":44,"v":5},"e":{"c":46,"v":3},"f":{"c":48,"v":5},"g":{"c":50,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"MACO Gavel"}}}`,
    name: "Hammer",
    type: "melee",
    meleeArchetype: hammerArchetype,
    model: () => new Hammer()
}, {
    id: `{"Ver":1,"Name":"Omneco Maul","Packet":{"Comps":{"Length":8,"a":{"c":2,"v":14},"b":{"c":3,"v":100},"c":{"c":4,"v":13},"d":{"c":44,"v":3},"e":{"c":46,"v":5},"f":{"c":48,"v":2},"g":{"c":50,"v":5}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Omneco Maul"}}}`,
    name: "Hammer",
    type: "melee",
    meleeArchetype: hammerArchetype,
    model: () => new Hammer()
}, {
    id: `{"Ver":1,"Name":"Mechatronic SGB3","Packet":{"Comps":{"Length":11,"a":{"c":1,"v":12},"b":{"c":2,"v":12},"c":{"c":3,"v":97},"d":{"c":4,"v":11},"e":{"c":5,"v":3},"f":{"c":12,"v":17},"g":{"c":16,"v":8},"h":{"c":27,"v":9},"i":{"c":40,"v":3},"j":{"c":42,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Mechatronic SGB3"}}}`,
    type: "rifle",
    name: "Burst Sentry",
    model: () => new Sentry()
}, {
    id: `{"Ver":1,"Name":"RAD Labs Meduza","Packet":{"Comps":{"Length":11,"a":{"c":1,"v":11},"b":{"c":2,"v":12},"c":{"c":3,"v":97},"d":{"c":4,"v":11},"e":{"c":5,"v":45},"f":{"c":12,"v":28},"g":{"c":16,"v":2},"h":{"c":27,"v":9},"i":{"c":40,"v":2},"j":{"c":42,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"RAD Labs Meduza"}}}`,
    name: "Shotgun Sentry",
    type: "rifle",
    model: () => new Sentry()
}, {
    id: `{"Ver":1,"Name":"Autotek 51 RSG","Packet":{"Comps":{"Length":11,"a":{"c":1,"v":10},"b":{"c":2,"v":12},"c":{"c":3,"v":97},"d":{"c":4,"v":11},"e":{"c":5,"v":36},"f":{"c":12,"v":19},"g":{"c":16,"v":1},"h":{"c":27,"v":9},"i":{"c":40,"v":1},"j":{"c":42,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Autotek 51 RSG"}}}`,
    name: "Auto Sentry",
    type: "rifle",
    model: () => new Sentry()
}, {
    id: `{"Ver":1,"Name":"Mechatronic B5 LFR","Packet":{"Comps":{"Length":11,"a":{"c":1,"v":13},"b":{"c":2,"v":12},"c":{"c":3,"v":97},"d":{"c":4,"v":11},"e":{"c":5,"v":4},"f":{"c":12,"v":13},"g":{"c":16,"v":2},"h":{"c":27,"v":9},"i":{"c":40,"v":2},"j":{"c":42,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Mechatronic B5 LFR"}}}`,
    name: "Sniper Sentry",
    type: "rifle",
    model: () => new Sentry()
}, {
    id: `{"Ver":1,"Name":"D-tek Optron IV","Packet":{"Comps":{"Length":9,"a":{"c":2,"v":9},"b":{"c":3,"v":28},"c":{"c":4,"v":10},"d":{"c":27,"v":10},"e":{"c":30,"v":3},"f":{"c":33,"v":3},"g":{"c":40,"v":2},"h":{"c":42,"v":3}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"D-tek Optron IV"}}}`,
    name: "Bio Tracker",
    type: "rifle",
    model: () => new Biotracker()
}, {
    id: `{"Ver":1,"Name":"Stalwart Flow G2","Packet":{"Comps":{"Length":12,"a":{"c":2,"v":11},"b":{"c":3,"v":73},"c":{"c":4,"v":15},"d":{"c":27,"v":15},"e":{"c":30,"v":5},"f":{"c":32,"v":4},"g":{"c":33,"v":4},"h":{"c":36,"v":1},"i":{"c":37,"v":2},"j":{"c":40,"v":2},"k":{"c":42,"v":7}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Stalwart Flow G2"}}}`,
    name: "C-Foam Launcher",
    type: "rifle",
    model: () => new CfoamLauncher()
}, {
    id: `{"Ver":1,"Name":"Krieger O4","Packet":{"Comps":{"Length":10,"a":{"c":2,"v":13},"b":{"c":3,"v":37},"c":{"c":4,"v":14},"d":{"c":27,"v":12},"e":{"c":30,"v":2},"f":{"c":33,"v":2},"g":{"c":37,"v":1},"h":{"c":40,"v":1},"i":{"c":42,"v":6}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Krieger O4"}}}`,
    name: "Mine Deployer",
    type: "rifle",
    model: () => new MineDeployer()
}, {
    id: `{"Ver":1,"Name":"Shelling S49","Packet":{"Comps":{"Length":16,"a":{"c":2,"v":8},"b":{"c":3,"v":108},"c":{"c":4,"v":8},"d":{"c":5,"v":1},"e":{"c":6,"v":1},"f":{"c":7,"v":2},"g":{"c":8,"v":16},"h":{"c":9,"v":15},"i":{"c":10,"v":27},"j":{"c":11,"v":27},"k":{"c":12,"v":38},"l":{"c":16,"v":21},"m":{"c":19,"v":18},"n":{"c":23,"v":8},"o":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":-0.098,"y":-0.07,"normalized":{"x":-0.813733459,"y":-0.5812382,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.120432556,"sqrMagnitude":0.014504},"scale":0.05},"tDecalB":{"position":{"x":-0.098,"y":-0.07,"normalized":{"x":-0.813733459,"y":-0.5812382,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.120432556,"sqrMagnitude":0.014504},"scale":0.04},"tPattern":{"position":{"x":-0.09,"y":-0.03,"normalized":{"x":-0.9486833,"y":-0.316227764,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.09486833,"sqrMagnitude":0.009000001},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Shelling S49"}}}`,
    name: "Pistol",
    type: "pistol",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    },
    model: () => new Pistol()
}, {
    id: `{"Ver":1,"Name":"Shelling Nano","Packet":{"Comps":{"Length":15,"a":{"c":1,"v":1},"b":{"c":2,"v":8},"c":{"c":3,"v":108},"d":{"c":4,"v":8},"e":{"c":5,"v":1},"f":{"c":6,"v":1},"g":{"c":7,"v":1},"h":{"c":8,"v":16},"i":{"c":9,"v":15},"j":{"c":10,"v":27},"k":{"c":11,"v":27},"l":{"c":12,"v":45},"m":{"c":19,"v":22},"n":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":-0.098,"y":-0.07,"normalized":{"x":-0.813733459,"y":-0.5812382,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.120432556,"sqrMagnitude":0.014504},"scale":0.05},"tDecalB":{"position":{"x":-0.098,"y":-0.07,"normalized":{"x":-0.813733459,"y":-0.5812382,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.120432556,"sqrMagnitude":0.014504},"scale":0.04},"tPattern":{"position":{"x":-0.09,"y":-0.03,"normalized":{"x":-0.9486833,"y":-0.316227764,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.09486833,"sqrMagnitude":0.009000001},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Shelling Nano"}}}`,
    name: "Burst Pistol",
    type: "pistol",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    },
    model: () => new BurstPistol()
}, {
    id: `{"Ver":1,"Name":"Bataldo 3RB","Packet":{"Comps":{"Length":16,"a":{"c":1,"v":1},"b":{"c":2,"v":23},"c":{"c":3,"v":108},"d":{"c":4,"v":42},"e":{"c":5,"v":29},"f":{"c":6,"v":29},"g":{"c":7,"v":2},"h":{"c":8,"v":19},"i":{"c":9,"v":10},"j":{"c":10,"v":17},"k":{"c":11,"v":17},"l":{"c":12,"v":35},"m":{"c":16,"v":17},"n":{"c":19,"v":15},"o":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.115,"y":-0.02,"normalized":{"x":0.9852118,"y":-0.171341166,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.116726175,"sqrMagnitude":0.0136250006},"angle":45.0,"scale":0.05},"tDecalB":{"position":{"x":0.115,"y":-0.02,"normalized":{"x":0.9852118,"y":-0.171341166,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.116726175,"sqrMagnitude":0.0136250006},"scale":0.06},"tPattern":{"position":{"x":0.07,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.07,"sqrMagnitude":0.0049},"angle":120.0,"scale":0.08}},"publicName":{"data":"Bataldo 3RB"}}}`,
    name: "Hel Revolver",
    type: "pistol",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Front_Revolver_2_Reload_0,
    },
    model: () => new HelRevolver()
}, {
    id: `{"Ver":1,"Name":"Raptus Treffen 2","Packet":{"Comps":{"Length":17,"a":{"c":1,"v":2},"b":{"c":2,"v":8},"c":{"c":3,"v":108},"d":{"c":4,"v":21},"e":{"c":5,"v":1},"f":{"c":6,"v":1},"g":{"c":7,"v":1},"h":{"c":8,"v":19},"i":{"c":9,"v":12},"j":{"c":10,"v":20},"k":{"c":11,"v":20},"l":{"c":12,"v":40},"m":{"c":16,"v":18},"n":{"c":19,"v":18},"o":{"c":23,"v":5},"p":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":-0.09,"y":0.03,"normalized":{"x":-0.9486833,"y":0.316227764,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.09486833,"sqrMagnitude":0.009000001},"scale":0.2},"tDecalB":{"position":{"x":-0.1,"y":0.04,"normalized":{"x":-0.9284767,"y":0.371390671,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.1077033,"sqrMagnitude":0.0116000008},"scale":0.2},"tPattern":{"position":{"x":-0.07,"y":0.03,"normalized":{"x":-0.919145,"y":0.3939193,"normalized":{"x":-0.919145048,"y":0.393919319,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.0761577338,"sqrMagnitude":0.0058},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Raptus Treffen 2"}}}`,
    name: "Machine Pistol",
    type: "pistol",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    },
    model: () => new MachinePistol()
}, {
    id: `{"Ver":1,"Name":"Raptus Steigro","Packet":{"Comps":{"Length":17,"a":{"c":1,"v":2},"b":{"c":2,"v":21},"c":{"c":3,"v":108},"d":{"c":4,"v":21},"e":{"c":5,"v":44},"f":{"c":6,"v":1},"g":{"c":7,"v":1},"h":{"c":8,"v":18},"i":{"c":9,"v":11},"j":{"c":10,"v":28},"k":{"c":11,"v":28},"l":{"c":12,"v":39},"m":{"c":16,"v":18},"n":{"c":19,"v":18},"o":{"c":23,"v":17},"p":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":-0.03,"y":0.032,"normalized":{"x":-0.683941066,"y":0.7295372,"normalized":{"x":-0.6839411,"y":0.729537249,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.0438634269,"sqrMagnitude":0.0019240001},"scale":0.033},"tDecalB":{"position":{"x":-0.03,"y":0.032,"normalized":{"x":-0.683941066,"y":0.7295372,"normalized":{"x":-0.6839411,"y":0.729537249,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.0438634269,"sqrMagnitude":0.0019240001},"scale":0.03},"tPattern":{"position":{"x":-0.1,"y":0.032,"normalized":{"x":-0.9524241,"y":0.3047757,"normalized":{"x":-0.952424169,"y":0.304775745,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.104995243,"sqrMagnitude":0.0110240011},"angle":140.0,"scale":0.15}},"publicName":{"data":"Raptus Steigro"}}}`,
    name: "Auto Pistol",
    type: "pistol",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.1)
    },
    model: () => new AutoPistol()
}, {
    id: `{"Ver":1,"Name":"Accrat Golok DA","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":17},"c":{"c":3,"v":108},"d":{"c":4,"v":22},"e":{"c":5,"v":38},"f":{"c":6,"v":2},"g":{"c":7,"v":2},"h":{"c":8,"v":18},"i":{"c":9,"v":13},"j":{"c":10,"v":22},"k":{"c":11,"v":22},"l":{"c":12,"v":41},"m":{"c":16,"v":19},"n":{"c":19,"v":17},"o":{"c":21,"v":9},"p":{"c":23,"v":5},"q":{"c":25,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":-0.202,"y":0.012,"normalized":{"x":-0.9982401,"y":0.05930139,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.20235613,"sqrMagnitude":0.0409480035},"scale":0.07},"tDecalB":{"position":{"x":-0.2,"y":0.01,"normalized":{"x":-0.9987523,"y":0.0499376133,"normalized":{"x":-0.998752356,"y":0.049937617,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.200249851,"sqrMagnitude":0.0401000045},"scale":0.07},"tPattern":{"position":{"x":-0.1,"y":0.032,"normalized":{"x":-0.9524241,"y":0.3047757,"normalized":{"x":-0.952424169,"y":0.304775745,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.104995243,"sqrMagnitude":0.0110240011},"angle":-140.0,"scale":0.1}},"publicName":{"data":"Accrat Golok DA"}}}`,
    name: "Bullpup",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
    },
    model: () => new Bullpup()
}, {
    id: `{"Ver":1,"Name":"Van Auken LTC5","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":2},"c":{"c":3,"v":108},"d":{"c":4,"v":2},"e":{"c":5,"v":2},"f":{"c":6,"v":2},"g":{"c":7,"v":1},"h":{"c":8,"v":15},"i":{"c":9,"v":5},"j":{"c":10,"v":17},"k":{"c":11,"v":17},"l":{"c":12,"v":26},"m":{"c":16,"v":6},"n":{"c":19,"v":5},"o":{"c":21,"v":10},"p":{"c":23,"v":5},"q":{"c":25,"v":2}},"MatTrans":{"tDecalA":{"position":{"x":0.07,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.07,"sqrMagnitude":0.0049},"angle":45.0,"scale":0.1},"tDecalB":{"position":{"x":0.075,"y":0.003,"normalized":{"x":0.999201059,"y":0.03996804,"normalized":{"x":0.99920094,"y":0.0399680361,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":1.00000012,"sqrMagnitude":1.00000024},"magnitude":0.07505997,"sqrMagnitude":0.005634},"angle":45.0,"scale":0.1},"tPattern":{"position":{"x":0.02,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.02,"sqrMagnitude":0.0004},"angle":200.0,"scale":0.5}},"publicName":{"data":"Van Auken LTC5"}}}`,
    name: "Smg",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.SMG_Front_4_Reload_1,
    },
    model: () => new Smg()
}, {
    id: `{"Ver":1,"Name":"Accrat STB","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":32},"c":{"c":3,"v":108},"d":{"c":4,"v":1},"e":{"c":5,"v":49},"f":{"c":6,"v":3},"g":{"c":7,"v":1},"h":{"c":8,"v":17},"i":{"c":9,"v":6},"j":{"c":10,"v":12},"k":{"c":11,"v":12},"l":{"c":12,"v":24},"m":{"c":16,"v":23},"n":{"c":19,"v":9},"o":{"c":21,"v":16},"p":{"c":23,"v":8},"q":{"c":25,"v":6}},"MatTrans":{"tDecalA":{"position":{"x":0.045,"y":0.025,"normalized":{"x":0.8741573,"y":0.48564294,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05147815,"sqrMagnitude":0.00265000015},"angle":90.0,"scale":0.1},"tDecalB":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":90.0,"scale":0.1},"tPattern":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Accrat STB"}}}`,
    name: "PDW",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.SMG_Front_4_Reload_1,
    },
    model: () => new PDW()
}, {
    id: `{"Ver":1,"Name":"Accrat ND6","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":25},"c":{"c":3,"v":108},"d":{"c":4,"v":2},"e":{"c":5,"v":47},"f":{"c":6,"v":2},"g":{"c":7,"v":1},"h":{"c":8,"v":15},"i":{"c":9,"v":5},"j":{"c":10,"v":17},"k":{"c":11,"v":17},"l":{"c":12,"v":25},"m":{"c":16,"v":6},"n":{"c":19,"v":5},"o":{"c":21,"v":8},"p":{"c":23,"v":5},"q":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.07,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.07,"sqrMagnitude":0.0049},"angle":45.0,"scale":0.1},"tDecalB":{"position":{"x":0.075,"y":0.003,"normalized":{"x":0.999201059,"y":0.03996804,"normalized":{"x":0.99920094,"y":0.0399680361,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":1.00000012,"sqrMagnitude":1.00000024},"magnitude":0.07505997,"sqrMagnitude":0.005634},"angle":45.0,"scale":0.1},"tPattern":{"position":{"x":0.02,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.02,"sqrMagnitude":0.0004},"angle":200.0,"scale":0.5}},"publicName":{"data":"Accrat ND6"}}}`,
    name: "Heavy Smg",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.SMG_Front_4_Reload_1,
    },
    model: () => new HeavySmg()
}, {
    id: `{"Ver":1,"Name":"Van Auken CAB F4","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":1},"b":{"c":2,"v":2},"c":{"c":3,"v":108},"d":{"c":4,"v":2},"e":{"c":5,"v":41},"f":{"c":6,"v":2},"g":{"c":7,"v":1},"h":{"c":8,"v":19},"i":{"c":9,"v":9},"j":{"c":10,"v":10},"k":{"c":11,"v":10},"l":{"c":12,"v":23},"m":{"c":16,"v":6},"n":{"c":19,"v":9},"o":{"c":21,"v":12},"p":{"c":23,"v":5},"q":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.05,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05,"sqrMagnitude":0.00250000018},"scale":0.3},"tDecalB":{"position":{"x":0.1,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.1,"sqrMagnitude":0.0100000007},"scale":0.3},"tPattern":{"angle":-135.0,"scale":0.2}},"publicName":{"data":"Van Auken CAB F4"}}}`,
    name: "Carbine",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.SMG_Front_4_Reload_1,
    },
    model: () => new Carbine()
}, {
    id: `{"Ver":1,"Name":"TR22 Hanaway","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":4},"b":{"c":3,"v":108},"c":{"c":4,"v":4},"d":{"c":5,"v":34},"e":{"c":6,"v":34},"f":{"c":7,"v":5},"g":{"c":8,"v":14},"h":{"c":9,"v":10},"i":{"c":10,"v":18},"j":{"c":11,"v":18},"k":{"c":12,"v":15},"l":{"c":16,"v":8},"m":{"c":19,"v":2},"n":{"c":21,"v":7},"o":{"c":23,"v":1},"p":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.48,"y":-0.035,"normalized":{"x":0.9973521,"y":-0.0727236,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.481274337,"sqrMagnitude":0.231624991},"scale":0.5},"tDecalB":{"position":{"x":0.53,"y":-0.05,"normalized":{"x":0.995579541,"y":-0.0939226,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.5323532,"sqrMagnitude":0.283399969},"scale":0.5},"tPattern":{"position":{"y":-0.02,"normalized":{"y":-1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.02,"sqrMagnitude":0.0004},"scale":0.5}},"publicName":{"data":"TR22 Hanaway"}}}`,
    name: "Dmr",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    type: "rifle",
    model: () => new Dmr()
}, {
    id: `{"Ver":1,"Name":"Hanaway PSB","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":1},"b":{"c":2,"v":4},"c":{"c":3,"v":108},"d":{"c":4,"v":4},"e":{"c":5,"v":34},"f":{"c":6,"v":34},"g":{"c":7,"v":5},"h":{"c":8,"v":13},"i":{"c":9,"v":9},"j":{"c":10,"v":10},"k":{"c":11,"v":10},"l":{"c":12,"v":15},"m":{"c":16,"v":2},"n":{"c":19,"v":8},"o":{"c":21,"v":18},"p":{"c":23,"v":1},"q":{"c":25,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":0.035,"y":0.045,"normalized":{"x":0.6139406,"y":0.789352238,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.0570087731,"sqrMagnitude":0.00325},"scale":0.3},"tDecalB":{"position":{"x":0.03,"y":0.04,"normalized":{"x":0.599999964,"y":0.799999952,"normalized":{"x":0.6,"y":0.8,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.05,"sqrMagnitude":0.0025},"scale":0.2},"tPattern":{"position":{"y":0.03,"normalized":{"y":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.03,"sqrMagnitude":0.0009},"angle":-90.0,"scale":0.3}},"publicName":{"data":"Hanaway PSB"}}}`,
    name: "Double Tap",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    type: "rifle",
    model: () => new DoubleTap()
}, {
    id: `{"Ver":1,"Name":"Malatack LX","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":1},"c":{"c":3,"v":108},"d":{"c":4,"v":1},"e":{"c":5,"v":3},"f":{"c":6,"v":3},"g":{"c":7,"v":3},"h":{"c":8,"v":17},"i":{"c":9,"v":6},"j":{"c":10,"v":12},"k":{"c":11,"v":12},"l":{"c":12,"v":28},"m":{"c":16,"v":9},"n":{"c":19,"v":7},"o":{"c":21,"v":20},"p":{"c":23,"v":4},"q":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.045,"y":0.025,"normalized":{"x":0.8741573,"y":0.48564294,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05147815,"sqrMagnitude":0.00265000015},"angle":90.0,"scale":0.1},"tDecalB":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":90.0,"scale":0.1},"tPattern":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Malatack LX"}}}`,
    name: "Assault Rifle",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    model: () => new AssaultRifle()
}, {
    id: `{"Ver":1,"Name":"Malatack CH 4","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":1},"b":{"c":2,"v":1},"c":{"c":3,"v":108},"d":{"c":4,"v":1},"e":{"c":5,"v":3},"f":{"c":6,"v":3},"g":{"c":7,"v":3},"h":{"c":8,"v":17},"i":{"c":9,"v":1},"j":{"c":10,"v":14},"k":{"c":11,"v":23},"l":{"c":12,"v":17},"m":{"c":16,"v":9},"n":{"c":19,"v":8},"o":{"c":21,"v":21},"p":{"c":23,"v":4},"q":{"c":25,"v":4}},"MatTrans":{"tDecalA":{"position":{"x":0.225,"y":0.003,"normalized":{"x":0.9999111,"y":0.013332149,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.225019991,"sqrMagnitude":0.0506339967},"angle":-90.0,"scale":0.05},"tDecalB":{"position":{"x":0.03,"y":-0.012,"normalized":{"x":0.9284767,"y":-0.371390671,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.03231099,"sqrMagnitude":0.001044},"scale":0.06},"tPattern":{"position":{"x":0.07,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.07,"sqrMagnitude":0.0049},"angle":180.0,"scale":0.3}},"publicName":{"data":"Malatack CH 4"}}}`,
    name: "Burst Rifle",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    model: () => new BurstRifle()
}, {
    id: `{"Ver":1,"Name":"Drekker Pres MOD 556","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":1},"b":{"c":3,"v":108},"c":{"c":4,"v":1},"d":{"c":5,"v":42},"e":{"c":6,"v":3},"f":{"c":7,"v":2},"g":{"c":8,"v":9},"h":{"c":9,"v":8},"i":{"c":10,"v":10},"j":{"c":11,"v":10},"k":{"c":12,"v":14},"l":{"c":16,"v":8},"m":{"c":19,"v":7},"n":{"c":21,"v":15},"o":{"c":23,"v":1},"p":{"c":25,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":0.03,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.03,"sqrMagnitude":0.0009},"scale":0.3},"tDecalB":{"position":{"x":0.1,"y":0.02,"normalized":{"x":0.9805806,"y":0.19611612,"normalized":{"x":0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.101980396,"sqrMagnitude":0.010400001},"scale":0.3},"tPattern":{"position":{"x":0.32,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.32,"sqrMagnitude":0.1024},"scale":0.6}},"publicName":{"data":"Drekker Pres MOD 556"}}}`,
    name: "Rifle",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    model: () => new Rifle()
}, {
    id: `{"Ver":1,"Name":"Buckland SBS III","Packet":{"Comps":{"Length":14,"a":{"c":2,"v":16},"b":{"c":3,"v":156},"c":{"c":4,"v":20},"d":{"c":5,"v":37},"e":{"c":6,"v":4},"f":{"c":8,"v":17},"g":{"c":9,"v":5},"h":{"c":10,"v":18},"i":{"c":11,"v":18},"j":{"c":12,"v":47},"k":{"c":16,"v":22},"l":{"c":19,"v":21},"m":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.51,"y":-0.05,"normalized":{"x":0.9952285,"y":-0.09757143,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.5124451,"sqrMagnitude":0.262599975},"scale":0.3},"tDecalB":{"position":{"x":0.5,"y":-0.07,"normalized":{"x":0.990341663,"y":-0.138647839,"normalized":{"x":0.9903418,"y":-0.138647854,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.9999999,"sqrMagnitude":0.9999998},"magnitude":0.504876256,"sqrMagnitude":0.2549},"scale":0.3},"tPattern":{"angle":-90.0,"scale":0.3}},"publicName":{"data":"Buckland SBS III"}}}`,
    name: "Sawed Off",
    type: "pistol",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Revolver_Front_1_Reload_1
    },
    model: () => new SawedOff()
}, {
    id: `{"Ver":1,"Name":"Bataldo J 300","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":33},"c":{"c":3,"v":156},"d":{"c":4,"v":46},"e":{"c":5,"v":50},"f":{"c":6,"v":4},"g":{"c":7,"v":4},"h":{"c":8,"v":17},"i":{"c":9,"v":5},"j":{"c":10,"v":18},"k":{"c":11,"v":18},"l":{"c":12,"v":32},"m":{"c":16,"v":12},"n":{"c":19,"v":10},"o":{"c":21,"v":11},"p":{"c":23,"v":9},"q":{"c":25,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":0.51,"y":-0.05,"normalized":{"x":0.9952285,"y":-0.09757143,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.5124451,"sqrMagnitude":0.262599975},"scale":0.3},"tDecalB":{"position":{"x":0.5,"y":-0.07,"normalized":{"x":0.990341663,"y":-0.138647839,"normalized":{"x":0.9903418,"y":-0.138647854,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.9999999,"sqrMagnitude":0.9999998},"magnitude":0.504876256,"sqrMagnitude":0.2549},"scale":0.3},"tPattern":{"angle":-90.0,"scale":0.3}},"publicName":{"data":"Bataldo J 300"}}}`,
    name: "Hel Shotgun",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    model: () => new HelShotgun()
}, {
    id: `{"Ver":1,"Name":"Bataldo Custom K330","Packet":{"Comps":{"Length":16,"a":{"c":2,"v":37},"b":{"c":3,"v":108},"c":{"c":4,"v":6},"d":{"c":5,"v":50},"e":{"c":6,"v":4},"f":{"c":7,"v":4},"g":{"c":8,"v":18},"h":{"c":9,"v":13},"i":{"c":10,"v":22},"j":{"c":11,"v":22},"k":{"c":12,"v":33},"l":{"c":16,"v":12},"m":{"c":19,"v":12},"n":{"c":21,"v":49},"o":{"c":25,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":-0.202,"y":0.012,"normalized":{"x":-0.9982401,"y":0.05930139,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.20235613,"sqrMagnitude":0.0409480035},"scale":0.07},"tDecalB":{"position":{"x":-0.2,"y":0.01,"normalized":{"x":-0.9987523,"y":0.0499376133,"normalized":{"x":-0.998752356,"y":0.049937617,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.200249851,"sqrMagnitude":0.0401000045},"scale":0.07},"tPattern":{"position":{"x":-0.1,"y":0.032,"normalized":{"x":-0.9524241,"y":0.3047757,"normalized":{"x":-0.952424169,"y":0.304775745,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.104995243,"sqrMagnitude":0.0110240011},"angle":-140.0,"scale":0.1}},"publicName":{"data":"Bataldo Custom K330"}}}`,
    name: "Slug Shotgun",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    model: () => new SlugShotgun()
}, {
    id: `{"Ver":1,"Name":"Malatack HXC","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":22},"c":{"c":3,"v":109},"d":{"c":4,"v":1},"e":{"c":5,"v":42},"f":{"c":6,"v":3},"g":{"c":7,"v":3},"h":{"c":8,"v":17},"i":{"c":9,"v":6},"j":{"c":10,"v":12},"k":{"c":11,"v":12},"l":{"c":12,"v":28},"m":{"c":16,"v":9},"n":{"c":19,"v":3},"o":{"c":21,"v":45},"p":{"c":23,"v":1},"q":{"c":25,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":0.045,"y":0.025,"normalized":{"x":0.8741573,"y":0.48564294,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05147815,"sqrMagnitude":0.00265000015},"angle":90.0,"scale":0.1},"tDecalB":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":90.0,"scale":0.1},"tPattern":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Malatack HXC"}}}`,
    name: "Heavy Assault Rifle",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    model: () => new HeavyAssaultRifle()
}, {
    id: `{"Ver":1,"Name":"Drekker CLR","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":24},"b":{"c":3,"v":109},"c":{"c":4,"v":49},"d":{"c":5,"v":2},"e":{"c":6,"v":2},"f":{"c":7,"v":1},"g":{"c":8,"v":15},"h":{"c":9,"v":5},"i":{"c":10,"v":17},"j":{"c":11,"v":17},"k":{"c":12,"v":25},"l":{"c":16,"v":7},"m":{"c":19,"v":8},"n":{"c":21,"v":50},"o":{"c":23,"v":5},"p":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.07,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.07,"sqrMagnitude":0.0049},"angle":45.0,"scale":0.1},"tDecalB":{"position":{"x":0.075,"y":0.003,"normalized":{"x":0.999201059,"y":0.03996804,"normalized":{"x":0.99920094,"y":0.0399680361,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":1.00000012,"sqrMagnitude":1.00000024},"magnitude":0.07505997,"sqrMagnitude":0.005634},"angle":45.0,"scale":0.1},"tPattern":{"position":{"x":0.02,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.02,"sqrMagnitude":0.0004},"angle":200.0,"scale":0.5}},"publicName":{"data":"Drekker CLR"}}}`,
    name: "Short Rifle",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    model: () => new ShortRifle()
}, {
    id: `{"Ver":1,"Name":"Buckland s870","Packet":{"Comps":{"Length":16,"a":{"c":2,"v":6},"b":{"c":3,"v":110},"c":{"c":4,"v":6},"d":{"c":5,"v":4},"e":{"c":6,"v":4},"f":{"c":7,"v":4},"g":{"c":8,"v":7},"h":{"c":9,"v":1},"i":{"c":10,"v":24},"j":{"c":11,"v":24},"k":{"c":12,"v":22},"l":{"c":16,"v":12},"m":{"c":19,"v":13},"n":{"c":21,"v":40},"o":{"c":25,"v":2}},"MatTrans":{"tDecalA":{"position":{"x":0.11,"y":0.01,"normalized":{"x":0.99589324,"y":0.090535745,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.110453606,"sqrMagnitude":0.0122},"angle":0.07,"scale":0.07},"tDecalB":{"position":{"x":0.105,"y":0.005,"normalized":{"x":0.9988681,"y":0.0475651473,"normalized":{"x":0.998868167,"y":0.04756515,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.105118982,"sqrMagnitude":0.01105},"angle":0.07,"scale":0.07},"tPattern":{"position":{"x":0.25,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.25,"sqrMagnitude":0.0625},"angle":180.0,"scale":0.5}},"publicName":{"data":"Buckland s870"}}}`,
    name: "Shotgun",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    model: () => new Shotgun()
}, {
    id: `{"Ver":1,"Name":"Buckland AF6","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":6},"c":{"c":3,"v":110},"d":{"c":4,"v":46},"e":{"c":5,"v":4},"f":{"c":6,"v":4},"g":{"c":7,"v":4},"h":{"c":8,"v":17},"i":{"c":9,"v":5},"j":{"c":10,"v":18},"k":{"c":11,"v":18},"l":{"c":12,"v":12},"m":{"c":16,"v":6},"n":{"c":19,"v":10},"o":{"c":21,"v":42},"p":{"c":23,"v":9},"q":{"c":25,"v":2}},"MatTrans":{"tDecalA":{"position":{"x":0.51,"y":-0.05,"normalized":{"x":0.9952285,"y":-0.09757143,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.5124451,"sqrMagnitude":0.262599975},"scale":0.3},"tDecalB":{"position":{"x":0.5,"y":-0.07,"normalized":{"x":0.990341663,"y":-0.138647839,"normalized":{"x":0.9903418,"y":-0.138647854,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.9999999,"sqrMagnitude":0.9999998},"magnitude":0.504876256,"sqrMagnitude":0.2549},"scale":0.3},"tPattern":{"angle":-90.0,"scale":0.3}},"publicName":{"data":"Buckland AF6"}}}`,
    name: "Combat Shotgun",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    model: () => new CombatShotgun()
}, {
    id: `{"Ver":1,"Name":"Drekker INEX Drei","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":1},"b":{"c":2,"v":30},"c":{"c":3,"v":110},"d":{"c":4,"v":43},"e":{"c":5,"v":4},"f":{"c":6,"v":4},"g":{"c":7,"v":4},"h":{"c":8,"v":19},"i":{"c":9,"v":10},"j":{"c":10,"v":19},"k":{"c":11,"v":19},"l":{"c":12,"v":11},"m":{"c":16,"v":9},"n":{"c":19,"v":13},"o":{"c":21,"v":33},"p":{"c":23,"v":19},"q":{"c":25,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":0.06,"y":0.005,"normalized":{"x":0.9965458,"y":0.08304548,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.06020797,"sqrMagnitude":0.003625},"scale":0.08},"tDecalB":{"position":{"x":0.07,"y":0.01,"normalized":{"x":0.9899496,"y":0.141421363,"normalized":{"x":0.989949465,"y":0.141421348,"normalized":{"x":0.9899495,"y":0.141421363,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":1.00000012,"sqrMagnitude":1.00000024},"magnitude":0.0707106739,"sqrMagnitude":0.005},"scale":0.08},"tPattern":{"position":{"x":0.06,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.06,"sqrMagnitude":0.0036},"angle":-60.0,"scale":0.3}},"publicName":{"data":"Drekker INEX Drei"}}}`,
    name: "Scatter Gun",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    model: () => new ScatterGun()
}, {
    id: `{"Ver":1,"Name":"Buckland XDist2","Packet":{"Comps":{"Length":17,"a":{"c":1,"v":1},"b":{"c":2,"v":6},"c":{"c":3,"v":110},"d":{"c":4,"v":6},"e":{"c":5,"v":46},"f":{"c":6,"v":4},"g":{"c":7,"v":4},"h":{"c":8,"v":19},"i":{"c":9,"v":10},"j":{"c":10,"v":19},"k":{"c":11,"v":19},"l":{"c":12,"v":20},"m":{"c":16,"v":6},"n":{"c":19,"v":12},"o":{"c":21,"v":43},"p":{"c":25,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":0.06,"y":0.005,"normalized":{"x":0.9965458,"y":0.08304548,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.06020797,"sqrMagnitude":0.003625},"scale":0.08},"tDecalB":{"position":{"x":0.07,"y":0.01,"normalized":{"x":0.9899496,"y":0.141421363,"normalized":{"x":0.989949465,"y":0.141421348,"normalized":{"x":0.9899495,"y":0.141421363,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":1.00000012,"sqrMagnitude":1.00000024},"magnitude":0.0707106739,"sqrMagnitude":0.005},"scale":0.08},"tPattern":{"position":{"x":0.06,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.06,"sqrMagnitude":0.0036},"angle":-60.0,"scale":0.3}},"publicName":{"data":"Buckland XDist2"}}}`,
    name: "Choke Mod Shotgun",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    model: () => new ChokeModShotgun()
}, {
    id: `{"Ver":1,"Name":"Mastaba R66","Packet":{"Comps":{"Length":14,"a":{"c":2,"v":7},"b":{"c":3,"v":109},"c":{"c":4,"v":7},"d":{"c":5,"v":29},"e":{"c":6,"v":29},"f":{"c":8,"v":7},"g":{"c":9,"v":14},"h":{"c":10,"v":20},"i":{"c":11,"v":35},"j":{"c":12,"v":36},"k":{"c":16,"v":16},"l":{"c":19,"v":14},"m":{"c":25,"v":2}},"MatTrans":{"tDecalA":{"position":{"x":0.17,"y":0.02,"normalized":{"x":0.993150651,"y":0.116841249,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.171172425,"sqrMagnitude":0.0293},"scale":0.06},"tDecalB":{"position":{"x":0.17,"y":-0.015,"normalized":{"x":0.9961299,"y":-0.08789381,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.170660481,"sqrMagnitude":0.0291250013},"scale":0.2},"tPattern":{"position":{"x":0.24,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.24,"sqrMagnitude":0.0576},"scale":0.5}},"publicName":{"data":"Mastaba R66"}}}`,
    name: "Revolver",
    type: "pistol",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Revolver_Front_1_Reload_1,
    },
    model: () => new Revolver()
}, {
    id: `{"Ver":1,"Name":"TechMan Arbalist V","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":3},"c":{"c":3,"v":109},"d":{"c":4,"v":3},"e":{"c":5,"v":33},"f":{"c":6,"v":33},"g":{"c":7,"v":3},"h":{"c":8,"v":10},"i":{"c":9,"v":10},"j":{"c":10,"v":13},"k":{"c":11,"v":14},"l":{"c":12,"v":18},"m":{"c":16,"v":6},"n":{"c":19,"v":3},"o":{"c":21,"v":13},"p":{"c":23,"v":14},"q":{"c":25,"v":6}},"MatTrans":{"tDecalA":{"position":{"x":0.1,"y":0.02,"normalized":{"x":0.9805806,"y":0.19611612,"normalized":{"x":0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.101980396,"sqrMagnitude":0.010400001},"angle":180.0,"scale":0.4},"tDecalB":{"position":{"x":-0.07,"y":0.03,"normalized":{"x":-0.919145,"y":0.3939193,"normalized":{"x":-0.919145048,"y":0.393919319,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.0761577338,"sqrMagnitude":0.0058},"angle":-90.0,"scale":0.05},"tPattern":{"angle":-90.0,"scale":0.1}},"publicName":{"data":"TechMan Arbalist V"}}}`,
    name: "Machine Gun",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    model: () => new MachineGun0()
}, {
    id: `{"Ver":1,"Name":"TechMan Veruta XII","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":19},"c":{"c":3,"v":109},"d":{"c":4,"v":3},"e":{"c":5,"v":39},"f":{"c":6,"v":33},"g":{"c":7,"v":3},"h":{"c":8,"v":10},"i":{"c":9,"v":10},"j":{"c":10,"v":13},"k":{"c":11,"v":14},"l":{"c":12,"v":27},"m":{"c":16,"v":6},"n":{"c":19,"v":3},"o":{"c":21,"v":5},"p":{"c":23,"v":7},"q":{"c":25,"v":6}},"MatTrans":{"tDecalA":{"position":{"x":0.1,"y":0.02,"normalized":{"x":0.9805806,"y":0.19611612,"normalized":{"x":0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.101980396,"sqrMagnitude":0.010400001},"angle":180.0,"scale":0.4},"tDecalB":{"position":{"x":-0.07,"y":0.03,"normalized":{"x":-0.919145,"y":0.3939193,"normalized":{"x":-0.919145048,"y":0.393919319,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.0761577338,"sqrMagnitude":0.0058},"angle":-90.0,"scale":0.05},"tPattern":{"angle":-90.0,"scale":0.1}},"publicName":{"data":"TechMan Veruta XII"}}}`,
    name: "Machine Gun",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    model: () => new MachineGun1()
}, {
    id: `{"Ver":1,"Name":"TechMan Klust 6","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":1},"b":{"c":2,"v":3},"c":{"c":3,"v":109},"d":{"c":4,"v":3},"e":{"c":5,"v":43},"f":{"c":6,"v":33},"g":{"c":7,"v":3},"h":{"c":8,"v":18},"i":{"c":9,"v":8},"j":{"c":10,"v":27},"k":{"c":11,"v":26},"l":{"c":12,"v":27},"m":{"c":16,"v":11},"n":{"c":19,"v":8},"o":{"c":21,"v":4},"p":{"c":23,"v":16},"q":{"c":25,"v":6}},"MatTrans":{"tDecalA":{"position":{"x":-0.05,"y":0.01,"normalized":{"x":-0.9805806,"y":0.19611612,"normalized":{"x":-0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.0509901978,"sqrMagnitude":0.00260000024},"scale":0.1},"tDecalB":{"position":{"x":-0.05,"y":0.01,"normalized":{"x":-0.9805806,"y":0.19611612,"normalized":{"x":-0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.0509901978,"sqrMagnitude":0.00260000024},"scale":0.1},"tPattern":{"position":{"x":0.17,"y":0.05,"normalized":{"x":0.9593655,"y":0.282166332,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.177200451,"sqrMagnitude":0.0314000025},"angle":-135.0,"scale":0.2}},"publicName":{"data":"TechMan Klust 6"}}}`,
    name: "Burst Cannon",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    model: () => new BurstCannon()
}, {
    id: `{"Ver":1,"Name":"Omneco exp1","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":3},"b":{"c":3,"v":109},"c":{"c":4,"v":3},"d":{"c":5,"v":33},"e":{"c":6,"v":33},"f":{"c":7,"v":3},"g":{"c":8,"v":13},"h":{"c":9,"v":5},"i":{"c":10,"v":25},"j":{"c":11,"v":12},"k":{"c":12,"v":27},"l":{"c":16,"v":10},"m":{"c":19,"v":1},"n":{"c":21,"v":24},"o":{"c":23,"v":14},"p":{"c":25,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":-0.05,"y":0.045,"normalized":{"x":-0.7432942,"y":0.6689648,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.06726812,"sqrMagnitude":0.004525},"scale":0.05},"tDecalB":{"position":{"x":-0.22,"normalized":{"x":-1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.22,"sqrMagnitude":0.0484},"scale":0.1},"tPattern":{"position":{"y":0.02,"normalized":{"y":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.02,"sqrMagnitude":0.0004},"angle":-90.0,"scale":0.2}},"publicName":{"data":"Omneco exp1"}}}`,
    name: "Hel Gun",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    model: () => new HelGun()
}, {
    id: `{"Ver":1,"Name":"Shelling Arid 5","Packet":{"Comps":{"Length":16,"a":{"c":2,"v":35},"b":{"c":3,"v":109},"c":{"c":4,"v":48},"d":{"c":5,"v":48},"e":{"c":6,"v":29},"f":{"c":7,"v":2},"g":{"c":8,"v":16},"h":{"c":9,"v":15},"i":{"c":10,"v":27},"j":{"c":11,"v":27},"k":{"c":12,"v":49},"l":{"c":16,"v":21},"m":{"c":19,"v":18},"n":{"c":23,"v":8},"o":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":-0.098,"y":-0.07,"normalized":{"x":-0.813733459,"y":-0.5812382,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.120432556,"sqrMagnitude":0.014504},"scale":0.05},"tDecalB":{"position":{"x":-0.098,"y":-0.07,"normalized":{"x":-0.813733459,"y":-0.5812382,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.120432556,"sqrMagnitude":0.014504},"scale":0.04},"tPattern":{"position":{"x":-0.09,"y":-0.03,"normalized":{"x":-0.9486833,"y":-0.316227764,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.09486833,"sqrMagnitude":0.009000001},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Shelling Arid 5"}}}`,
    name: "High Cal",
    type: "pistol",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    model: () => new HighCal()
}, {
    id: `{"Ver":1,"Name":"Drekker DEL P1","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":34},"b":{"c":3,"v":109},"c":{"c":4,"v":47},"d":{"c":5,"v":51},"e":{"c":6,"v":36},"f":{"c":7,"v":5},"g":{"c":8,"v":18},"h":{"c":9,"v":10},"i":{"c":10,"v":27},"j":{"c":11,"v":15},"k":{"c":12,"v":19},"l":{"c":16,"v":1},"m":{"c":19,"v":1},"n":{"c":21,"v":14},"o":{"c":23,"v":12},"p":{"c":25,"v":2}},"MatTrans":{"tDecalA":{"position":{"x":0.04,"y":0.04,"normalized":{"x":0.707106769,"y":0.707106769,"normalized":{"x":0.7071068,"y":0.7071068,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.05656854,"sqrMagnitude":0.0032},"scale":0.08},"tDecalB":{"position":{"x":0.48,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.48,"sqrMagnitude":0.2304},"scale":0.3},"tPattern":{"position":{"y":0.04,"normalized":{"y":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.04,"sqrMagnitude":0.0016},"angle":-90.0,"scale":0.2}},"publicName":{"data":"Drekker DEL P1"}}}`,
    name: "Precision Rifle",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    model: () => new PrecisionRifle()
}, {
    id: `{"Ver":1,"Name":"Köning PR 11","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":5},"b":{"c":3,"v":109},"c":{"c":4,"v":5},"d":{"c":5,"v":36},"e":{"c":6,"v":36},"f":{"c":7,"v":5},"g":{"c":8,"v":18},"h":{"c":9,"v":10},"i":{"c":10,"v":27},"j":{"c":11,"v":15},"k":{"c":12,"v":21},"l":{"c":16,"v":9},"m":{"c":19,"v":11},"n":{"c":21,"v":46},"o":{"c":23,"v":13},"p":{"c":25,"v":4}},"MatTrans":{"tDecalA":{"position":{"x":0.04,"y":0.04,"normalized":{"x":0.707106769,"y":0.707106769,"normalized":{"x":0.7071068,"y":0.7071068,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.05656854,"sqrMagnitude":0.0032},"scale":0.08},"tDecalB":{"position":{"x":0.48,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.48,"sqrMagnitude":0.2304},"scale":0.3},"tPattern":{"position":{"y":0.04,"normalized":{"y":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.04,"sqrMagnitude":0.0016},"angle":-90.0,"scale":0.2}},"publicName":{"data":"Köning PR 11"}}}`,
    name: "Sniper",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    model: () => new Sniper()
}, {
    id: `{"Ver":1,"Name":"Omneco LRG","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":20},"b":{"c":3,"v":109},"c":{"c":4,"v":5},"d":{"c":5,"v":36},"e":{"c":6,"v":36},"f":{"c":7,"v":5},"g":{"c":8,"v":18},"h":{"c":9,"v":10},"i":{"c":10,"v":27},"j":{"c":11,"v":15},"k":{"c":12,"v":29},"l":{"c":16,"v":10},"m":{"c":19,"v":2},"n":{"c":21,"v":19},"o":{"c":23,"v":12},"p":{"c":25,"v":4}},"MatTrans":{"tDecalA":{"position":{"x":0.04,"y":0.04,"normalized":{"x":0.707106769,"y":0.707106769,"normalized":{"x":0.7071068,"y":0.7071068,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.05656854,"sqrMagnitude":0.0032},"scale":0.08},"tDecalB":{"position":{"x":0.48,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.48,"sqrMagnitude":0.2304},"scale":0.3},"tPattern":{"position":{"y":0.04,"normalized":{"y":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.04,"sqrMagnitude":0.0016},"angle":-90.0,"scale":0.2}},"publicName":{"data":"Omneco LRG"}}}`,
    name: "Hel Rifle",
    type: "rifle",
    gearArchetype: {
        gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        offset: new Vector3(0, 0, 0.2)
    },
    model: () => new HelRifle()
}, {
    id: `{"Ver":1,"Name":"Hacking Tool","Packet":{"Comps":{"Length":5,"a":{"c":2,"v":15},"b":{"c":3,"v":53},"c":{"c":4,"v":17},"d":{"c":5,"v":28}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Hacking Tool"}}}`,
    name: "Hacking Tool",
    type: "rifle",
    model: () => new HackingTool()
}];

const _item: Equippable<number>[] = [{
    id: 102,
    type: "consumable",
    model: () => new Pack(0xff0000)
}, {
    id: 101,
    type: "consumable",
    model: () => new Pack(0x00ff00)
}, {
    id: 127,
    type: "consumable",
    model: () => new Pack(0x0000ff)
}, {
    id: 132,
    type: "consumable",
    model: () => new Pack(0x7b9fe8)
}, { 
    id: 114,
    name: "Glow Sticks",
    type: "consumable",
    model: () => new GlowStick()
}, { 
    id: 174,
    name: "Glow Sticks",
    type: "consumable",
    model: () => new GlowStick()
}, { 
    id: 30,
    name: "Long Range Flashlight",
    type: "consumable",
    model: () => new LongRangeFlashlight() 
}, { 
    id: 140,
    name: "I2-LP Syringe",
    type: "consumable",
    model: () => new Syringe(new Color(0xff4444)) 
}, { 
    id: 142,
    name: "IIX Syringe",
    type: "consumable",
    model: () => new Syringe(new Color(0xffff00))
}, { 
    id: 115,
    name: "Cfoam Grenade",
    type: "consumable",
    model: () => new CfoamGrenade()
}, { 
    id: 116,
    name: "Lock Melter",
    type: "consumable",
    model: () => new LockMelter()

}, { 
    id: 117,
    name: "Fog Repeller",
    type: "consumable",
    consumableArchetype: {
        equipAnim: playerAnimationClips.Fogrepeller_Throw_Equip,
        throwAnim: playerAnimationClips.Fogrepeller_Throw,
        chargeAnim: playerAnimationClips.Fogrepeller_Throw_Charge,
        chargeIdleAnim: playerAnimationClips.Fogrepeller_Throw_Charge_Idle
    },
    model: () => new FogRepeller()   
}, { 
    id: 139,
    name: "Explosive Tripmine",
    type: "consumable",
    model: () => new ConsumableMine()
}, { 
    id: 144,
    name: "Cfoam Tripmine",
    type: "consumable",
    model: () => new CfoamTripMine()
}, { 
    id: 131,
    name: "Power Cell",
    type: "rifle",
    model: () => new PowerCell()
}, { 
    id: 133,
    name: "Fog Repeller",
    type: "rifle",
    model: () => new HeavyFogRepeller()
}, { 
    id: 137,
    name: "Neonate",
    type: "rifle",
    model: () => new Neonate()
}, { 
    id: 141,
    name: "Neonate",
    type: "rifle",
    model: () => new Neonate()
}, { 
    id: 143,
    name: "Neonate",
    type: "rifle",
    model: () => new Neonate()
}, { 
    id: 170,
    name: "Neonate",
    type: "rifle",
    model: () => new Neonate()
}, { 
    id: 145,
    name: "Neonate",
    type: "rifle",
    model: () => new Neonate()
}, { 
    id: 175,
    name: "Neonate",
    type: "rifle",
    model: () => new Neonate()
}, { 
    id: 177,
    name: "Neonate",
    type: "rifle",
    model: () => new Neonate()
}, { 
    id: 164,
    name: "Matter Wave Projector",
    type: "rifle",
    model: () => new MatterWaveProjector()
}, { 
    id: 166,
    name: "Matter Wave Projector",
    type: "rifle",
    model: () => new MatterWaveProjector()
}, { 
    id: 151,
    name: "Data Sphere",
    type: "rifle",
    model: () => new DataSphere()
}, { 
    id: 181,
    name: "Data Sphere",
    type: "rifle",
    model: () => new DataSphere()
}, { 
    id: 138,
    name: "Cargo Crate",
    type: "rifle",
    model: () => new CargoCrate()
}, { 
    id: 176,
    name: "Cargo Crate",
    type: "rifle",
    model: () => new CargoCrate()
}, { 
    id: 154,
    name: "Hisec Cargo Crate",
    type: "rifle",
    model: () => new HisecCargoCrate()
}, { 
    id: 155,
    name: "Hisec Cargo Crate",
    type: "rifle",
    model: () => new HisecCargoCrate()
}, { 
    id: 148,
    name: "Cryo",
    type: "rifle",
    model: () => new Cryo()
}, { 
    id: 173,
    name: "Collection Case",
    type: "rifle",
    model: () => new CollectionCase()
}, { 
    id: 168,
    name: "Data Cube",
    type: "rifle",
    model: () => new DataCube()
}, { 
    id: 165,
    name: "Data Cube",
    type: "rifle",
    model: () => new DataCube()
}, { 
    id: 179,
    name: "Data Cube",
    type: "rifle",
    model: () => new DataCube()
}, { 
    id: 178,
    name: "Data Cube",
    type: "rifle",
    model: () => new DataCube()
}, { 
    id: 146,
    name: "Bulkhead Key",
    type: "rifle",
    model: () => new BulkheadKey()
}, { 
    id: 27,
    name: "Key Red",
    type: "rifle",
    model: () => new Keycard(0xff0000)
}, { 
    id: 85,
    name: "Key Blue",
    type: "rifle",
    model: () => new Keycard(0x0000ff)
}, { 
    id: 86,
    name: "Key Green",
    type: "rifle",
    model: () => new Keycard(0x00ff00)
}, { 
    id: 87,
    name: "Key Yellow",
    type: "rifle",
    model: () => new Keycard(0xffff00)
}, { 
    id: 88,
    name: "Key White",
    type: "rifle",
    model: () => new Keycard(0xffffff)
}, { 
    id: 89,
    name: "Key Black",
    type: "rifle",
    model: () => new Keycard(0x444444)
}, { 
    id: 90,
    name: "Key Grey",
    type: "rifle",
    model: () => new Keycard(0xaaaaaa)
}, { 
    id: 91,
    name: "Key Orange",
    type: "rifle",
    model: () => new Keycard(0xff8800)
}, { 
    id: 92,
    name: "Key Purple",
    type: "rifle",
    model: () => new Keycard(0xb300ff)
}, { 
    id: 128,
    name: "Personnel Id",
    type: "rifle",
    model: () => new PID()
}, { 
    id: 129,
    name: "Partial Decoder",
    type: "rifle",
    model: () => new PartialDecoder()
}, { 
    id: 147,
    name: "Hard Drive",
    type: "rifle",
    model: () => new HardDrive()
}, { 
    id: 180,
    name: "Hard Drive",
    type: "rifle",
    model: () => new HardDrive()
}, { 
    id: 183,
    name: "Hard Drive",
    type: "rifle",
    model: () => new HardDrive()
}, { 
    id: 149,
    name: "GLP",
    type: "rifle",
    model: () => new GLP1()
}, { 
    id: 150,
    name: "OSIP",
    type: "rifle",
    model: () => new OSIP()
}, { 
    id: 169,
    name: "GLP",
    type: "rifle",
    model: () => new GLP2()
}, { 
    id: 153,
    name: "Plant Sample",
    type: "rifle",
    model: () => new PlantSample()
}, { 
    id: 171,
    name: "Memory Stick",
    type: "rifle",
    model: () => new MemoryStick()
}, { 
    id: 172,
    name: "Memory Stick",
    type: "rifle",
    model: () => new MemoryStick()
}];

const _shooter_scale = 0.8;
const _enemies: EnemySpecification[] = [{
    id: 0,
    name: "Unknown",
    maxHealth: Infinity
}, {
    id: 20,
    name: "Scout",
    maxHealth: 42,
    headScale: {
        x: 1.3,
        y: 1.3,
        z: 1.3
    },
    armScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1,
    },
    scale: _shooter_scale
}, {
    id: 40,
    name: "Shadow Scout",
    transparent: true,
    maxHealth: 42,
    headScale: {
        x: 1.3,
        y: 1.3,
        z: 1.3
    },
    armScale: {
        x: 1.25,
        y: 1.25,
        z: 1.25,
    },
    legScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1,
    },
    scale: _shooter_scale
}, {
    id: 41,
    name: "Charger Scout",
    maxHealth: 60,
    headScale: {
        x: 1.3,
        y: 1.3,
        z: 1.3
    },
    armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2,
    },
    color: 0x880000
}, {
    id: 21,
    name: "Shadow",
    transparent: true,
    maxHealth: 20
}, {
    id: 35,
    name: "Big Shadow",
    transparent: true,
    maxHealth: 20,
    headScale: {
        x: 0.65,
        y: 0.65,
        z: 0.65,
    },
    chestScale: {
        x: 1,
        y: 0.7,
        z: 1,
    },
    armScale: {
        x: 1.2,
        y: 1,
        z: 1.2,
    }
}, {
    id: 38,
    name: "Baby",
    maxHealth: 5,
    armScale: {
        x: 1,
        y: 0.8,
        z: 0.8,
    },
    legScale: {
        x: 1,
        y: 0.8,
        z: 0.8,
    },
    chestScale: {
        x: 1.3,
        y: 1.3,
        z: 1.3,
    },
}, {
    id: 48,
    name: "Baby",
    maxHealth: 5,
    armScale: {
        x: 1,
        y: 0.8,
        z: 0.8,
    },
    legScale: {
        x: 1,
        y: 0.8,
        z: 0.8,
    },
    chestScale: {
        x: 1.3,
        y: 1.3,
        z: 1.3,
    },
}, {
    id: 13,
    name: "Striker",
    maxHealth: 20
}, {
    id: 32,
    name: "Striker",
    maxHealth: 20
}, {
    id: 31,
    name: "Striker",
    maxHealth: 20
}, {
    id: 24,
    name: "Striker",
    maxHealth: 20
}, {
    id: 49,
    name: "Striker",
    maxHealth: 20
}, {
    id: 16,
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
    id: 28,
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
    id: 50,
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
    id: 26,
    name: "Shooter",
    maxHealth: 30,
    scale: _shooter_scale,
}, {
    id: 51,
    name: "Shooter",
    maxHealth: 30,
    scale: _shooter_scale,
}, {
    id: 11,
    name: "Shooter",
    maxHealth: 30,
    scale: _shooter_scale,
}, {
    id: 18,
    name: "Big Shooter",
    maxHealth: 150,
    scale: _shooter_scale,
    headScale: {
        x: 0.8,
        y: 0.8,
        z: 0.8
    },
    chestScale: {
        x: 1.0,
        y: 1.0,
        z: 1.0
    },
    armScale: {
        x: 0.85,
        y: 0.85,
        z: 0.85
    },
}, {
    id: 33,
    name: "Hybrid",
    maxHealth: 150,
    scale: _shooter_scale,
    armScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1
    },
    chestScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
    },
    headScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1
    },
}, {
    id: 30,
    name: "Charger",
    maxHealth: 30,
    armScale: {
        x: 1.3,
        y: 1.3,
        z: 1.3
    },
    color: 0x880000
}, {
    id: 39,
    name: "Big Charger",
    maxHealth: 120,
    armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
    },
    headScale: {
        x: 0.7,
        y: 0.7,
        z: 0.7
    },
    color: 0x880000
}, {
    id: 29,
    name: "Tank",
    maxHealth: 1000,
}, {
    id: 36,
    name: "Mother",
    maxHealth: 1000,
    rotOffset: {
        x: 0,
        y: 180,
        z: 0
    }
}, {
    id: 37,
    name: "Big Mother",
    maxHealth: 2500,
    rotOffset: {
        x: 0,
        y: 180,
        z: 0
    }
}, {
    id: 46,
    name: "Snatcher",
    maxHealth: 225,
    scale: 1.5
}, {
    id: 47,
    name: "Immortal Tank",
    maxHealth: Infinity
}, {
    id: 42,
    name: "Flyer",
    maxHealth: 16.2,
    model: (enemy) => new FlyerModel(enemy),
}, {
    id: 45,
    name: "Big Flyer",
    maxHealth: 150,
    model: (enemy) => new BigFlyerModel(enemy),
}, {
    id: 43,
    name: "Squid",
    maxHealth: 6000,
    model: (enemy) => new SquidModel(enemy),
}, {
    id: 44,
    name: "Squid Boss",
    maxHealth: 6000,
    model: (enemy) => new SquidModel(enemy),
}, {
    id: 53,
    name: "Nightmare Striker",
    maxHealth: 37,
    armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
    },
    headScale: {
        x: 0,
        y: 0,
        z: 0
    },
    legScale: {
        x: 0.97,
        y: 0.97,
        z: 0.97
    },
    chestScale: {
        x: 1.05,
        y: 1.05,
        z: 1.05
    }
}, {
    id: 52,
    name: "Nightmare Shooter",
    maxHealth: 18,
    scale: _shooter_scale,
    armScale: {
        x: 0.2,
        y: 0.2,
        z: 0.2
    },
    headScale: {
        x: 0,
        y: 0,
        z: 0
    },
    legScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1
    },
}, {
    id: 54,
    name: "Zoomer Scout",
    maxHealth: 42,
    headScale: {
        x: 1.3,
        y: 1.3,
        z: 1.3
    },
    armScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1,
    },
    scale: _shooter_scale
}, {
    id: 55,
    name: "Mega Mother",
    maxHealth: 5000,
    rotOffset: {
        x: 0,
        y: 180,
        z: 0
    }
}, {
    id: 56,
    name: "Nightmare Scout",
    maxHealth: 161,
    armScale: {
        x: 0.2,
        y: 0.2,
        z: 0.2
    },
    headScale: {
        x: 0,
        y: 0,
        z: 0
    },
    legScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1
    },
    scale: _shooter_scale
}];

export class Specification {
    player: {
        maxHealth: number
    };
    item: Map<number, Equippable>;
    gear: Map<string, Equippable>;
    enemies: Map<number, EnemySpecification>;
    enemyAnimHandles: Map<AnimHandles.Flags, EnemyAnimHandle>;

    public getEnemy(identifier: Identifier): EnemySpecification | undefined {
        if (identifier.type === "Unknown") return undefined;
        if (identifier.type !== "Enemy") throw new Error(`Identifier does not represent an enemy. ('${identifier.type}')`);
        return this.enemies.get(identifier.id);
    }

    private getGear(identifier: Identifier, database?: IdentifierData): Equippable | undefined {
        if (identifier.type === "Unknown") return undefined;
        switch (identifier.type) {
        case "Gear": return this.gear.get(identifier.stringKey);
        case "Alias_Gear": {
            if (database === undefined) throw new Error("'Gear' identifiers need to be converted to 'Gear' to be used without a database.");
            const key = database.gearTable.get(identifier.id);
            if (key === undefined) throw new Error("Could not obtain 'Gear' from database.");
            return this.gear.get(key);
        }
        default: throw new Error(`Identifier does not represent a gear type. ('${identifier.type}')`);
        }
    }

    private getItem(identifier: Identifier): Equippable | undefined {
        if (identifier.type === "Unknown") return undefined;
        if (identifier.type !== "Item") throw new Error(`Identifier does not represent an item. ('${identifier.type}')`);
        return this.item.get(identifier.id);
    }

    public getEquippable(identifier: Identifier, database?: IdentifierData): Equippable | undefined {
        if (identifier.type === "Unknown") return undefined;
        switch (identifier.type) {
        case "Gear":
        case "Alias_Gear": {
            return this.getGear(identifier, database);
        }
        case "Item": {
            return this.getItem(identifier);
        }
        default: throw new Error(`Identifier does not represent a gear or item type. ('${identifier.type}')`);
        }
    }
}

export const specification: Specification = new Specification();
specification.player = {
    maxHealth: 25
};
specification.item = new Map(_item.map(g => [g.id, {...g, id: Identifier.create("Item", g.id)}]));
specification.gear = new Map(_gear.map(g => [g.id, {...g, id: Identifier.create("Gear", undefined, g.id)}]));
specification.enemies = new Map(_enemies.map(e => [e.id, e]));
specification.enemyAnimHandles = new Map(_enemyAnimHandles.map(e => [e.name, e]));