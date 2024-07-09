import { AnimFunc } from "../../library/animations/lib.js";
import { HumanJoints } from "../../renderer/animations/human.js";
import { PlayerAnimationClips, PlayerAnimations } from "../../renderer/datablocks/player/animations.js";
import { Datablock } from "../lib.js";

export const PlayerAnimDatablock: Datablock<PlayerAnimationClips | PlayerAnimations, AnimFunc<HumanJoints>> = new Datablock();