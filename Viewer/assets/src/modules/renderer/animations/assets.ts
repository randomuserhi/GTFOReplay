import { Anim, AnimBlend, mergeAnims, ScaledAnim } from "./animation.js";
import { GearFoldJoints } from "./gearfold.js";
import { HumanJoints } from "./human.js";
import { loadAnimFromJson } from "./loaders.js";

async function loadAllClips<T extends string = string, Joints extends string = string>(joints: ReadonlyArray<Joints>, clips: ReadonlyArray<T> | T[]): Promise<Record<T, Anim<Joints>>> {
    const collection: Record<T, Anim<Joints>> = {} as any;
    for (const clip of clips) {
        collection[clip] = await loadAnimFromJson(joints, `../js3party/animations/${clip}.json`);
    }
    return collection;
}

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
export type PlayerAnimationClip = typeof playerAnimationClipNames[number];
export const playerAnimationClips = await loadAllClips(HumanJoints, playerAnimationClipNames);

export const animVelocity = {
    x: 0,
    y: 0
};

export const animCrouch = {
    x: 0,
    y: 0
};

export const rifleStandMovement = new AnimBlend(HumanJoints, [
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

export const rifleCrouchMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Rifle_Crouch_WalkBwd, x: 0, y: -2 },
    { anim: playerAnimationClips.Rifle_Crouch_WalkFwd, x: 0, y: 2 },
    { anim: playerAnimationClips.Rifle_Crouch_WalkLt, x: -2, y: 0 },
    { anim: playerAnimationClips.Rifle_Crouch_WalkRt, x: 2, y: 0 },
    { anim: playerAnimationClips.Rifle_CrouchLoop, x: 0, y: 0 },
], animVelocity);

export const rifleMovement = new AnimBlend(HumanJoints, [
    { anim: rifleStandMovement, x: 0, y: 0 },
    { anim: rifleCrouchMovement, x: 1, y: 0 }
], animCrouch);

export const pistolStandMovement = new AnimBlend(HumanJoints, [
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

export const pistolCrouchMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Pistol_Crouch_WalkBwd, x: 0, y: -2 },
    { anim: playerAnimationClips.Pistol_Crouch_WalkFwd, x: 0, y: 2 },
    { anim: playerAnimationClips.Pistol_Crouch_WalkLt, x: -2, y: 0 },
    { anim: playerAnimationClips.Pistol_Crouch_WalkRt, x: 2, y: 0 },
    { anim: playerAnimationClips.Pistol_CrouchLoop, x: 0, y: 0 },
], animVelocity);

export const pistolMovement = new AnimBlend(HumanJoints, [
    { anim: pistolStandMovement, x: 0, y: 0 },
    { anim: pistolCrouchMovement, x: 1, y: 0 }
], animCrouch);

export const defaultStandMovement = new AnimBlend(HumanJoints, [
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

export const defaultCrouchMovement = new AnimBlend(HumanJoints, [
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

export const defaultMovement = new AnimBlend(HumanJoints, [
    { anim: defaultStandMovement, x: 0, y: 0 },
    { anim: defaultCrouchMovement, x: 1, y: 0 }
], animCrouch);

export const ladderMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Player_Climb_Ladder_Up_A, x: 0, y: 0.5 },
    { anim: playerAnimationClips.Player_Climb_Ladder_Idle_A, x: 0, y: 0 },
    { anim: playerAnimationClips.Player_Climb_Ladder_Down_A, x: 0, y: -0.5 },
], animVelocity);

export const hammerStandMovement = new AnimBlend(HumanJoints, [
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

export const hammerCrouchMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.SledgeHammer_Crouch_WalkBwd, x: 0, y: -2 },
    { anim: playerAnimationClips.SledgeHammer_Crouch_WalkFwd, x: 0, y: 2 },
    { anim: playerAnimationClips.SledgeHammer_Crouch_WalkLt, x: -2, y: 0 },
    { anim: playerAnimationClips.SledgeHammer_Crouch_WalkRt, x: 2, y: 0 },
    { anim: playerAnimationClips.Sledgehammer_Crouch_Idle, x: 0, y: 0 },
], animVelocity);

export const hammerMovement = new AnimBlend(HumanJoints, [
    { anim: hammerStandMovement, x: 0, y: 0 },
    { anim: hammerCrouchMovement, x: 1, y: 0 }
], animCrouch);

export const hammerCharge = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Sledgehammer_Stand_SwingLeft_Charge, x: 0, y: 0 },
    { anim: playerAnimationClips.Sledgehammer_Crouch_SwingLeft_Charge, x: 1, y: 0 }
], animCrouch);

export const hammerChargeIdle = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Sledgehammer_Stand_SwingLeft_Charge_Idle, x: 0, y: 0 },
    { anim: playerAnimationClips.Sledgehammer_Stand_SwingLeft_Charge_Idle, x: 1, y: 0 }
], animCrouch);

export const hammerRelease = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Sledgehammer_Stand_SwingLeft_Charge_Release, x: 0, y: 0 },
    { anim: playerAnimationClips.Sledgehammer_Stand_SwingLeft_Charge_Release, x: 1, y: 0 }
], animCrouch);

export const hammerSwing = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Sledgehammer_Stand_SwingLeft_Charge_Release, x: 0, y: 0 },
    { anim: playerAnimationClips.Sledgehammer_Stand_SwingLeft_Charge_Release, x: 1, y: 0 }
], animCrouch);

export const hammerShove = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Sledgehammer_Stand_Shove, x: 0, y: 0 },
    { anim: playerAnimationClips.Sledgehammer_Crouch_Shove, x: 1, y: 0 }
], animCrouch);

export const knifeStandMovement = new AnimBlend(HumanJoints, [
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

export const knifeCrouchMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Knife_Crouch_WalkBwd, x: 0, y: -2 },
    { anim: playerAnimationClips.Knife_Crouch_WalkFwd, x: 0, y: 2 },
    { anim: playerAnimationClips.Knife_Crouch_WalkLt, x: -2, y: 0 },
    { anim: playerAnimationClips.Knife_Crouch_WalkRt, x: 2, y: 0 },
    { anim: playerAnimationClips.Knife_Crouch_Idle, x: 0, y: 0 },
], animVelocity);

export const knifeMovement = new AnimBlend(HumanJoints, [
    { anim: knifeStandMovement, x: 0, y: 0 },
    { anim: knifeCrouchMovement, x: 1, y: 0 }
], animCrouch);

export const knifeCharge = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Knife_Stand_Chargeup, x: 0, y: 0 },
    { anim: playerAnimationClips.Knife_Crouch_Chargeup, x: 1, y: 0 }
], animCrouch);

export const knifeChargeIdle = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Knife_Stand_ChargeupIdle, x: 0, y: 0 },
    { anim: playerAnimationClips.Knife_Stand_ChargeupIdle, x: 1, y: 0 }
], animCrouch);

export const knifeRelease = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Knife_Stand_ChargeRelease, x: 0, y: 0 },
    { anim: playerAnimationClips.Knife_Crouch_ChargeRelease, x: 1, y: 0 }
], animCrouch);

export const knifeSwing = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Knife_Stand_SwingRight, x: 0, y: 0 },
    { anim: playerAnimationClips.Knife_Crouch_SwingRight, x: 1, y: 0 }
], animCrouch);

export const knifeShove = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Bat_Stand_Shove, x: 0, y: 0 },
    { anim: playerAnimationClips.Bat_Crouch_Shove, x: 1, y: 0 }
], animCrouch);

export const spearStandMovement = new AnimBlend(HumanJoints, [
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

export const spearCrouchMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Spear_Crouch_WalkBwd, x: 0, y: -2 },
    { anim: playerAnimationClips.Spear_Crouch_WalkFwd, x: 0, y: 2 },
    { anim: playerAnimationClips.Spear_Crouch_WalkLt, x: -2, y: 0 },
    { anim: playerAnimationClips.Spear_Crouch_WalkRt, x: 2, y: 0 },
    { anim: playerAnimationClips.Spear_Crouch_Idle, x: 0, y: 0 },
], animVelocity);

export const spearMovement = new AnimBlend(HumanJoints, [
    { anim: spearStandMovement, x: 0, y: 0 },
    { anim: spearCrouchMovement, x: 1, y: 0 }
], animCrouch);

export const spearCharge = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Spear_Stand_Charge, x: 0, y: 0 },
    { anim: playerAnimationClips.Spear_Crouch_Charge, x: 1, y: 0 }
], animCrouch);

export const spearChargeIdle = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Spear_Stand_ChargeIdle, x: 0, y: 0 },
    { anim: playerAnimationClips.Spear_Stand_ChargeIdle, x: 1, y: 0 }
], animCrouch);

export const spearRelease = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Spear_Stand_ChargeRelease, x: 0, y: 0 },
    { anim: playerAnimationClips.Spear_Crouch_ChargeRelease, x: 1, y: 0 }
], animCrouch);

export const spearSwing = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Spear_Stand_SwingRight, x: 0, y: 0 },
    { anim: playerAnimationClips.Spear_Crouch_SwingRight, x: 1, y: 0 }
], animCrouch);

export const spearShove = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Bat_Stand_Shove, x: 0, y: 0 },
    { anim: playerAnimationClips.Bat_Crouch_Shove, x: 1, y: 0 }
], animCrouch);

export const batStandMovement = knifeStandMovement;
export const batCrouchMovement = knifeCrouchMovement;
export const batMovement = knifeMovement;

export const batCharge = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Bat_Stand_Chargeup, x: 0, y: 0 },
    { anim: playerAnimationClips.Bat_Crouch_Chargeup, x: 1, y: 0 }
], animCrouch);

export const batChargeIdle = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Bat_Stand_ChargeupIdle, x: 0, y: 0 },
    { anim: playerAnimationClips.Bat_Stand_ChargeupIdle, x: 1, y: 0 }
], animCrouch);

export const batRelease = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Bat_Stand_ChargeRelease, x: 0, y: 0 },
    { anim: playerAnimationClips.Bat_Crouch_ChargeRelease, x: 1, y: 0 }
], animCrouch);

export const batSwing = new AnimBlend(HumanJoints, [
    { anim: playerAnimationClips.Bat_Stand_SwingRight, x: 0, y: 0 },
    { anim: playerAnimationClips.Bat_Crouch_SwingRight, x: 1, y: 0 }
], animCrouch);

export const batShove = knifeShove;

export const playerAnimations = {
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
export type PlayerAnimation = keyof typeof playerAnimations;

const gearFoldAnimationNames = [
    "Revolver_Front_1_Reload_1",
    "Front_Revolver_2_Reload_0",
    "Stock_Pistol_1_reload_1",
    "SMG_Front_4_Reload_1",
    "Front_AutoShotgun_1_animation_reload_0",
    "Front_AutoShotgun_2_Parts_Reload",
    "Front_AutoShotgun_3_reload_0",
    "Front_Precision_1_reload_1",
    "Front_Precision_2_reload_1",
    "Front_Precision_3_Parts_Reload",
    "Front_Shotgun_1_animation_reload_1",
    "Front_Shotgun_3_reload_0",
] as const;
export type GearFoldAnimation = typeof gearFoldAnimationNames[number];
export const gearFoldAnimations = await loadAllClips(GearFoldJoints, gearFoldAnimationNames);

const enemyAnimationClipNames = [
    "RU_Walk_Bwd",
    "RU_Walk_Fwd",
    "RU_Walk_Lt",
    "RU_Walk_Rt",
    "RU_Run_Bwd",
    "RU_Run_Fwd",
    "RU_Run_Lt",
    "RU_Run_Rt",
    "Idle_Active",
    "LO_Walk_Bwd_A",
    "LO_Walk_Fwd_A",
    "LO_Walk_Lt_A",
    "LO_Walk_Rt_A",
    "LO_Run_Bwd_A",
    "LO_Run_Fwd_A",
    "LO_Run_Lt_A",
    "LO_Run_Rt_A",
    "LO_Idle_A",
    "FD_Walk_Bwd_A",
    "FD_Walk_Fwd_A",
    "FD_Walk_Lt_B",
    "FD_Walk_Rt_A",
    "FD_Run_Bwd_A",
    "FD_Run_Fwd_A",
    "FD_Run_Lt_A",
    "FD_Run_Rt_A",
    "FD_Idle_A",
    "CA_Walk_Bwd_A",
    "CA_Walk_Fwd_A",
    "CA_Walk_Lt_A",
    "CA_Walk_Rt_A",
    "CA_Idle_A",
    "CF_Walk_Bwd_A",
    "CF_Walk_Fwd_A",
    "CF_Walk_Lt_A",
    "CF_Walk_Rt_A",
    "CF_Idle_A",
    "CR_Walk_Bwd",
    "CR_Walk_Fwd",
    "CR_Walk_Lt",
    "CR_Walk_Rt",
    "CR_Run_Bwd",
    "CR_Run_Fwd",
    "CR_Run_Lt",
    "CR_Run_Rt",
    "CR_Idle_A",
    "Enemy_Big_Idle_A",
    "Enemy_Big_Run_Bwd_A",
    "Enemy_Big_Run_Bwd_Left_A",
    "Enemy_Big_Run_Bwd_Right_A",
    "Enemy_Big_Run_Fwd_A",
    "Enemy_Big_Run_Fwd_Left_A",
    "Enemy_Big_Run_Fwd_Right_A",
    "Enemy_Big_Run_Left_A",
    "Enemy_Big_Run_Right_A",
    "Enemy_Big_Walk_Bwd_A",
    "Enemy_Big_Walk_Bwd_Left_A",
    "Enemy_Big_Walk_Bwd_Right_A",
    "Enemy_Big_Walk_Fwd_A",
    "Enemy_Big_Walk_Fwd_Left_A",
    "Enemy_Big_Walk_Fwd_Right_A",
    "Enemy_Big_Walk_Left_A",
    "Enemy_Big_Walk_Right_A",
    "Monster_Walk_Bwd",
    "Monster_Walk_Fwd",
    "Monster_Walk_Left",
    "Monster_Walk_Left_135",
    "Monster_Walk_Left_45",
    "Monster_Walk_Right",
    "Monster_Walk_Right_135",
    "Monster_Walk_Right_45",
    "Monster_Idle_01",
    "PO_WalkBwd",
    "PO_WalkFwd",
    "PO_WalkLeft",
    "PO_WalkRight",
    "PO_JogBwd",
    "PO_JogFwd",
    "PO_JogLeft",
    "PO_JogRight",
    "PO_RunFwd",
    "PO_IdleCombat",
    "LO_Ability_Fire_In_A",
    "LO_Ability_Fire_In_B",
    "LO_Ability_Fire_In_C",
    "CA_Ability_Fire_In_A",
    "CA_Ability_Fire_In_B",
    "CF_Ability_Fire_In_A",
    "CF_Ability_Fire_In_B",
    "FD_Ability_Fire_In_A",
    "FD_Ability_Fire_In_B",
    "CR_Ability_Fire_In_A",
    "CR_Ability_Fire_In_B",
    "CR_Ability_Fire_In_C",
    "Ability_Fire_0_Start",
    "Ability_Fire_2_Start",
    "Enemy_Big_Fire_In_A",
    "Enemy_Big_Fire_In_B",
    "Monster_TentacleStart",
    "RU_Hit_Heavy_Bwd_A",
    "RU_Hit_Heavy_Bwd_B",
    "RU_Hit_Heavy_Bwd_C",
    "RU_Hit_Heavy_Bwd_Turn_A",
    "RU_Hit_Heavy_Fwd_A",
    "RU_Hit_Heavy_Fwd_B",
    "RU_Hit_Heavy_Fwd_C",
    "RU_Hit_Heavy_Lt_A",
    "RU_Hit_Heavy_Lt_B",
    "RU_Hit_Heavy_Lt_C",
    "RU_Hit_Heavy_Rt_A",
    "RU_Hit_Heavy_Rt_B",
    "RU_Hit_Heavy_Rt_C",
    "RU_Hit_Light_Bwd_A",
    "RU_Hit_Light_Bwd_B",
    "RU_Hit_Light_Bwd_C",
    "RU_Hit_Light_Fwd_A",
    "RU_Hit_Light_Fwd_B",
    "RU_Hit_Light_Fwd_C",
    "RU_Hit_Light_Lt_A",
    "RU_Hit_Light_Lt_B",
    "RU_Hit_Light_Lt_C",
    "RU_Hit_Light_Rt_A",
    "RU_Hit_Light_Rt_B",
    "RU_Hit_Light_Rt_C",
    "LO_Hit_Heavy_Bwd_A",
    "LO_Hit_Heavy_Fwd_A",
    "LO_Hit_Heavy_Fwd_B",
    "LO_Hit_Heavy_Fwd_C",
    "LO_Hit_Heavy_Lt_A",
    "LO_Hit_Heavy_Lt_B",
    "LO_Hit_Heavy_Lt_C",
    "LO_Hit_Heavy_Rt_A",
    "LO_Hit_Heavy_Rt_B",
    "LO_Hit_Heavy_Rt_C",
    "LO_Hit_Light_Bwd_A",
    "LO_Hit_Light_Bwd_b",
    "LO_Hit_Light_Bwd_C",
    "LO_Hit_Light_Bwd_Turn_A",
    "LO_Hit_Light_Fwd_A",
    "LO_Hit_Light_Fwd_B",
    "LO_Hit_Light_Fwd_C",
    "LO_Hit_Light_Lt_A",
    "LO_Hit_Light_Lt_B",
    "LO_Hit_Light_Lt_C",
    "LO_Hit_Light_Rt_A",
    "LO_Hit_Light_Rt_B",
    "LO_Hit_Light_Rt_C",
    "LO_Hit_Light_Rt_D",
    "CR_Hit_Heavy_Bwd_A_Turn",
    "CR_Hit_Heavy_Bwd_B",
    "CR_Hit_Heavy_Bwd_C_Turn",
    "CR_Hit_Heavy_Bwd_D_0",
    "CR_Hit_Heavy_Bwd_D",
    "CR_Hit_Heavy_Fwd_A",
    "CR_Hit_Heavy_Fwd_B",
    "CR_Hit_Heavy_Fwd_C",
    "CR_Hit_Heavy_Lt_A",
    "CR_Hit_Heavy_Lt_B",
    "CR_Hit_Heavy_Lt_C",
    "CR_Hit_Heavy_Rt_A",
    "CR_Hit_Heavy_Rt_B",
    "CR_Hit_Heavy_Rt_C",
    "CR_Hit_Heavy_Rt_C_0",
    "CR_Hit_Light_Bwd_A",
    "CR_Hit_Light_Bwd_B",
    "CR_Hit_Light_Bwd_C",
    "CR_Hit_Light_Bwd_D",
    "CR_Hit_Light_Fwd_A",
    "CR_Hit_Light_Fwd_B",
    "CR_Hit_Light_Fwd_C",
    "CR_Hit_Light_Lt_A",
    "CR_Hit_Light_Lt_B",
    "CR_Hit_Light_Lt_C",
    "CR_Hit_Light_Rt_A",
    "CR_Hit_Light_Rt_B",
    "CR_Hit_Light_Rt_C",
    "FD_Hit_Heavy_Bwd_A",
    "FD_Hit_Heavy_Bwd_B",
    "FD_Hit_Heavy_Bwd_C",
    "FD_Hit_Heavy_Fwd_A",
    "FD_Hit_Heavy_Fwd_B",
    "FD_Hit_Heavy_Fwd_C",
    "FD_Hit_Heavy_Lt_A",
    "FD_Hit_Heavy_Lt_B",
    "FD_Hit_Heavy_Lt_C",
    "FD_Hit_Heavy_Rt_A",
    "FD_Hit_Heavy_Rt_B",
    "FD_Hit_Heavy_Rt_C",
    "FD_Hit_Light_Bwd_A",
    "FD_Hit_Light_Bwd_B",
    "FD_Hit_Light_Bwd_C",
    "FD_Hit_Light_Fwd_A",
    "FD_Hit_Light_Fwd_B",
    "FD_Hit_Light_Fwd_C",
    "FD_Hit_Light_Lt_A",
    "FD_Hit_Light_Lt_B",
    "FD_Hit_Light_Lt_C",
    "FD_Hit_Light_Rt_A",
    "FD_Hit_Light_Rt_B",
    "FD_Hit_Light_Rt_C",
    "CA_Hit_Heavy_Bwd_A",
    "CA_Hit_Heavy_Fwd_B",
    "CA_Hit_Heavy_Fwd_C",
    "CA_Hit_Heavy_Lt_A",
    "CA_Hit_Heavy_Lt_B",
    "CA_Hit_Heavy_Rt_A",
    "CA_Hit_Heavy_Rt_B",
    "CA_Hit_Light_Bwd_A",
    "CA_Hit_Light_Bwd_B",
    "CA_Hit_Light_Fwd_A",
    "CA_Hit_Light_Fwd_B",
    "CA_Hit_Light_Lt_A",
    "CA_Hit_Light_Lt_B",
    "CA_Hit_Light_Rt_A",
    "CA_Hit_Light_Rt_B",
    "CF_Hit_Light_A",
    "CF_Hit_Light_B",
    "Enemy_Big_Hit_Back_A",
    "Enemy_Big_Hit_Back_B",
    "Enemy_Big_Hit_Front_A",
    "Enemy_Big_Hit_Front_B",
    "Enemy_Big_Hit_Left_A",
    "Enemy_Big_Hit_Left_B",
    "Enemy_Big_Hit_Right_A",
    "Enemy_Big_Hit_Right_B",
    "Monster_Hit_Back_01",
    "Monster_Hit_Back_02",
    "Monster_Hit_Back_04",
    "Monster_Hit_Front_01",
    "Monster_Hit_Front_02",
    "Monster_Hit_Front_03",
    "Monster_Hit_Front_04",
    "Monster_Hit_Leg_01",
    "Monster_Hit_Leg_02",
    "Monster_Hit_Leg_03",
    "Monster_Hit_Right_01",
    "Melee_Sequence_Fwd",
    "RU_Melee_Sequence_A",
    "Monster_Attack_06_shortened",
    "Monster_Attack_180_L",
    "RU_Jump_In",
    "RU_Jump_Air_TimeBlend",
    "RU_Jump_Out",
    "CA_Jump_Start",
    "CA_Jump_Air",
    "CA_Jump_Land",
    "CR_Jump_Start",
    "CR_Jump_Air",
    "CR_Jump_Land",
    "CF_Jump_Start",
    "CF_Jump_Air",
    "CF_Jump_Land",
    "FD_Jump_Start",
    "FD_Jump_Air",
    "FD_Jump_Land",
    "LO_Jump_Start",
    "LO_Jump_Air",
    "LO_Jump_Land",
    "Enemy_Big_Jump_Start_A",
    "Enemy_Big_Jump_Loop_A",
    "Enemy_Big_Jump_Land_A",
    "Giant_Jump_Start",
    "Monster_Fall_Landing_01",
    "RU_Scream_A",
    "RU_Scream_B",
    "RU_Scream_C",
    "CA_Scream_A",
    "CA_Scream_B",
    "CR_Scream_A",
    "CR_Scream_B",
    "CR_Scream_C",
    "CF_Scream",
    "FD_Scream_A",
    "FD_Scream_B",
    "FD_Scream_C",
    "Monster_Taunt_01",
    "LO_Scream_A",
    "LO_Scream_B",
    "LO_Scream_C",
    "Enemy_Big_Detect_Front_A",
    "Enemy_Big_Detect_Front_B",
    "Enemy_Big_Hibernate_In_A",
    "Enemy_Big_Hibernate_Loop_A",
    "CA_Hibernate_In",
    "CA_Hibernate_Detect_Loop",
    "CA_Hibernate_Loop_A",
    "CR_Hibernate_In",
    "CR_Hibernate_Detect_Loop",
    "CR_Hibernate_Loop",
    "CF_Hibernate_In",
    "CF_Hibernate_Detect_Loop",
    "CF_Hibernate_Loop_A",
    "FD_Hibernate_In",
    "FD_Hibernate_Detect_Loop",
    "FD_Hibernate_Loop",
    "LO_Hibernate_In_A",
    "LO_Hibernate_Detect_Loop",
    "LO_Hibernate_Loop",
    "RU_Hibernate_In",
    "Ru_Hibernate_Detect_Loop_0",
    "RU_Hibernate_Loop_0",
    "CF_Birther_Hibernate_In",
    "CF_Birther_Hibernate_Loop",
    "Enemy_Big_Hibernate_Heartbeat_1_A",
    "Enemy_Big_Hibernate_Heartbeat_2_A",
    "Enemy_Big_Hibernate_Heartbeat_3_A",
    "Enemy_Big_Hibernate_Heartbeat_4_A",
    "Enemy_Big_Hibernate_Heartbeat_5_A",
    "CA_Hibernate_Heartbeat_A",
    "CA_Hibernate_Heartbeat_B",
    "CA_Hibernate_Heartbeat_C",
    "CA_Hibernate_Heartbeat_D",
    "CA_Hibernate_Heartbeat_E",
    "CR_Hibernate_Heartbeat_A",
    "CR_Hibernate_Heartbeat_B",
    "CR_Hibernate_Heartbeat_C",
    "CR_Hibernate_Heartbeat_D",
    "CR_Hibernate_Heartbeat_E",
    "CF_Hibernate_Heartbeat_A",
    "CF_Hibernate_Heartbeat_B",
    "CF_Hibernate_Heartbeat_C",
    "CF_Hibernate_Heartbeat_D",
    "CF_Hibernate_Heartbeat_E",
    "FD_Hibernate_Heartbeat_A",
    "FD_Hibernate_Heartbeat_B",
    "FD_Hibernate_Heartbeat_C",
    "FD_Hibernate_Heartbeat_D",
    "FD_Hibernate_Heartbeat_E",
    "LO_Hibernate_Heartbeat_A",
    "LO_Hibernate_Heartbeat_B",
    "LO_Hibernate_Heartbeat_C",
    "LO_Hibernate_Heartbeat_D",
    "LO_Hibernate_Heartbeat_E",
    "RU_Hibernate_Heartbeat_A",
    "RU_Hibernate_Heartbeat_A_0",
    "RU_Hibernate_Heartbeat_B",
    "RU_Hibernate_Heartbeat_B_0",
    "RU_Hibernate_Heartbeat_C",
    "RU_Hibernate_Heartbeat_C_0",
    "RU_Hibernate_Heartbeat_D",
    "RU_Hibernate_Heartbeat_D_0",
    "RU_Hibernate_Heartbeat_E",
    "RU_Hibernate_Heartbeat_E_0",
    "CF_Birther_Heartbeat",
    "CR_Hibernate_Wakeup_A",
    "CR_Hibernate_Wakeup_B",
    "CR_Hibernate_Wakeup_C",
    "CR_Hibernate_Wakeup_D",
    "CR_Hibernate_Wakeup_Turn_A",
    "LO_Hibernate_Wakeup_A",
    "LO_Hibernate_Wakeup_B",
    "LO_Hibernate_Wakeup_Fwd_C",
    "LO_Hibernate_Wakeup_Fwd_D",
    "LO_Hibernate_Wakeup_Turn_A",
    "CA_Hibernate_Wakeup_A",
    "CA_Hibernate_Wakeup_Turn_A",
    "RU_Hibernate_Wakeup_A_0",
    "RU_Hibernate_Wakeup_B_0",
    "RU_Hibernate_Wakeup_C_0",
    "RU_Hibernate_Wakeup_Turn_A",
    "CF_Hibernate_Wakeup_A",
    "CF_Hibernate_Wakeup_Turn_A",
    "Monster_Turn_Left_180",
    "Enemy_Big_Hibernate_Wakeup_180_B",
    "Enemy_Big_Hibernate_Wakeup_A",
    "FD_Hibernate_Wakeup_A",
    "FD_Hibernate_Wakeup_B",
    "FD_Hibernate_Wakeup_C",
    "FD_Hibernate_Wakeup_Turn_A",
    "RU_Hibernate_Wakeup_A",
    "RU_Hibernate_Wakeup_B",
    "RU_Hibernate_Wakeup_C",
    "PO_ConsumeAttack",
    "PO_ConsumeStart",
    "PO_ConsumeEnd",
    "PO_ConsumeLoop",
    "PO_SpitOut",
    "CA_Ability_Use_In_A",
    "CA_Ability_Use_Loop_A",
    "CA_Ability_Use_Out_A",
    "RU_Ability_Use_In_a",
    "RU_Ability_Use_Loop_a",
    "RU_Ability_Use_Out_a",
    "LO_Ability_Use_In_A",
    "LO_Ability_Use_Loop_A",
    "LO_Ability_Use_Out_A",
    "CR_Ability_Use_In_A",
    "CR_Ability_Use_Loop_A",
    "CR_Ability_Use_Out_A",
    "CF_Ability_Use_In_A",
    "CF_Ability_Use_Loop_A",
    "CF_Ability_Use_Out_A",
    "FD_Ability_Use_In_A",
    "FD_Ability_Use_Loop_A",
    "FD_Ability_Use_Out_A",
] as const;
export type EnemyAnimationClips = typeof enemyAnimationClipNames[number];
export const enemyAnimationClips = await loadAllClips(HumanJoints, enemyAnimationClipNames);

export const enemyRunnerMovement = new AnimBlend(HumanJoints, [
    { anim: enemyAnimationClips.RU_Walk_Fwd, x: 0, y: 2.2 },
    { anim: enemyAnimationClips.RU_Walk_Bwd, x: 0, y: -2.5},
    { anim: enemyAnimationClips.RU_Walk_Lt, x: -2.5, y: 0 },
    { anim: enemyAnimationClips.RU_Walk_Rt, x: 2.5, y: 0},
    { anim: enemyAnimationClips.RU_Run_Fwd, x: 0, y: 7 },
    { anim: enemyAnimationClips.RU_Run_Bwd, x: 0, y: -4.5 },
    { anim: enemyAnimationClips.RU_Run_Lt, x: -4.5, y: 0 },
    { anim: enemyAnimationClips.RU_Run_Rt, x: 4.5, y: 0},
    { anim: enemyAnimationClips.Idle_Active, x: 0, y: 0},
], animVelocity);

export const enemyLowMovement = new AnimBlend(HumanJoints, [
    { anim: enemyAnimationClips.LO_Walk_Fwd_A, x: 0, y: 2.2 },
    { anim: enemyAnimationClips.LO_Walk_Bwd_A, x: 0, y: -2.5},
    { anim: enemyAnimationClips.LO_Walk_Lt_A, x: -2.5, y: 0 },
    { anim: enemyAnimationClips.LO_Walk_Rt_A, x: 2.5, y: 0},
    { anim: enemyAnimationClips.LO_Run_Fwd_A, x: 0, y: 7 },
    { anim: enemyAnimationClips.LO_Run_Bwd_A, x: 0, y: -4.5 },
    { anim: enemyAnimationClips.LO_Run_Lt_A, x: -4.5, y: 0 },
    { anim: enemyAnimationClips.LO_Run_Rt_A, x: 4.5, y: 0},
    { anim: enemyAnimationClips.LO_Idle_A, x: 0, y: 0},
], animVelocity);

export const enemyFiddleMovement = new AnimBlend(HumanJoints, [
    { anim: enemyAnimationClips.FD_Walk_Fwd_A, x: 0, y: 1.35 },
    { anim: enemyAnimationClips.FD_Walk_Bwd_A, x: 0, y: -1},
    { anim: enemyAnimationClips.FD_Walk_Lt_B, x: -1, y: 0 },
    { anim: enemyAnimationClips.FD_Walk_Rt_A, x: 1, y: 0},
    { anim: enemyAnimationClips.FD_Run_Fwd_A, x: 0, y: 4 },
    { anim: enemyAnimationClips.FD_Run_Bwd_A, x: 0, y: -2.6 },
    { anim: enemyAnimationClips.FD_Run_Lt_A, x: -2.6, y: 0 },
    { anim: enemyAnimationClips.FD_Run_Rt_A, x: 2.6, y: 0},
    { anim: enemyAnimationClips.FD_Idle_A, x: 0, y: 0},
], animVelocity);

export const enemyCrawlMovement = new AnimBlend(HumanJoints, [
    { anim: enemyAnimationClips.CA_Walk_Fwd_A, x: 0, y: 1.2 },
    { anim: enemyAnimationClips.CA_Walk_Fwd_A, x: 0, y: 2.5, timescale: 1.5 },
    { anim: enemyAnimationClips.CA_Walk_Fwd_A, x: 0, y: 4, timescale: 2 },
    { anim: enemyAnimationClips.CA_Walk_Bwd_A, x: 0, y: -1.2},
    { anim: enemyAnimationClips.CA_Walk_Bwd_A, x: 0, y: -2.5, timescale: 1.5 },
    { anim: enemyAnimationClips.CA_Walk_Bwd_A, x: 0, y: -4, timescale: 2 },
    { anim: enemyAnimationClips.CA_Walk_Lt_A, x: -1.1, y: 0 },
    { anim: enemyAnimationClips.CA_Walk_Rt_A, x: 1.1, y: 0 },
    { anim: enemyAnimationClips.CA_Walk_Lt_A, x: -3.5, y: 0, timescale: 1.5 },
    { anim: enemyAnimationClips.CA_Walk_Rt_A, x: 3.5, y: 0, timescale: 1.5 },
    { anim: enemyAnimationClips.CA_Idle_A, x: 0, y: 0},
], animVelocity);

export const enemyCrawlFlipMovement = new AnimBlend(HumanJoints, [
    { anim: enemyAnimationClips.CF_Walk_Fwd_A, x: 0, y: 1 },
    { anim: enemyAnimationClips.CF_Walk_Fwd_A, x: 0, y: 3, timescale: 1.5 },
    { anim: enemyAnimationClips.CF_Walk_Bwd_A, x: 0, y: -1},
    { anim: enemyAnimationClips.CF_Walk_Bwd_A, x: 0, y: -3, timescale: 1.5 },
    { anim: enemyAnimationClips.CF_Walk_Lt_A, x: -1.1, y: 0 },
    { anim: enemyAnimationClips.CF_Walk_Rt_A, x: 1.1, y: 0 },
    { anim: enemyAnimationClips.CF_Walk_Lt_A, x: -2.5, y: 0, timescale: 1.5 },
    { anim: enemyAnimationClips.CF_Walk_Rt_A, x: 2.5, y: 0, timescale: 1.5 },
    { anim: enemyAnimationClips.CF_Idle_A, x: 0, y: 0},
], animVelocity);

export const enemyCrippleMovement = new AnimBlend(HumanJoints, [
    { anim: enemyAnimationClips.CR_Walk_Fwd, x: 0, y: 1.6 },
    { anim: enemyAnimationClips.CR_Walk_Bwd, x: 0, y: -1.2},
    { anim: enemyAnimationClips.CR_Walk_Lt, x: -1.2, y: 0 },
    { anim: enemyAnimationClips.CR_Walk_Rt, x: 1.2, y: 0},
    { anim: enemyAnimationClips.CR_Run_Fwd, x: 0, y: 4.6 },
    { anim: enemyAnimationClips.CR_Run_Bwd, x: 0, y: -3.3 },
    { anim: enemyAnimationClips.CR_Run_Lt, x: -3.3, y: 0 },
    { anim: enemyAnimationClips.CR_Run_Rt, x: 3.3, y: 0},
    { anim: enemyAnimationClips.CR_Idle_A, x: 0, y: 0},
], animVelocity);

export const enemyBigMovement = new AnimBlend(HumanJoints, [
    { anim: enemyAnimationClips.Enemy_Big_Idle_A, x: 0, y: 0 },
    { anim: enemyAnimationClips.Enemy_Big_Walk_Fwd_A, x: 0, y: 1 },
    { anim: enemyAnimationClips.Enemy_Big_Walk_Bwd_A, x: 0, y: -1 },
    { anim: enemyAnimationClips.Enemy_Big_Walk_Left_A, x: -1, y: 0 },
    { anim: enemyAnimationClips.Enemy_Big_Walk_Right_A, x: 1, y: 0 },
    { anim: enemyAnimationClips.Enemy_Big_Walk_Fwd_Left_A, x: -1, y: 1 },
    { anim: enemyAnimationClips.Enemy_Big_Walk_Fwd_Right_A, x: 1, y: 1 },
    { anim: enemyAnimationClips.Enemy_Big_Walk_Bwd_Left_A, x: -1, y: -1 },
    { anim: enemyAnimationClips.Enemy_Big_Walk_Bwd_Right_A, x: 1, y: -1 },
    { anim: enemyAnimationClips.Enemy_Big_Run_Fwd_A, x: 0, y: 3 },
    { anim: enemyAnimationClips.Enemy_Big_Run_Bwd_A, x: 0, y: -3 },
    { anim: enemyAnimationClips.Enemy_Big_Run_Left_A, x: -2.5, y: 0 },
    { anim: enemyAnimationClips.Enemy_Big_Run_Right_A, x: 2.5, y: 0 },
    { anim: enemyAnimationClips.Enemy_Big_Run_Fwd_Left_A, x: -2.5, y: 2.5 },
    { anim: enemyAnimationClips.Enemy_Big_Run_Fwd_Right_A, x: 2.5, y: 2.5 },
    { anim: enemyAnimationClips.Enemy_Big_Run_Bwd_Left_A, x: -2.5, y: -2.5 },
    { anim: enemyAnimationClips.Enemy_Big_Run_Bwd_Right_A, x: 2.5, y: -2.5 },
], animVelocity);

export const enemyGiantMovement = new AnimBlend(HumanJoints, [
    { anim: enemyAnimationClips.Monster_Idle_01, x: 0, y: 0 },
    { anim: enemyAnimationClips.Monster_Walk_Fwd, x: 0, y: 1.2 },
    { anim: enemyAnimationClips.Monster_Walk_Fwd, x: 0, y: 2.6, timescale: 1.5 },
    { anim: enemyAnimationClips.Monster_Walk_Bwd, x: 0, y: -1.2 },
    { anim: enemyAnimationClips.Monster_Walk_Bwd, x: 0, y: -2.6, timescale: 1.5 },
    { anim: enemyAnimationClips.Monster_Walk_Right, x: 1.2, y: 0 },
    { anim: enemyAnimationClips.Monster_Walk_Right, x: 2.6, y: 0, timescale: 1.5 },
    { anim: enemyAnimationClips.Monster_Walk_Left, x: -1.2, y: 0 },
    { anim: enemyAnimationClips.Monster_Walk_Left, x: -2.6, y: 0, timescale: 1.5 },
    { anim: enemyAnimationClips.Monster_Walk_Left_135, x: -1.1, y: -1.1 },
    { anim: enemyAnimationClips.Monster_Walk_Left_135, x: -2.6, y: -2.6, timescale: 1.5 },
    { anim: enemyAnimationClips.Monster_Walk_Left_45, x: -1.1, y: 1.1 },
    { anim: enemyAnimationClips.Monster_Walk_Left_45, x: -2.6, y: 2.6, timescale: 1.5 },
    { anim: enemyAnimationClips.Monster_Walk_Right_135, x: 1.1, y: -1.1 },
    { anim: enemyAnimationClips.Monster_Walk_Right_135, x: 2.6, y: -2.6, timescale: 1.5 },
    { anim: enemyAnimationClips.Monster_Walk_Right_45, x: 1.1, y: 1.1 },
    { anim: enemyAnimationClips.Monster_Walk_Right_45, x: 2.6, y: 2.6, timescale: 1.5 },
], animVelocity);

export const enemyPouncerMovement = new AnimBlend(HumanJoints, [
    { anim: enemyAnimationClips.PO_IdleCombat, x: 0, y: 0 },
    { anim: enemyAnimationClips.PO_JogFwd, x: 0, y: 4.5 },
    { anim: enemyAnimationClips.PO_JogBwd, x: 0, y: -2.8 },
    { anim: enemyAnimationClips.PO_JogLeft, x: -2.8, y: -1.2 },
    { anim: enemyAnimationClips.PO_JogRight, x: -2.8, y: -1.2 },
    { anim: enemyAnimationClips.PO_RunFwd, x: 0, y: 10.5 },
    { anim: enemyAnimationClips.PO_WalkFwd, x: 0, y: 1.2 },
    { anim: enemyAnimationClips.PO_WalkBwd, x: 0, y: -1.2 },
    { anim: enemyAnimationClips.PO_WalkLeft, x: -1.2, y: 0 },
    { anim: enemyAnimationClips.PO_WalkRight, x: 1.2, y: 0 },
], animVelocity);

export const animDetection = { x: 0, y: 0 };

export const CA_HibernateDetect = new AnimBlend(HumanJoints, [
    { anim: enemyAnimationClips.CA_Hibernate_Loop_A, x: 0, y: 0 },
    { anim: enemyAnimationClips.CA_Hibernate_Detect_Loop, x: 1, y: 0, timescale: 0.2 },
], animDetection);

export const CR_HibernateDetect = new AnimBlend(HumanJoints, [
    { anim: enemyAnimationClips.CR_Hibernate_Loop, x: 0, y: 0 },
    { anim: enemyAnimationClips.CR_Hibernate_Detect_Loop, x: 1, y: 0, timescale: 0.2 },
], animDetection);

export const CF_HibernateDetect = new AnimBlend(HumanJoints, [
    { anim: enemyAnimationClips.CF_Hibernate_Loop_A, x: 0, y: 0 },
    { anim: enemyAnimationClips.CF_Hibernate_Detect_Loop, x: 1, y: 0, timescale: 0.2 },
], animDetection);

export const FD_HibernateDetect = new AnimBlend(HumanJoints, [
    { anim: enemyAnimationClips.FD_Hibernate_Loop, x: 0, y: 0 },
    { anim: enemyAnimationClips.FD_Hibernate_Detect_Loop, x: 1, y: 0, timescale: 0.2 },
], animDetection);

export const LO_HibernateDetect = new AnimBlend(HumanJoints, [
    { anim: enemyAnimationClips.LO_Hibernate_Loop, x: 0, y: 0 },
    { anim: enemyAnimationClips.LO_Hibernate_Detect_Loop, x: 1, y: 0, timescale: 0.2 },
], animDetection);

export const RU_HibernateDetect = new AnimBlend(HumanJoints, [
    { anim: enemyAnimationClips.RU_Hibernate_Loop_0, x: 0, y: 0 },
    { anim: enemyAnimationClips.Ru_Hibernate_Detect_Loop_0, x: 1, y: 0, timescale: 0.2 },
], animDetection);

export const RU_Melee_Sequence_A_Fast = new ScaledAnim(HumanJoints, enemyAnimationClips.RU_Melee_Sequence_A, 2);

/*export const LO_Ability_Fire_A = mergeAnims(enemyAnimationClips.LO_Ability_Fire_In_A, enemyAnimationClips.LO_Ability_Fire_Out_A);
export const LO_Ability_Fire_B = mergeAnims(enemyAnimationClips.LO_Ability_Fire_In_B, enemyAnimationClips.LO_Ability_Fire_Out_B);
export const LO_Ability_Fire_C = mergeAnims(enemyAnimationClips.LO_Ability_Fire_In_C, enemyAnimationClips.LO_Ability_Fire_Out_C);
export const CA_Ability_Fire_A = mergeAnims(enemyAnimationClips.CA_Ability_Fire_In_A, enemyAnimationClips.CA_Ability_Fire_Out_A);
export const CA_Ability_Fire_B = mergeAnims(enemyAnimationClips.CA_Ability_Fire_In_B, enemyAnimationClips.CA_Ability_Fire_Out_B);
export const CF_Ability_Fire_A = mergeAnims(enemyAnimationClips.CF_Ability_Fire_In_A, enemyAnimationClips.CF_Ability_Fire_Out_A);
export const CF_Ability_Fire_B = mergeAnims(enemyAnimationClips.CF_Ability_Fire_In_B, enemyAnimationClips.CF_Ability_Fire_Out_B);
export const FD_Ability_Fire_A = mergeAnims(enemyAnimationClips.FD_Ability_Fire_In_A, enemyAnimationClips.FD_Ability_Fire_Out_A);
export const FD_Ability_Fire_B = mergeAnims(enemyAnimationClips.FD_Ability_Fire_In_B, enemyAnimationClips.FD_Ability_Fire_Out_B);
export const CR_Ability_Fire_A = mergeAnims(enemyAnimationClips.CR_Ability_Fire_In_A, enemyAnimationClips.CR_Ability_Fire_Out_A);
export const CR_Ability_Fire_B = mergeAnims(enemyAnimationClips.CR_Ability_Fire_In_B, enemyAnimationClips.CR_Ability_Fire_Out_B);
export const CR_Ability_Fire_C = mergeAnims(enemyAnimationClips.CR_Ability_Fire_In_C, enemyAnimationClips.CR_Ability_Fire_Out_C);
export const Ability_Fire_0 = mergeAnims(enemyAnimationClips.Ability_Fire_0_Start, enemyAnimationClips.Ability_Fire_0_End);
export const Ability_Fire_2 = mergeAnims(enemyAnimationClips.Ability_Fire_2_Start, enemyAnimationClips.Ability_Fire_2_End);
export const Enemy_Big_Fire_A = mergeAnims(enemyAnimationClips.Enemy_Big_Fire_In_A, enemyAnimationClips.Enemy_Big_Fire_End_A);
export const Enemy_Big_Fire_B = mergeAnims(enemyAnimationClips.Enemy_Big_Fire_In_B, enemyAnimationClips.Enemy_Big_Fire_End_B);
export const Monster_Tentacle = mergeAnims(enemyAnimationClips.Monster_TentacleStart, enemyAnimationClips.Monster_TentacleEnd);*/

export const PO_Consume = new ScaledAnim(HumanJoints, mergeAnims(
    enemyAnimationClips.PO_ConsumeStart,
    enemyAnimationClips.PO_ConsumeEnd,
), 1.5);

export const PO_SpitOut_Fast = new ScaledAnim(HumanJoints, enemyAnimationClips.PO_SpitOut, 1.5);

export const enemyAnimations = {
    enemyRunnerMovement,
    enemyLowMovement,
    enemyFiddleMovement,
    enemyCrawlMovement,
    enemyCrawlFlipMovement,
    enemyCrippleMovement,
    enemyBigMovement,
    enemyGiantMovement,
    enemyPouncerMovement,
    CA_HibernateDetect,
    CR_HibernateDetect,
    CF_HibernateDetect,
    FD_HibernateDetect,
    LO_HibernateDetect,
    RU_HibernateDetect,
    RU_Melee_Sequence_A_Fast,
    PO_Consume,
    PO_SpitOut_Fast,
    /*LO_Ability_Fire_A,
    LO_Ability_Fire_B,
    LO_Ability_Fire_C,
    CA_Ability_Fire_A,
    CA_Ability_Fire_B,
    CF_Ability_Fire_A,
    CF_Ability_Fire_B,
    FD_Ability_Fire_A,
    FD_Ability_Fire_B,
    CR_Ability_Fire_A,
    CR_Ability_Fire_B,
    CR_Ability_Fire_C,
    Ability_Fire_0,
    Ability_Fire_2,
    Enemy_Big_Fire_A,
    Enemy_Big_Fire_B,
    Monster_Tentacle,*/
} as const;
export type EnemyAnimations = keyof typeof enemyAnimations;