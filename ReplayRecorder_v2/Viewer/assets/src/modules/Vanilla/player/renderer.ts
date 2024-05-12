import { Camera, Color, ColorRepresentation, Group, Matrix4, Object3D, Quaternion, Scene, Vector3 } from "three";
import { Text } from "troika-three-text";
import { consume } from "../../../replay/instancing.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";
import { Equippable } from "../Equippable/equippable.js";
import { AnimBlend, AnimTimer, Avatar, AvatarSkeleton, AvatarStructure, createAvatarStruct, difference, toAnim } from "../animations/animation.js";
import { playerAnimations } from "../animations/assets.js";
import { HumanJoints, HumanMask, HumanSkeleton, defaultHumanStructure } from "../animations/human.js";
import { IKSolverAim } from "../animations/inversekinematics/aimsolver.js";
import { Bone } from "../animations/inversekinematics/rootmotion.js";
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
    { anim: playerAnimations.Rifle_StrafeRunLeftLoop, x: -6.8, y: 0 },
    { anim: playerAnimations.Rifle_StrafeRun45LeftLoop, x: -4.8, y: 4.8 },
    { anim: playerAnimations.Rifle_StrafeRun135LeftLoop_0, x: 4.34, y: -4.34 },
    { anim: playerAnimations.Rifle_StrafeRun45RightLoop, x: 4.8, y: 4.8 },
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

const rifleAimOffset = new AnimBlend(HumanJoints, [
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

class PlayerModel  {
    root: Group;
    anchor: Group;
    color: Color;
    
    skeleton: HumanSkeleton;
    gun: Group;
    rightHandAttachment: Group;
    leftHandAttachment: Group;
    
    aimIK: IKSolverAim;
    aimTarget: Object3D;
    
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

        // Attachment transforms for guns
        this.leftHandAttachment = new Group();
        this.skeleton.joints.leftHand.add(this.leftHandAttachment);
        this.leftHandAttachment.quaternion.set(0.5, 0.5, 0.5, 0.5);
        this.leftHandAttachment.position.set(0.1, -0.045, 0);

        this.rightHandAttachment = new Group();
        this.skeleton.joints.rightHand.add(this.rightHandAttachment);
        this.rightHandAttachment.quaternion.set(0.5, 0.5, 0.5, 0.5);
        this.rightHandAttachment.position.set(0.1, 0.045, 0);

        this.gun = new Group();
        this.rightHandAttachment.add(this.gun);
        this.gun.position.set(0, 0, 0.5);

        this.skeleton.set(defaultHumanStructure);

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
        this.anchor.add(this.tmp);

        this.equipped = new Group();
        this.anchor.add(this.equipped);

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

        this.aimIK = new IKSolverAim();
        this.aimIK.transform = this.gun;
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

        this.aimTarget.position.set(0, 0, 0);
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

        this.skeleton.override(rifleMovement.sample(this.movementAnimTimer.time));

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
    
            rifleAimOffset.point.y = -num5;
            rifleAimOffset.point.x = value;
    
            this.skeleton.additive(rifleAimOffset.sample(this.movementAnimTimer.time), 1);
        } break;
        }

        const dist = 10;
        this.skeleton.joints.head.getWorldPosition(this.aimTarget.position);
        this.aimTarget.position.x += anim.targetLookDir.x * dist;
        this.aimTarget.position.y += anim.targetLookDir.y * dist;
        this.aimTarget.position.z += anim.targetLookDir.z * dist;
        this.aimIK.update();
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

        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(this.aimTarget.position, zeroQ, sM), new Color(0xffffff));
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(this.rightHandAttachment.getWorldPosition(new Vector3()), zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(this.gun.getWorldPosition(new Vector3()), zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(this.gun.getWorldPosition(new Vector3()).add(this.aimIK.transformAxis()), zeroQ, sM), new Color(0xffff00));
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