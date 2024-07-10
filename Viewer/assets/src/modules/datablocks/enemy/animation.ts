import type { AnimFunc } from "../../library/animations/lib.js";
import type { AnimHandles, MeleeType } from "../../parser/enemy/animation.js";
import type { HumanAnimation, HumanJoints } from "../../renderer/animations/human.js";
import type { EnemyAnimationClips, EnemyAnimations } from "../../renderer/datablocks/enemies/animations.js";
import { Datablock } from "../lib.js";

export const EnemyAnimDatablock = new Datablock<EnemyAnimationClips | EnemyAnimations, AnimFunc<HumanJoints>>();

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