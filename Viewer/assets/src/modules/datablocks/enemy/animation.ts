import { AnimFunc } from "../../library/animations/lib.js";
import { HumanJoints } from "../../renderer/animations/human.js";
import { EnemyAnimationClips, EnemyAnimations } from "../../renderer/datablocks/enemies/animations.js";
import { Datablock } from "../lib.js";

export const EnemyAnimDatablock = new Datablock<EnemyAnimationClips | EnemyAnimations, AnimFunc<HumanJoints>>();
