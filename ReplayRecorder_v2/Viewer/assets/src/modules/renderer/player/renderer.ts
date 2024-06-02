import { Camera, Color, ColorRepresentation, Group, Matrix4, Object3D, Quaternion, Scene, Vector3 } from "three";
import { Text } from "troika-three-text";
import { consume } from "../../../replay/instancing.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";
import { PlayerAnimState } from "../../parser/player/animation.js";
import { Player } from "../../parser/player/player.js";
import { InventorySlot, PlayerBackpack, inventorySlotMap, inventorySlots } from "../../parser/player/playerbackpack.js";
import { PlayerStats } from "../../parser/player/playerstats.js";
import { Model } from "../Equippable/equippable.js";
import { AnimBlend, Avatar, AvatarSkeleton, AvatarStructure, createAvatarStruct, difference, toAnim } from "../animations/animation.js";
import { animCrouch, animVelocity, playerAnimationClips, playerAnimations } from "../animations/assets.js";
import { HumanAnimation, HumanJoints, HumanMask, HumanSkeleton, defaultHumanStructure } from "../animations/human.js";
import { IKSolverAim } from "../animations/inversekinematics/aimsolver.js";
import { IKSolverArm, TrigonometricBone } from "../animations/inversekinematics/limbsolver.js";
import { Bone } from "../animations/inversekinematics/rootmotion.js";
import { upV, zeroQ, zeroV } from "../constants.js";
import { Archetype, ConsumableArchetype, Equippable, GearArchetype, MeleeArchetype, hammerArchetype, specification } from "../specification.js";

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

const aimOffset = new AnimBlend(HumanJoints, [
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), playerAnimationClips.Rifle_AO_C.frames[0], playerAnimationClips.Rifle_AO_U.frames[0])), x: 0, y: 1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), playerAnimationClips.Rifle_AO_C.frames[0], playerAnimationClips.Rifle_AO_D.frames[0])), x: 0, y: -1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), playerAnimationClips.Rifle_AO_C.frames[0], playerAnimationClips.Rifle_AO_L.frames[0])), x: -1, y: 1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), playerAnimationClips.Rifle_AO_C.frames[0], playerAnimationClips.Rifle_AO_R.frames[0])), x: 1, y: 0 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), playerAnimationClips.Rifle_AO_C.frames[0], playerAnimationClips.Rifle_AO_LD.frames[0])), x: -1, y: -1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), playerAnimationClips.Rifle_AO_C.frames[0], playerAnimationClips.Rifle_AO_LU.frames[0])), x: -1, y: 1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), playerAnimationClips.Rifle_AO_C.frames[0], playerAnimationClips.Rifle_AO_RD.frames[0])), x: 1, y: -1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), playerAnimationClips.Rifle_AO_C.frames[0], playerAnimationClips.Rifle_AO_RU.frames[0])), x: 1, y: 1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), playerAnimationClips.Rifle_AO_C.frames[0], playerAnimationClips.Rifle_AO_C.frames[0])), x: 0, y: 0 },
]);

const _tempAvatar = new Avatar(HumanJoints);
class PlayerModel  {
    root: Group;
    anchor: Group;
    color: Color;
    
    skeleton: HumanSkeleton;
    visual: HumanSkeleton;
    
    aimIK: IKSolverAim;
    aimTarget: Object3D;
    
    leftIK: IKSolverArm;
    leftTarget: Object3D;

    head: number;
    parts: number[];
    points: number[];

    tmp?: Text;

    handAttachment: Group;
    equipped: Group;
    equippedItem?: { spec?: Equippable, model?: Model };
    equippedSlot?: InventorySlot;
    lastEquipped: number;

    slots: { spec?: Equippable, model?: Model }[];
    backpack: Group;
    backpackAligns: Group[];

    lastArchetype: Archetype;
    meleeArchetype: MeleeArchetype;
    consumableArchetype?: ConsumableArchetype;
    gearArchetype?: GearArchetype;

    offset: number;

    private construct(skeleton: HumanSkeleton) {
        skeleton.joints.hip.add(
            skeleton.joints.spine0,
            skeleton.joints.leftUpperLeg,
            skeleton.joints.rightUpperLeg
        );
        skeleton.joints.leftUpperLeg.add(skeleton.joints.leftLowerLeg);
        skeleton.joints.leftLowerLeg.add(skeleton.joints.leftFoot!);
        skeleton.joints.rightUpperLeg.add(skeleton.joints.rightLowerLeg);
        skeleton.joints.rightLowerLeg.add(skeleton.joints.rightFoot!);
        skeleton.joints.spine0.add(skeleton.joints.spine1);
        skeleton.joints.spine1.add(skeleton.joints.spine2);
        skeleton.joints.spine2.add(
            skeleton.joints.neck,
            skeleton.joints.leftShoulder,
            skeleton.joints.rightShoulder
        );
        skeleton.joints.leftShoulder.add(skeleton.joints.leftUpperArm);
        skeleton.joints.leftUpperArm.add(skeleton.joints.leftLowerArm);
        skeleton.joints.leftLowerArm.add(skeleton.joints.leftHand!);
        skeleton.joints.rightShoulder.add(skeleton.joints.rightUpperArm);
        skeleton.joints.rightUpperArm.add(skeleton.joints.rightLowerArm);
        skeleton.joints.rightLowerArm.add(skeleton.joints.rightHand!);
        skeleton.joints.neck.add(skeleton.joints.head);
        
        skeleton.setPos(defaultHumanStructure);
    }

    constructor(color: Color) {
        this.root = new Group();
        this.anchor = new Group();
        this.root.add(this.anchor);

        this.skeleton = new AvatarSkeleton(HumanJoints, "hip");
        this.visual = new AvatarSkeleton(HumanJoints, "hip");

        this.construct(this.skeleton);
        this.construct(this.visual);

        this.anchor.add(this.visual.joints.hip);
        this.anchor.add(this.skeleton.joints.hip);
        this.skeleton.root.visible = false;

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
        this.visual.joints.spine1.add(this.backpack);

        this.slots = new Array(inventorySlots.length);
        this.backpackAligns = new Array(inventorySlots.length);
        this.equippedItem = undefined;
        for (let i = 0; i < inventorySlots.length; ++i) {
            this.slots[i] = { spec: undefined, model: undefined };

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

        this.backpackAligns[inventorySlotMap.get("consumable")!].position.set(0.15, -0.2, -0.1);
        this.backpackAligns[inventorySlotMap.get("consumable")!].quaternion.set(0, -0.263914526, 0, -0.964546144);
        this.backpackAligns[inventorySlotMap.get("consumable")!].scale.set(0.7, 0.7, 0.7);

        this.backpackAligns[inventorySlotMap.get("heavyItem")!].visible = false;

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
    
        this.lastArchetype = "rifle";
        this.meleeArchetype = hammerArchetype;

        this.offset = Math.random() * 10;
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

    public update(dt: number, time: number, player: Player, anim: PlayerAnimState): void {
        this.animate(time, player, anim);
        this.render(dt, player);
    }
    
    public animate(time: number, player: Player, anim: PlayerAnimState): void {
        this.skeleton.joints.rightHand.add(this.handAttachment);
        this.equippedItem?.model?.reset();
        this.equipped.visible = true;

        time /= 1000; // NOTE(randomuserhi): Animations are handled using seconds, convert ms to seconds
        const offsetTime = time + this.offset;

        animVelocity.x = anim.velocity.x;
        animVelocity.y = anim.velocity.z;
        animCrouch.x = anim.crouch;

        const equipTime = time - (player.lastEquippedTime / 1000);
        switch (this.lastArchetype) {
        case "pistol": this.skeleton.override(playerAnimations.pistolMovement.sample(offsetTime)); break;
        case "rifle": this.skeleton.override(playerAnimations.rifleMovement.sample(offsetTime)); break;
        default: this.skeleton.override(this.meleeArchetype.movementAnim.sample(offsetTime)); break;
        }
        
        if (this.lastArchetype !== this.equippedItem?.spec?.archetype) {
            const blend = Math.clamp01(equipTime / 0.2);
            if (blend === 1 && this.equippedItem?.spec !== undefined) {
                this.lastArchetype = this.equippedItem.spec?.archetype;
            }

            switch (this.equippedItem?.spec?.archetype) {
            case "pistol": this.skeleton.blend(playerAnimations.pistolMovement.sample(offsetTime), blend); break;
            case "rifle": this.skeleton.blend(playerAnimations.rifleMovement.sample(offsetTime), blend); break;
            default: this.skeleton.blend(this.meleeArchetype.movementAnim.sample(offsetTime), blend); break;
            }
        }

        const downedTime = time - (anim.lastDowned / 1000);
        const reviveTime = time - (anim.lastRevive / 1000);
        if (reviveTime < playerAnimationClips.Revive.duration) {
            this.equipped.visible = false;
            
            this.skeleton.override(playerAnimationClips.Revive.sample(reviveTime));
            return;
        } else if (anim.isDowned) {
            this.equipped.visible = false;
            
            if (downedTime < playerAnimationClips.Die.duration) {
                this.skeleton.override(playerAnimationClips.Die.sample(downedTime));
            } else {
                this.skeleton.override(playerAnimationClips.Dead.sample(downedTime));
            }
            return;
        } 
        
        const stateTime = time - (anim.lastStateTransition / 1000);
        switch(anim.state) {
        case "jump": {
            switch (this.equippedItem?.spec?.archetype) {
            case "pistol": this.skeleton.override(playerAnimationClips.Pistol_Jump.sample(stateTime)); break;
            case "rifle": this.skeleton.override(playerAnimationClips.Rifle_Jump.sample(stateTime)); break;
            default: this.skeleton.override(this.meleeArchetype.jumpAnim.sample(stateTime)); break;
            }
        } break;
        case "fall": {
            const blendWeight = Math.clamp01(stateTime / 0.2);
            switch (this.equippedItem?.spec?.archetype) {
            case "pistol": this.skeleton.blend(playerAnimationClips.Pistol_Fall.sample(stateTime), blendWeight); break;
            case "rifle": this.skeleton.blend(playerAnimationClips.Rifle_Fall.sample(stateTime), blendWeight); break;
            default: this.skeleton.blend(this.meleeArchetype.fallAnim.sample(stateTime), blendWeight); break;
            }
        } break;
        case "land": {
            const isSlow = (Math.abs(anim.velocity.x) < 0.08 && Math.abs(anim.velocity.z) < 0.08);
            const blendWeight = 1 - Math.clamp01(stateTime / (isSlow ? 1 : 0.5));
            switch (this.equippedItem?.spec?.archetype) {
            case "pistol": this.skeleton.blend(playerAnimationClips.Pistol_Land.sample(stateTime), blendWeight); break;
            case "rifle": this.skeleton.blend(playerAnimationClips.Rifle_Land.sample(stateTime), blendWeight); break;
            default: this.skeleton.blend(this.meleeArchetype.landAnim.sample(stateTime), blendWeight); break;
            }
        } break;
        case "climbLadder": {
            const blendWeight = Math.clamp01(stateTime / 0.2);
            this.skeleton.blend(playerAnimations.ladderMovement.sample(stateTime), blendWeight);
        } break;
        }

        if (anim.state === "climbLadder") {
            this.equipped.visible = false;
            return;
        }

        const shoveTime = time - (anim.lastShoveTime / 1000);
        const shoveDuration = this.equippedItem?.spec?.archetype === "melee" ? this.meleeArchetype.shoveAnim.duration : this.meleeArchetype.shoveAnim.duration * 0.6;
        const isShoving = shoveTime < shoveDuration;
        if (isShoving) {
            this.equipped.visible = true;
            this.skeleton.blend(
                this.meleeArchetype.shoveAnim.sample(shoveTime), Math.clamp01(shoveTime / 0.2), upperBodyMask);
        }

        if (this.equippedItem !== undefined) {
            const equipDuration = 0.5;
            const isEquipping = equipTime < equipDuration && !isShoving;
            if (isEquipping) {
                this.equipped.visible = equipTime > equipDuration / 2.0;
                const blend = Math.clamp01(equipTime / 0.2);
                switch (this.equippedSlot) {
                case "melee": this.skeleton.blend(this.meleeArchetype.equipAnim.sample(equipTime / equipDuration * this.meleeArchetype.equipAnim.duration), blend, upperBodyMask); break;
                case "main": this.skeleton.blend(playerAnimationClips.Equip_Primary.sample(equipTime / equipDuration * playerAnimationClips.Equip_Primary.duration), blend, upperBodyMask); break;
                case "special": this.skeleton.blend(playerAnimationClips.Equip_Secondary.sample(equipTime / equipDuration * playerAnimationClips.Equip_Secondary.duration), blend, upperBodyMask); break;
                case "pack": this.skeleton.blend(playerAnimationClips.ConsumablePack_Equip.sample(equipTime / equipDuration * playerAnimationClips.ConsumablePack_Equip.duration), blend, upperBodyMask); break;
                case "consumable": {
                    let equipAnim = this.consumableArchetype?.equipAnim;
                    if (equipAnim === undefined) equipAnim = playerAnimationClips.Consumable_Throw_Equip;
                    this.skeleton.blend(equipAnim.sample(equipTime / equipDuration * equipAnim.duration), blend, upperBodyMask);
                } break;
                default: this.skeleton.blend(playerAnimationClips.Equip_Generic.sample(equipTime), blend, upperBodyMask); break;
                }
            } else {
                this.equipped.visible = true;
            }

            switch(anim.state) {
            case "jump":
            case "fall":
            case "land":
            case "crouch":
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

                this.skeleton.additive(aimOffset.sample(time), 1);
            } break;
            }

            if (!isEquipping && player.equippedId !== 0) {
                const dist = 10;
                this.skeleton.joints.head.getWorldPosition(this.aimTarget.position);
                this.aimTarget.position.x += anim.targetLookDir.x * dist;
                this.aimTarget.position.y += anim.targetLookDir.y * dist;
                this.aimTarget.position.z += anim.targetLookDir.z * dist;

                switch (this.equippedItem.spec?.archetype) {
                case "pistol":
                case "rifle": {
                    this.aimIK.update();

                    const reloadTime = time - (anim.lastReloadTransition / 1000);
                    if (this.gearArchetype !== undefined && anim.isReloading && reloadTime < anim.reloadDuration) {
                        if (this.gearArchetype.gunFoldAnim !== undefined && this.equippedItem.model !== undefined) {
                            this.equippedItem.model.update(this.gearArchetype.gunFoldAnim.sample(reloadTime / anim.reloadDuration * this.gearArchetype.gunFoldAnim.duration));

                            if (this.equippedItem.model.leftHand !== undefined) {
                                if (this.gearArchetype.offset !== undefined) {
                                    this.equippedItem.model.leftHand.position.add(this.gearArchetype.offset);
                                }
                                this.equippedItem.model.leftHand.getWorldPosition(this.leftTarget.position);
                                this.leftIK.update();
                            }
                        }
                    } else {
                        const shotTime = time - (anim.lastShot / 1000);
                        const recoilAnim = this.equippedItem.spec?.archetype === "pistol" ? playerAnimationClips.Pistol_Recoil : playerAnimationClips.Rifle_Recoil;
                        if (shotTime < recoilAnim.duration) {
                            this.skeleton.additive(difference(_tempAvatar, recoilAnim.frames[0], recoilAnim.sample(shotTime)), 1, upperBodyMask);
                        }

                        if (this.equippedItem !== undefined && this.equippedItem.model !== undefined && this.equippedItem.model.leftHand !== undefined) {
                            this.equippedItem.model.leftHand.getWorldPosition(this.leftTarget.position);
                            this.leftIK.update();
                        }
                    }
                } break;
                case "melee": {
                    if (!isShoving) {
                        const swingTime = time - (anim.lastSwingTime / 1000);
                        let swingAnim: HumanAnimation | undefined = undefined;
                        const isSwinging = swingTime < this.meleeArchetype.releaseAnim.duration;
                        if (anim.chargedSwing && isSwinging) {
                            swingAnim = this.meleeArchetype.releaseAnim;
                        } else if (!anim.chargedSwing && isSwinging) {
                            swingAnim = this.meleeArchetype.attackAnim;
                        }
                        if (swingAnim !== undefined) {
                            this.skeleton.blend(swingAnim.sample(swingTime), Math.clamp01(swingTime / 0.2), upperBodyMask);
                        } 
                    }
                    const chargeTime = time - (anim.lastMeleeChargingTransition / 1000);
                    if (anim.meleeCharging) { // not charging -> charging
                        const blend = Math.clamp01(chargeTime / 0.2);
                        if (chargeTime < this.meleeArchetype.chargeAnim.duration) {
                            this.skeleton.blend(this.meleeArchetype.chargeAnim.sample(chargeTime), blend, upperBodyMask);
                        } else {
                            this.skeleton.blend(this.meleeArchetype.chargeIdleAnim.sample(chargeTime), blend, upperBodyMask);
                        }
                    } else { // charging -> not charging
                        if (chargeTime < 0.2) {
                            this.skeleton.blend(this.meleeArchetype.chargeIdleAnim.sample(chargeTime), 1.0 - (chargeTime / 0.2), upperBodyMask);
                        }
                    }
                } break;
                case "consumable": {
                    this.skeleton.override(playerAnimationClips.ConsumablePack_Idle.sample(time), upperBodyMask);

                    let throwAnim = this.consumableArchetype?.throwAnim;
                    if (throwAnim === undefined) throwAnim = playerAnimationClips.Consumable_Throw;
                    let chargeAnim = this.consumableArchetype?.chargeAnim;
                    if (chargeAnim === undefined) chargeAnim = playerAnimationClips.Consumable_Throw_Charge;
                    let chargeIdleAnim = this.consumableArchetype?.chargeIdleAnim;
                    if (chargeIdleAnim === undefined) chargeIdleAnim = playerAnimationClips.Consumable_Throw_Charge_Idle;

                    const throwTime = time - (anim.lastThrowTime / 1000);
                    let isThrowing = false;
                    if (throwTime < throwAnim.duration) {
                        isThrowing = true;
                        this.skeleton.blend(throwAnim.sample(throwTime), Math.clamp01(throwTime / 0.2), upperBodyMask);
                    } else if (throwTime < throwAnim.duration + 0.5) {
                        isThrowing = true;
                        const blend = Math.clamp01((throwTime - throwAnim.duration) / 0.5);
                        this.skeleton.blend(throwAnim.sample(throwAnim.duration - 0.01), 1.0 - blend, upperBodyMask);
                    }

                    const chargeTime = time - (anim.lastThrowChargingTransition / 1000);
                    let isCharging = false;
                    if (anim.throwCharging) { // not charging -> charging
                        isCharging = true;
                        const blend = Math.clamp01(chargeTime / 0.2);
                        if (chargeTime < chargeAnim.duration) {
                            this.skeleton.blend(chargeAnim.sample(chargeTime), blend, upperBodyMask);
                        } else {
                            this.skeleton.blend(chargeIdleAnim.sample(chargeTime), blend, upperBodyMask);
                        }
                    } else { // charging -> not charging
                        if (chargeTime < 0.2) {
                            isCharging = true;
                            this.skeleton.blend(chargeIdleAnim.sample(chargeTime), 1.0 - (chargeTime / 0.2), upperBodyMask);
                        }
                    }

                    if (!isCharging && !isThrowing && this.equippedItem !== undefined && this.equippedItem.model !== undefined && this.equippedItem.model.leftHand !== undefined) {
                        this.equippedItem.model.leftHand.getWorldPosition(this.leftTarget.position);
                        this.leftIK.update();
                    }
                } break;
                }
            }   
        }

        if (anim.state === "onTerminal") {
            const t = time - (anim.lastStateTransition / 1000);
            const blend = Math.clamp01(t / 0.2);
            this.skeleton.blend(playerAnimationClips.TerminalConsole_Idle.sample(t), blend);
            return;
        }
    }

    public render(dt: number, player: Player): void {
        this.root.position.copy(player.position);
        this.anchor.quaternion.copy(player.rotation);

        const blendFactor = Math.clamp01(dt * 20);
        for (const key of HumanJoints) {
            this.visual.joints[key].quaternion.slerp(this.skeleton.joints[key].quaternion, blendFactor);
        }
        this.visual.root.position.lerp(this.skeleton.root.position, blendFactor);
        getWorldPos(worldPos, this.visual);

        this.visual.joints.rightHand.add(this.handAttachment);

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

            if (item.model === undefined || backpack.slots[i] !== item.spec?.id) {
                item.spec = specification.equippable.get(backpack.slots[i]);
                item.model = item.spec?.model();
            }

            if (item.model !== undefined) {
                item.model.reset();
                
                if (item.spec?.id === player.equippedId) {
                    this.equippedItem = item;
                    this.equippedSlot = inventorySlots[i];

                    if (item.spec !== undefined) {
                        switch (item.spec.archetype) {
                        case "melee": {
                            if (specification.meleeArchetype.has(item.spec.id)) {
                                const archetype = specification.meleeArchetype.get(item.spec.id)!;
                                this.meleeArchetype = archetype;
                            }
                        } break;
                        case "consumable": {
                            this.consumableArchetype = specification.consumableArchetype.get(item.spec.id);
                        } break;
                        case "pistol":
                        case "rifle": {
                            this.gearArchetype = specification.gearArchetype.get(item.spec.id);
                        } break;
                        }
                    }

                    this.equipped.add(item.model.group);
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
        name, pass: (renderer, snapshot, dt) => {
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
                        model.update(dt, time, player, anim);
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