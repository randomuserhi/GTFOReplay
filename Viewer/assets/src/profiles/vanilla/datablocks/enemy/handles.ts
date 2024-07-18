import { mergeAnims, ScaledAnim } from "../../library/animations/lib.js";
import { AnimHandles, MeleeType } from "../../parser/enemy/animation.js";
import { HumanAnim, HumanAnimation, HumanJoints } from "../../renderer/animations/human.js";
import { Datablock } from "../lib.js";
import { EnemyAnimDatablock } from "./animation.js";

if (module.metadata.isParser) console.warn("Datablocks should not be loaded by the parser. This degrades performance greatly.");

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

EnemyAnimHandlesDatablock.set("enemyRunner", {
    abilityUse: [
        EnemyAnimDatablock.RU_Ability_Use_In_a,
        EnemyAnimDatablock.RU_Ability_Use_Loop_a,
        EnemyAnimDatablock.RU_Ability_Use_Out_a,
    ],
    wakeup: [
        EnemyAnimDatablock.RU_Hibernate_Wakeup_A_0,
        EnemyAnimDatablock.RU_Hibernate_Wakeup_B_0,
        EnemyAnimDatablock.RU_Hibernate_Wakeup_C_0,
        EnemyAnimDatablock.RU_Hibernate_Wakeup_B_0
    ],
    wakeupTurns: [
        EnemyAnimDatablock.RU_Hibernate_Wakeup_Turn_A
    ],
    movement: EnemyAnimDatablock.enemyRunnerMovement,
    hibernateIn: EnemyAnimDatablock.RU_Hibernate_In,
    hibernateLoop: EnemyAnimDatablock.RU_HibernateDetect,
    ladderClimb: EnemyAnimDatablock.CA_Walk_Fwd_A,
    heartbeats: [
        EnemyAnimDatablock.RU_Hibernate_Heartbeat_A_0,
        EnemyAnimDatablock.RU_Hibernate_Heartbeat_B_0,
        EnemyAnimDatablock.RU_Hibernate_Heartbeat_C,
        EnemyAnimDatablock.RU_Hibernate_Heartbeat_D,
        EnemyAnimDatablock.RU_Hibernate_Heartbeat_E_0,
    ],
    screams: [
        EnemyAnimDatablock.RU_Scream_A,
        EnemyAnimDatablock.RU_Scream_B,
        EnemyAnimDatablock.RU_Scream_C,
    ],
    jump: [
        mergeAnims(EnemyAnimDatablock.RU_Jump_In as HumanAnim, EnemyAnimDatablock.RU_Jump_Air_TimeBlend as HumanAnim),
        EnemyAnimDatablock.RU_Jump_Out
    ],
    melee: {
        "Forward": [EnemyAnimDatablock.RU_Melee_Sequence_A_Fast],
        "Backward": [EnemyAnimDatablock.RU_Melee_Sequence_A_Fast],
    },
    abilityFire: [
        EnemyAnimDatablock.Ability_Fire_0_Start,
        EnemyAnimDatablock.Ability_Fire_0_Start,
        EnemyAnimDatablock.Ability_Fire_2_Start
    ],
    hitLightBwd: [
        EnemyAnimDatablock.RU_Hit_Light_Bwd_A,
        EnemyAnimDatablock.RU_Hit_Light_Bwd_B,
        EnemyAnimDatablock.RU_Hit_Light_Bwd_C,
        EnemyAnimDatablock.RU_Hit_Light_Bwd_B
    ],
    hitLightFwd: [
        EnemyAnimDatablock.RU_Hit_Light_Fwd_A,
        EnemyAnimDatablock.RU_Hit_Light_Fwd_B,
        EnemyAnimDatablock.RU_Hit_Light_Fwd_C
    ],
    hitLightLt: [
        EnemyAnimDatablock.RU_Hit_Light_Lt_A,
        EnemyAnimDatablock.RU_Hit_Light_Lt_B,
        EnemyAnimDatablock.RU_Hit_Light_Lt_C
    ],
    hitLightRt: [
        EnemyAnimDatablock.RU_Hit_Light_Rt_A,
        EnemyAnimDatablock.RU_Hit_Light_Rt_B,
        EnemyAnimDatablock.RU_Hit_Light_Rt_C
    ],
    hitHeavyBwd: [
        EnemyAnimDatablock.RU_Hit_Heavy_Bwd_A,
        EnemyAnimDatablock.RU_Hit_Heavy_Bwd_B,
        EnemyAnimDatablock.RU_Hit_Heavy_Bwd_Turn_A,
        EnemyAnimDatablock.RU_Hit_Heavy_Bwd_C
    ],
    hitHeavyFwd: [
        EnemyAnimDatablock.RU_Hit_Heavy_Fwd_A,
        EnemyAnimDatablock.RU_Hit_Heavy_Fwd_B,
        EnemyAnimDatablock.RU_Hit_Heavy_Fwd_C
    ],
    hitHeavyLt: [
        EnemyAnimDatablock.RU_Hit_Heavy_Lt_A,
        EnemyAnimDatablock.RU_Hit_Heavy_Lt_B,
        EnemyAnimDatablock.RU_Hit_Heavy_Lt_C
    ],
    hitHeavyRt: [
        EnemyAnimDatablock.RU_Hit_Heavy_Rt_A,
        EnemyAnimDatablock.RU_Hit_Heavy_Rt_B,
        EnemyAnimDatablock.RU_Hit_Heavy_Rt_C
    ],
});

EnemyAnimHandlesDatablock.set("enemyLow", {
    abilityUse: [
        EnemyAnimDatablock.LO_Ability_Use_In_A,
        EnemyAnimDatablock.LO_Ability_Use_Loop_A,
        EnemyAnimDatablock.LO_Ability_Use_Out_A,
    ],
    wakeup: [
        EnemyAnimDatablock.LO_Hibernate_Wakeup_A,
        EnemyAnimDatablock.LO_Hibernate_Wakeup_B,
        EnemyAnimDatablock.LO_Hibernate_Wakeup_Fwd_C,
        EnemyAnimDatablock.LO_Hibernate_Wakeup_Fwd_D
    ],
    wakeupTurns: [
        EnemyAnimDatablock.LO_Hibernate_Wakeup_Turn_A
    ],
    heartbeats: [
        EnemyAnimDatablock.LO_Hibernate_Heartbeat_A,
        EnemyAnimDatablock.LO_Hibernate_Heartbeat_B,
        EnemyAnimDatablock.LO_Hibernate_Heartbeat_C,
        EnemyAnimDatablock.LO_Hibernate_Heartbeat_D,
        EnemyAnimDatablock.LO_Hibernate_Heartbeat_E,
    ],
    movement: EnemyAnimDatablock.enemyLowMovement,
    hibernateIn: EnemyAnimDatablock.LO_Hibernate_In_A,
    hibernateLoop: EnemyAnimDatablock.LO_HibernateDetect,
    screams: [
        EnemyAnimDatablock.LO_Scream_A,
        EnemyAnimDatablock.LO_Scream_B,
        EnemyAnimDatablock.LO_Scream_C,
    ],
    jump: [
        mergeAnims(EnemyAnimDatablock.LO_Jump_Start as HumanAnim, EnemyAnimDatablock.LO_Jump_Air as HumanAnim),
        EnemyAnimDatablock.LO_Jump_Land
    ],
    ladderClimb: EnemyAnimDatablock.CA_Walk_Fwd_A,
    melee: {
        "Forward": [EnemyAnimDatablock.Melee_Sequence_Fwd],
        "Backward": [EnemyAnimDatablock.Melee_Sequence_Fwd],
    },
    abilityFire: [
        EnemyAnimDatablock.LO_Ability_Fire_In_A, 
        EnemyAnimDatablock.LO_Ability_Fire_In_B,
        EnemyAnimDatablock.LO_Ability_Fire_In_C
    ],
    hitLightBwd: [
        EnemyAnimDatablock.LO_Hit_Light_Bwd_A,
        EnemyAnimDatablock.LO_Hit_Light_Bwd_b,
        EnemyAnimDatablock.LO_Hit_Light_Bwd_C,
        EnemyAnimDatablock.LO_Hit_Light_Bwd_Turn_A
    ],
    hitLightFwd: [
        EnemyAnimDatablock.LO_Hit_Light_Fwd_A,
        EnemyAnimDatablock.LO_Hit_Light_Fwd_B,
        EnemyAnimDatablock.LO_Hit_Light_Fwd_C
    ],
    hitLightLt: [
        EnemyAnimDatablock.LO_Hit_Light_Lt_A,
        EnemyAnimDatablock.LO_Hit_Light_Lt_B,
        EnemyAnimDatablock.LO_Hit_Light_Lt_C
    ],
    hitLightRt: [
        EnemyAnimDatablock.LO_Hit_Light_Rt_A,
        EnemyAnimDatablock.LO_Hit_Light_Rt_B,
        EnemyAnimDatablock.LO_Hit_Light_Rt_C
    ],
    hitHeavyBwd: [
        EnemyAnimDatablock.LO_Hit_Heavy_Bwd_A,
        EnemyAnimDatablock.LO_Hit_Heavy_Bwd_A,
        EnemyAnimDatablock.LO_Hit_Heavy_Bwd_A,
        EnemyAnimDatablock.CR_Hit_Heavy_Bwd_D
    ],
    hitHeavyFwd: [
        EnemyAnimDatablock.LO_Hit_Heavy_Fwd_A,
        EnemyAnimDatablock.LO_Hit_Heavy_Fwd_B,
        EnemyAnimDatablock.LO_Hit_Heavy_Fwd_C
    ],
    hitHeavyLt: [
        EnemyAnimDatablock.LO_Hit_Heavy_Lt_A,
        EnemyAnimDatablock.LO_Hit_Heavy_Lt_B,
        EnemyAnimDatablock.LO_Hit_Heavy_Lt_C
    ],
    hitHeavyRt: [
        EnemyAnimDatablock.LO_Hit_Heavy_Rt_A,
        EnemyAnimDatablock.LO_Hit_Heavy_Rt_B,
        EnemyAnimDatablock.LO_Hit_Heavy_Rt_C
    ],
});
EnemyAnimHandlesDatablock.set("enemyFiddler", {
    abilityUse: [
        EnemyAnimDatablock.FD_Ability_Use_In_A,
        EnemyAnimDatablock.FD_Ability_Use_Loop_A,
        EnemyAnimDatablock.FD_Ability_Use_Out_A,
    ],
    wakeup: [
        EnemyAnimDatablock.FD_Hibernate_Wakeup_A,
        EnemyAnimDatablock.FD_Hibernate_Wakeup_B,
        EnemyAnimDatablock.FD_Hibernate_Wakeup_C,
        EnemyAnimDatablock.FD_Hibernate_Wakeup_B
    ],
    wakeupTurns: [
        EnemyAnimDatablock.FD_Hibernate_Wakeup_Turn_A
    ],
    heartbeats: [
        EnemyAnimDatablock.FD_Hibernate_Heartbeat_A,
        EnemyAnimDatablock.FD_Hibernate_Heartbeat_B,
        EnemyAnimDatablock.FD_Hibernate_Heartbeat_C,
        EnemyAnimDatablock.FD_Hibernate_Heartbeat_D,
        EnemyAnimDatablock.FD_Hibernate_Heartbeat_E,
    ],
    hibernateIn: EnemyAnimDatablock.FD_Hibernate_In,
    hibernateLoop: EnemyAnimDatablock.FD_HibernateDetect,
    screams: [
        EnemyAnimDatablock.FD_Scream_A,
        EnemyAnimDatablock.FD_Scream_B,
        EnemyAnimDatablock.FD_Scream_C,
    ],
    jump: [
        mergeAnims(EnemyAnimDatablock.FD_Jump_Start as HumanAnim, EnemyAnimDatablock.FD_Jump_Air as HumanAnim),
        EnemyAnimDatablock.FD_Jump_Land
    ],
    movement: EnemyAnimDatablock.enemyFiddleMovement,
    ladderClimb: EnemyAnimDatablock.CA_Walk_Fwd_A,
    abilityFire: [
        EnemyAnimDatablock.FD_Ability_Fire_In_A, 
        EnemyAnimDatablock.FD_Ability_Fire_In_B,
        EnemyAnimDatablock.FD_Ability_Fire_In_B
    ],
    hitLightBwd: [
        EnemyAnimDatablock.FD_Hit_Light_Bwd_A,
        EnemyAnimDatablock.FD_Hit_Light_Bwd_B,
        EnemyAnimDatablock.FD_Hit_Light_Bwd_C,
        EnemyAnimDatablock.FD_Hit_Light_Bwd_C // Not actually defined in vanilla game
    ],
    hitLightFwd: [
        EnemyAnimDatablock.FD_Hit_Light_Fwd_A,
        EnemyAnimDatablock.FD_Hit_Light_Fwd_B,
        EnemyAnimDatablock.FD_Hit_Light_Fwd_C,
    ],
    hitLightLt: [
        EnemyAnimDatablock.FD_Hit_Light_Lt_A,
        EnemyAnimDatablock.FD_Hit_Light_Lt_B,
        EnemyAnimDatablock.FD_Hit_Light_Lt_C
    ],
    hitLightRt: [
        EnemyAnimDatablock.FD_Hit_Light_Rt_A,
        EnemyAnimDatablock.FD_Hit_Light_Rt_B,
        EnemyAnimDatablock.FD_Hit_Light_Rt_C
    ],
    hitHeavyBwd: [
        EnemyAnimDatablock.FD_Hit_Heavy_Bwd_A,
        EnemyAnimDatablock.FD_Hit_Heavy_Bwd_B,
        EnemyAnimDatablock.FD_Hit_Heavy_Bwd_C,
        EnemyAnimDatablock.FD_Hit_Heavy_Bwd_C // Not actually defined in vanilla game
    ],
    hitHeavyFwd: [
        EnemyAnimDatablock.FD_Hit_Heavy_Fwd_A,
        EnemyAnimDatablock.FD_Hit_Heavy_Fwd_B,
        EnemyAnimDatablock.FD_Hit_Heavy_Fwd_C
    ],
    hitHeavyLt: [
        EnemyAnimDatablock.FD_Hit_Heavy_Lt_A,
        EnemyAnimDatablock.FD_Hit_Heavy_Lt_B,
        EnemyAnimDatablock.FD_Hit_Heavy_Lt_C
    ],
    hitHeavyRt: [
        EnemyAnimDatablock.FD_Hit_Heavy_Rt_A,
        EnemyAnimDatablock.FD_Hit_Heavy_Rt_B,
        EnemyAnimDatablock.FD_Hit_Heavy_Rt_C
    ],
});
EnemyAnimHandlesDatablock.set("enemyCrawl", {
    abilityUse: [
        EnemyAnimDatablock.CA_Ability_Use_In_A,
        EnemyAnimDatablock.CA_Ability_Use_Loop_A,
        EnemyAnimDatablock.CA_Ability_Use_Out_A,
    ],
    wakeup: [
        EnemyAnimDatablock.CA_Hibernate_Wakeup_A,
        EnemyAnimDatablock.CA_Hibernate_Wakeup_A,
        EnemyAnimDatablock.CA_Hibernate_Wakeup_A,
        EnemyAnimDatablock.CA_Hibernate_Wakeup_A
    ],
    wakeupTurns: [
        EnemyAnimDatablock.CA_Hibernate_Wakeup_Turn_A
    ],
    heartbeats: [
        EnemyAnimDatablock.CA_Hibernate_Heartbeat_A,
        EnemyAnimDatablock.CA_Hibernate_Heartbeat_B,
        EnemyAnimDatablock.CA_Hibernate_Heartbeat_C,
        EnemyAnimDatablock.CA_Hibernate_Heartbeat_D,
        EnemyAnimDatablock.CA_Hibernate_Heartbeat_E,
    ],
    hibernateIn: EnemyAnimDatablock.CA_Hibernate_In,
    hibernateLoop: EnemyAnimDatablock.CA_HibernateDetect,
    screams: [
        EnemyAnimDatablock.CA_Scream_A,
        EnemyAnimDatablock.CA_Scream_B,
        EnemyAnimDatablock.CA_Scream_A,
    ],
    movement: EnemyAnimDatablock.enemyCrawlMovement,
    jump: [
        mergeAnims(EnemyAnimDatablock.CA_Jump_Start as HumanAnim, EnemyAnimDatablock.CA_Jump_Air as HumanAnim),
        EnemyAnimDatablock.CA_Jump_Land
    ],
    ladderClimb: EnemyAnimDatablock.CA_Walk_Fwd_A,
    abilityFire: [
        EnemyAnimDatablock.CA_Ability_Fire_In_A, 
        EnemyAnimDatablock.CA_Ability_Fire_In_B,
        EnemyAnimDatablock.CA_Ability_Fire_In_B
    ],
    hitLightBwd: [
        EnemyAnimDatablock.CA_Hit_Light_Bwd_A,
        EnemyAnimDatablock.CA_Hit_Light_Bwd_B,
        EnemyAnimDatablock.CA_Hit_Light_Bwd_A,
        EnemyAnimDatablock.CA_Hit_Light_Bwd_B
    ],
    hitLightFwd: [
        EnemyAnimDatablock.CA_Hit_Light_Fwd_A,
        EnemyAnimDatablock.CA_Hit_Light_Fwd_B,
        EnemyAnimDatablock.CA_Hit_Light_Fwd_A,
    ],
    hitLightLt: [
        EnemyAnimDatablock.CA_Hit_Light_Lt_A,
        EnemyAnimDatablock.CA_Hit_Light_Lt_B,
        EnemyAnimDatablock.CA_Hit_Light_Lt_A
    ],
    hitLightRt: [
        EnemyAnimDatablock.CA_Hit_Light_Rt_A,
        EnemyAnimDatablock.CA_Hit_Light_Rt_B,
        EnemyAnimDatablock.CA_Hit_Light_Rt_A
    ],
    hitHeavyBwd: [
        EnemyAnimDatablock.CA_Hit_Heavy_Bwd_A,
        EnemyAnimDatablock.CA_Hit_Heavy_Bwd_A,
        EnemyAnimDatablock.CA_Hit_Heavy_Bwd_A,
        EnemyAnimDatablock.CA_Hit_Heavy_Bwd_A
    ],
    hitHeavyFwd: [
        EnemyAnimDatablock.CA_Hit_Heavy_Fwd_B,
        EnemyAnimDatablock.CA_Hit_Heavy_Fwd_C,
        EnemyAnimDatablock.CA_Hit_Heavy_Fwd_C
    ],
    hitHeavyLt: [
        EnemyAnimDatablock.CA_Hit_Heavy_Lt_A,
        EnemyAnimDatablock.CA_Hit_Heavy_Lt_B,
        EnemyAnimDatablock.CA_Hit_Heavy_Lt_A
    ],
    hitHeavyRt: [
        EnemyAnimDatablock.CA_Hit_Heavy_Rt_A,
        EnemyAnimDatablock.CA_Hit_Heavy_Rt_B,
        EnemyAnimDatablock.CA_Hit_Heavy_Rt_A
    ],
});

EnemyAnimHandlesDatablock.set("enemyCrawlFlip", {
    abilityUse: [
        EnemyAnimDatablock.CF_Ability_Use_In_A,
        EnemyAnimDatablock.CF_Ability_Use_Loop_A,
        EnemyAnimDatablock.CF_Ability_Use_Out_A,
    ],
    wakeup: [
        EnemyAnimDatablock.CF_Hibernate_Wakeup_A,
        EnemyAnimDatablock.CF_Hibernate_Wakeup_A,
        EnemyAnimDatablock.CF_Hibernate_Wakeup_A,
        EnemyAnimDatablock.CF_Hibernate_Wakeup_A
    ],
    wakeupTurns: [
        EnemyAnimDatablock.CF_Hibernate_Wakeup_Turn_A
    ],
    hibernateIn: EnemyAnimDatablock.CF_Hibernate_In,
    hibernateLoop: EnemyAnimDatablock.CF_HibernateDetect,
    heartbeats: [
        EnemyAnimDatablock.CF_Hibernate_Heartbeat_A,
        EnemyAnimDatablock.CF_Hibernate_Heartbeat_B,
        EnemyAnimDatablock.CF_Hibernate_Heartbeat_C,
        EnemyAnimDatablock.CF_Hibernate_Heartbeat_D,
        EnemyAnimDatablock.CF_Hibernate_Heartbeat_E,
    ],
    screams: [
        EnemyAnimDatablock.CF_Scream,
        EnemyAnimDatablock.CF_Scream,
        EnemyAnimDatablock.CF_Scream,
    ],
    movement: EnemyAnimDatablock.enemyCrawlFlipMovement,
    jump: [
        mergeAnims(EnemyAnimDatablock.CF_Jump_Start as HumanAnim, EnemyAnimDatablock.CF_Jump_Air as HumanAnim),
        EnemyAnimDatablock.CF_Jump_Land
    ],
    ladderClimb: EnemyAnimDatablock.CA_Walk_Fwd_A,
    abilityFire: [
        EnemyAnimDatablock.CF_Ability_Fire_In_A, 
        EnemyAnimDatablock.CF_Ability_Fire_In_B,
        EnemyAnimDatablock.CF_Ability_Fire_In_B
    ],
    hitLightBwd: [
        EnemyAnimDatablock.CF_Hit_Light_A,
        EnemyAnimDatablock.CF_Hit_Light_B,
        EnemyAnimDatablock.CF_Hit_Light_A,
        EnemyAnimDatablock.CF_Hit_Light_B
    ],
    hitLightFwd: [
        EnemyAnimDatablock.CF_Hit_Light_A,
        EnemyAnimDatablock.CF_Hit_Light_B,
        EnemyAnimDatablock.CF_Hit_Light_A,
    ],
    hitLightLt: [
        EnemyAnimDatablock.CF_Hit_Light_A,
        EnemyAnimDatablock.CF_Hit_Light_B,
        EnemyAnimDatablock.CF_Hit_Light_A,
    ],
    hitLightRt: [
        EnemyAnimDatablock.CF_Hit_Light_A,
        EnemyAnimDatablock.CF_Hit_Light_B,
        EnemyAnimDatablock.CF_Hit_Light_A,
    ],
    hitHeavyBwd: [
        EnemyAnimDatablock.CF_Hit_Light_A,
        EnemyAnimDatablock.CF_Hit_Light_B,
        EnemyAnimDatablock.CF_Hit_Light_A,
        EnemyAnimDatablock.CF_Hit_Light_B,
    ],
    hitHeavyFwd: [
        EnemyAnimDatablock.CF_Hit_Light_A,
        EnemyAnimDatablock.CF_Hit_Light_B,
        EnemyAnimDatablock.CF_Hit_Light_A,
    ],
    hitHeavyLt: [
        EnemyAnimDatablock.CF_Hit_Light_A,
        EnemyAnimDatablock.CF_Hit_Light_B,
        EnemyAnimDatablock.CF_Hit_Light_A,
    ],
    hitHeavyRt: [
        EnemyAnimDatablock.CF_Hit_Light_A,
        EnemyAnimDatablock.CF_Hit_Light_B,
        EnemyAnimDatablock.CF_Hit_Light_A,
    ],
});
EnemyAnimHandlesDatablock.set("enemyCripple", {
    abilityUse: [
        EnemyAnimDatablock.CR_Ability_Use_In_A,
        EnemyAnimDatablock.CR_Ability_Use_Loop_A,
        EnemyAnimDatablock.CR_Ability_Use_Out_A,
    ],
    wakeup: [
        EnemyAnimDatablock.CR_Hibernate_Wakeup_A,
        EnemyAnimDatablock.CR_Hibernate_Wakeup_B,
        EnemyAnimDatablock.CR_Hibernate_Wakeup_C,
        EnemyAnimDatablock.CR_Hibernate_Wakeup_D
    ],
    wakeupTurns: [
        EnemyAnimDatablock.CR_Hibernate_Wakeup_Turn_A
    ],
    heartbeats: [
        EnemyAnimDatablock.CR_Hibernate_Heartbeat_A,
        EnemyAnimDatablock.CR_Hibernate_Heartbeat_B,
        EnemyAnimDatablock.CR_Hibernate_Heartbeat_C,
        EnemyAnimDatablock.CR_Hibernate_Heartbeat_D,
        EnemyAnimDatablock.CR_Hibernate_Heartbeat_E,
    ],
    hibernateIn: EnemyAnimDatablock.CR_Hibernate_In,
    hibernateLoop: EnemyAnimDatablock.CR_HibernateDetect,
    screams: [
        EnemyAnimDatablock.CR_Scream_A,
        EnemyAnimDatablock.CR_Scream_B,
        EnemyAnimDatablock.CR_Scream_C,
    ],
    movement: EnemyAnimDatablock.enemyCrippleMovement,
    jump: [
        mergeAnims(EnemyAnimDatablock.CR_Jump_Start as HumanAnim, EnemyAnimDatablock.CR_Jump_Air as HumanAnim),
        EnemyAnimDatablock.CR_Jump_Land
    ],
    ladderClimb: EnemyAnimDatablock.CA_Walk_Fwd_A,
    abilityFire: [
        EnemyAnimDatablock.CR_Ability_Fire_In_A, 
        EnemyAnimDatablock.CR_Ability_Fire_In_B,
        EnemyAnimDatablock.CR_Ability_Fire_In_C
    ],
    hitLightBwd: [
        EnemyAnimDatablock.CR_Hit_Light_Bwd_A,
        EnemyAnimDatablock.CR_Hit_Light_Bwd_B,
        EnemyAnimDatablock.CR_Hit_Light_Bwd_C,
        EnemyAnimDatablock.CR_Hit_Light_Bwd_D
    ],
    hitLightFwd: [
        EnemyAnimDatablock.CR_Hit_Light_Fwd_A,
        EnemyAnimDatablock.CR_Hit_Light_Fwd_B,
        EnemyAnimDatablock.CR_Hit_Light_Fwd_C
    ],
    hitLightLt: [
        EnemyAnimDatablock.CR_Hit_Light_Lt_A,
        EnemyAnimDatablock.CR_Hit_Light_Lt_B,
        EnemyAnimDatablock.CR_Hit_Light_Lt_C
    ],
    hitLightRt: [
        EnemyAnimDatablock.CR_Hit_Light_Rt_A,
        EnemyAnimDatablock.CR_Hit_Light_Rt_B,
        EnemyAnimDatablock.CR_Hit_Light_Rt_C
    ],
    hitHeavyBwd: [
        EnemyAnimDatablock.CR_Hit_Heavy_Bwd_A_Turn,
        EnemyAnimDatablock.CR_Hit_Heavy_Bwd_B,
        EnemyAnimDatablock.CR_Hit_Heavy_Bwd_C_Turn,
        EnemyAnimDatablock.CR_Hit_Heavy_Bwd_D_0
    ],
    hitHeavyFwd: [
        EnemyAnimDatablock.CR_Hit_Heavy_Fwd_A,
        EnemyAnimDatablock.CR_Hit_Heavy_Fwd_B,
        EnemyAnimDatablock.CR_Hit_Heavy_Fwd_C
    ],
    hitHeavyLt: [
        EnemyAnimDatablock.CR_Hit_Heavy_Lt_A,
        EnemyAnimDatablock.CR_Hit_Heavy_Lt_B,
        EnemyAnimDatablock.CR_Hit_Heavy_Lt_C
    ],
    hitHeavyRt: [
        EnemyAnimDatablock.CR_Hit_Heavy_Rt_A,
        EnemyAnimDatablock.CR_Hit_Heavy_Rt_B,
        EnemyAnimDatablock.CR_Hit_Heavy_Rt_C_0
    ],
});
EnemyAnimHandlesDatablock.set("enemyBig", {
    abilityUse: [
        EnemyAnimDatablock.FD_Ability_Use_In_A,
        EnemyAnimDatablock.FD_Ability_Use_Loop_A,
        EnemyAnimDatablock.FD_Ability_Use_Out_A,
    ],
    wakeup: [
        EnemyAnimDatablock.Enemy_Big_Hibernate_Wakeup_A,
        EnemyAnimDatablock.Enemy_Big_Hibernate_Wakeup_A,
        EnemyAnimDatablock.Enemy_Big_Hibernate_Wakeup_A,
        EnemyAnimDatablock.Enemy_Big_Hibernate_Wakeup_A
    ],
    wakeupTurns: [
        EnemyAnimDatablock.Enemy_Big_Hibernate_Wakeup_180_B,
    ],
    heartbeats: [
        EnemyAnimDatablock.Enemy_Big_Hibernate_Heartbeat_1_A,
        EnemyAnimDatablock.Enemy_Big_Hibernate_Heartbeat_2_A,
        EnemyAnimDatablock.Enemy_Big_Hibernate_Heartbeat_3_A,
        EnemyAnimDatablock.Enemy_Big_Hibernate_Heartbeat_4_A,
        EnemyAnimDatablock.Enemy_Big_Hibernate_Heartbeat_5_A,
    ],
    hibernateIn: EnemyAnimDatablock.Enemy_Big_Hibernate_In_A,
    hibernateLoop: EnemyAnimDatablock.Enemy_Big_Hibernate_Loop_A,
    screams: [
        EnemyAnimDatablock.Enemy_Big_Detect_Front_A,
        EnemyAnimDatablock.Enemy_Big_Detect_Front_B,
        EnemyAnimDatablock.Enemy_Big_Detect_Front_A,
    ],
    movement: EnemyAnimDatablock.enemyBigMovement,
    jump: [
        mergeAnims(EnemyAnimDatablock.Enemy_Big_Jump_Start_A as HumanAnim, EnemyAnimDatablock.Enemy_Big_Jump_Loop_A as HumanAnim),
        EnemyAnimDatablock.Enemy_Big_Jump_Land_A
    ],
    ladderClimb: EnemyAnimDatablock.CA_Walk_Fwd_A,
    abilityFire: [
        EnemyAnimDatablock.Enemy_Big_Fire_In_A,
        EnemyAnimDatablock.Enemy_Big_Fire_In_B,
        EnemyAnimDatablock.Enemy_Big_Fire_In_B
    ],
    hitLightBwd: [
        EnemyAnimDatablock.Enemy_Big_Hit_Back_A,
        EnemyAnimDatablock.Enemy_Big_Hit_Back_B,
        EnemyAnimDatablock.Enemy_Big_Hit_Back_A,
        EnemyAnimDatablock.Enemy_Big_Hit_Back_B,
    ],
    hitLightFwd: [
        EnemyAnimDatablock.Enemy_Big_Hit_Front_A,
        EnemyAnimDatablock.Enemy_Big_Hit_Front_B,
        EnemyAnimDatablock.Enemy_Big_Hit_Front_A,
    ],
    hitLightLt: [
        EnemyAnimDatablock.Enemy_Big_Hit_Left_A,
        EnemyAnimDatablock.Enemy_Big_Hit_Left_B,
        EnemyAnimDatablock.Enemy_Big_Hit_Left_A,
    ],
    hitLightRt: [
        EnemyAnimDatablock.Enemy_Big_Hit_Right_A,
        EnemyAnimDatablock.Enemy_Big_Hit_Right_B,
        EnemyAnimDatablock.Enemy_Big_Hit_Right_A,
    ],
    hitHeavyBwd: [
        EnemyAnimDatablock.Enemy_Big_Hit_Back_A,
        EnemyAnimDatablock.Enemy_Big_Hit_Back_B,
        EnemyAnimDatablock.Enemy_Big_Hit_Back_A,
        EnemyAnimDatablock.Enemy_Big_Hit_Back_B,
    ],
    hitHeavyFwd: [
        EnemyAnimDatablock.Enemy_Big_Hit_Front_A,
        EnemyAnimDatablock.Enemy_Big_Hit_Front_B,
        EnemyAnimDatablock.Enemy_Big_Hit_Front_A,
    ],
    hitHeavyLt: [
        EnemyAnimDatablock.Enemy_Big_Hit_Left_A,
        EnemyAnimDatablock.Enemy_Big_Hit_Left_B,
        EnemyAnimDatablock.Enemy_Big_Hit_Left_A,
    ],
    hitHeavyRt: [
        EnemyAnimDatablock.Enemy_Big_Hit_Right_A,
        EnemyAnimDatablock.Enemy_Big_Hit_Right_B,
        EnemyAnimDatablock.Enemy_Big_Hit_Right_A,
    ],
});

EnemyAnimHandlesDatablock.set("enemyExploder", {
    abilityUse: [
        EnemyAnimDatablock.FD_Ability_Use_In_A,
        EnemyAnimDatablock.FD_Ability_Use_Loop_A,
        EnemyAnimDatablock.FD_Ability_Use_Out_A,
    ],
    wakeup: [
        EnemyAnimDatablock.Enemy_Big_Hibernate_Wakeup_A,
        EnemyAnimDatablock.Enemy_Big_Hibernate_Wakeup_A,
        EnemyAnimDatablock.Enemy_Big_Hibernate_Wakeup_A,
        EnemyAnimDatablock.Enemy_Big_Hibernate_Wakeup_A
    ],
    wakeupTurns: [
        EnemyAnimDatablock.Enemy_Big_Hibernate_Wakeup_180_B,
    ],
    heartbeats: [
        EnemyAnimDatablock.Enemy_Big_Hibernate_Heartbeat_1_A,
        EnemyAnimDatablock.Enemy_Big_Hibernate_Heartbeat_2_A,
        EnemyAnimDatablock.Enemy_Big_Hibernate_Heartbeat_3_A,
        EnemyAnimDatablock.Enemy_Big_Hibernate_Heartbeat_4_A,
        EnemyAnimDatablock.Enemy_Big_Hibernate_Heartbeat_5_A,
    ],
    hibernateIn: EnemyAnimDatablock.Enemy_Big_Hibernate_In_A,
    hibernateLoop: EnemyAnimDatablock.Enemy_Big_Hibernate_Loop_A,
    screams: [
        EnemyAnimDatablock.Enemy_Big_Detect_Front_A,
        EnemyAnimDatablock.Enemy_Big_Detect_Front_B,
        EnemyAnimDatablock.Enemy_Big_Detect_Front_A,
    ],
    movement: EnemyAnimDatablock.enemyBigMovement,
    jump: [
        mergeAnims(EnemyAnimDatablock.Enemy_Big_Jump_Start_A as HumanAnim, EnemyAnimDatablock.Enemy_Big_Jump_Loop_A as HumanAnim),
        EnemyAnimDatablock.Enemy_Big_Jump_Land_A
    ],
    ladderClimb: EnemyAnimDatablock.CA_Walk_Fwd_A,
    abilityFire: [
        EnemyAnimDatablock.Enemy_Big_Fire_In_A,
        EnemyAnimDatablock.Enemy_Big_Fire_In_B,
        EnemyAnimDatablock.Enemy_Big_Fire_In_B
    ],
    hitLightBwd: [
        EnemyAnimDatablock.Enemy_Big_Hit_Back_A,
        EnemyAnimDatablock.Enemy_Big_Hit_Back_B,
        EnemyAnimDatablock.Enemy_Big_Hit_Back_A,
        EnemyAnimDatablock.Enemy_Big_Hit_Back_B,
    ],
    hitLightFwd: [
        EnemyAnimDatablock.Enemy_Big_Hit_Front_A,
        EnemyAnimDatablock.Enemy_Big_Hit_Front_B,
        EnemyAnimDatablock.Enemy_Big_Hit_Front_A,
    ],
    hitLightLt: [
        EnemyAnimDatablock.Enemy_Big_Hit_Left_A,
        EnemyAnimDatablock.Enemy_Big_Hit_Left_B,
        EnemyAnimDatablock.Enemy_Big_Hit_Left_A,
    ],
    hitLightRt: [
        EnemyAnimDatablock.Enemy_Big_Hit_Right_A,
        EnemyAnimDatablock.Enemy_Big_Hit_Right_B,
        EnemyAnimDatablock.Enemy_Big_Hit_Right_A,
    ],
    hitHeavyBwd: [
        EnemyAnimDatablock.Enemy_Big_Hit_Back_A,
        EnemyAnimDatablock.Enemy_Big_Hit_Back_B,
        EnemyAnimDatablock.Enemy_Big_Hit_Back_A,
        EnemyAnimDatablock.Enemy_Big_Hit_Back_B,
    ],
    hitHeavyFwd: [
        EnemyAnimDatablock.Enemy_Big_Hit_Front_A,
        EnemyAnimDatablock.Enemy_Big_Hit_Front_B,
        EnemyAnimDatablock.Enemy_Big_Hit_Front_A,
    ],
    hitHeavyLt: [
        EnemyAnimDatablock.Enemy_Big_Hit_Left_A,
        EnemyAnimDatablock.Enemy_Big_Hit_Left_B,
        EnemyAnimDatablock.Enemy_Big_Hit_Left_A,
    ],
    hitHeavyRt: [
        EnemyAnimDatablock.Enemy_Big_Hit_Right_A,
        EnemyAnimDatablock.Enemy_Big_Hit_Right_B,
        EnemyAnimDatablock.Enemy_Big_Hit_Right_A,
    ],
});
EnemyAnimHandlesDatablock.set("enemyGiant", {
    abilityUse: [
        EnemyAnimDatablock.RU_Ability_Use_In_a,
        EnemyAnimDatablock.RU_Ability_Use_Loop_a,
        EnemyAnimDatablock.RU_Ability_Use_Out_a,
    ],
    wakeup: [
        EnemyAnimDatablock.RU_Hibernate_Wakeup_A,
        EnemyAnimDatablock.RU_Hibernate_Wakeup_B,
        EnemyAnimDatablock.RU_Hibernate_Wakeup_C,
        EnemyAnimDatablock.RU_Hibernate_Wakeup_B
    ],
    wakeupTurns: [
        EnemyAnimDatablock.Monster_Turn_Left_180
    ],
    hibernateIn: EnemyAnimDatablock.RU_Hibernate_In,
    hibernateLoop: EnemyAnimDatablock.RU_HibernateDetect,
    heartbeats: [
        EnemyAnimDatablock.RU_Hibernate_Heartbeat_A,
        EnemyAnimDatablock.RU_Hibernate_Heartbeat_B,
        EnemyAnimDatablock.RU_Hibernate_Heartbeat_C_0,
        EnemyAnimDatablock.RU_Hibernate_Heartbeat_D_0,
        EnemyAnimDatablock.RU_Hibernate_Heartbeat_E,
    ],
    blend: 10,
    screams: [
        EnemyAnimDatablock.Monster_Taunt_01,
        EnemyAnimDatablock.Monster_Taunt_01,
        EnemyAnimDatablock.Monster_Taunt_01,
    ],
    ladderClimb: EnemyAnimDatablock.CA_Walk_Fwd_A,
    melee: {
        "Forward": [EnemyAnimDatablock.Monster_Attack_06_shortened],
        "Backward": [EnemyAnimDatablock.Monster_Attack_180_L]
    },
    movement: EnemyAnimDatablock.enemyGiantMovement,
    jump: [
        EnemyAnimDatablock.Giant_Jump_Start,
        EnemyAnimDatablock.Monster_Fall_Landing_01
    ],
    abilityFire: [
        EnemyAnimDatablock.Monster_TentacleStart,
        EnemyAnimDatablock.Monster_TentacleStart, 
        EnemyAnimDatablock.Monster_TentacleStart, 
    ],
    hitLightBwd: [
        EnemyAnimDatablock.Monster_Hit_Back_01,
        EnemyAnimDatablock.Monster_Hit_Back_02,
        EnemyAnimDatablock.Monster_Hit_Back_04,
        EnemyAnimDatablock.Monster_Hit_Back_02,
    ],
    hitLightFwd: [
        EnemyAnimDatablock.Monster_Hit_Front_01,
        EnemyAnimDatablock.Monster_Hit_Front_02,
        EnemyAnimDatablock.Monster_Hit_Front_03,
    ],
    hitLightLt: [
        EnemyAnimDatablock.Monster_Hit_Leg_01,
        EnemyAnimDatablock.Monster_Hit_Leg_02,
        EnemyAnimDatablock.Monster_Hit_Leg_03,
    ],
    hitLightRt: [
        EnemyAnimDatablock.Monster_Hit_Right_01,
        EnemyAnimDatablock.Monster_Hit_Leg_02,
        EnemyAnimDatablock.Monster_Hit_Right_01,
    ],
    hitHeavyBwd: [
        EnemyAnimDatablock.Monster_Hit_Back_01,
        EnemyAnimDatablock.Monster_Hit_Back_02,
        EnemyAnimDatablock.Monster_Hit_Back_04,
        EnemyAnimDatablock.Monster_Hit_Back_01,
    ],
    hitHeavyFwd: [
        EnemyAnimDatablock.Monster_Hit_Front_04,
        EnemyAnimDatablock.Monster_Hit_Front_01,
        EnemyAnimDatablock.Monster_Hit_Leg_02,
    ],
    hitHeavyLt: [
        EnemyAnimDatablock.Monster_Hit_Leg_01,
        EnemyAnimDatablock.Monster_Hit_Leg_02,
        EnemyAnimDatablock.Monster_Hit_Leg_03,
    ],
    hitHeavyRt: [
        EnemyAnimDatablock.Monster_Hit_Right_01,
        EnemyAnimDatablock.Monster_Hit_Leg_02,
        EnemyAnimDatablock.Monster_Hit_Right_01,
    ],
});

EnemyAnimHandlesDatablock.set("enemyPouncer", {
    wakeup: [
        EnemyAnimDatablock.CA_Hibernate_Wakeup_A,
        EnemyAnimDatablock.CA_Hibernate_Wakeup_A,
        EnemyAnimDatablock.CA_Hibernate_Wakeup_A,
        EnemyAnimDatablock.CA_Hibernate_Wakeup_A
    ],
    wakeupTurns: [
        EnemyAnimDatablock.CA_Hibernate_Wakeup_Turn_A
    ],
    heartbeats: [
        EnemyAnimDatablock.CA_Hibernate_Heartbeat_A,
        EnemyAnimDatablock.CA_Hibernate_Heartbeat_B,
        EnemyAnimDatablock.CA_Hibernate_Heartbeat_C,
        EnemyAnimDatablock.CA_Hibernate_Heartbeat_D,
        EnemyAnimDatablock.CA_Hibernate_Heartbeat_E,
    ],
    hibernateIn: EnemyAnimDatablock.CA_Hibernate_In,
    hibernateLoop: EnemyAnimDatablock.CA_HibernateDetect,
    screams: [
        EnemyAnimDatablock.CA_Scream_A,
        EnemyAnimDatablock.CA_Scream_B,
        EnemyAnimDatablock.CA_Scream_A,
    ],
    jump: [
        mergeAnims(EnemyAnimDatablock.LO_Jump_Start as HumanAnim, EnemyAnimDatablock.LO_Jump_Air as HumanAnim),
        EnemyAnimDatablock.LO_Jump_Land
    ],
    ladderClimb: EnemyAnimDatablock.CA_Walk_Fwd_A,
    movement: EnemyAnimDatablock.enemyPouncerMovement,
    abilityFire: [],
    hitLightBwd: [
        EnemyAnimDatablock.CA_Hit_Light_Bwd_A,
        EnemyAnimDatablock.CA_Hit_Light_Bwd_B,
        EnemyAnimDatablock.CA_Hit_Light_Bwd_A,
        EnemyAnimDatablock.CA_Hit_Light_Bwd_B
    ],
    hitLightFwd: [
        EnemyAnimDatablock.CA_Hit_Light_Fwd_A,
        EnemyAnimDatablock.CA_Hit_Light_Fwd_B,
        EnemyAnimDatablock.CA_Hit_Light_Fwd_A,
    ],
    hitLightLt: [
        EnemyAnimDatablock.CA_Hit_Light_Lt_A,
        EnemyAnimDatablock.CA_Hit_Light_Lt_B,
        EnemyAnimDatablock.CA_Hit_Light_Lt_A
    ],
    hitLightRt: [
        EnemyAnimDatablock.CA_Hit_Light_Rt_A,
        EnemyAnimDatablock.CA_Hit_Light_Rt_B,
        EnemyAnimDatablock.CA_Hit_Light_Rt_A
    ],
    hitHeavyBwd: [
        EnemyAnimDatablock.CA_Hit_Heavy_Bwd_A,
        EnemyAnimDatablock.CA_Hit_Heavy_Bwd_A,
        EnemyAnimDatablock.CA_Hit_Heavy_Bwd_A,
        EnemyAnimDatablock.CA_Hit_Heavy_Bwd_A
    ],
    hitHeavyFwd: [
        EnemyAnimDatablock.CA_Hit_Heavy_Fwd_B,
        EnemyAnimDatablock.CA_Hit_Heavy_Fwd_C,
        EnemyAnimDatablock.CA_Hit_Heavy_Fwd_C
    ],
    hitHeavyLt: [
        EnemyAnimDatablock.CA_Hit_Heavy_Lt_A,
        EnemyAnimDatablock.CA_Hit_Heavy_Lt_B,
        EnemyAnimDatablock.CA_Hit_Heavy_Lt_A
    ],
    hitHeavyRt: [
        EnemyAnimDatablock.CA_Hit_Heavy_Rt_A,
        EnemyAnimDatablock.CA_Hit_Heavy_Rt_B,
        EnemyAnimDatablock.CA_Hit_Heavy_Rt_A
    ],
});

EnemyAnimHandlesDatablock.set("enemyBirtherCrawlFlip", {
    abilityUse: [
        EnemyAnimDatablock.CF_Ability_Use_In_A,
        EnemyAnimDatablock.CF_Ability_Use_Loop_A,
        EnemyAnimDatablock.CF_Ability_Use_Out_A,
    ],
    wakeup: [
        EnemyAnimDatablock.CF_Hibernate_Wakeup_A,
        EnemyAnimDatablock.CF_Hibernate_Wakeup_A,
        EnemyAnimDatablock.CF_Hibernate_Wakeup_A,
        EnemyAnimDatablock.CF_Hibernate_Wakeup_A
    ],
    wakeupTurns: [
        EnemyAnimDatablock.CF_Hibernate_Wakeup_Turn_A
    ],
    heartbeats: [
        EnemyAnimDatablock.CF_Birther_Heartbeat,
        EnemyAnimDatablock.CF_Birther_Heartbeat,
        EnemyAnimDatablock.CF_Birther_Heartbeat,
        EnemyAnimDatablock.CF_Birther_Heartbeat,
        EnemyAnimDatablock.CF_Birther_Heartbeat,
    ],
    hibernateIn: EnemyAnimDatablock.CF_Birther_Hibernate_In,
    hibernateLoop: new ScaledAnim(HumanJoints, EnemyAnimDatablock.CF_Birther_Hibernate_Loop as HumanAnim, 0.2),
    screams: [
        EnemyAnimDatablock.CF_Scream,
        EnemyAnimDatablock.CF_Scream,
        EnemyAnimDatablock.CF_Scream,
    ],
    movement: EnemyAnimDatablock.enemyCrawlFlipMovement,
    jump: [
        mergeAnims(EnemyAnimDatablock.CF_Jump_Start as HumanAnim, EnemyAnimDatablock.CF_Jump_Air as HumanAnim),
        EnemyAnimDatablock.CF_Jump_Land
    ],
    ladderClimb: EnemyAnimDatablock.CA_Walk_Fwd_A,
    abilityFire: [
        EnemyAnimDatablock.CF_Ability_Fire_In_A, 
        EnemyAnimDatablock.CF_Ability_Fire_In_B,
        EnemyAnimDatablock.CF_Ability_Fire_In_B
    ],
    hitLightBwd: [
        EnemyAnimDatablock.CF_Hit_Light_A,
        EnemyAnimDatablock.CF_Hit_Light_B,
        EnemyAnimDatablock.CF_Hit_Light_A,
        EnemyAnimDatablock.CF_Hit_Light_B
    ],
    hitLightFwd: [
        EnemyAnimDatablock.CF_Hit_Light_A,
        EnemyAnimDatablock.CF_Hit_Light_B,
        EnemyAnimDatablock.CF_Hit_Light_A,
    ],
    hitLightLt: [
        EnemyAnimDatablock.CF_Hit_Light_A,
        EnemyAnimDatablock.CF_Hit_Light_B,
        EnemyAnimDatablock.CF_Hit_Light_A,
    ],
    hitLightRt: [
        EnemyAnimDatablock.CF_Hit_Light_A,
        EnemyAnimDatablock.CF_Hit_Light_B,
        EnemyAnimDatablock.CF_Hit_Light_A,
    ],
    hitHeavyBwd: [
        EnemyAnimDatablock.CF_Hit_Light_A,
        EnemyAnimDatablock.CF_Hit_Light_B,
        EnemyAnimDatablock.CF_Hit_Light_A,
        EnemyAnimDatablock.CF_Hit_Light_B,
    ],
    hitHeavyFwd: [
        EnemyAnimDatablock.CF_Hit_Light_A,
        EnemyAnimDatablock.CF_Hit_Light_B,
        EnemyAnimDatablock.CF_Hit_Light_A,
    ],
    hitHeavyLt: [
        EnemyAnimDatablock.CF_Hit_Light_A,
        EnemyAnimDatablock.CF_Hit_Light_B,
        EnemyAnimDatablock.CF_Hit_Light_A,
    ],
    hitHeavyRt: [
        EnemyAnimDatablock.CF_Hit_Light_A,
        EnemyAnimDatablock.CF_Hit_Light_B,
        EnemyAnimDatablock.CF_Hit_Light_A,
    ],
});