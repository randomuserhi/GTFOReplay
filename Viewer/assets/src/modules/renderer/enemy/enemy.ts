import { InstanceTypes, consume } from "@esm/@root/replay/instancing.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Camera, Color, ColorRepresentation, Frustum, Group, Matrix4, Mesh, MeshPhongMaterial, Object3D, Quaternion, Scene, Sphere, SphereGeometry, Vector3, Vector3Like } from "@esm/three";
import { Text } from "@esm/troika-three-text";
import { Enemy, EnemyAnimState } from "../../parser/enemy/enemy.js";
import { Player } from "../../parser/player/player.js";
import { AvatarSkeleton, AvatarStructure, createAvatarStruct } from "../animations/animation.js";
import { animCrouch, animDetection, animVelocity, enemyAnimations, playerAnimations } from "../animations/assets.js";
import { HumanAnimation, HumanJoints, HumanSkeleton, defaultHumanPose, defaultHumanStructure } from "../animations/human.js";
import { upV, zeroQ, zeroV } from "../constants.js";
import { playerColors } from "../player/renderer.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Enemies": void;
        }

        interface RenderData {
            "Enemy.ShowInfo": boolean;
            "Enemies": Map<number, EnemyModel>;
            "Enemy.LimbCustom": Map<number, { mesh: Mesh, material: MeshPhongMaterial }>;
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

let showInfo = false;

const bodyTop = Pod.Vec.zero();
const bodyBottom = Pod.Vec.zero();
const temp = new Vector3();

const headScale = new Vector3(0.15, 0.15, 0.15);

const rot = new Quaternion();

const radius = 0.05;
const sM = new Vector3(radius, radius, radius);
const scale = new Vector3(radius, radius, radius);

export class EnemyModel {
    root: Group;
    anchor: Group;
    culled: boolean;

    tmp?: Text;
    tmpHeight: number;
    tag?: Text;

    datablock?: EnemySpecification;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(enemy: Enemy) {
        this.root = new Group();
        this.anchor = new Group();
        this.culled = false;

        this.datablock = specification.getEnemy(enemy.type);

        this.tmp = new Text();
        this.tmp.font = "./fonts/oxanium/Oxanium-SemiBold.ttf";
        this.tmp.fontSize = 0.2;
        this.tmp.textAlign = "center";
        this.tmp.anchorX = "center";
        this.tmp.anchorY = "bottom";
        this.tmp.color = 0xffffff;
        this.tmp.visible = false;
        this.tmpHeight = (this.datablock?.height === undefined ? 2.2 : this.datablock.height) * enemy.scale;
        this.tmp.position.y = this.tmpHeight;
        this.root.add(this.tmp);

        this.tag = new Text();
        this.tag.font = "./fonts/oxanium/Oxanium-ExtraBold.ttf";
        this.tag.fontSize = 0.2;
        this.tag.textAlign = "center";
        this.tag.anchorX = "center";
        this.tag.anchorY = "bottom";
        this.tag.color = 0xffffff;
        this.tag.visible = false;
        this.tag.text = `Δ
·`;
        this.tag.colorRanges = {
            0: 0xff0000,
            1: 0xffffff,
        };
        this.tag.material.depthTest = false;
        this.tag.material.depthWrite = false;
        this.tag.renderOrder = Infinity;
        this.root.add(this.tag);
    }

    public cull(position: Vector3Like, radius: number, camera: Camera, frustum: Frustum, renderDistance: number) {
        if (radius === Infinity) {
            this.culled = false;
            return false;
        }

        sphere.center.copy(position);
        sphere.radius = radius;
        if (camera.getWorldPosition(diff).sub(position).lengthSq() > renderDistance * renderDistance ||
            !frustum.intersectsSphere(sphere)) {
            this.culled = true;
            return true;
        }
        this.culled = false;
        return false;
    }

    public updateTmp(enemy: Enemy, anim: EnemyAnimState, camera: Camera, tagTarget: Object3D, players: (Player | undefined)[]) {
        if (this.tmp === undefined || this.tag === undefined) return;
        
        if (!this.isVisible()) {
            this.tmp.visible = false;
            this.tag.visible = false;
            return;
        }
        
        this.tag.visible = enemy.tagged;
        this.tag.position.copy(tagTarget.getWorldPosition(tagPos).sub(this.root.position));
        
        let target = "Unknown";
        let color: ColorRepresentation = 0xffffff;
        const player = players[enemy.targetPlayerSlotIndex];
        if (player !== undefined) {
            target = player.nickname;
            color = playerColors[player.slot]; 
        }

        this.tmp.text = `${(this.datablock !== undefined ? this.datablock.name : enemy.type.hash)}
State: ${anim.state}
Anim: ${enemy.animHandle}
HP: ${Math.round(enemy.health * 10) / 10}
Target: `;
        this.tmp.colorRanges = {
            0: 0xffffff,
            [this.tmp.text.length]: color,
        };
        this.tmp.text += target;

        this.tmp.visible = showInfo;

        this.orientateText(this.tmp, camera, 0.3, 0.05);
        this.orientateText(this.tag, camera, 0.5, 0.1);
    }

    private orientateText(tmp: Text, camera: Camera, scale: number, min: number) {
        tmp.getWorldPosition(tmpPos);
        camera.getWorldPosition(camPos);

        const lerp = Math.clamp01(camPos.distanceTo(tmpPos) / 30);
        tmp.fontSize = lerp * scale + min;
        tmp.lookAt(camPos);
    }

    public addToLimb(obj: Object3D, limb: HumanJoints) {
        this.anchor.add(obj);
    }

    public addToScene(scene: Scene) {
        scene.add(this.root);
    }

    public removeFromScene(scene: Scene) {
        scene.remove(this.root);
    }

    public isVisible(): boolean {
        if (this.culled) return false;
        return this.root.visible;
    }

    public setVisible(visible: boolean) {
        this.root.visible = visible;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public update(dt: number, time: number, enemy: Enemy, anim: EnemyAnimState, camera: Camera, frustum: Frustum, renderDistance: number, players: (Player | undefined)[]) {
    }

    public dispose(): void {
        this.tag?.dispose();
        this.tag = undefined;

        this.tmp?.dispose();
        this.tmp = undefined;
    }
}

const tmpPos = new Vector3();
const camPos = new Vector3();
const tagPos = new Vector3();

const _parts: Matrix4[] = new Array(9);
const _points: Matrix4[] = new Array(14);

for (let i = 0; i < _parts.length; ++i) {
    _parts[i] = new Matrix4();
}
for (let i = 0; i < _points.length; ++i) {
    _points[i] = new Matrix4();
}

const _temp_headRot = new Quaternion();

const sphere = new Sphere();
const diff = new Vector3();
export class HumanoidEnemyModel extends EnemyModel {
    pivot: Object3D;
    
    skeleton: HumanSkeleton;
    visual: HumanSkeleton;
    inverseMatrix: AvatarStructure<HumanJoints, Matrix4>;
    color: Color;

    head: Matrix4;
    neck: Matrix4;

    animHandle?: EnemyAnimHandle;

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
        skeleton.setRot(defaultHumanPose);

        if (this.datablock?.structure !== undefined) {
            for (const joint of HumanJoints) {
                if (this.datablock.structure[joint] !== undefined) {
                    skeleton.joints[joint].position.copy(this.datablock.structure[joint]!);
                }
            }
        }
    }

    constructor(enemy: Enemy) {
        super(enemy);
        this.offset = Math.random() * 10;
        this.head = new Matrix4();
        this.neck = new Matrix4();

        if (enemy.animHandle !== undefined) {
            this.animHandle = specification.enemyAnimHandles.get(enemy.animHandle);
        }

        this.color = new Color(0xff0000);

        this.pivot = new Group();
        this.anchor.add(this.pivot);
        this.root.add(this.anchor);

        this.skeleton = new AvatarSkeleton(HumanJoints, "hip");
        this.visual = new AvatarSkeleton(HumanJoints, "hip");
        this.construct(this.skeleton);
        this.construct(this.visual);

        this.pivot.add(this.visual.joints.hip);

        // Scale model - NOTE(randomuserhi): IK doesn't work with scaled models
        let scale = enemy.scale;
        if (this.datablock !== undefined) {
            if (this.datablock.neckScale !== undefined) {
                this.skeleton.joints.neck.scale.copy(this.datablock.neckScale);

                this.visual.joints.neck.scale.copy(this.datablock.neckScale);
            }
            if (this.datablock.armScale !== undefined) {
                this.skeleton.joints.leftUpperArm.scale.copy(this.datablock.armScale);
                this.skeleton.joints.rightUpperArm.scale.copy(this.datablock.armScale);

                this.visual.joints.leftUpperArm.scale.copy(this.datablock.armScale);
                this.visual.joints.rightUpperArm.scale.copy(this.datablock.armScale);
            }
            if (this.datablock.legScale !== undefined) {
                this.skeleton.joints.leftUpperLeg.scale.copy(this.datablock.legScale);
                this.skeleton.joints.rightUpperLeg.scale.copy(this.datablock.legScale);

                this.visual.joints.leftUpperLeg.scale.copy(this.datablock.legScale);
                this.visual.joints.rightUpperLeg.scale.copy(this.datablock.legScale);
            }
            if (this.datablock.chestScale !== undefined) {
                this.skeleton.joints.spine2.scale.copy(this.datablock.chestScale);

                this.visual.joints.spine2.scale.copy(this.datablock.chestScale);
            }
            if (this.datablock.scale !== undefined) {
                scale *= this.datablock.scale;
            }
        }

        this.anchor.scale.set(scale, scale, scale);
        if (this.datablock?.rotOffset !== undefined) {
            this.anchor.rotateX(Math.deg2rad * this.datablock.rotOffset.x);
            this.anchor.rotateY(Math.deg2rad * this.datablock.rotOffset.y);
            this.anchor.rotateZ(Math.deg2rad * this.datablock.rotOffset.z);
        }

        this.inverseMatrix = createAvatarStruct(HumanJoints, () => new Matrix4());
        for (const joint of HumanJoints) {
            this.visual.joints[joint].updateWorldMatrix(true, false);
            this.inverseMatrix[joint].copy(this.visual.joints[joint].matrixWorld).invert();
        }
    }

    // NOTE(randomuserhi): object is positioned at offset from base position if skeleton was in T-pose
    public addToLimb(obj: Object3D, limb: HumanJoints) {
        this.visual.joints[limb].add(obj);
        obj.applyMatrix4(this.inverseMatrix[limb]);
    }

    public update(dt: number, time: number, enemy: Enemy, anim: EnemyAnimState, camera: Camera, frustum: Frustum, renderDistance: number, players: (Player | undefined)[]) {
        const cull = this.cull(enemy.position, anim.state === "ScoutDetection" ? Infinity : 2, camera, frustum, renderDistance);
        this.updateTmp(enemy, anim, camera, this.visual.joints.spine1, players);
        if (cull) return;

        this.animate(dt, time, enemy, anim);
        this.computeMatrices(dt, enemy);

        // TODO(randomuserhi): Change the mechanism to make more maintainable for different head types
        if (this.datablock?.transparent === true) {
            this.render(enemy, "Sphere.Bumpy.MeshPhong.HalfTransparency.Mask", "Sphere.Charger.MeshPhong.HalfTransparency.Mask", "Sphere.Spikey.MeshPhong.HalfTransparency.Mask", "Sphere.MeshPhong.HalfTransparency.Mask", "Cylinder.MeshPhong.HalfTransparency.Mask");
            this.render(enemy, "Sphere.Bumpy.MeshPhong.HalfTransparency", "Sphere.Charger.MeshPhong.HalfTransparency", "Sphere.Spikey.MeshPhong.HalfTransparency", "Sphere.MeshPhong.HalfTransparency", "Cylinder.MeshPhong.HalfTransparency");
        } else {
            this.render(enemy, "Sphere.Bumpy.MeshPhong", "Sphere.Charger.MeshPhong", "Sphere.Spikey.MeshPhong", "Sphere.MeshPhong", "Cylinder.MeshPhong");
        }
    }

    // TODO(randomuserhi): Change the mechanism to make more maintainable for different head types
    private render(enemy: Enemy, shooter: keyof InstanceTypes, charger: keyof InstanceTypes, spikey: keyof InstanceTypes, sphere: keyof InstanceTypes, cylinder: keyof InstanceTypes) {
        if (enemy.head) {
            switch (this.datablock?.headType) {
            case "spikey":
                consume(spikey, this.head, this.color);
                break;
            case "charger":
                consume(charger, this.head, this.color);
                break;
            case "bumpy":
                consume(shooter, this.head, this.color);
                break;
            default:
                consume(sphere, this.head, this.color);
                break;
            }
        }

        for (let i = 0; i < _points.length; ++i) {
            consume(sphere, _points[i], this.color);
        }
        for (let i = 0; i < _parts.length; ++i) {
            consume(cylinder, _parts[i], this.color);
        }
    }

    private animate(dt: number, time: number, enemy: Enemy, anim: EnemyAnimState) {
        this.color.set(0xff0000);
        if (this.datablock?.color !== undefined) {
            this.color.set(this.datablock.color);
        }

        this.pivot.rotation.set(0, 0, 0);

        time /= 1000; // NOTE(randomuserhi): Animations are handled using seconds, convert ms to seconds
        const offsetTime = time + this.offset;

        animVelocity.x = anim.velocity.x;
        animVelocity.y = anim.velocity.z;
        animCrouch.x = 0;
        animDetection.x = anim.detect;

        const overrideBlend = this.animHandle !== undefined && this.animHandle.blend ? Math.clamp01(this.animHandle.blend * dt) : 1;

        if (this.animHandle === undefined) {
            this.skeleton.blend(playerAnimations.defaultMovement.sample(offsetTime), overrideBlend);
            return;
        }

        const stateTime = time - (anim.lastStateTime / 1000);
        switch (anim.state) {
        case "StuckInGlue": {
            const blend = Math.clamp01(stateTime / 0.15);
            const screamAnim = this.animHandle.screams[anim.screamAnimIndex];
            this.skeleton.blend(screamAnim.sample(Math.clamp(stateTime, 0, 0.5)), blend);

            this.color.set(0x0000ff);
        } break;
        case "HibernateWakeUp": {
            const wakeupTime = time - (anim.lastWakeupTime / 1000);
            const wakeupAnim = anim.wakeupTurn ? this.animHandle.wakeupTurns[anim.wakeupAnimIndex] : this.animHandle.wakeup[anim.wakeupAnimIndex];
            const inWakeup = wakeupAnim !== undefined && wakeupTime < wakeupAnim.duration && anim.state === "HibernateWakeUp";
            if (inWakeup) {
                const blend = wakeupTime < wakeupAnim.duration / 2 ? Math.clamp01(wakeupTime / 0.15) : Math.clamp01((wakeupAnim.duration - wakeupTime) / 0.15);
                this.skeleton.blend(wakeupAnim.sample(Math.clamp(wakeupTime, 0, wakeupAnim.duration)), blend);
            }
        } break;
        case "Hibernate": {
            this.skeleton.override(this.animHandle.hibernateLoop.sample(stateTime));
            if (stateTime < this.animHandle.hibernateIn.duration) {
                this.skeleton.blend(this.animHandle.hibernateIn.sample(stateTime), 1 - Math.clamp01(stateTime / this.animHandle.hibernateIn.duration));
            }
            
            const heartbeatTime = time - (anim.lastHeartbeatTime / 1000);
            const heartbeatAnim = this.animHandle.heartbeats[anim.heartbeatAnimIndex];
            const inHeartbeat = heartbeatAnim !== undefined && heartbeatTime < heartbeatAnim.duration;
            if (inHeartbeat) {
                const blend = heartbeatTime < heartbeatAnim.duration / 2 ? Math.clamp01(heartbeatTime / 0.15) : Math.clamp01((heartbeatAnim.duration - heartbeatTime) / 0.15);
                this.skeleton.blend(heartbeatAnim.sample(Math.clamp(heartbeatTime, 0, heartbeatAnim.duration)), blend);
            }
        } break;
        case "ClimbLadder": {
            if (anim.up) {
                this.pivot.rotation.set(-90 * Math.deg2rad, 0, 0, "YXZ");
            } else {
                this.pivot.rotation.set(90 * Math.deg2rad, 180 * Math.deg2rad, 0, "YXZ");
            } 
            if (anim.velocity.y !== 0) this.skeleton.blend(this.animHandle.ladderClimb.sample(offsetTime, 2), overrideBlend);
        } break;
        default: this.skeleton.blend(this.animHandle.movement.sample(offsetTime), overrideBlend); break;
        }

        if (this.animHandle.abilityUse !== undefined && (anim.state === "ScoutScream" || anim.state === "ScoutDetection")) {
            const screamTime = time - (anim.lastScoutScream / 1000);
            if (anim.scoutScreamStart === true) {
                const inStartup = screamTime < this.animHandle.abilityUse[0].duration;
                if (inStartup) {
                    this.skeleton.blend(this.animHandle.abilityUse[0].sample(screamTime), overrideBlend);
                } else {
                    this.skeleton.blend(this.animHandle.abilityUse[1].sample(screamTime), overrideBlend);
                }

                return;
            } else {
                const inEnd = screamTime < this.animHandle.abilityUse[2].duration;
                if (inEnd) {
                    this.skeleton.blend(this.animHandle.abilityUse[2].sample(screamTime), overrideBlend);
                    return;
                }
            }
        }

        const screamTime = time - (anim.lastScreamTime / 1000);
        const screamAnim = this.animHandle.screams[anim.screamAnimIndex];
        const inScream = screamAnim !== undefined && screamTime < screamAnim.duration && (anim.state === "Scream" || anim.state === "ScoutScream");
        if (inScream) {
            if (anim.screamType === "Regular") {
                const blend = screamTime < screamAnim.duration / 2 ? Math.clamp01(screamTime / 0.15) : Math.clamp01((screamAnim.duration - screamTime) / 0.15);
                this.skeleton.blend(screamAnim.sample(Math.clamp(screamTime, 0, screamAnim.duration)), blend);
            }

            // TODO(randomuserhi): scream effect...
        }

        const jumpTime = time - (anim.lastJumpTime / 1000);
        const jumpAnim = this.animHandle.jump[anim.jumpAnimIndex];
        const inJump = (jumpTime < jumpAnim.duration || anim.state === "Jump");
        if (inJump) {
            const blend = jumpTime < jumpAnim.duration / 2 ? Math.clamp01(jumpTime / 0.15) : Math.clamp01((jumpAnim.duration - jumpTime) / 0.15);
            this.skeleton.blend(jumpAnim.sample(Math.clamp(jumpTime, 0, jumpAnim.duration)), blend);
            return;
        }

        if (this.animHandle.melee !== undefined) {
            const meleeTime = time - (anim.lastMeleeTime / 1000);
            const meleeAnim = this.animHandle.melee[anim.meleeType][anim.meleeAnimIndex];
            const inMelee = meleeAnim !== undefined && (meleeTime < meleeAnim.duration && anim.state === "StrikerMelee");
            if (inMelee) {
                const blend = meleeTime < meleeAnim.duration / 2 ? Math.clamp01(meleeTime / 0.15) : Math.clamp01((meleeAnim.duration - meleeTime) / 0.15);
                this.skeleton.blend(meleeAnim.sample(Math.clamp(meleeTime, 0, meleeAnim.duration)), blend);
            }
        }

        const windupTime = time - (anim.lastWindupTime / 1000);
        const windupAnim = this.animHandle.abilityFire[anim.windupAnimIndex];
        const inWindup = windupAnim !== undefined && (windupTime < windupAnim.duration || anim.state === "StrikerAttack");
        if (inWindup) {
            const blend = windupTime < windupAnim.duration / 2 ? Math.clamp01(windupTime / 0.15) : Math.clamp01((windupAnim.duration - windupTime) / 0.15);
            this.skeleton.blend(windupAnim.sample(Math.clamp(windupTime, 0, windupAnim.duration)), blend);
        }

        const pouncerGrabTime = time - (anim.lastPouncerGrabTime / 1000);
        const inPouncerGrab = pouncerGrabTime < enemyAnimations.PO_Consume.duration;
        if (inPouncerGrab) {
            const blend = pouncerGrabTime < enemyAnimations.PO_Consume.duration / 2 ? Math.clamp01(pouncerGrabTime / 0.15) : Math.clamp01((enemyAnimations.PO_Consume.duration - pouncerGrabTime) / 0.15);
            this.skeleton.blend(enemyAnimations.PO_Consume.sample(Math.clamp(pouncerGrabTime, 0, enemyAnimations.PO_Consume.duration)), blend);
        }

        const pouncerSpitTime = time - (anim.lastPouncerSpitTime / 1000);
        const inPouncerSpit = pouncerSpitTime < enemyAnimations.PO_SpitOut_Fast.duration;
        if (inPouncerSpit) {
            const blend = pouncerSpitTime < enemyAnimations.PO_SpitOut_Fast.duration / 2 ? Math.clamp01(pouncerSpitTime / 0.15) : Math.clamp01((enemyAnimations.PO_SpitOut_Fast.duration - pouncerSpitTime) / 0.15);
            this.skeleton.blend(enemyAnimations.PO_SpitOut_Fast.sample(Math.clamp(pouncerSpitTime, 0, enemyAnimations.PO_SpitOut_Fast.duration)), blend);
        }

        const hitreactTime = time - (anim.lastHitreactTime / 1000);
        let hitreactAnim: HumanAnimation | undefined = undefined;
        switch (anim.hitreactType) {
        case "Heavy": {
            switch (anim.hitreactDirection) {
            case "Backward": hitreactAnim = this.animHandle.hitHeavyBwd[anim.hitreactAnimIndex]; break;
            case "Forward": hitreactAnim = this.animHandle.hitHeavyFwd[anim.hitreactAnimIndex]; break;
            case "Left": hitreactAnim = this.animHandle.hitHeavyLt[anim.hitreactAnimIndex]; break;
            case "Right": hitreactAnim = this.animHandle.hitHeavyRt[anim.hitreactAnimIndex]; break;
            }
        } break;
        case "Light": {
            switch (anim.hitreactDirection) {
            case "Backward": hitreactAnim = this.animHandle.hitLightBwd[anim.hitreactAnimIndex]; break;
            case "Forward": hitreactAnim = this.animHandle.hitLightFwd[anim.hitreactAnimIndex]; break;
            case "Left": hitreactAnim = this.animHandle.hitLightLt[anim.hitreactAnimIndex]; break;
            case "Right": hitreactAnim = this.animHandle.hitLightRt[anim.hitreactAnimIndex]; break;
            }
        } break;
        }
        if (anim.state === "Hitreact" || anim.state === "HitReactFlyer") {
            this.color.set(0xdddddd);
        }
        const inHitreact = hitreactAnim !== undefined && hitreactTime < hitreactAnim.duration;
        if (inHitreact) {
            let blend: number;
            // If hitreact ended early compared with duration of hitreact animation -> blend out of hit reaction.
            const endHitreactTime = time - (anim.lastEndHitreactTime / 1000);
            if (anim.lastEndHitreactTime > anim.lastHitreactTime && endHitreactTime > 0) {
                blend = 1 - Math.clamp01(endHitreactTime / 0.5);
            } else {
                blend = hitreactTime < hitreactAnim.duration / 2 ? Math.clamp01(hitreactTime / 0.15) : Math.clamp01((hitreactAnim.duration - hitreactTime) / 0.15);
            }
            this.skeleton.blend(hitreactAnim.sample(Math.clamp(hitreactTime, 0, hitreactAnim.duration)), blend);
        }
    }

    public computeMatrices(dt: number, enemy: Enemy): void {
        this.root.position.copy(enemy.position);
        this.anchor.quaternion.copy(enemy.rotation);
        if (this.datablock?.rotOffset !== undefined) {
            this.anchor.rotateX(Math.deg2rad * this.datablock.rotOffset.x);
            this.anchor.rotateY(Math.deg2rad * this.datablock.rotOffset.y);
            this.anchor.rotateZ(Math.deg2rad * this.datablock.rotOffset.z);
        }

        const blendFactor = Math.clamp01(dt * 50);
        for (const key of HumanJoints) {
            this.visual.joints[key].quaternion.slerp(this.skeleton.joints[key].quaternion, blendFactor);
        }
        this.visual.root.position.lerp(this.skeleton.root.position, blendFactor);
        getWorldPos(worldPos, this.visual);

        headScale.set(0.15, 0.15, 0.15);
        if(this.datablock?.headScale !== undefined) headScale.multiply(this.datablock.headScale);
        this.head.compose(worldPos.head, this.visual.joints.head.getWorldQuaternion(_temp_headRot), headScale);

        let i = 0;
        let j = 0;
        
        Pod.Vec.copy(bodyTop, worldPos.neck);
        this.neck.setPosition(worldPos.neck);
        
        Pod.Vec.mid(bodyBottom, worldPos.leftUpperLeg, worldPos.rightUpperLeg);
        
        _parts[i].lookAt(temp.copy(bodyBottom).sub(bodyTop), zeroV, upV);
        scale.z = Pod.Vec.dist(bodyTop, bodyBottom);
        _parts[i].compose(temp.copy(bodyTop), rot.setFromRotationMatrix(_parts[i]), scale);
        ++i;
        _points[j++].compose(bodyTop, zeroQ, sM);
        _points[j++].compose(bodyBottom, zeroQ, sM);

        _parts[i].lookAt(temp.copy(worldPos.leftLowerArm).sub(worldPos.leftUpperArm), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.leftUpperArm, worldPos.leftLowerArm);
        _parts[i].compose(worldPos.leftUpperArm, rot.setFromRotationMatrix(_parts[i]), scale);
        ++i;

        _parts[i].lookAt(temp.copy(worldPos.leftHand!).sub(worldPos.leftLowerArm), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.leftLowerArm, worldPos.leftHand!);
        _parts[i].compose(worldPos.leftLowerArm, rot.setFromRotationMatrix(_parts[i]), scale);
        ++i;

        _points[j++].compose(worldPos.leftUpperArm, zeroQ, sM);
        _points[j++].compose(worldPos.leftLowerArm, zeroQ, sM);
        _points[j++].compose(worldPos.leftHand, zeroQ, sM);

        _parts[i].lookAt(temp.copy(worldPos.rightLowerArm).sub(worldPos.rightUpperArm), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.rightUpperArm, worldPos.rightLowerArm);
        _parts[i].compose(worldPos.rightUpperArm, rot.setFromRotationMatrix(_parts[i]), scale);
        ++i;

        _parts[i].lookAt(temp.copy(worldPos.rightHand!).sub(worldPos.rightLowerArm), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.rightLowerArm, worldPos.rightHand!);
        _parts[i].compose(worldPos.rightLowerArm, rot.setFromRotationMatrix(_parts[i]), scale);
        ++i;

        _points[j++].compose(worldPos.rightUpperArm, zeroQ, sM);
        _points[j++].compose(worldPos.rightLowerArm, zeroQ, sM);
        _points[j++].compose(worldPos.rightHand, zeroQ, sM);

        _parts[i].lookAt(temp.copy(worldPos.leftLowerLeg).sub(worldPos.leftUpperLeg), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.leftUpperLeg, worldPos.leftLowerLeg);
        _parts[i].compose(worldPos.leftUpperLeg, rot.setFromRotationMatrix(_parts[i]), scale);
        ++i;

        _parts[i].lookAt(temp.copy(worldPos.leftFoot!).sub(worldPos.leftLowerLeg), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.leftLowerLeg, worldPos.leftFoot);
        _parts[i].compose(worldPos.leftLowerLeg, rot.setFromRotationMatrix(_parts[i]), scale);
        ++i;

        _points[j++].compose(worldPos.leftUpperLeg, zeroQ, sM);
        _points[j++].compose(worldPos.leftLowerLeg, zeroQ, sM);
        _points[j++].compose(worldPos.leftFoot, zeroQ, sM);

        _parts[i].lookAt(temp.copy(worldPos.rightLowerLeg).sub(worldPos.rightUpperLeg), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.rightUpperLeg, worldPos.rightLowerLeg);
        _parts[i].compose(worldPos.rightUpperLeg, rot.setFromRotationMatrix(_parts[i]), scale);
        ++i;

        _parts[i].lookAt(temp.copy(worldPos.rightFoot!).sub(worldPos.rightLowerLeg), zeroV, upV);
        scale.z = Pod.Vec.dist(worldPos.rightLowerLeg, worldPos.rightFoot!);
        _parts[i].compose(worldPos.rightLowerLeg, rot.setFromRotationMatrix(_parts[i]), scale);
        ++i;

        _points[j++].compose(worldPos.rightUpperLeg, zeroQ, sM);
        _points[j++].compose(worldPos.rightLowerLeg, zeroQ, sM);
        _points[j++].compose(worldPos.rightFoot, zeroQ, sM);
    }
}

module.ready();
// eslint-disable-next-line sort-imports
import { EnemyAnimHandle, EnemySpecification, specification } from "../specification.js";

ModuleLoader.registerRender("Enemies", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot, dt) => {
            showInfo = renderer.getOrDefault("Enemy.ShowInfo", () => false);

            const time = snapshot.time();
            const models = renderer.getOrDefault("Enemies", () => new Map());
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
            const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", () => new Map());
            const camera = renderer.get("Camera")!;
            const frustum = renderer.get("Frustum")!;
            const renderDistance = renderer.get("RenderDistance")!;
            const players = snapshot.getOrDefault("Vanilla.Player.Slots", () => []);
            for (const [id, enemy] of enemies) {
                if (!models.has(id)) {
                    const modelFactory = specification.getEnemy(enemy.type)?.model;
                    let model: EnemyModel;
                    if (modelFactory !== undefined) {
                        model = modelFactory(enemy);
                    } else {
                        model = new HumanoidEnemyModel(enemy);
                    }
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.setVisible(enemy.dimension === renderer.get("Dimension"));
                
                if (model.root.visible) {
                    if (anims.has(id)) {
                        const anim = anims.get(id)!;
                        model.update(dt, time, enemy, anim, camera, frustum, renderDistance, players);
                    }
                }
            }

            for (const [id, model] of [...models.entries()]) {
                if (!enemies.has(id)) {
                    model.removeFromScene(renderer.scene);
                    model.dispose();
                    models.delete(id);
                }
            }
        } 
    }, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Enemy.LimbCustom", () => new Map());
            const limbs = snapshot.getOrDefault("Vanilla.Enemy.LimbCustom", () => new Map());
            const skeletons = renderer.getOrDefault("Enemies", () => new Map());
            for (const [id, limb] of limbs) {
                if (!skeletons.has(limb.owner)) continue;
                const skeleton = skeletons.get(limb.owner)!;

                if (!models.has(id)) {
                    const material = new MeshPhongMaterial({
                        color: 0xff0000
                    });
                    material.transparent = true;
                    material.opacity = 0.8;
                    material.depthWrite = false;
        
                    const geometry = new SphereGeometry(1, 10, 10);
        
                    const mesh = new Mesh(geometry, material);
                
                    models.set(id, { mesh, material });
                    renderer.scene.add(mesh);
                }
                const model = models.get(id)!;
                if (!skeleton.isVisible()) {
                    model.mesh.visible = false;
                    continue;
                }

                model.mesh.visible = limb.active;

                // TODO(randomuserhi): I should only need to add once on creation... why need to add every frame?
                model.mesh.scale.set(limb.scale, limb.scale, limb.scale);
                model.mesh.quaternion.set(0, 0, 0, 1);
                model.mesh.position.set(limb.offset.x, limb.offset.y, limb.offset.z);
                skeleton.addToLimb(model.mesh, limb.bone);
            }

            for (const [id, model] of [...models.entries()]) {
                if (!limbs.has(id)) {
                    model.mesh.removeFromParent();
                    models.delete(id);
                }
            }
        } 
    }]);
});