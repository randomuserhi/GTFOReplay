import { signal } from "@esm/@/rhu/signal.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { CylinderGeometry, Group, Mesh, MeshPhongMaterial, Object3D, Quaternion, Vector3 } from "@esm/three";
import { Text } from "@esm/troika-three-text";
import { Ragdoll } from "@root/profiles/extensions/ragdoll/parser/ragdoll.js";
import { GearDatablock, GunArchetype, MeleeArchetype } from "../../datablocks/gear/models.js";
import { Archetype, ItemArchetype, ItemDatablock } from "../../datablocks/items/item.js";
import { animCrouch, animVelocity, PlayerAnimDatablock } from "../../datablocks/player/animation.js";
import { IKSolverAim } from "../../library/animations/inversekinematics/aimsolver.js";
import { IKSolverArm, TrigonometricBone } from "../../library/animations/inversekinematics/limbsolver.js";
import { Bone } from "../../library/animations/inversekinematics/rootmotion.js";
import { AnimBlend, Avatar, difference, toAnim } from "../../library/animations/lib.js";
import { white, zeroQ, zeroV } from "../../library/constants.js";
import { Identifier, IdentifierData } from "../../parser/identifier.js";
import { PlayerAnimState } from "../../parser/player/animation.js";
import { InventorySlot, inventorySlotMap, inventorySlots, PlayerBackpack } from "../../parser/player/backpack.js";
import { Player } from "../../parser/player/player.js";
import { Sentry } from "../../parser/player/sentry.js";
import { PlayerStats } from "../../parser/player/stats.js";
import { HumanAnimation, HumanJoints, HumanMask } from "../animations/human.js";
import { GearModel } from "../models/gear.js";
import { ItemModel } from "../models/items.js";
import { StickFigure } from "../models/stickfigure.js";
import { Camera } from "../renderer.js";

const upperBodyMask: HumanMask = {
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
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), PlayerAnimDatablock.Rifle_AO_C.first(), PlayerAnimDatablock.Rifle_AO_U.first())), x: 0, y: 1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), PlayerAnimDatablock.Rifle_AO_C.first(), PlayerAnimDatablock.Rifle_AO_D.first())), x: 0, y: -1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), PlayerAnimDatablock.Rifle_AO_C.first(), PlayerAnimDatablock.Rifle_AO_L.first())), x: -1, y: 1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), PlayerAnimDatablock.Rifle_AO_C.first(), PlayerAnimDatablock.Rifle_AO_R.first())), x: 1, y: 0 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), PlayerAnimDatablock.Rifle_AO_C.first(), PlayerAnimDatablock.Rifle_AO_LD.first())), x: -1, y: -1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), PlayerAnimDatablock.Rifle_AO_C.first(), PlayerAnimDatablock.Rifle_AO_LU.first())), x: -1, y: 1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), PlayerAnimDatablock.Rifle_AO_C.first(), PlayerAnimDatablock.Rifle_AO_RD.first())), x: 1, y: -1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), PlayerAnimDatablock.Rifle_AO_C.first(), PlayerAnimDatablock.Rifle_AO_RU.first())), x: 1, y: 1 },
    { anim: toAnim(HumanJoints, 0.05, 0.1, difference(new Avatar(HumanJoints), PlayerAnimDatablock.Rifle_AO_C.first(), PlayerAnimDatablock.Rifle_AO_C.first())), x: 0, y: 0 },
]);

const defaultArchetype: MeleeArchetype = {
    equipAnim: PlayerAnimDatablock.Equip_Melee,
    movementAnim: PlayerAnimDatablock.hammerMovement,
    jumpAnim: PlayerAnimDatablock.SledgeHammer_Jump,
    fallAnim:  PlayerAnimDatablock.SledgeHammer_Fall,
    landAnim:  PlayerAnimDatablock.SledgeHammer_Land,
    attackAnim: PlayerAnimDatablock.hammerSwing,
    chargeAnim: PlayerAnimDatablock.hammerCharge,
    chargeIdleAnim: PlayerAnimDatablock.hammerChargeIdle,
    releaseAnim: PlayerAnimDatablock.hammerRelease,
    shoveAnim: PlayerAnimDatablock.hammerShove,
};

class EquippedItem {
    id?: Identifier;
    itemDatablock?: ItemDatablock;
    gearDatablock?: GearDatablock;
    model?: ItemModel | GearModel;

    public get(id: Identifier, includeModel: boolean = true) {
        switch (id.type) {
        case "Unknown": {
            this.itemDatablock = undefined;
            this.gearDatablock = undefined;
            this.model = undefined;
        } break;
        case "Gear": {
            this.itemDatablock = undefined;
            this.gearDatablock = GearDatablock.getOrMatchCategory(id);
            if (includeModel) this.model = this.gearDatablock?.model(id.stringKey);
            else this.model = undefined;
        } break;
        case "Item": {
            this.gearDatablock = undefined;
            this.itemDatablock = ItemDatablock.get(id);
            const factory = this.itemDatablock?.model;
            if (includeModel && factory !== undefined) this.model = factory();
            else this.model = undefined;
        } break;
        default: throw new Error(`Could not get equipped item ${id}`);
        }
        this.id = id;

        return this;
    }

    get name(): string | undefined {
        switch (this.id?.type) {
        case "Gear": return this.gearDatablock?.name;
        case "Item": return this.itemDatablock?.name;
        default: return undefined;
        }
    }

    get type(): Archetype {
        let type: Archetype | undefined = undefined;
        switch (this.id?.type) {
        case "Gear": type = this.gearDatablock?.type; break;
        case "Item": type = this.itemDatablock?.type; break;
        }
        if (type === undefined) return "rifle";
        return type;
    }

    get meleeArchetype(): MeleeArchetype | undefined {
        if (this.id?.type !== "Gear") return undefined;
        return this.gearDatablock?.meleeArchetype;
    }

    get gunArchetype(): GunArchetype | undefined {
        if (this.id?.type !== "Gear") return undefined;
        return this.gearDatablock?.gunArchetype;
    }

    get itemArchetype(): ItemArchetype | undefined {
        if (this.id?.type !== "Item") return undefined;
        return this.itemDatablock?.archetype;
    }
}

const cylinder = new CylinderGeometry(1, 1, 1, 10, 10).translate(0, 0.5, 0).rotateX(Math.PI * 0.5);

export class PlayerModel extends StickFigure<[camera: Camera, database: IdentifierData, player: Player, anim: PlayerAnimState, stats?: PlayerStats, backpack?: PlayerBackpack, sentries?: Map<number, Sentry>, ragdoll?: Ragdoll]> {
    public static showFlashlightLineOfSight = signal(false);
    
    private aimIK: IKSolverAim = new IKSolverAim();
    private aimTarget: Object3D;
    
    private leftIK: IKSolverArm = new IKSolverArm();
    private leftTarget: Object3D;

    private handAttachment: Group = new Group();
    private equipped: Group = new Group();
    private equippedItem?: EquippedItem;
    private equippedSlot?: InventorySlot;

    private slots: EquippedItem[];
    private backpack: Group = new Group();
    private backpackAligns: Group[] = new Array(inventorySlots.length);

    private lastArchetype: Archetype | undefined = "default";
    private meleeArchetype: MeleeArchetype = defaultArchetype;
    private itemArchetype: ItemArchetype;
    private gunArchetype: GunArchetype | undefined;

    private animOffset: number = Math.random() * 10;

    private tmp?: Text;

    private flashlightLOS: Mesh;
    private flashlightMaterial: MeshPhongMaterial;

    constructor() {
        super();

        // Setup tmp
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

        // Setup backpack
        this.visual.joints.spine1.add(this.backpack);

        this.slots = new Array(inventorySlots.length);
        this.backpackAligns = new Array(inventorySlots.length);
        this.equippedItem = undefined;
        for (let i = 0; i < inventorySlots.length; ++i) {
            this.slots[i] = new EquippedItem();

            this.backpackAligns[i] = new Group();
            this.backpack.add(this.backpackAligns[i]);
        }

        this.backpackAligns[inventorySlotMap.melee].position.set(0.03, 0.01130009, -0.5089508);
        this.backpackAligns[inventorySlotMap.melee].rotateX(Math.PI);

        this.backpackAligns[inventorySlotMap.main].position.set(-0.15, 0.078, -0.395);
        this.backpackAligns[inventorySlotMap.main].quaternion.set(0.5, -0.5, 0.5, 0.5);

        this.backpackAligns[inventorySlotMap.special].position.set(0.159, 0.07800007, -0.223);
        this.backpackAligns[inventorySlotMap.special].quaternion.set(0.704416037, 0.0616284497, -0.0616284497, 0.704416037);

        this.backpackAligns[inventorySlotMap.tool].position.set(-0.395, 0.07800007, -0.318);
        this.backpackAligns[inventorySlotMap.tool].quaternion.set(0.0979499891, 0.700289905, -0.700289726, 0.0979499221);

        this.backpackAligns[inventorySlotMap.pack].position.set(-0.003, -0.2, -0.24);
        this.backpackAligns[inventorySlotMap.pack].quaternion.set(0, -0.263914526, 0, 0.964546144);
        this.backpackAligns[inventorySlotMap.pack].scale.set(0.7, 0.7, 0.7);

        this.backpackAligns[inventorySlotMap.consumable].position.set(0.15, -0.2, -0.1);
        this.backpackAligns[inventorySlotMap.consumable].quaternion.set(0, -0.263914526, 0, -0.964546144);
        this.backpackAligns[inventorySlotMap.consumable].scale.set(0.7, 0.7, 0.7);

        this.backpackAligns[inventorySlotMap.heavyItem].visible = false;
        this.backpackAligns[inventorySlotMap.hackingTool].visible = false;

        // Setup hand attachment for holding items
        this.handAttachment.add(this.equipped);
        this.handAttachment.position.set(0.1, 0.045, 0);
        this.handAttachment.quaternion.set(0.5, 0.5, 0.5, 0.5);
        this.skeleton.joints.rightHand.add(this.handAttachment);

        // Setup IK
        this.aimIK.root = this.skeleton.joints["hip"];
        this.aimIK.transform = this.handAttachment;
        this.aimIK.target = this.aimTarget = new Object3D();
        this.aimIK.tolerance = 0.1;
        this.aimIK.maxIterations = 3;
        this.aimIK.bones = [
            new Bone(this.skeleton.joints.spine1, 1),
            new Bone(this.skeleton.joints.spine2, 0.8),
            new Bone(this.skeleton.joints.rightShoulder, 0),
            new Bone(this.skeleton.joints.rightUpperArm, 0.1),
            new Bone(this.skeleton.joints.rightHand, 1)
        ];
        this.aimIK.initiate(this.aimIK.root);
        
        this.leftIK.root = this.skeleton.joints["hip"];
        this.leftIK.rightArm = false;
        this.leftIK.IKPositionWeight = 1;
        this.leftIK.target = this.leftTarget = new Object3D();
        this.leftIK.IKRotationWeight = 1;
        this.leftIK.bone1 = new TrigonometricBone(this.skeleton.joints.leftUpperArm, 1);
        this.leftIK.bone2 = new TrigonometricBone(this.skeleton.joints.leftLowerArm, 1);
        this.leftIK.bone3 = new TrigonometricBone(this.skeleton.joints.leftHand, 1);
        this.leftIK.initiate(this.leftIK.root);
        
        // Setup flashlightLOS
        this.flashlightMaterial = new MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
        this.flashlightLOS = new Mesh(cylinder, this.flashlightMaterial);
        this.flashlightLOS.scale.set(0.07, 0.07, 1000);
        this.root.add(this.flashlightLOS);

        /*{ const test = new Mesh(UnitySphere, this.flashlightMaterial);
        test.scale.set(0.1, 0.1, 0.1);
        this.handAttachment.add(test); }*/
    }

    public render(dt: number, time: number, camera: Camera, database: IdentifierData, player: Player, anim: PlayerAnimState, stats?: PlayerStats, backpack?: PlayerBackpack, sentries?: Map<number, Sentry>, ragdoll?: Ragdoll) {
        if (!this.isVisible()) return;

        this.updateBackpack(database, player, backpack, sentries);

        this.animate(dt, time, player, anim, ragdoll);
        
        this.draw();
        this.visual.joints.rightHand.add(this.handAttachment);
    
        this.updateTmp(player, camera, stats, backpack);
    }
    
    private animate(dt: number, time: number, player: Player, anim: PlayerAnimState, ragdoll?: Ragdoll) {
        this._animate(dt, time, player, anim, ragdoll);
        this.updateSkeleton(dt, player.position, player.rotation);

        // flashlight
        const { tempVector } = PlayerModel.FUNC_animate;

        this.flashlightLOS.visible = PlayerModel.showFlashlightLineOfSight();

        if (player.flashlight) {
            this.flashlightMaterial.color = this.color;
            this.flashlightLOS.scale.x = 0.07;
            this.flashlightLOS.scale.y = 0.07;
        } else {
            this.flashlightMaterial.color = white;
            this.flashlightLOS.scale.x = 0.01;
            this.flashlightLOS.scale.y = 0.01;
        }

        this.root.remove(this.flashlightLOS);
        this.flashlightLOS.scale.z = player.flashlightRange;
        this.flashlightLOS.position.copy(this.visual.joints.head.getWorldPosition(tempVector));
        this.flashlightLOS.lookAt(tempVector.add(anim.targetLookDir));
        this.root.attach(this.flashlightLOS);
    }

    private static FUNC_animate = {
        tempAvatar: (() => {
            const avatar = new Avatar(HumanJoints);
            for (const joint of avatar.keys) {
                avatar.joints[joint].rot = Pod.Quat.identity();
            }
            avatar.joints["hip"].pos = Pod.Vec.zero();
            return avatar;
        })(),
        tempVector: new Vector3()
    } as const;
    private _animate(dt: number, time: number, player: Player, anim: PlayerAnimState, ragdoll?: Ragdoll) {
        const { tempAvatar } = PlayerModel.FUNC_animate;

        this.skeleton.joints.rightHand.add(this.handAttachment);
        this.equippedItem?.model?.reset();
        this.equipped.visible = true;

        time /= 1000; // NOTE(randomuserhi): Animations are handled using seconds, convert ms to seconds
        const offsetTime = time + this.animOffset;

        animVelocity.x = anim.velocity.x;
        animVelocity.y = anim.velocity.z;
        animCrouch.x = anim.crouch;

        if (anim.state === "inElevator") {
            this.skeleton.override(PlayerAnimDatablock.defaultMovement.sample(offsetTime));
            return;
        }

        // NOTE(randomuserhi): RagdollMode mod - https://thunderstore.io/c/gtfo/p/Brandonious/Ragdoll_Mode/
        if (ragdoll !== undefined && ragdoll.enabled && ragdoll.avatar !== undefined) {
            this.skeleton.override(ragdoll.avatar);
            return;
        }

        const equipTime = time - (player.lastEquippedTime / 1000);
        switch (this.lastArchetype) {
        case "default": this.skeleton.override(PlayerAnimDatablock.defaultMovement.sample(offsetTime)); break;
        case "pistol": this.skeleton.override(PlayerAnimDatablock.pistolMovement.sample(offsetTime)); break;
        case "rifle": this.skeleton.override(PlayerAnimDatablock.rifleMovement.sample(offsetTime)); break;
        default: this.skeleton.override(this.meleeArchetype.movementAnim.sample(offsetTime)); break;
        }

        if ((this.equippedItem === undefined && this.lastArchetype != "default") || (this.lastArchetype !== this.equippedItem?.type)) {
            const blend = Math.clamp01(equipTime / 0.2);
            if (blend === 1) {
                this.lastArchetype = Identifier.isKnown(player.equippedId) ? this.equippedItem?.type : "default";
            }

            switch (this.equippedItem?.type) {
            case "default": this.skeleton.override(PlayerAnimDatablock.defaultMovement.sample(offsetTime)); break;
            case "pistol": this.skeleton.blend(PlayerAnimDatablock.pistolMovement.sample(offsetTime), blend); break;
            case "rifle": this.skeleton.blend(PlayerAnimDatablock.rifleMovement.sample(offsetTime), blend); break;
            default: this.skeleton.blend(this.meleeArchetype.movementAnim.sample(offsetTime), blend); break;
            }
        }

        const downedTime = time - (anim.lastDowned / 1000);
        const reviveTime = time - (anim.lastRevive / 1000);
        if (reviveTime < PlayerAnimDatablock.Revive.duration) {
            this.equipped.visible = false;
            
            this.skeleton.override(PlayerAnimDatablock.Revive.sample(reviveTime));
            return;
        } else if (anim.isDowned) {
            this.equipped.visible = false;
            
            if (downedTime < PlayerAnimDatablock.Die.duration) {
                this.skeleton.override(PlayerAnimDatablock.Die.sample(downedTime));
            } else {
                this.skeleton.override(PlayerAnimDatablock.Dead.sample(downedTime));
            }
            return;
        } 
        
        const stateTime = time - (anim.lastStateTransition / 1000);
        switch(anim.state) {
        case "jump": {
            switch (this.equippedItem?.type) {
            case "pistol": this.skeleton.override(PlayerAnimDatablock.Pistol_Jump.sample(stateTime)); break;
            case "rifle": this.skeleton.override(PlayerAnimDatablock.Rifle_Jump.sample(stateTime)); break;
            default: this.skeleton.override(this.meleeArchetype.jumpAnim.sample(stateTime)); break;
            }
        } break;
        case "fall": {
            const blendWeight = Math.clamp01(stateTime / 0.2);
            switch (this.equippedItem?.type) {
            case "pistol": this.skeleton.blend(PlayerAnimDatablock.Pistol_Fall.sample(stateTime), blendWeight); break;
            case "rifle": this.skeleton.blend(PlayerAnimDatablock.Rifle_Fall.sample(stateTime), blendWeight); break;
            default: this.skeleton.blend(this.meleeArchetype.fallAnim.sample(stateTime), blendWeight);  break;
            }
        } break;
        case "land": {
            const isSlow = (Math.abs(anim.velocity.x) < 0.08 && Math.abs(anim.velocity.z) < 0.08);
            const blendWeight = 1 - Math.clamp01(stateTime / (isSlow ? 1 : 0.5));
            switch (this.equippedItem?.type) {
            case "pistol": this.skeleton.blend(PlayerAnimDatablock.Pistol_Land.sample(stateTime), blendWeight); break;
            case "rifle": this.skeleton.blend(PlayerAnimDatablock.Rifle_Land.sample(stateTime), blendWeight); break;
            default: this.skeleton.blend(this.meleeArchetype.landAnim.sample(stateTime), blendWeight);  break;
            }
        } break;
        case "climbLadder": {
            const blendWeight = Math.clamp01(stateTime / 0.2);
            this.skeleton.blend(PlayerAnimDatablock.ladderMovement.sample(stateTime), blendWeight);
        } break;
        }

        if (anim.state === "climbLadder") {
            this.equipped.visible = false;
            return;
        }

        const shoveTime = time - (anim.lastShoveTime / 1000);
        const shoveDuration = this.equippedItem?.type === "melee" ? this.meleeArchetype.shoveAnim.duration : this.meleeArchetype.shoveAnim.duration * 0.6;
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
                case "main": this.skeleton.blend(PlayerAnimDatablock.Equip_Primary.sample(equipTime / equipDuration * PlayerAnimDatablock.Equip_Primary.duration), blend, upperBodyMask); break;
                case "special": this.skeleton.blend(PlayerAnimDatablock.Equip_Secondary.sample(equipTime / equipDuration * PlayerAnimDatablock.Equip_Secondary.duration), blend, upperBodyMask); break;
                case "pack": this.skeleton.blend(PlayerAnimDatablock.ConsumablePack_Equip.sample(equipTime / equipDuration * PlayerAnimDatablock.ConsumablePack_Equip.duration), blend, upperBodyMask); break;
                case "consumable": {
                    let equipAnim = this.itemArchetype?.equipAnim;
                    if (equipAnim === undefined) equipAnim = PlayerAnimDatablock.Consumable_Throw_Equip;
                    this.skeleton.blend(equipAnim.sample(equipTime / equipDuration * equipAnim.duration), blend, upperBodyMask);
                } break;
                default: this.skeleton.blend(PlayerAnimDatablock.Equip_Generic.sample(equipTime), blend, upperBodyMask); break;
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

            if (!isEquipping && Identifier.isKnown(player.equippedId)) {
                const dist = 10;
                this.skeleton.joints.head.getWorldPosition(this.aimTarget.position);
                this.aimTarget.position.x += anim.targetLookDir.x * dist;
                this.aimTarget.position.y += anim.targetLookDir.y * dist;
                this.aimTarget.position.z += anim.targetLookDir.z * dist;

                switch (this.equippedItem.type) {
                case "pistol":
                case "rifle": {
                    this.aimIK.update();

                    const reloadTime = time - (anim.lastReloadTransition / 1000);
                    if (anim.isReloading && reloadTime < anim.reloadDurationInSeconds) {
                        if (this.equippedItem.model !== undefined) {
                            if (this.equippedItem.model.type === "Gear") {
                                const model = this.equippedItem.model as GearModel;
                                const t = reloadTime / anim.reloadDurationInSeconds;
                                model.animate(t);
                            } else {
                                throw new Error(`Tried to perform reload animation on a ItemModel, expected a GearModel instead.`);
                            }
                            
                            if (this.equippedItem.model.leftHand !== undefined) {
                                if (this.gunArchetype?.offset !== undefined) {
                                    this.equippedItem.model.leftHand.position.add(this.gunArchetype.offset);
                                }
                                this.equippedItem.model.leftHand.getWorldPosition(this.leftTarget.position);
                                this.leftIK.update();
                            }
                        }
                    } else {
                        const shotTime = time - (anim.lastShot / 1000);
                        const recoilAnim = this.equippedItem?.type === "pistol" ? PlayerAnimDatablock.Pistol_Recoil : PlayerAnimDatablock.Rifle_Recoil;
                        if (shotTime < recoilAnim.duration) {
                            this.skeleton.additive(difference(tempAvatar, recoilAnim.first(), recoilAnim.sample(shotTime)), 1, upperBodyMask);
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
                    this.skeleton.override(PlayerAnimDatablock.ConsumablePack_Idle.sample(time), upperBodyMask);

                    let throwAnim = this.itemArchetype?.throwAnim;
                    if (throwAnim === undefined) throwAnim = PlayerAnimDatablock.Consumable_Throw;
                    let chargeAnim = this.itemArchetype?.chargeAnim;
                    if (chargeAnim === undefined) chargeAnim = PlayerAnimDatablock.Consumable_Throw_Charge;
                    let chargeIdleAnim = this.itemArchetype?.chargeIdleAnim;
                    if (chargeIdleAnim === undefined) chargeIdleAnim = PlayerAnimDatablock.Consumable_Throw_Charge_Idle;

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
            this.skeleton.blend(PlayerAnimDatablock.TerminalConsole_Idle.sample(t), blend);
            return;
        }
    }

    private static FUNC_updateBackpack = {
        spearPosOffset: new Vector3(0.1, 0.3, 0),
        spearRotOffset: new Quaternion(0, 0, -0.1736482, 0.9848078)
    } as const;
    private updateBackpack(database: IdentifierData, player: Player, backpack?: PlayerBackpack, sentries?: Map<number, Sentry>) {
        if (backpack === undefined) return;

        // Check if there exists a sentry that belongs to this player, if so hide the tool slot
        this.backpackAligns[inventorySlotMap.tool].visible = true;
        if (sentries !== undefined) {
            for (const sentry of sentries.values()) {
                if (sentry.owner === player.id) {
                    this.backpackAligns[inventorySlotMap.tool].visible = false;
                    break;
                }
            }
        }

        // Update items
        this.equippedItem = undefined;
        this.equippedSlot = undefined;
        for (let i = 0; i < this.slots.length; ++i) {
            const item = this.slots[i];

            if (item.model !== undefined) {
                item.model.removeFromParent();
            }

            if (item.model === undefined || !Identifier.equals(database, backpack.slots[i], item.id)) {
                item.get(backpack.slots[i]);
            }

            if (item.model !== undefined) {
                item.model.reset();
                if (Identifier.equals(database, player.equippedId, item.id)) {
                    this.equippedItem = item;
                    this.equippedSlot = inventorySlots[i];

                    switch (item.type) {
                    case "melee": {
                        const archetype = item.meleeArchetype;
                        if (archetype !== undefined) {
                            this.meleeArchetype = archetype;
                        }
                    } break;
                    case "consumable": {
                        const archetype = item.itemArchetype;
                        if (archetype !== undefined) {
                            this.itemArchetype = archetype;
                        }
                    } break;
                    case "pistol":
                    case "rifle": {
                        this.gunArchetype = item.gunArchetype;
                    } break;
                    }

                    this.equipped.add(item.model.root);
                    if (item.model.equipOffsetPos !== undefined) item.model.root.position.copy(item.model.equipOffsetPos);
                    else item.model.root.position.copy(zeroV);
                    if (item.model.equipOffsetRot !== undefined) item.model.root.quaternion.copy(item.model.equipOffsetRot);
                    else item.model.root.quaternion.copy(zeroQ);
                } else {
                    this.backpackAligns[i].add(item.model.root);
                    if (item.model.offsetPos !== undefined) item.model.root.position.copy(item.model.offsetPos);
                    else item.model.root.position.copy(zeroV);
                    if (item.model.offsetRot !== undefined) item.model.root.quaternion.copy(item.model.offsetRot);
                    else item.model.root.quaternion.copy(zeroQ);
                }
            }
        }
    }

    private static FUNC_updateTmp = {
        tmpPos: new Vector3(),
        camPos: new Vector3(),
        equippable: new EquippedItem(),
    } as const;
    private updateTmp(player: Player, camera: Camera, stats?: PlayerStats, backpack?: PlayerBackpack) {
        if (this.tmp !== undefined) {
            const { tmpPos, camPos, equippable } = PlayerModel.FUNC_updateTmp;

            if (stats === undefined) {
                this.tmp.visible = false;   
                return;
            }
            
            const nickname = player.nickname;
            const health = `Health: ${Math.round(stats.health * 100).toString().padStart(3)}%`;
            const infectionValue = Math.round(stats.infection * 100);
            const infection = `${(infectionValue >= 10 ? ` (${infectionValue.toString().padStart(3)}%)` : "")}`;
            const stamina = stats.stamina == 1 ? "" : `🏃 ${Math.round(stats.stamina * 100).toString().padStart(3)}%`;
            if (backpack === undefined) {
                this.tmp.text = `${nickname}
${health}${infection}
Main: ${Math.round(stats.primaryAmmo * 100).toString().padStart(3)}%
Special: ${Math.round(stats.secondaryAmmo * 100).toString().padStart(3)}%
Tool: ${Math.round(stats.toolAmmo * 100).toString().padStart(3)}%
${stamina}`;
                this.tmp.colorRanges = {
                    0: this.color,
                    [nickname.length]: 0xffffff,
                };
            } else {
                const main = equippable.get(backpack.slots[inventorySlotMap.main], false).name;
                const special = equippable.get(backpack.slots[inventorySlotMap.special], false).name;
                const tool = equippable.get(backpack.slots[inventorySlotMap.tool], false).name;
                this.tmp.text = `${nickname}
${health}${infection}
${(main !== undefined ? main : "Main")}: ${Math.round(stats.primaryAmmo * 100).toString().padStart(3)}%
${(special !== undefined ? special : "Special")}: ${Math.round(stats.secondaryAmmo * 100).toString().padStart(3)}%
${(tool !== undefined ? tool : "Tool")}: ${Math.round(stats.toolAmmo * 100).toString().padStart(3)}%
${stamina}`;
                this.tmp.colorRanges = {
                    0: this.color,
                    [nickname.length]: 0xffffff,
                    [nickname.length + health.length + 1]: 0x03e8fc, 
                    [nickname.length + health.length + 1 + infection.length]: 0xffffff
                };
            }
            this.tmp.visible = true;

            this.tmp.getWorldPosition(tmpPos);
            camera.root.getWorldPosition(camPos);

            const lerp = Math.clamp01(camPos.distanceTo(tmpPos) / 30);
            this.tmp.fontSize = lerp * 0.3 + 0.05;
            this.tmp.lookAt(camPos);
        }
    }

    public dispose(): void {
        super.dispose();
        this.tmp?.dispose();
        this.tmp = undefined;
    }
}

