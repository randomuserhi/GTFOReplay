import { animCrouch, animDetection, animVelocity, EnemyAnimDatablock } from "../../../datablocks/enemy/animation.js";
import { PlayerAnimDatablock } from "../../../datablocks/player/animation.js";
import { EnemyAnimState } from "../../../parser/enemy/animation.js";
import { Enemy } from "../../../parser/enemy/enemy.js";
import { HumanAnimation } from "../../animations/human.js";
import { StickFigure } from "../../models/stickfigure.js";
import { EnemyModel } from "../lib.js";

const playerAnimations = PlayerAnimDatablock.obj();
const enemyAnimations = EnemyAnimDatablock.obj();

export class HumanoidEnemyModel extends StickFigure<[enemy: Enemy, anim: EnemyAnimState]> {
    private readonly wrapper: EnemyModel;
    private animOffset: number = Math.random() * 10;

    constructor(wrapper: EnemyModel) {
        super();  
        this.wrapper = wrapper;
    }

    public render(dt: number, time: number, enemy: Enemy, anim: EnemyAnimState) {
        if (!this.isVisible()) return;

        this.animate(dt, time, anim);
        this.draw(dt, enemy.position, enemy.rotation);
    }

    private animate(dt: number, time: number, anim: EnemyAnimState) {
        const { animHandle } = this.wrapper;
        
        this.color.set(0xff0000);
        if (this.settings.color !== undefined) {
            this.color.set(this.settings.color);
        }

        this.offset.rotation.set(0, 0, 0);

        time /= 1000; // NOTE(randomuserhi): Animations are handled using seconds, convert ms to seconds
        const offsetTime = time + this.animOffset;

        animVelocity.x = anim.velocity.x;
        animVelocity.y = anim.velocity.z;
        animCrouch.x = 0;
        animDetection.x = anim.detect;

        const overrideBlend = animHandle !== undefined && animHandle.blend ? Math.clamp01(animHandle.blend * dt) : 1;

        if (animHandle === undefined) {
            this.skeleton.blend(playerAnimations.defaultMovement.sample(offsetTime), overrideBlend);
            return;
        }

        const stateTime = time - (anim.lastStateTime / 1000);
        switch (anim.state) {
        case "StuckInGlue": {
            const blend = Math.clamp01(stateTime / 0.15);
            const screamAnim = animHandle.screams[anim.screamAnimIndex];
            this.skeleton.blend(screamAnim.sample(Math.clamp(stateTime, 0, 0.5)), blend);

            this.color.set(0x0000ff);
        } break;
        case "HibernateWakeUp": {
            const wakeupTime = time - (anim.lastWakeupTime / 1000);
            const wakeupAnim = anim.wakeupTurn ? animHandle.wakeupTurns[anim.wakeupAnimIndex] : animHandle.wakeup[anim.wakeupAnimIndex];
            const inWakeup = wakeupAnim !== undefined && wakeupTime < wakeupAnim.duration && anim.state === "HibernateWakeUp";
            if (inWakeup) {
                const blend = wakeupTime < wakeupAnim.duration / 2 ? Math.clamp01(wakeupTime / 0.15) : Math.clamp01((wakeupAnim.duration - wakeupTime) / 0.15);
                this.skeleton.blend(wakeupAnim.sample(Math.clamp(wakeupTime, 0, wakeupAnim.duration)), blend);
            }
        } break;
        case "Hibernate": {
            this.skeleton.override(animHandle.hibernateLoop.sample(stateTime));
            if (stateTime < animHandle.hibernateIn.duration) {
                this.skeleton.blend(animHandle.hibernateIn.sample(stateTime), 1 - Math.clamp01(stateTime / animHandle.hibernateIn.duration));
            }
            
            const heartbeatTime = time - (anim.lastHeartbeatTime / 1000);
            const heartbeatAnim = animHandle.heartbeats[anim.heartbeatAnimIndex];
            const inHeartbeat = heartbeatAnim !== undefined && heartbeatTime < heartbeatAnim.duration;
            if (inHeartbeat) {
                const blend = heartbeatTime < heartbeatAnim.duration / 2 ? Math.clamp01(heartbeatTime / 0.15) : Math.clamp01((heartbeatAnim.duration - heartbeatTime) / 0.15);
                this.skeleton.blend(heartbeatAnim.sample(Math.clamp(heartbeatTime, 0, heartbeatAnim.duration)), blend);
            }
        } break;
        case "ClimbLadder": {
            if (anim.up) {
                this.offset.rotation.set(-90 * Math.deg2rad, 0, 0, "YXZ");
            } else {
                this.offset.rotation.set(90 * Math.deg2rad, 180 * Math.deg2rad, 0, "YXZ");
            } 
            if (anim.velocity.y !== 0) this.skeleton.blend(animHandle.ladderClimb.sample(offsetTime, 2), overrideBlend);
        } break;
        default: this.skeleton.blend(animHandle.movement.sample(offsetTime), overrideBlend); break;
        }

        if (animHandle.abilityUse !== undefined && (anim.state === "ScoutScream" || anim.state === "ScoutDetection")) {
            const screamTime = time - (anim.lastScoutScream / 1000);
            if (anim.scoutScreamStart === true) {
                const inStartup = screamTime < animHandle.abilityUse[0].duration;
                if (inStartup) {
                    this.skeleton.blend(animHandle.abilityUse[0].sample(screamTime), overrideBlend);
                } else {
                    this.skeleton.blend(animHandle.abilityUse[1].sample(screamTime), overrideBlend);
                }

                return;
            } else {
                const inEnd = screamTime < animHandle.abilityUse[2].duration;
                if (inEnd) {
                    this.skeleton.blend(animHandle.abilityUse[2].sample(screamTime), overrideBlend);
                    return;
                }
            }
        }

        const screamTime = time - (anim.lastScreamTime / 1000);
        const screamAnim = animHandle.screams[anim.screamAnimIndex];
        const inScream = screamAnim !== undefined && screamTime < screamAnim.duration && (anim.state === "Scream" || anim.state === "ScoutScream");
        if (inScream) {
            if (anim.screamType === "Regular") {
                const blend = screamTime < screamAnim.duration / 2 ? Math.clamp01(screamTime / 0.15) : Math.clamp01((screamAnim.duration - screamTime) / 0.15);
                this.skeleton.blend(screamAnim.sample(Math.clamp(screamTime, 0, screamAnim.duration)), blend);
            }

            // TODO(randomuserhi): scream effect...
        }

        const jumpTime = time - (anim.lastJumpTime / 1000);
        const jumpAnim = animHandle.jump[anim.jumpAnimIndex];
        const inJump = (jumpTime < jumpAnim.duration || anim.state === "Jump");
        if (inJump) {
            const blend = jumpTime < jumpAnim.duration / 2 ? Math.clamp01(jumpTime / 0.15) : Math.clamp01((jumpAnim.duration - jumpTime) / 0.15);
            this.skeleton.blend(jumpAnim.sample(Math.clamp(jumpTime, 0, jumpAnim.duration)), blend);
            return;
        }

        if (animHandle.melee !== undefined) {
            const meleeTime = time - (anim.lastMeleeTime / 1000);
            const meleeAnim = animHandle.melee[anim.meleeType][anim.meleeAnimIndex];
            const inMelee = meleeAnim !== undefined && (meleeTime < meleeAnim.duration && anim.state === "StrikerMelee");
            if (inMelee) {
                const blend = meleeTime < meleeAnim.duration / 2 ? Math.clamp01(meleeTime / 0.15) : Math.clamp01((meleeAnim.duration - meleeTime) / 0.15);
                this.skeleton.blend(meleeAnim.sample(Math.clamp(meleeTime, 0, meleeAnim.duration)), blend);
            }
        }

        const windupTime = time - (anim.lastWindupTime / 1000);
        const windupAnim = animHandle.abilityFire[anim.windupAnimIndex];
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
            case "Backward": hitreactAnim = animHandle.hitHeavyBwd[anim.hitreactAnimIndex]; break;
            case "Forward": hitreactAnim = animHandle.hitHeavyFwd[anim.hitreactAnimIndex]; break;
            case "Left": hitreactAnim = animHandle.hitHeavyLt[anim.hitreactAnimIndex]; break;
            case "Right": hitreactAnim = animHandle.hitHeavyRt[anim.hitreactAnimIndex]; break;
            }
        } break;
        case "Light": {
            switch (anim.hitreactDirection) {
            case "Backward": hitreactAnim = animHandle.hitLightBwd[anim.hitreactAnimIndex]; break;
            case "Forward": hitreactAnim = animHandle.hitLightFwd[anim.hitreactAnimIndex]; break;
            case "Left": hitreactAnim = animHandle.hitLightLt[anim.hitreactAnimIndex]; break;
            case "Right": hitreactAnim = animHandle.hitLightRt[anim.hitreactAnimIndex]; break;
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
}