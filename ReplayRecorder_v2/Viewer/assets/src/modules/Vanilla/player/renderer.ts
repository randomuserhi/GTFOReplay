import { Camera, Color, ColorRepresentation, Group, Matrix4, Object3D, Quaternion, Scene, Vector3 } from "three";
import { Text } from "troika-three-text";
import { consume } from "../../../replay/instancing.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";
import { Equippable } from "../Equippable/equippable.js";
import { AnimBlend, AnimTimer } from "../animations/animation.js";
import { Human, HumanFrame, apply, blend, defaultHumanStructure } from "../animations/human.js";
import { Rifle_AO_C } from "../animations/player/Rifle_AO_C.js";
import { Rifle_AO_D } from "../animations/player/Rifle_AO_D.js";
import { Rifle_AO_L } from "../animations/player/Rifle_AO_L.js";
import { Rifle_AO_LD } from "../animations/player/Rifle_AO_LD.js";
import { Rifle_AO_LU } from "../animations/player/Rifle_AO_LU.js";
import { Rifle_AO_R } from "../animations/player/Rifle_AO_R.js";
import { Rifle_AO_RD } from "../animations/player/Rifle_AO_RD.js";
import { Rifle_AO_RU } from "../animations/player/Rifle_AO_RU.js";
import { Rifle_AO_U } from "../animations/player/Rifle_AO_U.js";
import { Rifle_CrouchLoop } from "../animations/player/Rifle_CrouchLoop.js";
import { Rifle_Crouch_WalkBwd } from "../animations/player/Rifle_Crouch_WalkBwd.js";
import { Rifle_Crouch_WalkFwd } from "../animations/player/Rifle_Crouch_WalkFwd.js";
import { Rifle_Crouch_WalkLt } from "../animations/player/Rifle_Crouch_WalkLt.js";
import { Rifle_Crouch_WalkRt } from "../animations/player/Rifle_Crouch_WalkRt.js";
import { Rifle_Idle } from "../animations/player/Rifle_Idle.js";
import { Rifle_Jog_Backward } from "../animations/player/Rifle_Jog_Backward.js";
import { Rifle_Jog_BackwardLeft } from "../animations/player/Rifle_Jog_BackwardLeft.js";
import { Rifle_Jog_BackwardRight } from "../animations/player/Rifle_Jog_BackwardRight.js";
import { Rifle_Jog_Forward } from "../animations/player/Rifle_Jog_Forward.js";
import { Rifle_Jog_ForwardLeft } from "../animations/player/Rifle_Jog_ForwardLeft.js";
import { Rifle_Jog_ForwardRight } from "../animations/player/Rifle_Jog_ForwardRight.js";
import { Rifle_Jog_Left } from "../animations/player/Rifle_Jog_Left.js";
import { Rifle_Jog_Right } from "../animations/player/Rifle_Jog_Right.js";
import { Rifle_RunBwdLoop } from "../animations/player/Rifle_RunBwdLoop.js";
import { Rifle_SprintFwdLoop } from "../animations/player/Rifle_SprintFwdLoop.js";
import { Rifle_SprintFwdLoop_Left } from "../animations/player/Rifle_SprintFwdLoop_Left.js";
import { Rifle_SprintFwdLoop_Right } from "../animations/player/Rifle_SprintFwdLoop_Right.js";
import { Rifle_StrafeLeft135Loop } from "../animations/player/Rifle_StrafeLeft135Loop.js";
import { Rifle_StrafeLeft45Loop } from "../animations/player/Rifle_StrafeLeft45Loop.js";
import { Rifle_StrafeLeftLoop } from "../animations/player/Rifle_StrafeLeftLoop.js";
import { Rifle_StrafeRight135Loop } from "../animations/player/Rifle_StrafeRight135Loop.js";
import { Rifle_StrafeRight45Loop } from "../animations/player/Rifle_StrafeRight45Loop.js";
import { Rifle_StrafeRightLoop } from "../animations/player/Rifle_StrafeRightLoop.js";
import { Rifle_StrafeRun135LeftLoop } from "../animations/player/Rifle_StrafeRun135LeftLoop.js";
import { Rifle_StrafeRun135LeftLoop_0 } from "../animations/player/Rifle_StrafeRun135LeftLoop_0.js";
import { Rifle_StrafeRun45LeftLoop } from "../animations/player/Rifle_StrafeRun45LeftLoop.js";
import { Rifle_StrafeRun45RightLoop } from "../animations/player/Rifle_StrafeRun45RightLoop.js";
import { Rifle_StrafeRunLeftLoop } from "../animations/player/Rifle_StrafeRunLeftLoop.js";
import { Rifle_StrafeRunRightLoop } from "../animations/player/Rifle_StrafeRunRightLoop.js";
import { Rifle_WalkBwdLoop } from "../animations/player/Rifle_WalkBwdLoop.js";
import { Rifle_WalkFwdLoop } from "../animations/player/Rifle_WalkFwdLoop.js";
import { upV, zeroQ, zeroV } from "../humanmodel.js";
import { specification } from "../specification.js";
import { PlayerAnimState } from "./animation.js";
import { Player } from "./player.js";
import { PlayerBackpack, inventorySlotMap, inventorySlots } from "./playerbackpack.js";
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

const worldPos: Human<Vector3> = {
    hip: new Vector3(),

    leftUpperLeg: new Vector3(),
    leftLowerLeg: new Vector3(),
    leftFoot: new Vector3(),
    
    rightUpperLeg: new Vector3(),
    rightLowerLeg: new Vector3(),
    rightFoot: new Vector3(),
    
    spine0: new Vector3(),
    spine1: new Vector3(),
    spine2: new Vector3(),
    
    leftShoulder: new Vector3(),
    leftUpperArm: new Vector3(),
    leftLowerArm: new Vector3(),
    leftHand: new Vector3(),
    
    rightShoulder: new Vector3(),
    rightUpperArm: new Vector3(),
    rightLowerArm: new Vector3(),
    rightHand: new Vector3(),

    neck: new Vector3(),
    head: new Vector3()
};
function getWorldPos(worldPos: Human<Vector3>, skeleton: Human<Object3D>): Human<Vector3> {
    skeleton.hip.getWorldPosition(worldPos.hip);

    skeleton.leftUpperLeg.getWorldPosition(worldPos.leftUpperLeg);
    skeleton.leftLowerLeg.getWorldPosition(worldPos.leftLowerLeg);
    skeleton.leftFoot!.getWorldPosition(worldPos.leftFoot!);

    skeleton.rightUpperLeg.getWorldPosition(worldPos.rightUpperLeg);
    skeleton.rightLowerLeg.getWorldPosition(worldPos.rightLowerLeg);
    skeleton.rightFoot!.getWorldPosition(worldPos.rightFoot!);

    skeleton.spine0.getWorldPosition(worldPos.spine0);
    skeleton.spine1.getWorldPosition(worldPos.spine1);
    skeleton.spine2.getWorldPosition(worldPos.spine2);

    skeleton.leftShoulder.getWorldPosition(worldPos.leftShoulder);
    skeleton.leftUpperArm.getWorldPosition(worldPos.leftUpperArm);
    skeleton.leftLowerArm.getWorldPosition(worldPos.leftLowerArm);
    skeleton.leftHand!.getWorldPosition(worldPos.leftHand!);

    skeleton.rightShoulder.getWorldPosition(worldPos.rightShoulder);
    skeleton.rightUpperArm.getWorldPosition(worldPos.rightUpperArm);
    skeleton.rightLowerArm.getWorldPosition(worldPos.rightLowerArm);
    skeleton.rightHand!.getWorldPosition(worldPos.rightHand!);
    
    skeleton.neck.getWorldPosition(worldPos.neck);
    skeleton.head.getWorldPosition(worldPos.head);
    
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

const upperBodyMask: Human<boolean> = {
    hip: false,

    leftUpperLeg: false,
    leftLowerLeg: false,

    rightUpperLeg: false,
    rightLowerLeg: false,

    spine0: true,
    spine1: true,
    spine2: true,

    leftShoulder: true,
    leftUpperArm: true,
    leftLowerArm: true,

    rightShoulder: true,
    rightUpperArm: true,
    rightLowerArm: true,

    neck: true,
    head: true,
};

const lowerBodyMask: Human<boolean> = {
    hip: true,

    leftUpperLeg: true,
    leftLowerLeg: true,

    rightUpperLeg: true,
    rightLowerLeg: true,

    spine0: false,
    spine1: false,
    spine2: false,

    leftShoulder: false,
    leftUpperArm: false,
    leftLowerArm: false,

    rightShoulder: false,
    rightUpperArm: false,
    rightLowerArm: false,

    neck: false,
    head: false,
};

const rifleStandMovement = new AnimBlend<HumanFrame>([
    { anim: Rifle_Jog_Forward, x: 0, y: 3.5 },
    { anim: Rifle_Jog_Backward, x: 0, y: -3.5 },
    { anim: Rifle_Jog_Right, x: 3.5, y: 0 },
    { anim: Rifle_Jog_Left, x: -3.5, y: 0 },
    { anim: Rifle_Jog_ForwardLeft, x: -2.56, y: 2.56 },
    { anim: Rifle_Jog_ForwardRight, x: 2.56, y: 2.56 },
    { anim: Rifle_Jog_BackwardRight, x: 2.56, y: -2.56 },
    { anim: Rifle_Jog_BackwardLeft, x: -2.56, y: -2.56 },
    { anim: Rifle_WalkFwdLoop, x: 0, y: 1.9 },
    { anim: Rifle_WalkBwdLoop, x: 0, y: -1.8 },
    { anim: Rifle_StrafeLeftLoop, x: -1.6, y: 0 },
    { anim: Rifle_StrafeLeft45Loop, x: -1.16, y: 1.16 },
    { anim: Rifle_StrafeLeft135Loop, x: -1.13, y: -1.13 },
    { anim: Rifle_StrafeRightLoop, x: 2, y: 0 },
    { anim: Rifle_StrafeRight45Loop, x: 1.37, y: 1.37 },
    { anim: Rifle_StrafeRight135Loop, x: 1.16, y: -1.16 },
    { anim: Rifle_Idle, x: 0, y: 0 },
    { anim: Rifle_SprintFwdLoop, x: 0, y: 6 },
    { anim: Rifle_RunBwdLoop, x: 0, y: -5 },
    { anim: Rifle_StrafeRunRightLoop, x: 6.8, y: 0 },
    { anim: Rifle_StrafeRunLeftLoop, x: -6.8, y: 0 },
    { anim: Rifle_StrafeRun45LeftLoop, x: -4.8, y: 4.8 },
    { anim: Rifle_StrafeRun135LeftLoop_0, x: 4.34, y: -4.34 },
    { anim: Rifle_StrafeRun45RightLoop, x: 4.8, y: 4.8 },
    { anim: Rifle_StrafeRun135LeftLoop, x: -4.9, y: -4.9 },
    { anim: Rifle_SprintFwdLoop_Left, x: -1.25, y: 5.85 },
    { anim: Rifle_SprintFwdLoop_Right, x: 1.25, y: 5.85 },
]);

const rifleCrouchMovement = new AnimBlend<HumanFrame>([
    { anim: Rifle_Crouch_WalkBwd, x: 0, y: -2 },
    { anim: Rifle_Crouch_WalkFwd, x: 0, y: 2 },
    { anim: Rifle_Crouch_WalkLt, x: -2, y: 0 },
    { anim: Rifle_Crouch_WalkRt, x: 2, y: 0 },
    { anim: Rifle_CrouchLoop, x: 0, y: 0 },
]);

const rifleMovement = new AnimBlend<HumanFrame>([
    { anim: rifleStandMovement, x: 0, y: 0 },
    { anim: rifleCrouchMovement, x: 1, y: 0 }
]);

const rifleAimOffset = new AnimBlend<HumanFrame>([
    { anim: Rifle_AO_U, x: 0, y: 1 },
    { anim: Rifle_AO_D, x: 0, y: -1 },
    { anim: Rifle_AO_L, x: -1, y: 1 },
    { anim: Rifle_AO_R, x: 1, y: 0 },
    { anim: Rifle_AO_LD, x: -1, y: -1 },
    { anim: Rifle_AO_LU, x: -1, y: 1 },
    { anim: Rifle_AO_RD, x: 1, y: -1 },
    { anim: Rifle_AO_RU, x: 1, y: 1 },
    { anim: Rifle_AO_C, x: 0, y: 0 },
]);

class PlayerModel  {
    root: Group;
    skeleton: Human<Group>;
    color: Color;

    head: number;
    parts: number[];
    points: number[];

    movementAnimTimer: AnimTimer;

    tmp?: Text;

    equipped: Group;

    slots: Equippable[];
    backpack: Group;
    backpackAligns: Group[];

    constructor(color: Color) {
        this.root = new Group();
        this.skeleton = {
            hip: new Group(),

            leftUpperLeg: new Group(),
            leftLowerLeg: new Group(),
            leftFoot: new Group(),
            
            rightUpperLeg: new Group(),
            rightLowerLeg: new Group(),
            rightFoot: new Group(),
            
            spine0: new Group(),
            spine1: new Group(),
            spine2: new Group(),
            
            leftShoulder: new Group(),
            leftUpperArm: new Group(),
            leftLowerArm: new Group(),
            leftHand: new Group(),
            
            rightShoulder: new Group(),
            rightUpperArm: new Group(),
            rightLowerArm: new Group(),
            rightHand: new Group(),

            neck: new Group(),
            head: new Group()
        };
        this.root.add(this.skeleton.hip);
        this.skeleton.hip.add(
            this.skeleton.spine0,
            this.skeleton.leftUpperLeg,
            this.skeleton.rightUpperLeg
        );
        this.skeleton.leftUpperLeg.add(this.skeleton.leftLowerLeg);
        this.skeleton.leftLowerLeg.add(this.skeleton.leftFoot!);
        this.skeleton.rightUpperLeg.add(this.skeleton.rightLowerLeg);
        this.skeleton.rightLowerLeg.add(this.skeleton.rightFoot!);
        this.skeleton.spine0.add(this.skeleton.spine1);
        this.skeleton.spine1.add(this.skeleton.spine2);
        this.skeleton.spine2.add(
            this.skeleton.neck,
            this.skeleton.leftShoulder,
            this.skeleton.rightShoulder
        );
        this.skeleton.leftShoulder.add(this.skeleton.leftUpperArm);
        this.skeleton.leftUpperArm.add(this.skeleton.leftLowerArm);
        this.skeleton.leftLowerArm.add(this.skeleton.leftHand!);
        this.skeleton.rightShoulder.add(this.skeleton.rightUpperArm);
        this.skeleton.rightUpperArm.add(this.skeleton.rightLowerArm);
        this.skeleton.rightLowerArm.add(this.skeleton.rightHand!);
        this.skeleton.neck.add(this.skeleton.head);

        this.skeleton.hip.position.copy(defaultHumanStructure.hip);
        this.skeleton.leftUpperLeg.position.copy(defaultHumanStructure.leftUpperLeg);
        this.skeleton.leftLowerLeg.position.copy(defaultHumanStructure.leftLowerLeg);
        this.skeleton.leftFoot!.position.copy(defaultHumanStructure.leftFoot!);
        this.skeleton.rightUpperLeg.position.copy(defaultHumanStructure.rightUpperLeg);
        this.skeleton.rightLowerLeg.position.copy(defaultHumanStructure.rightLowerLeg);
        this.skeleton.rightFoot!.position.copy(defaultHumanStructure.rightFoot!);
        this.skeleton.spine0.position.copy(defaultHumanStructure.spine0);
        this.skeleton.spine1.position.copy(defaultHumanStructure.spine1);
        this.skeleton.spine2.position.copy(defaultHumanStructure.spine2);
        this.skeleton.leftShoulder.position.copy(defaultHumanStructure.leftShoulder);
        this.skeleton.leftUpperArm.position.copy(defaultHumanStructure.leftUpperArm);
        this.skeleton.leftLowerArm.position.copy(defaultHumanStructure.leftLowerArm);
        this.skeleton.leftHand!.position.copy(defaultHumanStructure.leftHand!);
        this.skeleton.rightShoulder.position.copy(defaultHumanStructure.rightShoulder);
        this.skeleton.rightUpperArm.position.copy(defaultHumanStructure.rightUpperArm);
        this.skeleton.rightLowerArm.position.copy(defaultHumanStructure.rightLowerArm);
        this.skeleton.rightHand!.position.copy(defaultHumanStructure.rightHand!);
        this.skeleton.neck.position.copy(defaultHumanStructure.neck);
        this.skeleton.head.position.copy(defaultHumanStructure.head);

        this.movementAnimTimer = new AnimTimer(true); 
        this.movementAnimTimer.play(0);

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
        this.root.add(this.tmp);

        this.equipped = new Group();
        this.root.add(this.equipped);

        this.backpack = new Group();
        this.skeleton.spine1.add(this.backpack);

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

    public update(time: number, player: Player, anim: PlayerAnimState): void {
        this.movementAnimTimer.update(time);

        rifleStandMovement.point.x = anim.velocity.x;
        rifleStandMovement.point.y = anim.velocity.z;

        rifleCrouchMovement.point.x = anim.velocity.x;
        rifleCrouchMovement.point.y = anim.velocity.z;

        rifleMovement.point.x = anim.crouch;

        apply(this.skeleton, blend(this.movementAnimTimer.time, rifleMovement), lowerBodyMask);

        {
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

            rifleAimOffset.point.y = num5;
            rifleAimOffset.point.x = value;

            apply(this.skeleton, blend(this.movementAnimTimer.time, rifleAimOffset), upperBodyMask);
        }

        this.render(player);
    }

    public render(player: Player): void {
        this.root.position.copy(player.position);
        this.root.quaternion.copy(player.rotation);

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
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.leftHand!, zeroQ, sM), this.color);

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
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.rightHand!, zeroQ, sM), this.color);

        pM.lookAt(temp.copy(worldPos.leftLowerLeg).sub(worldPos.leftUpperLeg), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.leftUpperLeg, worldPos.leftLowerLeg);
        pM.compose(worldPos.leftUpperLeg, rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        pM.lookAt(temp.copy(worldPos.leftFoot!).sub(worldPos.leftLowerLeg), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.leftLowerLeg, worldPos.leftFoot!);
        pM.compose(worldPos.leftLowerLeg, rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.leftUpperLeg, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.leftLowerLeg, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.leftFoot!, zeroQ, sM), this.color);

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
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(worldPos.rightFoot!, zeroQ, sM), this.color);
    }

    public morph(player: Player) {
        this.root.position.set(player.position.x, player.position.y, player.position.z);
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
                    item.model.group.position.set(0, 0, 0);
                    item.model.group.quaternion.set(0, 0, 0, 1);
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
                
                if (model.root.visible) {
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