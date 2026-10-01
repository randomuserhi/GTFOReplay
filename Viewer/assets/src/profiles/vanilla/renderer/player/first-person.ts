import { AmbientLight, Box3, DirectionalLight, Euler, Group, Matrix4, Object3D, PerspectiveCamera, Quaternion, Scene, Vector3 } from "@esm/three";
import { RenderPass } from "@esm/three/examples/jsm/postprocessing/RenderPass.js";
import { Anim, AvatarSkeleton, type AvatarLike } from "../../library/animations/lib.js";
import { Actor } from "../models/actor.js";
import type { ActorDescriptor } from "../../library/actorCatalog.js";
import { StickFigure } from "../models/stickfigure.js";
import { PlayerJoints } from "../animations/human.js";
import { playerMeleeGrips, playerRig } from "../animations/player-rig.js";
import { sampleHands } from "../../datablocks/player/hands.js";
import { IKSolverArm, TrigonometricBone } from "../../library/animations/inversekinematics/limbsolver.js";
import { GearModel } from "../models/gear.js";
import type { ItemModel } from "../models/items.js";
import type { PlayerAnimState } from "../../parser/player/animation.js";
import { solveBodyReach } from "@esm/@root/replay/native-weapon-view.js";

const response = await fetch(new URL("../player-animations/first-person.json", module.baseURI));
if (!response.ok) throw new Error(`Could not load first-person animations: ${response.status}`);
const data: { version:number; models:ActorDescriptor[]; clips:Record<string,{rate:number;duration:number;frames:AvatarLike<PlayerJoints>[]}> } = await response.json();
if (data.version !== 1) throw new Error("Unsupported first-person animation package.");
const clips = new Map(Object.entries(data.clips).map(([key, clip]) => [key, new Anim(PlayerJoints,clip.rate,clip.duration,clip.frames)]));
type Melee = keyof typeof playerMeleeGrips;
const toolFraming = { wrist: new Vector3(.15,-.13,-.38) };

/** One camera-space rig, independent of the third-person body and its foot/aim IK. */
export class FirstPersonModel {
    readonly scene = new Scene();
    readonly camera = new PerspectiveCamera(65, 1, .01, 100);
    readonly pass = new RenderPass(this.scene,this.camera);
    readonly root = new Group();
    readonly skeleton = new AvatarSkeleton(PlayerJoints);
    readonly actors: Actor[];
    private readonly leftIK = new IKSolverArm();
    private readonly leftTarget = new Object3D();
    private readonly rightIK = new IKSolverArm();
    private readonly rightTarget = new Object3D();
    private readonly leftBend = new Object3D();
    private readonly rightBend = new Object3D();
    private readonly fpsGrip = {pos:new Vector3(),rot:new Quaternion()};
    private readonly grip = new Matrix4();
    private readonly nativeSize = new Matrix4();
    private readonly gunRotation = new Euler(0, 0, 0, 'YXZ');
    private readonly eye = new Vector3();
    private readonly position = new Vector3();
    private readonly wrist = new Vector3();
    private readonly shoulder = new Vector3();
    private readonly support = new Vector3();
    private readonly rotation = new Quaternion();
    private readonly scale = new Vector3(1,1,1);
    private held?: ItemModel;
    private heldParent?: Object3D | null;
    private heldMatrix = new Matrix4();
    private readonly itemBounds = new Box3();
    private readonly meleeOffsets = new Map<Melee,Vector3>();

    constructor() {
        this.pass.clear = false;
        this.pass.clearDepth = true;
        this.pass.enabled = false;
        this.scene.add(new AmbientLight(0xffffff, 1.5));
        const light = new DirectionalLight(0xffffff, 2); light.position.set(-1,2,1); this.scene.add(light);
        this.scene.add(this.root);
        StickFigure.construct(this.skeleton,playerRig);
        this.skeleton.joints.hip.updateMatrixWorld(true);
        const reference = new Map(PlayerJoints.map(joint => [joint,this.skeleton.joints[joint].matrixWorld.clone().invert()]));
        // The sampled rig faces +Z; a Three camera looks along -Z.
        const eye = this.skeleton.joints.head.getWorldPosition(new Vector3());
        this.eye.copy(eye);
        this.root.rotation.y = Math.PI;
        this.root.position.set(eye.x,-eye.y,eye.z + .08);
        this.root.add(this.skeleton.joints.hip);
        this.root.add(this.leftBend,this.rightBend);
        this.actors = data.models.map(model => new Actor(model,this.root,this.skeleton,reference));
        const ik = this.leftIK;
        ik.root = this.skeleton.joints.hip; ik.rightArm = false;
        ik.IKPositionWeight = 1; ik.IKRotationWeight = 1; ik.target = this.leftTarget;
        ik.bone1 = new TrigonometricBone(this.skeleton.joints.leftUpperArm,1);
        ik.bone2 = new TrigonometricBone(this.skeleton.joints.leftLowerArm,1);
        ik.bone3 = new TrigonometricBone(this.skeleton.joints.leftHand,1);
        ik.initiate(ik.root);
        const right = this.rightIK;
        right.root = this.skeleton.joints.hip; right.rightArm = true;
        right.IKPositionWeight = 1; right.IKRotationWeight = 1; right.target = this.rightTarget;
        right.bone1 = new TrigonometricBone(this.skeleton.joints.rightUpperArm,1);
        right.bone2 = new TrigonometricBone(this.skeleton.joints.rightLowerArm,1);
        right.bone3 = new TrigonometricBone(this.skeleton.joints.rightHand,1);
        right.initiate(right.root);
        for (const kind of Object.keys(playerMeleeGrips) as Melee[]) {
            this.skeleton.override(clips.get(kind+'Idle')!.sample(0));
            this.meleeOffsets.set(kind,new Vector3(.18,-.20,-.40).sub(this.skeleton.joints.rightHand.getWorldPosition(new Vector3())));
        }
    }

    /** Return the shared equipped model before the player's next animation update. */
    release() {
        this.pass.enabled = false;
        if (!this.held) return;
        if (this.heldParent) this.heldParent.add(this.held.root);
        else this.held.root.removeFromParent();
        this.heldMatrix.decompose(this.held.root.position,this.held.root.quaternion,this.held.root.scale);
        this.held = undefined; this.heldParent = undefined;
    }

    render(time: number, aspect: number, anim: PlayerAnimState, item: ItemModel | undefined, name: string, melee?: Melee, fieldOfView = 65) {
        if (!item || anim.isDowned || ['inElevator','climbLadder','grabbedByPouncer','grabbedByTank'].includes(anim.state)) return;
        this.pass.enabled = true;
        if (this.camera.aspect !== aspect) { this.camera.aspect = aspect; this.camera.updateProjectionMatrix(); }
        let key = melee ? melee + 'Idle' : /hacking/i.test(name) ? 'hacking' : /bio.*tracker/i.test(name) ? 'scanner' : /foam/i.test(name) ? 'glue' : /mine/i.test(name) ? 'mine' : /glow/i.test(name) ? 'glowstick' : /grenade|fog repeller/i.test(name) ? 'grenade' : 'shoulder';
        let t = 0;
        if (melee) {
            const elapsed = (start:number) => (time-start)/1000;
            const shove = elapsed(anim.lastShoveTime), swing = elapsed(anim.lastSwingTime);
            const attack = melee + (anim.chargedSwing ? 'Release' : 'Hit');
            if (shove >= 0 && shove < clips.get(melee+'Push')!.duration) { key=melee+'Push'; t=shove; }
            else if (swing >= 0 && swing < clips.get(attack)!.duration) { key=attack; t=swing; }
            else if (anim.meleeCharging) { key=melee+'Charge'; t=Math.min(Math.max(0,elapsed(anim.lastMeleeChargingTransition)),clips.get(key)!.duration-.001); }
        }
        this.skeleton.override(clips.get(key)!.sample(t));
        // Native attack clips do not necessarily end on the idle pose. Blend
        // their recovery in replay time so both playback and seeking stay smooth.
        if (melee && (key.endsWith('Hit') || key.endsWith('Release') || key.endsWith('Push'))) {
            const recovery = Math.max(0, 1 - (clips.get(key)!.duration - t) / .12);
            this.skeleton.blend(clips.get(melee + 'Idle')!.sample(0), recovery * recovery * (3 - 2 * recovery));
        }
        const reloadTime = (time-anim.lastReloadTransition)/1000;
        const reload = anim.isReloading && anim.reloadDurationInSeconds > 0 && reloadTime >= 0 && reloadTime < anim.reloadDurationInSeconds ? reloadTime/anim.reloadDurationInSeconds : undefined;
        const gear = item.type === 'Gear' ? item as GearModel : undefined;
        const firearm = !melee && !!gear?.reloadAnimation;
        const view=firearm ? gear!.view : undefined;
        if(firearm && (!view || this.actors.some(actor=>!actor.loaded))) {this.pass.enabled=false;return;}
        // Share the viewer's lens with the world. Native item-camera FOV is
        // authored for the game's camera setup, not this replay projection.
        const fov=fieldOfView;
        if(this.camera.fov!==fov) {this.camera.fov=fov;this.camera.updateProjectionMatrix();}
        this.camera.position.set(0,0,0);
        this.camera.updateMatrixWorld(true);
        this.root.rotation.set(0,Math.PI,0);
        this.root.position.set(this.eye.x,-this.eye.y,this.eye.z+.08);
        if(view) {
            const p=view.settings.bodyOffsetLocal;
            const base=view.player.armsOffset;
            this.root.position.set(base.x,-view.player.cameraHeight+base.y,-base.z);
            this.root.position.add(this.position.set(p.x,p.y,-p.z));
            view.rotation(this.rotation,view.settings.bodyRotationOffsetLocal);
            this.root.quaternion.multiply(this.rotation);
            this.leftBend.position.fromArray(view.bendGoals.left);
            this.rightBend.position.fromArray(view.bendGoals.right);
        }
        this.leftIK.bendGoal=view?this.leftBend:undefined;
        this.rightIK.bendGoal=view?this.rightBend:undefined;
        for (const hand of sampleHands(gear?.reloadAnimation,melee,reload)) this.skeleton.override(hand.frame,hand.mask);
        this.held=item; this.heldParent=item.root.parent; item.root.updateMatrix(); this.heldMatrix.copy(item.root.matrix);
        this.skeleton.joints.rightHand.add(item.root);
        let target = melee ? playerMeleeGrips[melee].right : item.rightHandGrip ?? {pos:{x:0,y:0,z:0},rot:playerMeleeGrips.hammer.right.rot};
        if(view) {
            this.fpsGrip.pos.copy(target.pos).add(this.position.fromArray(view.wristOffsets.right.position).divideScalar(gear!.nativeScale).applyQuaternion(target.rot));
            this.fpsGrip.rot.copy(target.rot).multiply(view.rotation(this.rotation,view.wristOffsets.right.rotation));
            target=this.fpsGrip;
        }
        // Convert the wrist and geometry together: authored part scales remain
        // intact while firearms undo GearBuilder's world-model shrink.
        this.scale.set(1, 1, 1);
        this.grip.compose(this.position.copy(target.pos),this.rotation.copy(target.rot),this.scale).invert();
        const nativeScale = !melee && gear ? gear.nativeScale : 1;
        this.grip.premultiply(this.nativeSize.makeScale(nativeScale,nativeScale,nativeScale));
        this.grip.decompose(item.root.position,item.root.quaternion,item.root.scale);
        item.reset();
        if (reload !== undefined && gear?.reloadAnimation && !melee) gear.animate(reload);
        if (!melee) {
            // FPS_Weapon_Pose supplies shoulders; the game completes firearm poses
            // with two wrist targets. Reconstruct the weapon in camera space, then
            // solve both arms instead of attaching it to the unposed right wrist.
            this.scene.add(item.root);
            item.root.quaternion.setFromEuler(this.gunRotation.set(0,Math.PI,0));
            this.position.copy(target.pos).multiplyScalar(nativeScale).applyQuaternion(item.root.quaternion);
            const sinceShot = (time-anim.lastShot)/1000;
            const recoil = sinceShot >= 0 && sinceShot < .18 ? Math.sin(Math.PI*sinceShot/.18)*.035 : 0;
            // Start from the lower-right of the view, then fit the assembly to
            // the support arm below so long weapons do not leave a floating hand.
            item.root.position.copy(toolFraming.wrist).sub(this.position);
            if(view) {
                view.sample(item.root.position,this.rotation,time/1000,reload);
                item.root.position.applyQuaternion(item.root.quaternion);
                item.root.quaternion.multiply(this.rotation);
            }
            item.root.position.z += firearm ? recoil : 0;
            if (item.type === 'Item' && item.leftHandGrip && item.rightHandGrip) {
                // Carried prefabs have different axes from firearms. Align the
                // native grip pair across the view, with left contact on the left.
                this.support.copy(item.leftHandGrip).sub(item.rightHandGrip.pos);
                const yaw = Math.atan2(-this.support.z, -this.support.x);
                item.root.quaternion.setFromEuler(this.gunRotation.set(0,yaw,0));
                this.position.copy(item.leftHandGrip).add(item.rightHandGrip.pos).multiplyScalar(.5).applyQuaternion(item.root.quaternion);
                item.root.position.set(0,-.22,-.5).sub(this.position);
            }
            if (!firearm) {
                // Keep native size while clearing the sight line and near plane.
                // Geometry bounding boxes are cached; never scan every vertex
                // during normal playback just to frame an equipped item.
                this.itemBounds.setFromObject(item.root);
                if (!this.itemBounds.isEmpty()) {
                    item.root.position.y -= Math.max(0,this.itemBounds.max.y+.06);
                    item.root.position.z -= Math.max(0,this.itemBounds.max.z+.12);
                }
            }
            this.rightTarget.position.copy(target.pos); this.rightTarget.quaternion.copy(target.rot);
            item.root.add(this.rightTarget);
        } else {
            // Preserve the native wrist trajectory while keeping the shoulders
            // behind the eye; moving the entire rig exposes the sleeve openings.
            this.scene.attach(item.root);
            item.root.position.add(this.meleeOffsets.get(melee)!);
            this.rightTarget.position.copy(target.pos); this.rightTarget.quaternion.copy(target.rot);
            item.root.add(this.rightTarget);
            // The sampled attack clips drive the third-person wrist, so charging and
            // swinging put the hand in front of the eye. Hold the solved wrist away
            // from the centre of the view instead of letting the weapon cover it.
            item.root.updateMatrixWorld(true);
            this.rightTarget.getWorldPosition(this.wrist);
            this.wrist.set(
                Math.abs(this.wrist.x) < .18 ? (this.wrist.x < 0 ? -1 : 1) * .18 : this.wrist.x,
                Math.min(this.wrist.y, -.20),
                Math.min(this.wrist.z, -.40));
            item.root.worldToLocal(this.wrist);
            this.rightTarget.position.copy(this.wrist);
            this.rightTarget.getWorldPosition(this.position);
            item.root.position.add(this.position.sub(item.root.localToWorld(this.support.copy(target.pos))));
            this.rightTarget.position.copy(target.pos);
        }
        // Place the whole held assembly within the support arm's reach before
        // solving either wrist. Clamping IK alone leaves the hand short of the gun.
        const twoHandedMelee = melee === 'hammer' || melee === 'spear';
        if(!melee && item.leftHand) {
            // Retarget contacts with a single shoulder-girdle translation. Bone
            // lengths and the authored weapon trajectory remain unchanged.
            this.rightTarget.getWorldPosition(this.wrist);
            this.skeleton.joints.rightUpperArm.getWorldPosition(this.shoulder);
            this.wrist.sub(this.shoulder);
            item.leftHand.getWorldPosition(this.support);
            item.leftHand.getWorldQuaternion(this.rotation);
            if (view) this.support.add(this.position.fromArray(view.wristOffsets.left.position).applyQuaternion(this.rotation));
            this.skeleton.joints.leftUpperArm.getWorldPosition(this.shoulder);
            this.support.sub(this.shoulder);
            solveBodyReach(this.position,this.wrist,this.support,
                this.skeleton.joints.rightLowerArm.position.length()+this.skeleton.joints.rightHand.position.length(),
                this.skeleton.joints.leftLowerArm.position.length()+this.skeleton.joints.leftHand.position.length());
            this.root.position.add(this.position);
        }
        if (twoHandedMelee) {
            item.root.localToWorld(this.support.copy(playerMeleeGrips[melee].left.pos));
            this.skeleton.joints.leftUpperArm.getWorldPosition(this.shoulder);
            const reach = this.skeleton.joints.leftLowerArm.position.length() + this.skeleton.joints.leftHand.position.length() - .01;
            this.position.copy(this.support).sub(this.shoulder);
            if (this.position.length() > reach) {
                this.position.setLength(reach).add(this.shoulder).sub(this.support);
                item.root.position.add(this.position);
            }
        }
        this.rightIK.update(); this.rightTarget.removeFromParent();
        // The solved wrist owns the weapon. If a reconstructed target exceeds
        // arm reach, the grip must stay attached rather than leave a floating gun.
        this.skeleton.joints.rightHand.add(item.root);
        this.grip.decompose(item.root.position,item.root.quaternion,item.root.scale);
        // Grip markers describe a wrist, not the centre of the palm. Weapons,
        // gloves and finger poses must share native scale to keep the handle in
        // the fingers and the support grip within reach of the other arm.
        if (twoHandedMelee) {
            this.leftTarget.position.copy(playerMeleeGrips[melee].left.pos);
            this.leftTarget.quaternion.copy(playerMeleeGrips[melee].left.rot);
            item.root.add(this.leftTarget);
        } else if (!melee && item.leftHand) {
            item.root.updateWorldMatrix(true,true);
            item.leftHand.getWorldPosition(this.leftTarget.position);
            item.leftHand.getWorldQuaternion(this.leftTarget.quaternion);
            if(view) {
                this.leftTarget.position.add(this.position.fromArray(view.wristOffsets.left.position).applyQuaternion(this.leftTarget.quaternion));
                this.leftTarget.quaternion.multiply(view.rotation(this.rotation,view.wristOffsets.left.rotation));
            }
            this.leftTarget.removeFromParent();
        }
        if (twoHandedMelee || !melee && item.leftHand) this.leftIK.update();
        this.leftTarget.removeFromParent();
        if(view) {
            // Translate the finished rig as one object. The native left shoulder
            // anchors its horizontal extent, and the idle gun clears the horizon.
            this.skeleton.joints.leftUpperArm.getWorldPosition(this.position);
            this.root.position.x-=Math.min(0,this.position.x);
            this.root.position.y-=view.hipCeiling;
        }
        for (const actor of this.actors) actor.update(true,undefined,false,time);
    }

    dispose() { this.release(); this.actors.forEach(actor => actor.dispose()); this.pass.dispose(); }
}
