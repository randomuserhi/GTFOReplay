import { AnimBlend, AnimFunc } from "../../library/animations/lib.js";
import { loadAllClips } from "../../library/animations/loaders.js";
import { HumanJoints } from "../../renderer/animations/human.js";
import { Datablock } from "../lib.js";

if (module.metadata.isParser) console.warn("Datablocks should not be loaded by the parser. This degrades performance greatly.");

export const PlayerAnimDatablock: Datablock<PlayerAnimationClips | PlayerAnimations, AnimFunc<HumanJoints>> = new Datablock();

export const animVelocity = {
    x: 0,
    y: 0
};

export const animCrouch = {
    x: 0,
    y: 0
};

const playerAnimationClipNames = [
    "Rifle_AO_C", 
    "Rifle_AO_D",
    "Rifle_AO_L",
    "Rifle_AO_LD",
    "Rifle_AO_LU",
    "Rifle_AO_R",
    "Rifle_AO_RD",
    "Rifle_AO_RU",
    "Rifle_AO_U",
    "Rifle_CrouchLoop",
    "Rifle_Crouch_WalkBwd",
    "Rifle_Crouch_WalkFwd",
    "Rifle_Crouch_WalkLt",
    "Rifle_Crouch_WalkRt",
    "Rifle_Idle",
    "Rifle_Jog_Backward",
    "Rifle_Jog_BackwardLeft",
    "Rifle_Jog_BackwardRight",
    "Rifle_Jog_Forward",
    "Rifle_Jog_ForwardLeft",
    "Rifle_Jog_ForwardRight",
    "Rifle_Jog_Left",
    "Rifle_Jog_Right",
    "Rifle_RunBwdLoop",
    "Rifle_SprintFwdLoop",
    "Rifle_SprintFwdLoop_Left",
    "Rifle_SprintFwdLoop_Right",
    "Rifle_StrafeLeft135Loop",
    "Rifle_StrafeLeft45Loop",
    "Rifle_StrafeLeftLoop",
    "Rifle_StrafeRight135Loop",
    "Rifle_StrafeRight45Loop",
    "Rifle_StrafeRightLoop",
    "Rifle_StrafeRun135LeftLoop",
    "Rifle_StrafeRun135LeftLoop_0",
    "Rifle_StrafeRun45LeftLoop",
    "Rifle_StrafeRun45RightLoop",
    "Rifle_StrafeRunLeftLoop",
    "Rifle_StrafeRunRightLoop",
    "Rifle_WalkBwdLoop",
    "Rifle_WalkFwdLoop",
    "Pistol_AO_C", 
    "Pistol_AO_D",
    "Pistol_AO_L",
    "Pistol_AO_LD",
    "Pistol_AO_LU",
    "Pistol_AO_R",
    "Pistol_AO_RD",
    "Pistol_AO_RU",
    "Pistol_AO_U",
    "Pistol_CrouchLoop",
    "Pistol_Crouch_WalkBwd",
    "Pistol_Crouch_WalkFwd",
    "Pistol_Crouch_WalkLt",
    "Pistol_Crouch_WalkRt",
    "Pistol_Idle",
    "Pistol_Jog_Backward",
    "Pistol_Jog_BackwardLeft",
    "Pistol_Jog_BackwardRight",
    "Pistol_Jog_Forward",
    "Pistol_Jog_ForwardLeft",
    "Pistol_Jog_ForwardRight",
    "Pistol_Jog_Left",
    "Pistol_Jog_Right",
    "Pistol_RunBwdLoop",
    "Pistol_SprintFwdLoop",
    "Pistol_StrafeLeft135Loop",
    "Pistol_StrafeLeft45Loop",
    "Pistol_StrafeLeftLoop",
    "Pistol_StrafeRight135Loop",
    "Pistol_StrafeRight45Loop",
    "Pistol_StrafeRightLoop",
    "Pistol_StrafeRun135LeftLoop",
    "Pistol_StrafeRun135RightLoop",
    "Pistol_StrafeRun45LeftLoop",
    "Pistol_StrafeRun45RightLoop",
    "Pistol_StrafeRunLeftLoop",
    "Pistol_StrafeRunRightLoop",
    "Pistol_WalkBwdLoop",
    "Pistol_WalkFwdLoop",
    "Pistol_TurnL_90",
    "Pistol_TurnR_90",
    "Pistol_Crouch_Turn90L",
    "Pistol_Crouch_Turn90R",
    "Rifle_TurnL_90",
    "Rifle_TurnR_90",
    "Rifle_Crouch_Turn90L",
    "Rifle_Crouch_Turn90R",
    "Idle_1",
    "RunFwdLoop",
    "RunBwdLoop",
    "RunRtLoop",
    "RunLtLoop",
    "RunStrafeRight45Loop",
    "RunStrafeRight135Loop",
    "RunStrafeLeft45Loop",
    "RunStrafeLeft135Loop",
    "WalkFwdLoop",
    "WalkBwdLoop",
    "StrafeRightLoop",
    "StrafeRight45Loop",
    "StrafeRight135Loop",
    "StrafeLeftLoop",
    "StrafeLeft45Loop",
    "StrafeLeft135Loop",
    "Crouch_Idle",
    "Crouch_WalkFwd_new",
    "Crouch_WalkBwd_new",
    "Crouch_WalkLt_new",
    "Crouch_WalkRt_new",
    "Crouch_WalkLt45_new",
    "Crouch_WalkLt135_new",
    "Crouch_WalkRt45_new",
    "Crouch_WalkRt135_new",
    "Equip_Generic",
    "Equip_Melee",
    "Equip_Primary",
    "Equip_Tool",
    "Equip_Secondary",
    "Bat_Equip",
    "Spear_Equip",
    "ConsumablePack_Equip",
    "Consumable_Throw_Equip",
    "Sledgehammer_Stand_Idle",
    "SledgeHammer_Jog_Backward",
    "SledgeHammer_Jog_BackwardLeft",
    "SledgeHammer_Jog_BackwardRight",
    "SledgeHammer_Jog_Forward",
    "SledgeHammer_Jog_ForwardLeft",
    "SledgeHammer_Jog_ForwardRight",
    "SledgeHammer_Jog_Left",
    "SledgeHammer_Jog_Right",
    "SledgeHammer_SprintFwdLoop",
    "Player_Melee_Movement_Walk_Bwd_Left_Stand_A",
    "Player_Melee_Movement_Walk_Bwd_Right_Stand_A",
    "Player_Melee_Movement_Walk_Bwd_Stand_A",
    "Player_Melee_Movement_Walk_Fwd_Left_Stand_A",
    "Player_Melee_Movement_Walk_Fwd_Right_Stand_A",
    "Player_Melee_Movement_Walk_Fwd_Stand_A",
    "Player_Melee_Movement_Walk_Left_Stand_A",
    "Player_Melee_Movement_Walk_Right_Stand_A",
    "Sledgehammer_Crouch_Idle",
    "SledgeHammer_Crouch_WalkBwd",
    "SledgeHammer_Crouch_WalkFwd",
    "SledgeHammer_Crouch_WalkLt",
    "SledgeHammer_Crouch_WalkRt",
    "Pistol_Jump",
    "Pistol_Fall",
    "Pistol_Land",
    "Rifle_Jump",
    "Rifle_Fall",
    "Rifle_Land",
    "SledgeHammer_Jump",
    "SledgeHammer_Fall",
    "SledgeHammer_Land",
    "Sledgehammer_Stand_SwingLeft_Charge",
    "Sledgehammer_Crouch_SwingLeft_Charge",
    "Sledgehammer_Stand_SwingLeft_Charge_Idle",
    "Sledgehammer_Stand_SwingLeft_Charge_Release",
    "Sledgehammer_Crouch_SwingLeft_Charge_Release",
    "Sledgehammer_Stand_Shove",
    "Sledgehammer_Crouch_Shove",
    "Consumable_Throw",
    "Consumable_Throw_Charge",
    "Consumable_Throw_Charge_Idle",
    "Fogrepeller_Throw",
    "Fogrepeller_Throw_Charge",
    "Fogrepeller_Throw_Charge_Idle",
    "Fogrepeller_Throw_Equip",
    "Pistol_Recoil",
    "Rifle_Recoil",
    "Stock_Pistol_1_reload",
    "Front_Revolver_1_reload",
    "Front_Revolver_2_Reload",
    "TerminalConsole_Idle",
    "Player_Climb_Ladder_Idle_A",
    "Player_Climb_Ladder_Down_A",
    "Player_Climb_Ladder_Up_A",
    "Revive",
    "Die",
    "Dead",
    "Player_Reviving_Upperbody_Loop",
    "Rifle1_Reload",
    "ConsumablePack_Idle",
    "Knife_Idle_0",
    "Knife_Jog_Forward",
    "Knife_Jog_Backward",
    "Knife_Jog_Right",
    "Knife_Jog_Left",
    "Knife_Jog_ForwardLeft",
    "Knife_Jog_ForwardRight",
    "Knife_Jog_BackwardLeft",
    "Knife_Jog_BackwardRight",
    "Knife_SprintFwdLoop",
    "Knife_Crouch_Idle",
    "Knife_Crouch_WalkLt",
    "Knife_Crouch_WalkRt",
    "Knife_Crouch_WalkFwd",
    "Knife_Crouch_WalkBwd",
    "Spear_Idle",
    "Spear_Jog_Forward",
    "Spear_Jog_Backward",
    "Spear_Jog_Right",
    "Spear_Jog_Left",
    "Spear_Jog_ForwardLeft",
    "Spear_Jog_ForwardRight",
    "Spear_Jog_BackwardLeft",
    "Spear_Jog_BackwardRight",
    "Spear_SprintFwdLoop",
    "Spear_Crouch_Idle",
    "Spear_Crouch_WalkLt",
    "Spear_Crouch_WalkRt",
    "Spear_Crouch_WalkFwd",
    "Spear_Crouch_WalkBwd",
    "Spear_Crouch_ChargeRelease",
    "Spear_Crouch_Charge",
    "Spear_Crouch_Shove",
    "Spear_Crouch_SwingRight",
    "Spear_Stand_ChargeRelease",
    "Spear_Stand_Charge",
    "Spear_Stand_ChargeIdle",
    "Spear_Stand_Shove",
    "Spear_Stand_SwingRight",
    "Bat_Crouch_ChargeRelease",
    "Bat_Crouch_Chargeup",
    "Bat_Crouch_Shove",
    "Bat_Crouch_SwingRight",
    "Bat_Stand_ChargeRelease",
    "Bat_Stand_Chargeup",
    "Bat_Stand_ChargeupIdle",
    "Bat_Stand_Shove",
    "Bat_Stand_SwingRight",
    "Knife_Crouch_ChargeRelease",
    "Knife_Crouch_Chargeup",
    "Knife_Crouch_SwingRight",
    "Knife_Stand_ChargeRelease",
    "Knife_Stand_Chargeup",
    "Knife_Stand_ChargeupIdle",
    "Knife_Stand_SwingRight",
    "Spear_Jump",
    "Spear_Land",
    "Spear_Fall",
    "Knife_Jump",
    "Knife_Land",
    "Knife_Fall",
] as const;
export type PlayerAnimationClips = typeof playerAnimationClipNames[number];
const playerAnimationClips = await loadAllClips(HumanJoints, playerAnimationClipNames);

const rifleStandMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Rifle_Jog_Forward, x: 0, y: 3.5 },
    { anim: playerAnimationClips.Rifle_Jog_Backward, x: 0, y: -3.5 },
    { anim: playerAnimationClips.Rifle_Jog_Right, x: 3.5, y: 0 },
    { anim: playerAnimationClips.Rifle_Jog_Left, x: -3.5, y: 0 },
    { anim: playerAnimationClips.Rifle_Jog_ForwardLeft, x: -2.56, y: 2.56 },
    { anim: playerAnimationClips.Rifle_Jog_ForwardRight, x: 2.56, y: 2.56 },
    { anim: playerAnimationClips.Rifle_Jog_BackwardRight, x: 2.56, y: -2.56 },
    { anim: playerAnimationClips.Rifle_Jog_BackwardLeft, x: -2.56, y: -2.56 },
    { anim: playerAnimationClips.Rifle_WalkFwdLoop, x: 0, y: 1.9 },
    { anim: playerAnimationClips.Rifle_WalkBwdLoop, x: 0, y: -1.8 },
    { anim: playerAnimationClips.Rifle_StrafeLeftLoop, x: -1.6, y: 0 },
    { anim: playerAnimationClips.Rifle_StrafeLeft45Loop, x: -1.16, y: 1.16 },
    { anim: playerAnimationClips.Rifle_StrafeLeft135Loop, x: -1.13, y: -1.13 },
    { anim: playerAnimationClips.Rifle_StrafeRightLoop, x: 2, y: 0 },
    { anim: playerAnimationClips.Rifle_StrafeRight45Loop, x: 1.37, y: 1.37 },
    { anim: playerAnimationClips.Rifle_StrafeRight135Loop, x: 1.16, y: -1.16 },
    { anim: playerAnimationClips.Rifle_Idle, x: 0, y: 0 },
    { anim: playerAnimationClips.Rifle_SprintFwdLoop, x: 0, y: 6 },
    { anim: playerAnimationClips.Rifle_RunBwdLoop, x: 0, y: -5 },
    { anim: playerAnimationClips.Rifle_StrafeRunRightLoop, x: 6.8, y: 0 },
    { anim: playerAnimationClips.Rifle_StrafeRun45RightLoop, x: 4.8, y: 4.8 },
    { anim: playerAnimationClips.Rifle_StrafeRun135LeftLoop_0, x: 4.34, y: -4.34 },
    { anim: playerAnimationClips.Rifle_StrafeRunLeftLoop, x: -6.8, y: 0 },
    { anim: playerAnimationClips.Rifle_StrafeRun45LeftLoop, x: -4.8, y: 4.8 },
    { anim: playerAnimationClips.Rifle_StrafeRun135LeftLoop, x: -4.9, y: -4.9 },
    { anim: playerAnimationClips.Rifle_SprintFwdLoop_Left, x: -1.25, y: 5.85 },
    { anim: playerAnimationClips.Rifle_SprintFwdLoop_Right, x: 1.25, y: 5.85 },
], animVelocity);

const rifleCrouchMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Rifle_Crouch_WalkBwd, x: 0, y: -2 },
    { anim: playerAnimationClips.Rifle_Crouch_WalkFwd, x: 0, y: 2 },
    { anim: playerAnimationClips.Rifle_Crouch_WalkLt, x: -2, y: 0 },
    { anim: playerAnimationClips.Rifle_Crouch_WalkRt, x: 2, y: 0 },
    { anim: playerAnimationClips.Rifle_CrouchLoop, x: 0, y: 0 },
], animVelocity);

const rifleMovement = new AnimBlend(HumanJoints, [
    { anim: rifleStandMovement, x: 0, y: 0 },
    { anim: rifleCrouchMovement, x: 1, y: 0 }
], animCrouch);

const pistolStandMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Pistol_Jog_Forward, x: 0, y: 3.5 },
    { anim: playerAnimationClips.Pistol_Jog_Backward, x: 0, y: -3.5 },
    { anim: playerAnimationClips.Pistol_Jog_Right, x: 3.5, y: 0 },
    { anim: playerAnimationClips.Pistol_Jog_Left, x: -3.5, y: 0 },
    { anim: playerAnimationClips.Pistol_Jog_ForwardLeft, x: -2.56, y: 2.56 },
    { anim: playerAnimationClips.Pistol_Jog_ForwardRight, x: 2.56, y: 2.56 },
    { anim: playerAnimationClips.Pistol_Jog_BackwardRight, x: 2.56, y: -2.56 },
    { anim: playerAnimationClips.Pistol_Jog_BackwardLeft, x: -2.56, y: -2.56 },
    { anim: playerAnimationClips.Pistol_WalkFwdLoop, x: 0, y: 1.9 },
    { anim: playerAnimationClips.Pistol_WalkBwdLoop, x: 0, y: -1.8 },
    { anim: playerAnimationClips.Pistol_StrafeLeftLoop, x: -1.6, y: 0 },
    { anim: playerAnimationClips.Pistol_StrafeLeft45Loop, x: -1.16, y: 1.16 },
    { anim: playerAnimationClips.Pistol_StrafeLeft135Loop, x: -1.13, y: -1.13 },
    { anim: playerAnimationClips.Pistol_StrafeRightLoop, x: 2, y: 0 },
    { anim: playerAnimationClips.Pistol_StrafeRight45Loop, x: 1.37, y: 1.37 },
    { anim: playerAnimationClips.Pistol_StrafeRight135Loop, x: 1.16, y: -1.16 },
    { anim: playerAnimationClips.Pistol_Idle, x: 0, y: 0 },
    { anim: playerAnimationClips.Pistol_RunBwdLoop, x: 0, y: -6.48 },
    { anim: playerAnimationClips.Pistol_SprintFwdLoop, x: 0, y: 6 },
    { anim: playerAnimationClips.Pistol_StrafeRunRightLoop, x: 6.48, y: 0 },
    { anim: playerAnimationClips.Pistol_StrafeRun45RightLoop, x: 4.64, y: 4.64 },
    { anim: playerAnimationClips.Pistol_StrafeRun135LeftLoop, x: 4.14, y: -4.14 },
    { anim: playerAnimationClips.Pistol_StrafeRunLeftLoop, x: -6.48, y: 0 },
    { anim: playerAnimationClips.Pistol_StrafeRun45LeftLoop, x: -4.58, y: 4.58 },
    { anim: playerAnimationClips.Pistol_StrafeRun135RightLoop, x: -4.34, y: -4.34 },
], animVelocity);

const pistolCrouchMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Pistol_Crouch_WalkBwd, x: 0, y: -2 },
    { anim: playerAnimationClips.Pistol_Crouch_WalkFwd, x: 0, y: 2 },
    { anim: playerAnimationClips.Pistol_Crouch_WalkLt, x: -2, y: 0 },
    { anim: playerAnimationClips.Pistol_Crouch_WalkRt, x: 2, y: 0 },
    { anim: playerAnimationClips.Pistol_CrouchLoop, x: 0, y: 0 },
], animVelocity);

const pistolMovement = new AnimBlend(HumanJoints, [
    { anim: pistolStandMovement, x: 0, y: 0 },
    { anim: pistolCrouchMovement, x: 1, y: 0 }
], animCrouch);

const defaultStandMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.RunFwdLoop, x: 0, y: 3.4 },
    { anim: playerAnimationClips.RunBwdLoop, x: 0, y: -2.1 },
    { anim: playerAnimationClips.RunRtLoop, x: 2.1, y: 0 },
    { anim: playerAnimationClips.RunLtLoop, x: -2.1, y: 0 },
    { anim: playerAnimationClips.RunStrafeRight45Loop, x: 2.4, y: 2.4 },
    { anim: playerAnimationClips.RunStrafeRight135Loop, x: 1.5, y: -1.5 },
    { anim: playerAnimationClips.RunStrafeLeft45Loop, x: -2.4, y: 2.4 },
    { anim: playerAnimationClips.RunStrafeLeft135Loop, x: -1.5, y: -1.5 },
    { anim: playerAnimationClips.WalkFwdLoop, x: 0, y: 1.5 },
    { anim: playerAnimationClips.WalkBwdLoop, x: 0, y: -1.5 },
    { anim: playerAnimationClips.StrafeRightLoop, x: -1.5, y: 0 },
    { anim: playerAnimationClips.StrafeRight45Loop, x: 1.12, y: 1.12 },
    { anim: playerAnimationClips.StrafeRight135Loop, x: 1.12, y: -1.12 },
    { anim: playerAnimationClips.StrafeLeftLoop, x: -1.56, y: 0 },
    { anim: playerAnimationClips.StrafeLeft45Loop, x: -1.12, y: 1.12 },
    { anim: playerAnimationClips.StrafeLeft135Loop, x: -1.12, y: -1.12 },
    { anim: playerAnimationClips.Idle_1, x: 0, y: 0 },
], animVelocity);

const defaultCrouchMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Crouch_WalkFwd_new, x: 0, y: 1.54 },
    { anim: playerAnimationClips.Crouch_WalkBwd_new, x: 0, y: -1.74 },
    { anim: playerAnimationClips.Crouch_WalkLt45_new, x: -1, y: 1 },
    { anim: playerAnimationClips.Crouch_WalkLt135_new, x: -1.2, y: -1.2 },
    { anim: playerAnimationClips.Crouch_WalkRt45_new, x: 1, y: 1 },
    { anim: playerAnimationClips.Crouch_WalkRt135_new, x: 1, y: -1 },
    { anim: playerAnimationClips.Crouch_WalkRt_new, x: 2, y: 0 },
    { anim: playerAnimationClips.Crouch_WalkLt_new, x: -2, y: 0 },
    { anim: playerAnimationClips.Crouch_Idle, x: 0, y: 0 },
], animVelocity);

const defaultMovement = new AnimBlend(HumanJoints, [
    { anim: defaultStandMovement, x: 0, y: 0 },
    { anim: defaultCrouchMovement, x: 1, y: 0 }
], animCrouch);

const ladderMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Player_Climb_Ladder_Up_A, x: 0, y: 0.5 },
    { anim: playerAnimationClips.Player_Climb_Ladder_Idle_A, x: 0, y: 0 },
    { anim: playerAnimationClips.Player_Climb_Ladder_Down_A, x: 0, y: -0.5 },
], animVelocity);

const hammerStandMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.SledgeHammer_Jog_Forward, x: 0, y: 3.5 },
    { anim: playerAnimationClips.SledgeHammer_Jog_Backward, x: 0, y: -3.5},
    { anim: playerAnimationClips.SledgeHammer_Jog_Right, x: 3.5, y: 0 },
    { anim: playerAnimationClips.SledgeHammer_Jog_Left, x: -3.5, y: 0 },
    { anim: playerAnimationClips.SledgeHammer_Jog_ForwardLeft, x: -2.56, y: 2.56 },
    { anim: playerAnimationClips.SledgeHammer_Jog_ForwardRight, x: 2.56, y: 2.56 },
    { anim: playerAnimationClips.SledgeHammer_Jog_BackwardLeft, x: -2.56, y: -2.56 },
    { anim: playerAnimationClips.SledgeHammer_Jog_BackwardRight, x: 2.56, y: -2.56 },
    { anim: playerAnimationClips.SledgeHammer_SprintFwdLoop, x: 0, y: 6 },
    { anim: playerAnimationClips.Player_Melee_Movement_Walk_Fwd_Stand_A, x: 0, y: 1.8 },
    { anim: playerAnimationClips.Player_Melee_Movement_Walk_Bwd_Stand_A, x: 0, y: -1.8 },
    { anim: playerAnimationClips.Player_Melee_Movement_Walk_Right_Stand_A, x: 1.8, y: 0 },
    { anim: playerAnimationClips.Player_Melee_Movement_Walk_Left_Stand_A, x: -1.8, y: 0 },
    { anim: playerAnimationClips.Player_Melee_Movement_Walk_Fwd_Left_Stand_A, x: -1.2, y: 1.2 },
    { anim: playerAnimationClips.Player_Melee_Movement_Walk_Fwd_Right_Stand_A, x: 1.2, y: 1.2 },
    { anim: playerAnimationClips.Player_Melee_Movement_Walk_Bwd_Left_Stand_A, x: -1.2, y: -1.2 },
    { anim: playerAnimationClips.Player_Melee_Movement_Walk_Bwd_Right_Stand_A, x: 1.2, y: -1.2 },
    { anim: playerAnimationClips.Sledgehammer_Stand_Idle, x: 0, y: 0 },
], animVelocity);

const hammerCrouchMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.SledgeHammer_Crouch_WalkBwd, x: 0, y: -2 },
    { anim: playerAnimationClips.SledgeHammer_Crouch_WalkFwd, x: 0, y: 2 },
    { anim: playerAnimationClips.SledgeHammer_Crouch_WalkLt, x: -2, y: 0 },
    { anim: playerAnimationClips.SledgeHammer_Crouch_WalkRt, x: 2, y: 0 },
    { anim: playerAnimationClips.Sledgehammer_Crouch_Idle, x: 0, y: 0 },
], animVelocity);

const hammerMovement = new AnimBlend(HumanJoints, [
    { anim: hammerStandMovement, x: 0, y: 0 },
    { anim: hammerCrouchMovement, x: 1, y: 0 }
], animCrouch);

const hammerCharge = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Sledgehammer_Stand_SwingLeft_Charge, x: 0, y: 0 },
    { anim: playerAnimationClips.Sledgehammer_Crouch_SwingLeft_Charge, x: 1, y: 0 }
], animCrouch);

const hammerChargeIdle = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Sledgehammer_Stand_SwingLeft_Charge_Idle, x: 0, y: 0 },
    { anim: playerAnimationClips.Sledgehammer_Stand_SwingLeft_Charge_Idle, x: 1, y: 0 }
], animCrouch);

const hammerRelease = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Sledgehammer_Stand_SwingLeft_Charge_Release, x: 0, y: 0 },
    { anim: playerAnimationClips.Sledgehammer_Stand_SwingLeft_Charge_Release, x: 1, y: 0 }
], animCrouch);

const hammerSwing = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Sledgehammer_Stand_SwingLeft_Charge_Release, x: 0, y: 0 },
    { anim: playerAnimationClips.Sledgehammer_Stand_SwingLeft_Charge_Release, x: 1, y: 0 }
], animCrouch);

const hammerShove = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Sledgehammer_Stand_Shove, x: 0, y: 0 },
    { anim: playerAnimationClips.Sledgehammer_Crouch_Shove, x: 1, y: 0 }
], animCrouch);

const knifeStandMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Knife_SprintFwdLoop, x: 0, y: 6 },
    { anim: playerAnimationClips.Knife_Jog_BackwardLeft, x: -2.56, y: -2.56 },
    { anim: playerAnimationClips.Knife_Jog_BackwardRight, x: 2.56, y: -2.56 },
    { anim: playerAnimationClips.Knife_Jog_ForwardLeft, x: -2.56, y: 2.56 },
    { anim: playerAnimationClips.Knife_Jog_ForwardRight, x: 2.56, y: 2.56 },
    { anim: playerAnimationClips.Knife_Jog_Left, x: -3.5, y: 0 },
    { anim: playerAnimationClips.Knife_Jog_Right, x: 3.5, y: 0 },
    { anim: playerAnimationClips.Knife_Jog_Backward, x: 0, y: -3.5 },
    { anim: playerAnimationClips.Knife_Jog_Forward, x: 0, y: 3.5 },
    { anim: playerAnimationClips.Knife_Idle_0, x: 0, y: 0 },
], animVelocity);

const knifeCrouchMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Knife_Crouch_WalkBwd, x: 0, y: -2 },
    { anim: playerAnimationClips.Knife_Crouch_WalkFwd, x: 0, y: 2 },
    { anim: playerAnimationClips.Knife_Crouch_WalkLt, x: -2, y: 0 },
    { anim: playerAnimationClips.Knife_Crouch_WalkRt, x: 2, y: 0 },
    { anim: playerAnimationClips.Knife_Crouch_Idle, x: 0, y: 0 },
], animVelocity);

const knifeMovement = new AnimBlend(HumanJoints, [
    { anim: knifeStandMovement, x: 0, y: 0 },
    { anim: knifeCrouchMovement, x: 1, y: 0 }
], animCrouch);

const knifeCharge = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Knife_Stand_Chargeup, x: 0, y: 0 },
    { anim: playerAnimationClips.Knife_Crouch_Chargeup, x: 1, y: 0 }
], animCrouch);

const knifeChargeIdle = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Knife_Stand_ChargeupIdle, x: 0, y: 0 },
    { anim: playerAnimationClips.Knife_Stand_ChargeupIdle, x: 1, y: 0 }
], animCrouch);

const knifeRelease = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Knife_Stand_ChargeRelease, x: 0, y: 0 },
    { anim: playerAnimationClips.Knife_Crouch_ChargeRelease, x: 1, y: 0 }
], animCrouch);

const knifeSwing = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Knife_Stand_SwingRight, x: 0, y: 0 },
    { anim: playerAnimationClips.Knife_Crouch_SwingRight, x: 1, y: 0 }
], animCrouch);

const knifeShove = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Bat_Stand_Shove, x: 0, y: 0 },
    { anim: playerAnimationClips.Bat_Crouch_Shove, x: 1, y: 0 }
], animCrouch);

const spearStandMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Spear_SprintFwdLoop, x: 0, y: 6 },
    { anim: playerAnimationClips.Spear_Jog_BackwardLeft, x: -2.56, y: -2.56 },
    { anim: playerAnimationClips.Spear_Jog_BackwardRight, x: 2.56, y: -2.56 },
    { anim: playerAnimationClips.Spear_Jog_ForwardLeft, x: -2.56, y: 2.56 },
    { anim: playerAnimationClips.Spear_Jog_ForwardRight, x: 2.56, y: 2.56 },
    { anim: playerAnimationClips.Spear_Jog_Left, x: -3.5, y: 0 },
    { anim: playerAnimationClips.Spear_Jog_Right, x: 3.5, y: 0 },
    { anim: playerAnimationClips.Spear_Jog_Backward, x: 0, y: -3.5 },
    { anim: playerAnimationClips.Spear_Jog_Forward, x: 0, y: 3.5 },
    { anim: playerAnimationClips.Spear_Idle, x: 0, y: 0 },
], animVelocity);

const spearCrouchMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Spear_Crouch_WalkBwd, x: 0, y: -2 },
    { anim: playerAnimationClips.Spear_Crouch_WalkFwd, x: 0, y: 2 },
    { anim: playerAnimationClips.Spear_Crouch_WalkLt, x: -2, y: 0 },
    { anim: playerAnimationClips.Spear_Crouch_WalkRt, x: 2, y: 0 },
    { anim: playerAnimationClips.Spear_Crouch_Idle, x: 0, y: 0 },
], animVelocity);

const spearMovement = new AnimBlend(HumanJoints, [
    { anim: spearStandMovement, x: 0, y: 0 },
    { anim: spearCrouchMovement, x: 1, y: 0 }
], animCrouch);

const spearCharge = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Spear_Stand_Charge, x: 0, y: 0 },
    { anim: playerAnimationClips.Spear_Crouch_Charge, x: 1, y: 0 }
], animCrouch);

const spearChargeIdle = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Spear_Stand_ChargeIdle, x: 0, y: 0 },
    { anim: playerAnimationClips.Spear_Stand_ChargeIdle, x: 1, y: 0 }
], animCrouch);

const spearRelease = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Spear_Stand_ChargeRelease, x: 0, y: 0 },
    { anim: playerAnimationClips.Spear_Crouch_ChargeRelease, x: 1, y: 0 }
], animCrouch);

const spearSwing = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Spear_Stand_SwingRight, x: 0, y: 0 },
    { anim: playerAnimationClips.Spear_Crouch_SwingRight, x: 1, y: 0 }
], animCrouch);

const spearShove = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Bat_Stand_Shove, x: 0, y: 0 },
    { anim: playerAnimationClips.Bat_Crouch_Shove, x: 1, y: 0 }
], animCrouch);

const batStandMovement = knifeStandMovement;
const batCrouchMovement = knifeCrouchMovement;
const batMovement = knifeMovement;

const batCharge = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Bat_Stand_Chargeup, x: 0, y: 0 },
    { anim: playerAnimationClips.Bat_Crouch_Chargeup, x: 1, y: 0 }
], animCrouch);

const batChargeIdle = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Bat_Stand_ChargeupIdle, x: 0, y: 0 },
    { anim: playerAnimationClips.Bat_Stand_ChargeupIdle, x: 1, y: 0 }
], animCrouch);

const batRelease = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Bat_Stand_ChargeRelease, x: 0, y: 0 },
    { anim: playerAnimationClips.Bat_Crouch_ChargeRelease, x: 1, y: 0 }
], animCrouch);

const batSwing = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Bat_Stand_SwingRight, x: 0, y: 0 },
    { anim: playerAnimationClips.Bat_Crouch_SwingRight, x: 1, y: 0 }
], animCrouch);

const batShove = knifeShove;

const playerAnimations = {
    rifleStandMovement,
    rifleCrouchMovement,
    rifleMovement,
    pistolStandMovement,
    pistolCrouchMovement,
    pistolMovement,
    hammerStandMovement,
    hammerCrouchMovement,
    hammerMovement,
    knifeStandMovement,
    knifeCrouchMovement,
    knifeMovement,
    knifeCharge,
    knifeChargeIdle,
    knifeRelease,
    knifeSwing,
    knifeShove,
    spearStandMovement,
    spearCrouchMovement,
    spearMovement,
    spearCharge,
    spearChargeIdle,
    spearRelease,
    spearSwing,
    spearShove,
    batStandMovement,
    batCrouchMovement,
    batMovement,
    batCharge,
    batChargeIdle,
    batRelease,
    batSwing,
    batShove,
    defaultStandMovement,
    defaultCrouchMovement,
    defaultMovement,
    hammerCharge,
    hammerChargeIdle,
    hammerRelease,
    hammerSwing,
    hammerShove,
    ladderMovement
} as const;
export type PlayerAnimations = keyof typeof playerAnimations;

for (const [key, anim] of [...Object.entries(playerAnimations), ...Object.entries(playerAnimationClips)]) {
    if (PlayerAnimDatablock.has(key as any)) throw new Error(`Duplicate clip '${key}' being loaded.`);
    PlayerAnimDatablock.set(key as any, anim);
}