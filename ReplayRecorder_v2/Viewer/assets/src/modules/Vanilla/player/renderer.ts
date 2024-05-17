import { Camera, Color, ColorRepresentation, Group, Matrix4, Object3D, Quaternion, Scene, Vector3, Vector3Like } from "three";
import { Text } from "troika-three-text";
import { consume } from "../../../replay/instancing.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";
import { Equippable } from "../Equippable/equippable.js";
import { AnimBlend, AnimTimer, Avatar, AvatarSkeleton, AvatarStructure, createAvatarStruct, difference, toAnim } from "../animations/animation.js";
import { playerAnimations } from "../animations/assets.js";
import { HumanJoints, HumanMask, HumanSkeleton, defaultHumanStructure } from "../animations/human.js";
import { IKSolverAim } from "../animations/inversekinematics/aimsolver.js";
import { IKSolverArm, TrigonometricBone } from "../animations/inversekinematics/limbsolver.js";
import { Bone } from "../animations/inversekinematics/rootmotion.js";
import { upV, zeroQ, zeroV } from "../humanmodel.js";
import { specification } from "../specification.js";
import { PlayerAnimState } from "./animation.js";
import { Player } from "./player.js";
import { InventorySlot, PlayerBackpack, inventorySlotMap, inventorySlots } from "./playerbackpack.js";
import { PlayerStats } from "./playerstats.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Players": void;
        }

        interface RenderData {
            "Players": Map<number, PlayerModel>;
        }
    }
}

const worldPos: AvatarStructure<HumanJoints, Vector3> = createAvatarStruct(HumanJoints, () => new Vector3());
function getWorldPos(worldPos: AvatarStructure<HumanJoints, Vector3>, skeleton: HumanSkeleton): AvatarStructure<HumanJoints, Vector3> {
    for (const key of skeleton.keys) {
        skeleton.joints[key].getWorldPosition(worldPos[key]);
    }

    return worldPos;
}

const bodyTop = Pod.Vec.zero();
const bodyBottom = Pod.Vec.zero();
const temp = new Vector3();

const headScale = new Vector3(0.15, 0.15, 0.15);

const rot = new Quaternion();

const radius = 0.05;
const sM = new Vector3(radius, radius, radius);
const scale = new Vector3(radius, radius, radius);

const tmpPos = new Vector3();
const camPos = new Vector3();

const upperBodyMask: HumanMask = {
    root: false,
    joints: { 
        spine0: true,
        spine1: true,
        spine2: true,

        leftShoulder: true,
        leftUpperArm: true,
        leftLowerArm: true,
        leftHand: true,

        rightShoulder: true,
        rightUpperArm: true,
        rightLowerArm: true,
        rightHand: true,

        neck: true,
        head: true
    }
};

const rifleStandMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimations.Rifle_Jog_Forward, x: 0, y: 3.5 },
    { anim: playerAnimations.Rifle_Jog_Backward, x: 0, y: -3.5 },
    { anim: playerAnimations.Rifle_Jog_Right, x: 3.5, y: 0 },
    { anim: playerAnimations.Rifle_Jog_Left, x: -3.5, y: 0 },
    { anim: playerAnimations.Rifle_Jog_ForwardLeft, x: -2.56, y: 2.56 },
    { anim: playerAnimations.Rifle_Jog_ForwardRight, x: 2.56, y: 2.56 },
    { anim: playerAnimations.Rifle_Jog_BackwardRight, x: 2.56, y: -2.56 },
    { anim: playerAnimations.Rifle_Jog_BackwardLeft, x: -2.56, y: -2.56 },
    { anim: playerAnimations.Rifle_WalkFwdLoop, x: 0, y: 1.9 },
    { anim: playerAnimations.Rifle_WalkBwdLoop, x: 0, y: -1.8 },
    { anim: playerAnimations.Rifle_StrafeLeftLoop, x: -1.6, y: 0 },
    { anim: playerAnimations.Rifle_StrafeLeft45Loop, x: -1.16, y: 1.16 },
    { anim: playerAnimations.Rifle_StrafeLeft135Loop, x: -1.13, y: -1.13 },
    { anim: playerAnimations.Rifle_StrafeRightLoop, x: 2, y: 0 },
    { anim: playerAnimations.Rifle_StrafeRight45Loop, x: 1.37, y: 1.37 },
    { anim: playerAnimations.Rifle_StrafeRight135Loop, x: 1.16, y: -1.16 },
    { anim: playerAnimations.Rifle_Idle, x: 0, y: 0 },
    { anim: playerAnimations.Rifle_SprintFwdLoop, x: 0, y: 6 },
    { anim: playerAnimations.Rifle_RunBwdLoop, x: 0, y: -5 },
    { anim: playerAnimations.Rifle_StrafeRunRightLoop, x: 6.8, y: 0 },
    { anim: playerAnimations.Rifle_StrafeRun45RightLoop, x: 4.8, y: 4.8 },
    { anim: playerAnimations.Rifle_StrafeRun135LeftLoop_0, x: 4.34, y: -4.34 },
    { anim: playerAnimations.Rifle_StrafeRunLeftLoop, x: -6.8, y: 0 },
    { anim: playerAnimations.Rifle_StrafeRun45LeftLoop, x: -4.8, y: 4.8 },
    { anim: playerAnimations.Rifle_StrafeRun135LeftLoop, x: -4.9, y: -4.9 },
    { anim: playerAnimations.Rifle_SprintFwdLoop_Left, x: -1.25, y: 5.85 },
    { anim: playerAnimations.Rifle_SprintFwdLoop_Right, x: 1.25, y: 5.85 },
]);

const rifleCrouchMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimations.Rifle_Crouch_WalkBwd, x: 0, y: -2 },
    { anim: playerAnimations.Rifle_Crouch_WalkFwd, x: 0, y: 2 },
    { anim: playerAnimations.Rifle_Crouch_WalkLt, x: -2, y: 0 },
    { anim: playerAnimations.Rifle_Crouch_WalkRt, x: 2, y: 0 },
    { anim: playerAnimations.Rifle_CrouchLoop, x: 0, y: 0 },
]);

const rifleMovement = new AnimBlend(HumanJoints, [
    { anim: rifleStandMovement, x: 0, y: 0 },
    { anim: rifleCrouchMovement, x: 1, y: 0 }
]);

const pistolStandMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimations.Pistol_Jog_Forward, x: 0, y: 3.5 },
    { anim: playerAnimations.Pistol_Jog_Backward, x: 0, y: -3.5 },
    { anim: playerAnimations.Pistol_Jog_Right, x: 3.5, y: 0 },
    { anim: playerAnimations.Pistol_Jog_Left, x: -3.5, y: 0 },
    { anim: playerAnimations.Pistol_Jog_ForwardLeft, x: -2.56, y: 2.56 },
    { anim: playerAnimations.Pistol_Jog_ForwardRight, x: 2.56, y: 2.56 },
    { anim: playerAnimations.Pistol_Jog_BackwardRight, x: 2.56, y: -2.56 },
    { anim: playerAnimations.Pistol_Jog_BackwardLeft, x: -2.56, y: -2.56 },
    { anim: playerAnimations.Pistol_WalkFwdLoop, x: 0, y: 1.9 },
    { anim: playerAnimations.Pistol_WalkBwdLoop, x: 0, y: -1.8 },
    { anim: playerAnimations.Pistol_StrafeLeftLoop, x: -1.6, y: 0 },
    { anim: playerAnimations.Pistol_StrafeLeft45Loop, x: -1.16, y: 1.16 },
    { anim: playerAnimations.Pistol_StrafeLeft135Loop, x: -1.13, y: -1.13 },
    { anim: playerAnimations.Pistol_StrafeRightLoop, x: 2, y: 0 },
    { anim: playerAnimations.Pistol_StrafeRight45Loop, x: 1.37, y: 1.37 },
    { anim: playerAnimations.Pistol_StrafeRight135Loop, x: 1.16, y: -1.16 },
    { anim: playerAnimations.Pistol_Idle, x: 0, y: 0 },
    { anim: playerAnimations.Pistol_RunBwdLoop, x: 0, y: -6.48 },
    { anim: playerAnimations.Pistol_SprintFwdLoop, x: 0, y: 6 },
    { anim: playerAnimations.Pistol_StrafeRunRightLoop, x: 6.48, y: 0 },
    { anim: playerAnimations.Pistol_StrafeRun45RightLoop, x: 4.64, y: 4.64 },
    { anim: playerAnimations.Pistol_StrafeRun135LeftLoop, x: 4.14, y: -4.14 },
    { anim: playerAnimations.Pistol_StrafeRunLeftLoop, x: -6.48, y: 0 },
    { anim: playerAnimations.Pistol_StrafeRun45LeftLoop, x: -4.58, y: 4.58 },
    { anim: playerAnimations.Pistol_StrafeRun135RightLoop, x: -4.34, y: -4.34 },
]);

const pistolCrouchMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimations.Pistol_Crouch_WalkBwd, x: 0, y: -2 },
    { anim: playerAnimations.Pistol_Crouch_WalkFwd, x: 0, y: 2 },
    { anim: playerAnimations.Pistol_Crouch_WalkLt, x: -2, y: 0 },
    { anim: playerAnimations.Pistol_Crouch_WalkRt, x: 2, y: 0 },
    { anim: playerAnimations.Pistol_CrouchLoop, x: 0, y: 0 },
]);

const pistolMovement = new AnimBlend(HumanJoints, [
    { anim: pistolStandMovement, x: 0, y: 0 },
    { anim: pistolCrouchMovement, x: 1, y: 0 }
]);

const aimOffset = new AnimBlend(HumanJoints, [
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), playerAnimations.Rifle_AO_C.frames[0], playerAnimations.Rifle_AO_U.frames[0])), x: 0, y: 1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), playerAnimations.Rifle_AO_C.frames[0], playerAnimations.Rifle_AO_D.frames[0])), x: 0, y: -1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), playerAnimations.Rifle_AO_C.frames[0], playerAnimations.Rifle_AO_L.frames[0])), x: -1, y: 1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), playerAnimations.Rifle_AO_C.frames[0], playerAnimations.Rifle_AO_R.frames[0])), x: 1, y: 0 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), playerAnimations.Rifle_AO_C.frames[0], playerAnimations.Rifle_AO_LD.frames[0])), x: -1, y: -1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), playerAnimations.Rifle_AO_C.frames[0], playerAnimations.Rifle_AO_LU.frames[0])), x: -1, y: 1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), playerAnimations.Rifle_AO_C.frames[0], playerAnimations.Rifle_AO_RD.frames[0])), x: 1, y: -1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), playerAnimations.Rifle_AO_C.frames[0], playerAnimations.Rifle_AO_RU.frames[0])), x: 1, y: 1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), playerAnimations.Rifle_AO_C.frames[0], playerAnimations.Rifle_AO_C.frames[0])), x: 0, y: 0 },
]);

const defaultStandMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimations.RunFwdLoop, x: 0, y: 3.4 },
    { anim: playerAnimations.RunBwdLoop, x: 0, y: -2.1 },
    { anim: playerAnimations.RunRtLoop, x: 2.1, y: 0 },
    { anim: playerAnimations.RunLtLoop, x: -2.1, y: 0 },
    { anim: playerAnimations.RunStrafeRight45Loop, x: 2.4, y: 2.4 },
    { anim: playerAnimations.RunStrafeRight135Loop, x: 1.5, y: -1.5 },
    { anim: playerAnimations.RunStrafeLeft45Loop, x: -2.4, y: 2.4 },
    { anim: playerAnimations.RunStrafeLeft135Loop, x: -1.5, y: -1.5 },
    { anim: playerAnimations.WalkFwdLoop, x: 0, y: 1.5 },
    { anim: playerAnimations.WalkBwdLoop, x: 0, y: -1.5 },
    { anim: playerAnimations.StrafeRightLoop, x: -1.5, y: 0 },
    { anim: playerAnimations.StrafeRight45Loop, x: 1.12, y: 1.12 },
    { anim: playerAnimations.StrafeRight135Loop, x: 1.12, y: -1.12 },
    { anim: playerAnimations.StrafeLeftLoop, x: -1.56, y: 0 },
    { anim: playerAnimations.StrafeLeft45Loop, x: -1.12, y: 1.12 },
    { anim: playerAnimations.StrafeLeft135Loop, x: -1.12, y: -1.12 },
    { anim: playerAnimations.Idle_1, x: 0, y: 0 },
]);

const defaultCrouchMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimations.Crouch_WalkFwd_new, x: 0, y: 1.54 },
    { anim: playerAnimations.Crouch_WalkBwd_new, x: 0, y: -1.74 },
    { anim: playerAnimations.Crouch_WalkLt45_new, x: -1, y: 1 },
    { anim: playerAnimations.Crouch_WalkLt135_new, x: -1.2, y: -1.2 },
    { anim: playerAnimations.Crouch_WalkRt45_new, x: 1, y: 1 },
    { anim: playerAnimations.Crouch_WalkRt135_new, x: 1, y: -1 },
    { anim: playerAnimations.Crouch_WalkRt_new, x: 2, y: 0 },
    { anim: playerAnimations.Crouch_WalkLt_new, x: -2, y: 0 },
    { anim: playerAnimations.Crouch_Idle, x: 0, y: 0 },
]);

const defaultMovement = new AnimBlend(HumanJoints, [
    { anim: defaultStandMovement, x: 0, y: 0 },
    { anim: defaultCrouchMovement, x: 1, y: 0 }
]);

const hammerStandMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimations.SledgeHammer_Jog_Forward, x: 0, y: 3.5 },
    { anim: playerAnimations.SledgeHammer_Jog_Backward, x: 0, y: -3.5},
    { anim: playerAnimations.SledgeHammer_Jog_Right, x: 3.5, y: 0 },
    { anim: playerAnimations.SledgeHammer_Jog_Left, x: -3.5, y: 0 },
    { anim: playerAnimations.SledgeHammer_Jog_ForwardLeft, x: -2.56, y: 2.56 },
    { anim: playerAnimations.SledgeHammer_Jog_ForwardRight, x: 2.56, y: 2.56 },
    { anim: playerAnimations.SledgeHammer_Jog_BackwardLeft, x: -2.56, y: -2.56 },
    { anim: playerAnimations.SledgeHammer_Jog_BackwardRight, x: 2.56, y: -2.56 },
    { anim: playerAnimations.SledgeHammer_SprintFwdLoop, x: 0, y: 6 },
    { anim: playerAnimations.Player_Melee_Movement_Walk_Fwd_Stand_A, x: 0, y: 1.8 },
    { anim: playerAnimations.Player_Melee_Movement_Walk_Bwd_Stand_A, x: 0, y: -1.8 },
    { anim: playerAnimations.Player_Melee_Movement_Walk_Right_Stand_A, x: 1.8, y: 0 },
    { anim: playerAnimations.Player_Melee_Movement_Walk_Left_Stand_A, x: -1.8, y: 0 },
    { anim: playerAnimations.Player_Melee_Movement_Walk_Fwd_Left_Stand_A, x: -1.2, y: 1.2 },
    { anim: playerAnimations.Player_Melee_Movement_Walk_Fwd_Right_Stand_A, x: 1.2, y: 1.2 },
    { anim: playerAnimations.Player_Melee_Movement_Walk_Bwd_Left_Stand_A, x: -1.2, y: -1.2 },
    { anim: playerAnimations.Player_Melee_Movement_Walk_Bwd_Right_Stand_A, x: 1.2, y: -1.2 },
    { anim: playerAnimations.Sledgehammer_Stand_Idle, x: 0, y: 0 },
]);

const hammerCrouchMovement = new AnimBlend(HumanJoints, [
    { anim: playerAnimations.SledgeHammer_Crouch_WalkBwd, x: 0, y: -2 },
    { anim: playerAnimations.SledgeHammer_Crouch_WalkFwd, x: 0, y: 2 },
    { anim: playerAnimations.SledgeHammer_Crouch_WalkLt, x: -2, y: 0 },
    { anim: playerAnimations.SledgeHammer_Crouch_WalkRt, x: 2, y: 0 },
    { anim: playerAnimations.Sledgehammer_Crouch_Idle, x: 0, y: 0 },
]);

const hammerMovement = new AnimBlend(HumanJoints, [
    { anim: hammerStandMovement, x: 0, y: 0 },
    { anim: hammerCrouchMovement, x: 1, y: 0 }
]);

class PlayerModel  {
    root: Group;
    anchor: Group;
    color: Color;
    
    skeleton: HumanSkeleton;
    
    aimIK: IKSolverAim;
    aimTarget: Object3D;
    
    leftIK: IKSolverArm;
    leftTarget: Object3D;

    head: number;
    parts: number[];
    points: number[];

    movementAnimTimer: AnimTimer;
    equipAnimTimer: AnimTimer;

    tmp?: Text;

    handAttachment: Group;
    equipped: Group;
    equippedItem?: Equippable;
    equippedSlot?: InventorySlot;
    lastEquipped: number;

    slots: Equippable[];
    backpack: Group;
    backpackAligns: Group[];

    constructor(color: Color) {
        this.root = new Group();
        this.anchor = new Group();
        this.root.add(this.anchor);

        this.skeleton = new AvatarSkeleton(HumanJoints, "hip");
        this.anchor.add(this.skeleton.joints.hip);
        this.skeleton.joints.hip.add(
            this.skeleton.joints.spine0,
            this.skeleton.joints.leftUpperLeg,
            this.skeleton.joints.rightUpperLeg
        );
        this.skeleton.joints.leftUpperLeg.add(this.skeleton.joints.leftLowerLeg);
        this.skeleton.joints.leftLowerLeg.add(this.skeleton.joints.leftFoot!);
        this.skeleton.joints.rightUpperLeg.add(this.skeleton.joints.rightLowerLeg);
        this.skeleton.joints.rightLowerLeg.add(this.skeleton.joints.rightFoot!);
        this.skeleton.joints.spine0.add(this.skeleton.joints.spine1);
        this.skeleton.joints.spine1.add(this.skeleton.joints.spine2);
        this.skeleton.joints.spine2.add(
            this.skeleton.joints.neck,
            this.skeleton.joints.leftShoulder,
            this.skeleton.joints.rightShoulder
        );
        this.skeleton.joints.leftShoulder.add(this.skeleton.joints.leftUpperArm);
        this.skeleton.joints.leftUpperArm.add(this.skeleton.joints.leftLowerArm);
        this.skeleton.joints.leftLowerArm.add(this.skeleton.joints.leftHand!);
        this.skeleton.joints.rightShoulder.add(this.skeleton.joints.rightUpperArm);
        this.skeleton.joints.rightUpperArm.add(this.skeleton.joints.rightLowerArm);
        this.skeleton.joints.rightLowerArm.add(this.skeleton.joints.rightHand!);
        this.skeleton.joints.neck.add(this.skeleton.joints.head);
        
        this.skeleton.set(defaultHumanStructure);

        this.movementAnimTimer = new AnimTimer(Math.max(
            rifleMovement.duration, 
            pistolMovement.duration,
            defaultMovement.duration,
        ), true); 
        this.movementAnimTimer.play(0);

        this.equipAnimTimer = new AnimTimer(1.067, false);
        this.equipAnimTimer.pause(0);

        this.color = color;
        this.parts = new Array(9);
        this.points = new Array(14);
        this.head = -1;

        this.tmp = new Text();
        this.tmp.font = "./fonts/oxanium/Oxanium-SemiBold.ttf";
        this.tmp.fontSize = 0.2;
        this.tmp.position.y = 2;
        this.tmp.textAlign = "center";
        this.tmp.anchorX = "center";
        this.tmp.anchorY = "bottom";
        this.tmp.color = 0xffffff;
        this.tmp.visible = false;
        this.anchor.add(this.tmp);

        this.equipped = new Group();
        
        this.handAttachment = new Group();
        this.handAttachment.add(this.equipped);
        this.handAttachment.position.set(0.1, 0.045, 0);
        this.handAttachment.quaternion.set(0.5, 0.5, 0.5, 0.5);
        this.skeleton.joints.rightHand.add(this.handAttachment);

        this.backpack = new Group();
        this.skeleton.joints.spine1.add(this.backpack);

        this.slots = new Array(inventorySlots.length);
        this.backpackAligns = new Array(inventorySlots.length);
        for (let i = 0; i < inventorySlots.length; ++i) {
            this.slots[i] = { id: 0 };

            this.backpackAligns[i] = new Group();
            this.backpack.add(this.backpackAligns[i]);
        }

        this.backpackAligns[inventorySlotMap.get("melee")!].position.set(0.03, 0.01130009, -0.5089508);
        this.backpackAligns[inventorySlotMap.get("melee")!].rotateX(Math.PI);

        this.backpackAligns[inventorySlotMap.get("main")!].position.set(-0.15, 0.078, -0.395);
        this.backpackAligns[inventorySlotMap.get("main")!].quaternion.set(0.5, -0.5, 0.5, 0.5);

        this.backpackAligns[inventorySlotMap.get("special")!].position.set(0.159, 0.07800007, -0.223);
        this.backpackAligns[inventorySlotMap.get("special")!].quaternion.set(0.704416037, 0.0616284497, -0.0616284497, 0.704416037);

        this.backpackAligns[inventorySlotMap.get("tool")!].position.set(-0.295, 0.07800007, -0.318);
        this.backpackAligns[inventorySlotMap.get("tool")!].quaternion.set(0.0979499891, 0.700289905, -0.700289726, 0.0979499221);

        this.backpackAligns[inventorySlotMap.get("pack")!].position.set(-0.003, -0.2, -0.24);
        this.backpackAligns[inventorySlotMap.get("pack")!].quaternion.set(0, -0.263914526, 0, 0.964546144);
        this.backpackAligns[inventorySlotMap.get("pack")!].scale.set(0.7, 0.7, 0.7);

        this.lastEquipped = 0;

        this.aimIK = new IKSolverAim();
        this.aimIK.root = this.skeleton.root;
        this.aimIK.transform = this.handAttachment;
        this.aimIK.target = this.aimTarget = new Object3D();
        this.aimIK.tolerance = 0.1;
        this.aimIK.maxIterations = 3;
        this.aimIK.bones = [
            new Bone(this.skeleton.joints.spine1, 1),
            new Bone(this.skeleton.joints.spine2, 0.8),
            new Bone(this.skeleton.joints.rightShoulder, 0),
            new Bone(this.skeleton.joints.rightUpperArm, 0.1),
            new Bone(this.skeleton.joints.rightHand, 1),
        ];
        this.aimIK.initiate(this.aimIK.root);

        this.leftIK = new IKSolverArm();
        this.leftIK.root = this.skeleton.root;
        this.leftIK.rightArm = false;
        this.leftIK.IKPositionWeight = 1;
        this.leftIK.target = this.leftTarget = new Object3D();
        this.leftIK.IKRotationWeight = 1;
        this.leftIK.bone1 = new TrigonometricBone(this.skeleton.joints.leftUpperArm, 1);
        this.leftIK.bone2 = new TrigonometricBone(this.skeleton.joints.leftLowerArm, 1);
        this.leftIK.bone3 = new TrigonometricBone(this.skeleton.joints.leftHand, 1);
        this.leftIK.initiate(this.leftIK.root);
    }

    public addToScene(scene: Scene) {
        scene.add(this.root);
    }

    public removeFromScene(scene: Scene) {
        scene.remove(this.root);
    }

    public setVisible(visible: boolean) {
        this.root.visible = visible;
    }

    private animVelocity<T extends string>(blend: AnimBlend<T>, vel: Vector3Like) {
        blend.point.x = vel.x;
        blend.point.y = vel.z;
    }

    public update(time: number, player: Player, anim: PlayerAnimState): void {
        this.movementAnimTimer.update(time);
        this.equipAnimTimer.update(time);

        this.animVelocity(rifleStandMovement, anim.velocity);
        this.animVelocity(pistolStandMovement, anim.velocity);
        this.animVelocity(defaultStandMovement, anim.velocity);

        this.animVelocity(rifleCrouchMovement, anim.velocity);
        this.animVelocity(pistolCrouchMovement, anim.velocity);
        this.animVelocity(defaultCrouchMovement, anim.velocity);

        rifleMovement.point.x = anim.crouch;
        pistolMovement.point.x = anim.crouch;
        defaultMovement.point.x = anim.crouch;

        switch (this.equippedItem?.model?.archetype) {
        case "pistol": this.skeleton.override(pistolMovement.sample(this.movementAnimTimer.time)); break;
        case "rifle": this.skeleton.override(rifleMovement.sample(this.movementAnimTimer.time)); break;
        case "hammer": this.skeleton.override(hammerMovement.sample(this.movementAnimTimer.time)); break;
        default: this.skeleton.override(defaultMovement.sample(this.movementAnimTimer.time)); break;
        }

        if (this.equippedItem !== undefined) {
            if (this.lastEquipped !== this.equippedItem.id) {
                this.equipAnimTimer.reset(time);
                this.equipAnimTimer.play(time);
                this.lastEquipped = this.equippedItem.id;
            }

            if (this.equipAnimTimer.isPlaying) {
                this.equipped.visible = this.equipAnimTimer.time > 0.5;

                switch (this.equippedSlot) {
                case "melee": {
                    switch (this.equippedItem?.model?.archetype) {
                    case "spear": this.skeleton.override(playerAnimations.Spear_Equip.sample(this.equipAnimTimer.time), upperBodyMask); break;
                    case "bat":
                    case "knife": this.skeleton.override(playerAnimations.Bat_Equip.sample(this.equipAnimTimer.time), upperBodyMask); break;
                    default: this.skeleton.override(playerAnimations.Equip_Melee.sample(this.equipAnimTimer.time), upperBodyMask); break;
                    }
                } break;
                case "main": this.skeleton.override(playerAnimations.Equip_Primary.sample(this.equipAnimTimer.time), upperBodyMask); break;
                case "special": this.skeleton.override(playerAnimations.Equip_Secondary.sample(this.equipAnimTimer.time), upperBodyMask); break;
                case "pack": this.skeleton.override(playerAnimations.ConsumablePack_Equip.sample(this.equipAnimTimer.time), upperBodyMask); break;
                default: this.skeleton.override(playerAnimations.Equip_Generic.sample(this.equipAnimTimer.time), upperBodyMask); break;
                }
            } else {
                this.equipped.visible = true;
            }
            
            switch(anim.state) {
            case "crouch":
            case "jump":
            case "fall":
            case "land":
            case "stunned":
            case "stand": {
                const forward = new Vector3(0, 0, 1).applyQuaternion(player.rotation);
                const targetLookDir = new Vector3().copy(anim.targetLookDir);
                targetLookDir.normalize();
                const num = -70.0;
                const num2 = 70.0;
                const vector2 = new Vector3(forward.x, forward.z);
                const to = new Vector3(targetLookDir.x, targetLookDir.z);
                const num3 = Pod.Vec.signedAngle(vector2, to);
                if (num3 < num) {
                    const f = Math.PI / 180.0 * num;
                    const _num = Math.cos(f);
                    const _num2 = Math.sin(f);
                    to.x = vector2.x * _num - vector2.y * _num2;
                    to.y = vector2.x * _num2 + vector2.y * _num;
                } else if (num3 > num2) {
                    const f = Math.PI / 180.0 * num2;
                    const _num = Math.cos(f);
                    const _num2 = Math.sin(f);
                    to.x = vector2.x * _num - vector2.y * _num2;
                    to.y = vector2.x * _num2 + vector2.y * _num;
                }
                const vector3 = new Vector3(to.x, to.y);
                vector3.normalize();
                const right = new Vector3(1, 0, 0).applyQuaternion(player.rotation);
                const rhs = new Vector3(right.x, right.z);
                rhs.normalize();
                const vector4 = new Vector3(forward.x, forward.z);
                vector4.normalize();
                const num4 = 1.2217305;
                let num5 = Math.asin(targetLookDir.y);
                num5 /= num4;
                const num6 = Pod.Vec.dot(vector3, rhs);
                const num7 = Pod.Vec.dot(vector3, vector4);
                const value = ((num6 < 0) ? ((!(num7 < 0)) ? ((0 - Math.asin(0 - num6)) / num4) : (-1)) : ((!(num7 < 0)) ? (Math.asin(num6) / num4) : 1));
    
                aimOffset.point.y = -num5;
                aimOffset.point.x = value;
    
                this.skeleton.additive(aimOffset.sample(this.movementAnimTimer.time), 1);
            } break;
            }

            if (!this.equipAnimTimer.isPlaying) {
                const dist = 10;
                this.skeleton.joints.head.getWorldPosition(this.aimTarget.position);
                this.aimTarget.position.x += anim.targetLookDir.x * dist;
                this.aimTarget.position.y += anim.targetLookDir.y * dist;
                this.aimTarget.position.z += anim.targetLookDir.z * dist;

                switch (this.equippedItem?.model?.archetype) {
                case "pistol":
                case "rifle": {
                    this.aimIK.update();

                    if (this.equippedItem !== undefined) {
                        this.equippedItem.model.leftHand.getWorldPosition(this.leftTarget.position);
                        this.leftIK.update();
                    }
                } break;
                default: break;
                }
            }   
        }

        this.render(player);
    }

    public render(player: Player): void {
        this.root.position.copy(player.position);
        this.anchor.quaternion.copy(player.rotation);

        getWorldPos(worldPos, this.skeleton);

        const pM = new Matrix4();
        this.head = consume("Sphere.MeshPhong", pM.compose(worldPos.head, zeroQ, headScale), this.color);

        let i = 0;
        let j = 0;

        Pod.Vec.copy(bodyTop, worldPos.neck);

        Pod.Vec.mid(bodyBottom, worldPos.leftUpperLeg, worldPos.rightUpperLeg);

        pM.lookAt(temp.copy(bodyBottom).sub(bodyTop), zeroV, upV);
        scale.z = Pod.Vec.dist(bodyTop, bodyBottom);
        pM.compose(temp.copy(bodyTop), rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(bodyTop, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(bodyBottom, zeroQ, sM), this.color);

        pM.lookAt(temp.copy(worldPos.leftLowerArm).sub(worldPos.leftUpperArm), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.leftUpperArm, worldPos.leftLowerArm);
        pM.compose(worldPos.leftUpperArm, rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        pM.lookAt(temp.copy(worldPos.leftHand!).sub(worldPos.leftLowerArm), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.leftLowerArm, worldPos.leftHand!);
        pM.compose(worldPos.leftLowerArm, rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.leftUpperArm, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.leftLowerArm, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.leftHand, zeroQ, sM), this.color);

        pM.lookAt(temp.copy(worldPos.rightLowerArm).sub(worldPos.rightUpperArm), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.rightUpperArm, worldPos.rightLowerArm);
        pM.compose(worldPos.rightUpperArm, rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        pM.lookAt(temp.copy(worldPos.rightHand!).sub(worldPos.rightLowerArm), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.rightLowerArm, worldPos.rightHand!);
        pM.compose(worldPos.rightLowerArm, rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.rightUpperArm, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.rightLowerArm, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.rightHand, zeroQ, sM), this.color);

        pM.lookAt(temp.copy(worldPos.leftLowerLeg).sub(worldPos.leftUpperLeg), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.leftUpperLeg, worldPos.leftLowerLeg);
        pM.compose(worldPos.leftUpperLeg, rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        pM.lookAt(temp.copy(worldPos.leftFoot!).sub(worldPos.leftLowerLeg), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.leftLowerLeg, worldPos.leftFoot);
        pM.compose(worldPos.leftLowerLeg, rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.leftUpperLeg, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.leftLowerLeg, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.leftFoot, zeroQ, sM), this.color);

        pM.lookAt(temp.copy(worldPos.rightLowerLeg).sub(worldPos.rightUpperLeg), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.rightUpperLeg, worldPos.rightLowerLeg);
        pM.compose(worldPos.rightUpperLeg, rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        pM.lookAt(temp.copy(worldPos.rightFoot!).sub(worldPos.rightLowerLeg), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.rightLowerLeg, worldPos.rightFoot!);
        pM.compose(worldPos.rightLowerLeg, rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.rightUpperLeg, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.rightLowerLeg, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.rightFoot, zeroQ, sM), this.color);
    }

    public updateTmp(player: Player, camera: Camera, stats?: PlayerStats, backpack?: PlayerBackpack) {
        if (this.tmp !== undefined) {
            if (stats === undefined) {
                this.tmp.visible = false;   
                return;
            }
            
            const nickname = player.nickname;
            const health = `Health: ${Math.round(stats.health * 100).toString().padStart(3)}%`;
            const infectionValue = Math.round(stats.infection * 100);
            const infection = `${(infectionValue >= 10 ? ` (${infectionValue.toString().padStart(3)}%)` : "")}`;
            if (backpack === undefined) {
                this.tmp.text = `${nickname}
${health}${infection}
Main: ${Math.round(stats.primaryAmmo * 100).toString().padStart(3)}%
Special: ${Math.round(stats.secondaryAmmo * 100).toString().padStart(3)}%
Tool: ${Math.round(stats.toolAmmo * 100).toString().padStart(3)}%`;
                this.tmp.colorRanges = {
                    0: playerColors[player.slot],
                    [nickname.length]: 0xffffff,
                };
            } else {
                const main = specification.equippable.get(backpack.slots[inventorySlotMap.get("main")!]);
                const special = specification.equippable.get(backpack.slots[inventorySlotMap.get("special")!]);
                const tool = specification.equippable.get(backpack.slots[inventorySlotMap.get("tool")!]);
                this.tmp.text = `${nickname}
${health}${infection}
${(main !== undefined && main.name !== undefined ? main.name : "Main")}: ${Math.round(stats.primaryAmmo * 100).toString().padStart(3)}%
${(special !== undefined && special.name !== undefined ? special.name : "Special")}: ${Math.round(stats.secondaryAmmo * 100).toString().padStart(3)}%
${(tool !== undefined && tool.name !== undefined ? tool.name : "Tool")}: ${Math.round(stats.toolAmmo * 100).toString().padStart(3)}%`;
                this.tmp.colorRanges = {
                    0: playerColors[player.slot],
                    [nickname.length]: 0xffffff,
                    [nickname.length + health.length + 1]: 0x03e8fc, 
                    [nickname.length + health.length + 1 + infection.length]: 0xffffff
                };
            }
            this.tmp.visible = true;

            this.tmp.getWorldPosition(tmpPos);
            camera.getWorldPosition(camPos);

            const lerp = Math.clamp01(camPos.distanceTo(tmpPos) / 30);
            this.tmp.fontSize = lerp * 0.3 + 0.05;
            this.tmp.lookAt(camPos);
        }
    }

    public updateBackpack(player: Player, backpack?: PlayerBackpack) {
        if (backpack === undefined) return;

        this.equippedItem = undefined;
        this.equippedSlot = undefined;
        for (let i = 0; i < this.slots.length; ++i) {
            const item = this.slots[i];
            if (item.model !== undefined) {
                item.model.group.removeFromParent();
            }

            if (item.model === undefined || backpack.slots[i] !== item.id) {
                item.id = backpack.slots[i];
                item.model = specification.equippable.get(backpack.slots[i])?.model();
            }

            if (item.model !== undefined) {
                if (item.id === player.equippedId) {
                    this.equipped.add(item.model.group);
                    this.equippedItem = item;
                    this.equippedSlot = inventorySlots[i];
                    item.model.group.position.copy(item.model.equipOffsetPos);
                    item.model.group.quaternion.copy(item.model.equipOffsetRot);
                } else {
                    this.backpackAligns[i].add(item.model.group);
                    item.model.group.position.copy(item.model.offsetPos);
                    item.model.group.quaternion.copy(item.model.offsetRot);
                }
            }
        }
    }

    public dispose() {
        this.tmp?.dispose();
        this.tmp = undefined;
    }
}

export const playerColors: ColorRepresentation[] = [
    0xc21f4e,
    0x18935e,
    0x20558c,
    0x7a1a8e
];

ModuleLoader.registerRender("Players", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const time = snapshot.time();
            const camera = renderer.get("Camera")!;
            const models = renderer.getOrDefault("Players", () => new Map());
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
            const anims = snapshot.getOrDefault("Vanilla.Player.Animation", () => new Map());
            const backpacks = snapshot.getOrDefault("Vanilla.Player.Backpack", () => new Map());
            const stats = snapshot.getOrDefault("Vanilla.Player.Stats", () => new Map());
            for (const [id, player] of players) {
                if (!models.has(id)) {
                    const model = new PlayerModel(new Color(playerColors[player.slot]));
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.setVisible(player.dimension === renderer.get("Dimension"));
                
                if (model.anchor.visible) {
                    const backpack = backpacks.get(id);
                    model.updateBackpack(player, backpack);
                    model.updateTmp(player, camera, stats.get(id), backpack);

                    if (anims.has(id)) {
                        const anim = anims.get(id)!;
                        model.update(time, player, anim);
                    }
                }
            }

            for (const [id, model] of [...models.entries()]) {
                if (!players.has(id)) {
                    model.removeFromScene(renderer.scene);
                    model.dispose();
                    models.delete(id);
                }
            }
        } 
    }]);
});

ModuleLoader.registerDispose((renderer) => {
    const models = renderer.getOrDefault("Players", () => new Map());
    for (const model of models.values()) {
        model.dispose();
    }
});