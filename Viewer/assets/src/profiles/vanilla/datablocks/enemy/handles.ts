import { mergeAnims, ScaledAnim } from "../../library/animations/lib.js";
import { AnimHandles, MeleeType } from "../../parser/enemy/animation.js";
import { HumanAnim, HumanAnimation, HumanJoints } from "../../renderer/animations/human.js";
import { Datablock } from "../lib.js";
import { EnemyAnimDatablock } from "./animation.js";

export interface EnemyAnimHandle {
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
export const EnemyAnimHandlesDatablock = new Datablock<AnimHandles.Flags, EnemyAnimHandle>();

const enemyAnimations = EnemyAnimDatablock.obj();

EnemyAnimHandlesDatablock.set("enemyRunner", {
    abilityUse: [
        enemyAnimations.RU_Ability_Use_In_a,
        enemyAnimations.RU_Ability_Use_Loop_a,
        enemyAnimations.RU_Ability_Use_Out_a,
    ],
    wakeup: [
        enemyAnimations.RU_Hibernate_Wakeup_A_0,
        enemyAnimations.RU_Hibernate_Wakeup_B_0,
        enemyAnimations.RU_Hibernate_Wakeup_C_0,
        enemyAnimations.RU_Hibernate_Wakeup_B_0
    ],
    wakeupTurns: [
        enemyAnimations.RU_Hibernate_Wakeup_Turn_A
    ],
    movement: enemyAnimations.enemyRunnerMovement,
    hibernateIn: enemyAnimations.RU_Hibernate_In,
    hibernateLoop: enemyAnimations.RU_HibernateDetect,
    ladderClimb: enemyAnimations.CA_Walk_Fwd_A,
    heartbeats: [
        enemyAnimations.RU_Hibernate_Heartbeat_A_0,
        enemyAnimations.RU_Hibernate_Heartbeat_B_0,
        enemyAnimations.RU_Hibernate_Heartbeat_C,
        enemyAnimations.RU_Hibernate_Heartbeat_D,
        enemyAnimations.RU_Hibernate_Heartbeat_E_0,
    ],
    screams: [
        enemyAnimations.RU_Scream_A,
        enemyAnimations.RU_Scream_B,
        enemyAnimations.RU_Scream_C,
    ],
    jump: [
        mergeAnims(enemyAnimations.RU_Jump_In as HumanAnim, enemyAnimations.RU_Jump_Air_TimeBlend as HumanAnim),
        enemyAnimations.RU_Jump_Out
    ],
    melee: {
        "Forward": [enemyAnimations.RU_Melee_Sequence_A_Fast],
        "Backward": [enemyAnimations.RU_Melee_Sequence_A_Fast],
    },
    abilityFire: [
        enemyAnimations.Ability_Fire_0_Start,
        enemyAnimations.Ability_Fire_0_Start,
        enemyAnimations.Ability_Fire_2_Start
    ],
    hitLightBwd: [
        enemyAnimations.RU_Hit_Light_Bwd_A,
        enemyAnimations.RU_Hit_Light_Bwd_B,
        enemyAnimations.RU_Hit_Light_Bwd_C,
        enemyAnimations.RU_Hit_Light_Bwd_B
    ],
    hitLightFwd: [
        enemyAnimations.RU_Hit_Light_Fwd_A,
        enemyAnimations.RU_Hit_Light_Fwd_B,
        enemyAnimations.RU_Hit_Light_Fwd_C
    ],
    hitLightLt: [
        enemyAnimations.RU_Hit_Light_Lt_A,
        enemyAnimations.RU_Hit_Light_Lt_B,
        enemyAnimations.RU_Hit_Light_Lt_C
    ],
    hitLightRt: [
        enemyAnimations.RU_Hit_Light_Rt_A,
        enemyAnimations.RU_Hit_Light_Rt_B,
        enemyAnimations.RU_Hit_Light_Rt_C
    ],
    hitHeavyBwd: [
        enemyAnimations.RU_Hit_Heavy_Bwd_A,
        enemyAnimations.RU_Hit_Heavy_Bwd_B,
        enemyAnimations.RU_Hit_Heavy_Bwd_Turn_A,
        enemyAnimations.RU_Hit_Heavy_Bwd_C
    ],
    hitHeavyFwd: [
        enemyAnimations.RU_Hit_Heavy_Fwd_A,
        enemyAnimations.RU_Hit_Heavy_Fwd_B,
        enemyAnimations.RU_Hit_Heavy_Fwd_C
    ],
    hitHeavyLt: [
        enemyAnimations.RU_Hit_Heavy_Lt_A,
        enemyAnimations.RU_Hit_Heavy_Lt_B,
        enemyAnimations.RU_Hit_Heavy_Lt_C
    ],
    hitHeavyRt: [
        enemyAnimations.RU_Hit_Heavy_Rt_A,
        enemyAnimations.RU_Hit_Heavy_Rt_B,
        enemyAnimations.RU_Hit_Heavy_Rt_C
    ],
});

EnemyAnimHandlesDatablock.set("enemyLow", {
    abilityUse: [
        enemyAnimations.LO_Ability_Use_In_A,
        enemyAnimations.LO_Ability_Use_Loop_A,
        enemyAnimations.LO_Ability_Use_Out_A,
    ],
    wakeup: [
        enemyAnimations.LO_Hibernate_Wakeup_A,
        enemyAnimations.LO_Hibernate_Wakeup_B,
        enemyAnimations.LO_Hibernate_Wakeup_Fwd_C,
        enemyAnimations.LO_Hibernate_Wakeup_Fwd_D
    ],
    wakeupTurns: [
        enemyAnimations.LO_Hibernate_Wakeup_Turn_A
    ],
    heartbeats: [
        enemyAnimations.LO_Hibernate_Heartbeat_A,
        enemyAnimations.LO_Hibernate_Heartbeat_B,
        enemyAnimations.LO_Hibernate_Heartbeat_C,
        enemyAnimations.LO_Hibernate_Heartbeat_D,
        enemyAnimations.LO_Hibernate_Heartbeat_E,
    ],
    movement: enemyAnimations.enemyLowMovement,
    hibernateIn: enemyAnimations.LO_Hibernate_In_A,
    hibernateLoop: enemyAnimations.LO_HibernateDetect,
    screams: [
        enemyAnimations.LO_Scream_A,
        enemyAnimations.LO_Scream_B,
        enemyAnimations.LO_Scream_C,
    ],
    jump: [
        mergeAnims(enemyAnimations.LO_Jump_Start as HumanAnim, enemyAnimations.LO_Jump_Air as HumanAnim),
        enemyAnimations.LO_Jump_Land
    ],
    ladderClimb: enemyAnimations.CA_Walk_Fwd_A,
    melee: {
        "Forward": [enemyAnimations.Melee_Sequence_Fwd],
        "Backward": [enemyAnimations.Melee_Sequence_Fwd],
    },
    abilityFire: [
        enemyAnimations.LO_Ability_Fire_In_A, 
        enemyAnimations.LO_Ability_Fire_In_B,
        enemyAnimations.LO_Ability_Fire_In_C
    ],
    hitLightBwd: [
        enemyAnimations.LO_Hit_Light_Bwd_A,
        enemyAnimations.LO_Hit_Light_Bwd_b,
        enemyAnimations.LO_Hit_Light_Bwd_C,
        enemyAnimations.LO_Hit_Light_Bwd_Turn_A
    ],
    hitLightFwd: [
        enemyAnimations.LO_Hit_Light_Fwd_A,
        enemyAnimations.LO_Hit_Light_Fwd_B,
        enemyAnimations.LO_Hit_Light_Fwd_C
    ],
    hitLightLt: [
        enemyAnimations.LO_Hit_Light_Lt_A,
        enemyAnimations.LO_Hit_Light_Lt_B,
        enemyAnimations.LO_Hit_Light_Lt_C
    ],
    hitLightRt: [
        enemyAnimations.LO_Hit_Light_Rt_A,
        enemyAnimations.LO_Hit_Light_Rt_B,
        enemyAnimations.LO_Hit_Light_Rt_C
    ],
    hitHeavyBwd: [
        enemyAnimations.LO_Hit_Heavy_Bwd_A,
        enemyAnimations.LO_Hit_Heavy_Bwd_A,
        enemyAnimations.LO_Hit_Heavy_Bwd_A,
        enemyAnimations.CR_Hit_Heavy_Bwd_D
    ],
    hitHeavyFwd: [
        enemyAnimations.LO_Hit_Heavy_Fwd_A,
        enemyAnimations.LO_Hit_Heavy_Fwd_B,
        enemyAnimations.LO_Hit_Heavy_Fwd_C
    ],
    hitHeavyLt: [
        enemyAnimations.LO_Hit_Heavy_Lt_A,
        enemyAnimations.LO_Hit_Heavy_Lt_B,
        enemyAnimations.LO_Hit_Heavy_Lt_C
    ],
    hitHeavyRt: [
        enemyAnimations.LO_Hit_Heavy_Rt_A,
        enemyAnimations.LO_Hit_Heavy_Rt_B,
        enemyAnimations.LO_Hit_Heavy_Rt_C
    ],
});
EnemyAnimHandlesDatablock.set("enemyFiddler", {
    abilityUse: [
        enemyAnimations.FD_Ability_Use_In_A,
        enemyAnimations.FD_Ability_Use_Loop_A,
        enemyAnimations.FD_Ability_Use_Out_A,
    ],
    wakeup: [
        enemyAnimations.FD_Hibernate_Wakeup_A,
        enemyAnimations.FD_Hibernate_Wakeup_B,
        enemyAnimations.FD_Hibernate_Wakeup_C,
        enemyAnimations.FD_Hibernate_Wakeup_B
    ],
    wakeupTurns: [
        enemyAnimations.FD_Hibernate_Wakeup_Turn_A
    ],
    heartbeats: [
        enemyAnimations.FD_Hibernate_Heartbeat_A,
        enemyAnimations.FD_Hibernate_Heartbeat_B,
        enemyAnimations.FD_Hibernate_Heartbeat_C,
        enemyAnimations.FD_Hibernate_Heartbeat_D,
        enemyAnimations.FD_Hibernate_Heartbeat_E,
    ],
    hibernateIn: enemyAnimations.FD_Hibernate_In,
    hibernateLoop: enemyAnimations.FD_HibernateDetect,
    screams: [
        enemyAnimations.FD_Scream_A,
        enemyAnimations.FD_Scream_B,
        enemyAnimations.FD_Scream_C,
    ],
    jump: [
        mergeAnims(enemyAnimations.FD_Jump_Start as HumanAnim, enemyAnimations.FD_Jump_Air as HumanAnim),
        enemyAnimations.FD_Jump_Land
    ],
    movement: enemyAnimations.enemyFiddleMovement,
    ladderClimb: enemyAnimations.CA_Walk_Fwd_A,
    abilityFire: [
        enemyAnimations.FD_Ability_Fire_In_A, 
        enemyAnimations.FD_Ability_Fire_In_B,
        enemyAnimations.FD_Ability_Fire_In_B
    ],
    hitLightBwd: [
        enemyAnimations.FD_Hit_Light_Bwd_A,
        enemyAnimations.FD_Hit_Light_Bwd_B,
        enemyAnimations.FD_Hit_Light_Bwd_C,
        enemyAnimations.FD_Hit_Light_Bwd_C // Not actually defined in vanilla game
    ],
    hitLightFwd: [
        enemyAnimations.FD_Hit_Light_Fwd_A,
        enemyAnimations.FD_Hit_Light_Fwd_B,
        enemyAnimations.FD_Hit_Light_Fwd_C,
    ],
    hitLightLt: [
        enemyAnimations.FD_Hit_Light_Lt_A,
        enemyAnimations.FD_Hit_Light_Lt_B,
        enemyAnimations.FD_Hit_Light_Lt_C
    ],
    hitLightRt: [
        enemyAnimations.FD_Hit_Light_Rt_A,
        enemyAnimations.FD_Hit_Light_Rt_B,
        enemyAnimations.FD_Hit_Light_Rt_C
    ],
    hitHeavyBwd: [
        enemyAnimations.FD_Hit_Heavy_Bwd_A,
        enemyAnimations.FD_Hit_Heavy_Bwd_B,
        enemyAnimations.FD_Hit_Heavy_Bwd_C,
        enemyAnimations.FD_Hit_Heavy_Bwd_C // Not actually defined in vanilla game
    ],
    hitHeavyFwd: [
        enemyAnimations.FD_Hit_Heavy_Fwd_A,
        enemyAnimations.FD_Hit_Heavy_Fwd_B,
        enemyAnimations.FD_Hit_Heavy_Fwd_C
    ],
    hitHeavyLt: [
        enemyAnimations.FD_Hit_Heavy_Lt_A,
        enemyAnimations.FD_Hit_Heavy_Lt_B,
        enemyAnimations.FD_Hit_Heavy_Lt_C
    ],
    hitHeavyRt: [
        enemyAnimations.FD_Hit_Heavy_Rt_A,
        enemyAnimations.FD_Hit_Heavy_Rt_B,
        enemyAnimations.FD_Hit_Heavy_Rt_C
    ],
});
EnemyAnimHandlesDatablock.set("enemyCrawl", {
    abilityUse: [
        enemyAnimations.CA_Ability_Use_In_A,
        enemyAnimations.CA_Ability_Use_Loop_A,
        enemyAnimations.CA_Ability_Use_Out_A,
    ],
    wakeup: [
        enemyAnimations.CA_Hibernate_Wakeup_A,
        enemyAnimations.CA_Hibernate_Wakeup_A,
        enemyAnimations.CA_Hibernate_Wakeup_A,
        enemyAnimations.CA_Hibernate_Wakeup_A
    ],
    wakeupTurns: [
        enemyAnimations.CA_Hibernate_Wakeup_Turn_A
    ],
    heartbeats: [
        enemyAnimations.CA_Hibernate_Heartbeat_A,
        enemyAnimations.CA_Hibernate_Heartbeat_B,
        enemyAnimations.CA_Hibernate_Heartbeat_C,
        enemyAnimations.CA_Hibernate_Heartbeat_D,
        enemyAnimations.CA_Hibernate_Heartbeat_E,
    ],
    hibernateIn: enemyAnimations.CA_Hibernate_In,
    hibernateLoop: enemyAnimations.CA_HibernateDetect,
    screams: [
        enemyAnimations.CA_Scream_A,
        enemyAnimations.CA_Scream_B,
        enemyAnimations.CA_Scream_A,
    ],
    movement: enemyAnimations.enemyCrawlMovement,
    jump: [
        mergeAnims(enemyAnimations.CA_Jump_Start as HumanAnim, enemyAnimations.CA_Jump_Air as HumanAnim),
        enemyAnimations.CA_Jump_Land
    ],
    ladderClimb: enemyAnimations.CA_Walk_Fwd_A,
    abilityFire: [
        enemyAnimations.CA_Ability_Fire_In_A, 
        enemyAnimations.CA_Ability_Fire_In_B,
        enemyAnimations.CA_Ability_Fire_In_B
    ],
    hitLightBwd: [
        enemyAnimations.CA_Hit_Light_Bwd_A,
        enemyAnimations.CA_Hit_Light_Bwd_B,
        enemyAnimations.CA_Hit_Light_Bwd_A,
        enemyAnimations.CA_Hit_Light_Bwd_B
    ],
    hitLightFwd: [
        enemyAnimations.CA_Hit_Light_Fwd_A,
        enemyAnimations.CA_Hit_Light_Fwd_B,
        enemyAnimations.CA_Hit_Light_Fwd_A,
    ],
    hitLightLt: [
        enemyAnimations.CA_Hit_Light_Lt_A,
        enemyAnimations.CA_Hit_Light_Lt_B,
        enemyAnimations.CA_Hit_Light_Lt_A
    ],
    hitLightRt: [
        enemyAnimations.CA_Hit_Light_Rt_A,
        enemyAnimations.CA_Hit_Light_Rt_B,
        enemyAnimations.CA_Hit_Light_Rt_A
    ],
    hitHeavyBwd: [
        enemyAnimations.CA_Hit_Heavy_Bwd_A,
        enemyAnimations.CA_Hit_Heavy_Bwd_A,
        enemyAnimations.CA_Hit_Heavy_Bwd_A,
        enemyAnimations.CA_Hit_Heavy_Bwd_A
    ],
    hitHeavyFwd: [
        enemyAnimations.CA_Hit_Heavy_Fwd_B,
        enemyAnimations.CA_Hit_Heavy_Fwd_C,
        enemyAnimations.CA_Hit_Heavy_Fwd_C
    ],
    hitHeavyLt: [
        enemyAnimations.CA_Hit_Heavy_Lt_A,
        enemyAnimations.CA_Hit_Heavy_Lt_B,
        enemyAnimations.CA_Hit_Heavy_Lt_A
    ],
    hitHeavyRt: [
        enemyAnimations.CA_Hit_Heavy_Rt_A,
        enemyAnimations.CA_Hit_Heavy_Rt_B,
        enemyAnimations.CA_Hit_Heavy_Rt_A
    ],
});

EnemyAnimHandlesDatablock.set("enemyCrawlFlip", {
    abilityUse: [
        enemyAnimations.CF_Ability_Use_In_A,
        enemyAnimations.CF_Ability_Use_Loop_A,
        enemyAnimations.CF_Ability_Use_Out_A,
    ],
    wakeup: [
        enemyAnimations.CF_Hibernate_Wakeup_A,
        enemyAnimations.CF_Hibernate_Wakeup_A,
        enemyAnimations.CF_Hibernate_Wakeup_A,
        enemyAnimations.CF_Hibernate_Wakeup_A
    ],
    wakeupTurns: [
        enemyAnimations.CF_Hibernate_Wakeup_Turn_A
    ],
    hibernateIn: enemyAnimations.CF_Hibernate_In,
    hibernateLoop: enemyAnimations.CF_HibernateDetect,
    heartbeats: [
        enemyAnimations.CF_Hibernate_Heartbeat_A,
        enemyAnimations.CF_Hibernate_Heartbeat_B,
        enemyAnimations.CF_Hibernate_Heartbeat_C,
        enemyAnimations.CF_Hibernate_Heartbeat_D,
        enemyAnimations.CF_Hibernate_Heartbeat_E,
    ],
    screams: [
        enemyAnimations.CF_Scream,
        enemyAnimations.CF_Scream,
        enemyAnimations.CF_Scream,
    ],
    movement: enemyAnimations.enemyCrawlFlipMovement,
    jump: [
        mergeAnims(enemyAnimations.CF_Jump_Start as HumanAnim, enemyAnimations.CF_Jump_Air as HumanAnim),
        enemyAnimations.CF_Jump_Land
    ],
    ladderClimb: enemyAnimations.CA_Walk_Fwd_A,
    abilityFire: [
        enemyAnimations.CF_Ability_Fire_In_A, 
        enemyAnimations.CF_Ability_Fire_In_B,
        enemyAnimations.CF_Ability_Fire_In_B
    ],
    hitLightBwd: [
        enemyAnimations.CF_Hit_Light_A,
        enemyAnimations.CF_Hit_Light_B,
        enemyAnimations.CF_Hit_Light_A,
        enemyAnimations.CF_Hit_Light_B
    ],
    hitLightFwd: [
        enemyAnimations.CF_Hit_Light_A,
        enemyAnimations.CF_Hit_Light_B,
        enemyAnimations.CF_Hit_Light_A,
    ],
    hitLightLt: [
        enemyAnimations.CF_Hit_Light_A,
        enemyAnimations.CF_Hit_Light_B,
        enemyAnimations.CF_Hit_Light_A,
    ],
    hitLightRt: [
        enemyAnimations.CF_Hit_Light_A,
        enemyAnimations.CF_Hit_Light_B,
        enemyAnimations.CF_Hit_Light_A,
    ],
    hitHeavyBwd: [
        enemyAnimations.CF_Hit_Light_A,
        enemyAnimations.CF_Hit_Light_B,
        enemyAnimations.CF_Hit_Light_A,
        enemyAnimations.CF_Hit_Light_B,
    ],
    hitHeavyFwd: [
        enemyAnimations.CF_Hit_Light_A,
        enemyAnimations.CF_Hit_Light_B,
        enemyAnimations.CF_Hit_Light_A,
    ],
    hitHeavyLt: [
        enemyAnimations.CF_Hit_Light_A,
        enemyAnimations.CF_Hit_Light_B,
        enemyAnimations.CF_Hit_Light_A,
    ],
    hitHeavyRt: [
        enemyAnimations.CF_Hit_Light_A,
        enemyAnimations.CF_Hit_Light_B,
        enemyAnimations.CF_Hit_Light_A,
    ],
});
EnemyAnimHandlesDatablock.set("enemyCripple", {
    abilityUse: [
        enemyAnimations.CR_Ability_Use_In_A,
        enemyAnimations.CR_Ability_Use_Loop_A,
        enemyAnimations.CR_Ability_Use_Out_A,
    ],
    wakeup: [
        enemyAnimations.CR_Hibernate_Wakeup_A,
        enemyAnimations.CR_Hibernate_Wakeup_B,
        enemyAnimations.CR_Hibernate_Wakeup_C,
        enemyAnimations.CR_Hibernate_Wakeup_D
    ],
    wakeupTurns: [
        enemyAnimations.CR_Hibernate_Wakeup_Turn_A
    ],
    heartbeats: [
        enemyAnimations.CR_Hibernate_Heartbeat_A,
        enemyAnimations.CR_Hibernate_Heartbeat_B,
        enemyAnimations.CR_Hibernate_Heartbeat_C,
        enemyAnimations.CR_Hibernate_Heartbeat_D,
        enemyAnimations.CR_Hibernate_Heartbeat_E,
    ],
    hibernateIn: enemyAnimations.CR_Hibernate_In,
    hibernateLoop: enemyAnimations.CR_HibernateDetect,
    screams: [
        enemyAnimations.CR_Scream_A,
        enemyAnimations.CR_Scream_B,
        enemyAnimations.CR_Scream_C,
    ],
    movement: enemyAnimations.enemyCrippleMovement,
    jump: [
        mergeAnims(enemyAnimations.CR_Jump_Start as HumanAnim, enemyAnimations.CR_Jump_Air as HumanAnim),
        enemyAnimations.CR_Jump_Land
    ],
    ladderClimb: enemyAnimations.CA_Walk_Fwd_A,
    abilityFire: [
        enemyAnimations.CR_Ability_Fire_In_A, 
        enemyAnimations.CR_Ability_Fire_In_B,
        enemyAnimations.CR_Ability_Fire_In_C
    ],
    hitLightBwd: [
        enemyAnimations.CR_Hit_Light_Bwd_A,
        enemyAnimations.CR_Hit_Light_Bwd_B,
        enemyAnimations.CR_Hit_Light_Bwd_C,
        enemyAnimations.CR_Hit_Light_Bwd_D
    ],
    hitLightFwd: [
        enemyAnimations.CR_Hit_Light_Fwd_A,
        enemyAnimations.CR_Hit_Light_Fwd_B,
        enemyAnimations.CR_Hit_Light_Fwd_C
    ],
    hitLightLt: [
        enemyAnimations.CR_Hit_Light_Lt_A,
        enemyAnimations.CR_Hit_Light_Lt_B,
        enemyAnimations.CR_Hit_Light_Lt_C
    ],
    hitLightRt: [
        enemyAnimations.CR_Hit_Light_Rt_A,
        enemyAnimations.CR_Hit_Light_Rt_B,
        enemyAnimations.CR_Hit_Light_Rt_C
    ],
    hitHeavyBwd: [
        enemyAnimations.CR_Hit_Heavy_Bwd_A_Turn,
        enemyAnimations.CR_Hit_Heavy_Bwd_B,
        enemyAnimations.CR_Hit_Heavy_Bwd_C_Turn,
        enemyAnimations.CR_Hit_Heavy_Bwd_D_0
    ],
    hitHeavyFwd: [
        enemyAnimations.CR_Hit_Heavy_Fwd_A,
        enemyAnimations.CR_Hit_Heavy_Fwd_B,
        enemyAnimations.CR_Hit_Heavy_Fwd_C
    ],
    hitHeavyLt: [
        enemyAnimations.CR_Hit_Heavy_Lt_A,
        enemyAnimations.CR_Hit_Heavy_Lt_B,
        enemyAnimations.CR_Hit_Heavy_Lt_C
    ],
    hitHeavyRt: [
        enemyAnimations.CR_Hit_Heavy_Rt_A,
        enemyAnimations.CR_Hit_Heavy_Rt_B,
        enemyAnimations.CR_Hit_Heavy_Rt_C_0
    ],
});
EnemyAnimHandlesDatablock.set("enemyBig", {
    abilityUse: [
        enemyAnimations.FD_Ability_Use_In_A,
        enemyAnimations.FD_Ability_Use_Loop_A,
        enemyAnimations.FD_Ability_Use_Out_A,
    ],
    wakeup: [
        enemyAnimations.Enemy_Big_Hibernate_Wakeup_A,
        enemyAnimations.Enemy_Big_Hibernate_Wakeup_A,
        enemyAnimations.Enemy_Big_Hibernate_Wakeup_A,
        enemyAnimations.Enemy_Big_Hibernate_Wakeup_A
    ],
    wakeupTurns: [
        enemyAnimations.Enemy_Big_Hibernate_Wakeup_180_B,
    ],
    heartbeats: [
        enemyAnimations.Enemy_Big_Hibernate_Heartbeat_1_A,
        enemyAnimations.Enemy_Big_Hibernate_Heartbeat_2_A,
        enemyAnimations.Enemy_Big_Hibernate_Heartbeat_3_A,
        enemyAnimations.Enemy_Big_Hibernate_Heartbeat_4_A,
        enemyAnimations.Enemy_Big_Hibernate_Heartbeat_5_A,
    ],
    hibernateIn: enemyAnimations.Enemy_Big_Hibernate_In_A,
    hibernateLoop: enemyAnimations.Enemy_Big_Hibernate_Loop_A,
    screams: [
        enemyAnimations.Enemy_Big_Detect_Front_A,
        enemyAnimations.Enemy_Big_Detect_Front_B,
        enemyAnimations.Enemy_Big_Detect_Front_A,
    ],
    movement: enemyAnimations.enemyBigMovement,
    jump: [
        mergeAnims(enemyAnimations.Enemy_Big_Jump_Start_A as HumanAnim, enemyAnimations.Enemy_Big_Jump_Loop_A as HumanAnim),
        enemyAnimations.Enemy_Big_Jump_Land_A
    ],
    ladderClimb: enemyAnimations.CA_Walk_Fwd_A,
    abilityFire: [
        enemyAnimations.Enemy_Big_Fire_In_A,
        enemyAnimations.Enemy_Big_Fire_In_B,
        enemyAnimations.Enemy_Big_Fire_In_B
    ],
    hitLightBwd: [
        enemyAnimations.Enemy_Big_Hit_Back_A,
        enemyAnimations.Enemy_Big_Hit_Back_B,
        enemyAnimations.Enemy_Big_Hit_Back_A,
        enemyAnimations.Enemy_Big_Hit_Back_B,
    ],
    hitLightFwd: [
        enemyAnimations.Enemy_Big_Hit_Front_A,
        enemyAnimations.Enemy_Big_Hit_Front_B,
        enemyAnimations.Enemy_Big_Hit_Front_A,
    ],
    hitLightLt: [
        enemyAnimations.Enemy_Big_Hit_Left_A,
        enemyAnimations.Enemy_Big_Hit_Left_B,
        enemyAnimations.Enemy_Big_Hit_Left_A,
    ],
    hitLightRt: [
        enemyAnimations.Enemy_Big_Hit_Right_A,
        enemyAnimations.Enemy_Big_Hit_Right_B,
        enemyAnimations.Enemy_Big_Hit_Right_A,
    ],
    hitHeavyBwd: [
        enemyAnimations.Enemy_Big_Hit_Back_A,
        enemyAnimations.Enemy_Big_Hit_Back_B,
        enemyAnimations.Enemy_Big_Hit_Back_A,
        enemyAnimations.Enemy_Big_Hit_Back_B,
    ],
    hitHeavyFwd: [
        enemyAnimations.Enemy_Big_Hit_Front_A,
        enemyAnimations.Enemy_Big_Hit_Front_B,
        enemyAnimations.Enemy_Big_Hit_Front_A,
    ],
    hitHeavyLt: [
        enemyAnimations.Enemy_Big_Hit_Left_A,
        enemyAnimations.Enemy_Big_Hit_Left_B,
        enemyAnimations.Enemy_Big_Hit_Left_A,
    ],
    hitHeavyRt: [
        enemyAnimations.Enemy_Big_Hit_Right_A,
        enemyAnimations.Enemy_Big_Hit_Right_B,
        enemyAnimations.Enemy_Big_Hit_Right_A,
    ],
});

EnemyAnimHandlesDatablock.set("enemyExploder", {
    abilityUse: [
        enemyAnimations.FD_Ability_Use_In_A,
        enemyAnimations.FD_Ability_Use_Loop_A,
        enemyAnimations.FD_Ability_Use_Out_A,
    ],
    wakeup: [
        enemyAnimations.Enemy_Big_Hibernate_Wakeup_A,
        enemyAnimations.Enemy_Big_Hibernate_Wakeup_A,
        enemyAnimations.Enemy_Big_Hibernate_Wakeup_A,
        enemyAnimations.Enemy_Big_Hibernate_Wakeup_A
    ],
    wakeupTurns: [
        enemyAnimations.Enemy_Big_Hibernate_Wakeup_180_B,
    ],
    heartbeats: [
        enemyAnimations.Enemy_Big_Hibernate_Heartbeat_1_A,
        enemyAnimations.Enemy_Big_Hibernate_Heartbeat_2_A,
        enemyAnimations.Enemy_Big_Hibernate_Heartbeat_3_A,
        enemyAnimations.Enemy_Big_Hibernate_Heartbeat_4_A,
        enemyAnimations.Enemy_Big_Hibernate_Heartbeat_5_A,
    ],
    hibernateIn: enemyAnimations.Enemy_Big_Hibernate_In_A,
    hibernateLoop: enemyAnimations.Enemy_Big_Hibernate_Loop_A,
    screams: [
        enemyAnimations.Enemy_Big_Detect_Front_A,
        enemyAnimations.Enemy_Big_Detect_Front_B,
        enemyAnimations.Enemy_Big_Detect_Front_A,
    ],
    movement: enemyAnimations.enemyBigMovement,
    jump: [
        mergeAnims(enemyAnimations.Enemy_Big_Jump_Start_A as HumanAnim, enemyAnimations.Enemy_Big_Jump_Loop_A as HumanAnim),
        enemyAnimations.Enemy_Big_Jump_Land_A
    ],
    ladderClimb: enemyAnimations.CA_Walk_Fwd_A,
    abilityFire: [
        enemyAnimations.Enemy_Big_Fire_In_A,
        enemyAnimations.Enemy_Big_Fire_In_B,
        enemyAnimations.Enemy_Big_Fire_In_B
    ],
    hitLightBwd: [
        enemyAnimations.Enemy_Big_Hit_Back_A,
        enemyAnimations.Enemy_Big_Hit_Back_B,
        enemyAnimations.Enemy_Big_Hit_Back_A,
        enemyAnimations.Enemy_Big_Hit_Back_B,
    ],
    hitLightFwd: [
        enemyAnimations.Enemy_Big_Hit_Front_A,
        enemyAnimations.Enemy_Big_Hit_Front_B,
        enemyAnimations.Enemy_Big_Hit_Front_A,
    ],
    hitLightLt: [
        enemyAnimations.Enemy_Big_Hit_Left_A,
        enemyAnimations.Enemy_Big_Hit_Left_B,
        enemyAnimations.Enemy_Big_Hit_Left_A,
    ],
    hitLightRt: [
        enemyAnimations.Enemy_Big_Hit_Right_A,
        enemyAnimations.Enemy_Big_Hit_Right_B,
        enemyAnimations.Enemy_Big_Hit_Right_A,
    ],
    hitHeavyBwd: [
        enemyAnimations.Enemy_Big_Hit_Back_A,
        enemyAnimations.Enemy_Big_Hit_Back_B,
        enemyAnimations.Enemy_Big_Hit_Back_A,
        enemyAnimations.Enemy_Big_Hit_Back_B,
    ],
    hitHeavyFwd: [
        enemyAnimations.Enemy_Big_Hit_Front_A,
        enemyAnimations.Enemy_Big_Hit_Front_B,
        enemyAnimations.Enemy_Big_Hit_Front_A,
    ],
    hitHeavyLt: [
        enemyAnimations.Enemy_Big_Hit_Left_A,
        enemyAnimations.Enemy_Big_Hit_Left_B,
        enemyAnimations.Enemy_Big_Hit_Left_A,
    ],
    hitHeavyRt: [
        enemyAnimations.Enemy_Big_Hit_Right_A,
        enemyAnimations.Enemy_Big_Hit_Right_B,
        enemyAnimations.Enemy_Big_Hit_Right_A,
    ],
});
EnemyAnimHandlesDatablock.set("enemyGiant", {
    abilityUse: [
        enemyAnimations.RU_Ability_Use_In_a,
        enemyAnimations.RU_Ability_Use_Loop_a,
        enemyAnimations.RU_Ability_Use_Out_a,
    ],
    wakeup: [
        enemyAnimations.RU_Hibernate_Wakeup_A,
        enemyAnimations.RU_Hibernate_Wakeup_B,
        enemyAnimations.RU_Hibernate_Wakeup_C,
        enemyAnimations.RU_Hibernate_Wakeup_B
    ],
    wakeupTurns: [
        enemyAnimations.Monster_Turn_Left_180
    ],
    hibernateIn: enemyAnimations.RU_Hibernate_In,
    hibernateLoop: enemyAnimations.RU_HibernateDetect,
    heartbeats: [
        enemyAnimations.RU_Hibernate_Heartbeat_A,
        enemyAnimations.RU_Hibernate_Heartbeat_B,
        enemyAnimations.RU_Hibernate_Heartbeat_C_0,
        enemyAnimations.RU_Hibernate_Heartbeat_D_0,
        enemyAnimations.RU_Hibernate_Heartbeat_E,
    ],
    blend: 10,
    screams: [
        enemyAnimations.Monster_Taunt_01,
        enemyAnimations.Monster_Taunt_01,
        enemyAnimations.Monster_Taunt_01,
    ],
    ladderClimb: enemyAnimations.CA_Walk_Fwd_A,
    melee: {
        "Forward": [enemyAnimations.Monster_Attack_06_shortened],
        "Backward": [enemyAnimations.Monster_Attack_180_L]
    },
    movement: enemyAnimations.enemyGiantMovement,
    jump: [
        enemyAnimations.Giant_Jump_Start,
        enemyAnimations.Monster_Fall_Landing_01
    ],
    abilityFire: [
        enemyAnimations.Monster_TentacleStart,
        enemyAnimations.Monster_TentacleStart, 
        enemyAnimations.Monster_TentacleStart, 
    ],
    hitLightBwd: [
        enemyAnimations.Monster_Hit_Back_01,
        enemyAnimations.Monster_Hit_Back_02,
        enemyAnimations.Monster_Hit_Back_04,
        enemyAnimations.Monster_Hit_Back_02,
    ],
    hitLightFwd: [
        enemyAnimations.Monster_Hit_Front_01,
        enemyAnimations.Monster_Hit_Front_02,
        enemyAnimations.Monster_Hit_Front_03,
    ],
    hitLightLt: [
        enemyAnimations.Monster_Hit_Leg_01,
        enemyAnimations.Monster_Hit_Leg_02,
        enemyAnimations.Monster_Hit_Leg_03,
    ],
    hitLightRt: [
        enemyAnimations.Monster_Hit_Right_01,
        enemyAnimations.Monster_Hit_Leg_02,
        enemyAnimations.Monster_Hit_Right_01,
    ],
    hitHeavyBwd: [
        enemyAnimations.Monster_Hit_Back_01,
        enemyAnimations.Monster_Hit_Back_02,
        enemyAnimations.Monster_Hit_Back_04,
        enemyAnimations.Monster_Hit_Back_01,
    ],
    hitHeavyFwd: [
        enemyAnimations.Monster_Hit_Front_04,
        enemyAnimations.Monster_Hit_Front_01,
        enemyAnimations.Monster_Hit_Leg_02,
    ],
    hitHeavyLt: [
        enemyAnimations.Monster_Hit_Leg_01,
        enemyAnimations.Monster_Hit_Leg_02,
        enemyAnimations.Monster_Hit_Leg_03,
    ],
    hitHeavyRt: [
        enemyAnimations.Monster_Hit_Right_01,
        enemyAnimations.Monster_Hit_Leg_02,
        enemyAnimations.Monster_Hit_Right_01,
    ],
});

EnemyAnimHandlesDatablock.set("enemyPouncer", {
    wakeup: [
        enemyAnimations.CA_Hibernate_Wakeup_A,
        enemyAnimations.CA_Hibernate_Wakeup_A,
        enemyAnimations.CA_Hibernate_Wakeup_A,
        enemyAnimations.CA_Hibernate_Wakeup_A
    ],
    wakeupTurns: [
        enemyAnimations.CA_Hibernate_Wakeup_Turn_A
    ],
    heartbeats: [
        enemyAnimations.CA_Hibernate_Heartbeat_A,
        enemyAnimations.CA_Hibernate_Heartbeat_B,
        enemyAnimations.CA_Hibernate_Heartbeat_C,
        enemyAnimations.CA_Hibernate_Heartbeat_D,
        enemyAnimations.CA_Hibernate_Heartbeat_E,
    ],
    hibernateIn: enemyAnimations.CA_Hibernate_In,
    hibernateLoop: enemyAnimations.CA_HibernateDetect,
    screams: [
        enemyAnimations.CA_Scream_A,
        enemyAnimations.CA_Scream_B,
        enemyAnimations.CA_Scream_A,
    ],
    jump: [
        mergeAnims(enemyAnimations.LO_Jump_Start as HumanAnim, enemyAnimations.LO_Jump_Air as HumanAnim),
        enemyAnimations.LO_Jump_Land
    ],
    ladderClimb: enemyAnimations.CA_Walk_Fwd_A,
    movement: enemyAnimations.enemyPouncerMovement,
    abilityFire: [],
    hitLightBwd: [
        enemyAnimations.CA_Hit_Light_Bwd_A,
        enemyAnimations.CA_Hit_Light_Bwd_B,
        enemyAnimations.CA_Hit_Light_Bwd_A,
        enemyAnimations.CA_Hit_Light_Bwd_B
    ],
    hitLightFwd: [
        enemyAnimations.CA_Hit_Light_Fwd_A,
        enemyAnimations.CA_Hit_Light_Fwd_B,
        enemyAnimations.CA_Hit_Light_Fwd_A,
    ],
    hitLightLt: [
        enemyAnimations.CA_Hit_Light_Lt_A,
        enemyAnimations.CA_Hit_Light_Lt_B,
        enemyAnimations.CA_Hit_Light_Lt_A
    ],
    hitLightRt: [
        enemyAnimations.CA_Hit_Light_Rt_A,
        enemyAnimations.CA_Hit_Light_Rt_B,
        enemyAnimations.CA_Hit_Light_Rt_A
    ],
    hitHeavyBwd: [
        enemyAnimations.CA_Hit_Heavy_Bwd_A,
        enemyAnimations.CA_Hit_Heavy_Bwd_A,
        enemyAnimations.CA_Hit_Heavy_Bwd_A,
        enemyAnimations.CA_Hit_Heavy_Bwd_A
    ],
    hitHeavyFwd: [
        enemyAnimations.CA_Hit_Heavy_Fwd_B,
        enemyAnimations.CA_Hit_Heavy_Fwd_C,
        enemyAnimations.CA_Hit_Heavy_Fwd_C
    ],
    hitHeavyLt: [
        enemyAnimations.CA_Hit_Heavy_Lt_A,
        enemyAnimations.CA_Hit_Heavy_Lt_B,
        enemyAnimations.CA_Hit_Heavy_Lt_A
    ],
    hitHeavyRt: [
        enemyAnimations.CA_Hit_Heavy_Rt_A,
        enemyAnimations.CA_Hit_Heavy_Rt_B,
        enemyAnimations.CA_Hit_Heavy_Rt_A
    ],
});

EnemyAnimHandlesDatablock.set("enemyBirtherCrawlFlip", {
    abilityUse: [
        enemyAnimations.CF_Ability_Use_In_A,
        enemyAnimations.CF_Ability_Use_Loop_A,
        enemyAnimations.CF_Ability_Use_Out_A,
    ],
    wakeup: [
        enemyAnimations.CF_Hibernate_Wakeup_A,
        enemyAnimations.CF_Hibernate_Wakeup_A,
        enemyAnimations.CF_Hibernate_Wakeup_A,
        enemyAnimations.CF_Hibernate_Wakeup_A
    ],
    wakeupTurns: [
        enemyAnimations.CF_Hibernate_Wakeup_Turn_A
    ],
    heartbeats: [
        enemyAnimations.CF_Birther_Heartbeat,
        enemyAnimations.CF_Birther_Heartbeat,
        enemyAnimations.CF_Birther_Heartbeat,
        enemyAnimations.CF_Birther_Heartbeat,
        enemyAnimations.CF_Birther_Heartbeat,
    ],
    hibernateIn: enemyAnimations.CF_Birther_Hibernate_In,
    hibernateLoop: new ScaledAnim(HumanJoints, enemyAnimations.CF_Birther_Hibernate_Loop as HumanAnim, 0.2),
    screams: [
        enemyAnimations.CF_Scream,
        enemyAnimations.CF_Scream,
        enemyAnimations.CF_Scream,
    ],
    movement: enemyAnimations.enemyCrawlFlipMovement,
    jump: [
        mergeAnims(enemyAnimations.CF_Jump_Start as HumanAnim, enemyAnimations.CF_Jump_Air as HumanAnim),
        enemyAnimations.CF_Jump_Land
    ],
    ladderClimb: enemyAnimations.CA_Walk_Fwd_A,
    abilityFire: [
        enemyAnimations.CF_Ability_Fire_In_A, 
        enemyAnimations.CF_Ability_Fire_In_B,
        enemyAnimations.CF_Ability_Fire_In_B
    ],
    hitLightBwd: [
        enemyAnimations.CF_Hit_Light_A,
        enemyAnimations.CF_Hit_Light_B,
        enemyAnimations.CF_Hit_Light_A,
        enemyAnimations.CF_Hit_Light_B
    ],
    hitLightFwd: [
        enemyAnimations.CF_Hit_Light_A,
        enemyAnimations.CF_Hit_Light_B,
        enemyAnimations.CF_Hit_Light_A,
    ],
    hitLightLt: [
        enemyAnimations.CF_Hit_Light_A,
        enemyAnimations.CF_Hit_Light_B,
        enemyAnimations.CF_Hit_Light_A,
    ],
    hitLightRt: [
        enemyAnimations.CF_Hit_Light_A,
        enemyAnimations.CF_Hit_Light_B,
        enemyAnimations.CF_Hit_Light_A,
    ],
    hitHeavyBwd: [
        enemyAnimations.CF_Hit_Light_A,
        enemyAnimations.CF_Hit_Light_B,
        enemyAnimations.CF_Hit_Light_A,
        enemyAnimations.CF_Hit_Light_B,
    ],
    hitHeavyFwd: [
        enemyAnimations.CF_Hit_Light_A,
        enemyAnimations.CF_Hit_Light_B,
        enemyAnimations.CF_Hit_Light_A,
    ],
    hitHeavyLt: [
        enemyAnimations.CF_Hit_Light_A,
        enemyAnimations.CF_Hit_Light_B,
        enemyAnimations.CF_Hit_Light_A,
    ],
    hitHeavyRt: [
        enemyAnimations.CF_Hit_Light_A,
        enemyAnimations.CF_Hit_Light_B,
        enemyAnimations.CF_Hit_Light_A,
    ],
});