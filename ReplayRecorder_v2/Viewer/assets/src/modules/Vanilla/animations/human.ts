import { Object3D, QuaternionLike, Vector3Like } from "three";
import * as Pod from "../../../replay/pod.js";
import { Anim, AnimBlend, isAnimBlend } from "./animation.js";

export interface Human<T> {
    root?: Vector3Like;

    hip: T;

    leftUpperLeg: T;
    leftLowerLeg: T;
    leftFoot?: T;

    rightUpperLeg: T;
    rightLowerLeg: T;
    rightFoot?: T;

    spine0: T;
    spine1: T;
    spine2: T;

    leftShoulder: T;
    leftUpperArm: T;
    leftLowerArm: T;
    leftHand?: T;

    rightShoulder: T;
    rightUpperArm: T;
    rightLowerArm: T;
    rightHand?: T;

    neck: T;
    head: T;
}

export type SkeletonStructure = Human<Vector3Like>;
export const defaultHumanStructure: SkeletonStructure =     {hip:{x:0,y:1.04,z:0},leftUpperLeg:{x:0.09999999,y:0,z:0},leftLowerLeg:{x:1.776357E-17,y:-0.49,z:0},leftFoot:{x:0,y:-0.44,z:0},rightUpperLeg:{x:-0.09999999,y:1.421085E-16,z:0},rightLowerLeg:{x:-1.776357E-17,y:-0.49,z:0},rightFoot:{x:-1.887379E-17,y:-0.44,z:0},spine0:{x:0,y:0.11,z:0},spine1:{x:0,y:0.11,z:0},spine2:{x:0,y:0.11,z:0},leftShoulder:{x:0.03,y:0.19,z:0},leftUpperArm:{x:0.18,y:-2.842171E-16,z:0},leftLowerArm:{x:0.33,y:-4.662936E-16,z:0},leftHand:{x:0.29,y:2.431388E-16,z:-9.769963E-17},rightShoulder:{x:-0.03,y:0.19,z:0},rightUpperArm:{x:-0.18,y:0,z:0},rightLowerArm:{x:-0.33,y:0,z:0},rightHand:{x:-0.29,y:-2.842171E-16,z:0},neck:{x:0,y:0.275,z:0.02499937},head:{x:0,y:0.09999999,z:0}};

export type HumanFrame = Human<QuaternionLike>;

function blendRoot(model: HumanFrame, states: {anim: HumanFrame, weight: number}[]) {
    if (states.length === 0) return;
    if (model.root === undefined) return;

    const buffer: { value: Pod.Vector, weight: number }[] = [];
    for (let i = 0; i < states.length; ++i) {
        const state = states[i];
        if (state.anim.root === undefined) continue;
        buffer.push({
            value: state.anim.root,
            weight: state.weight
        });
    }
    let length = buffer.length;
    if (length === 0) return;

    while (length > 1) {
        let newLength = 0;
        for (let i = 0; i < length;) {
            const idx = newLength++;
            const a = i++;
            const b = i++;
            if (b < length) {
                const total = buffer[a].weight + buffer[b].weight;
                const lerp = buffer[b].weight / total;
                Pod.Vec.lerp(buffer[idx].value, buffer[a].value, buffer[b].value, lerp);
                buffer[idx].weight = total;
            } else {
                Pod.Vec.copy(buffer[idx].value, buffer[a].value);
                buffer[idx].weight = buffer[a].weight;
            }
        }

        length = newLength;
    }

    const root: Pod.Vector = model.root;
    Pod.Vec.copy(root, buffer[0].value);
}

function blendLimb(model: HumanFrame, states: {anim: HumanFrame, weight: number}[], key: keyof HumanFrame) {
    if (states.length === 0) return;

    const buffer: { value: Pod.Quaternion, weight: number }[] = new Array(states.length);
    let length = states.length;
    for (let i = 0; i < states.length; ++i) {
        buffer[i] = {
            value: states[i].anim[key]! as Pod.Quaternion,
            weight: states[i].weight
        };
    }

    while (length > 1) {
        let newLength = 0;
        for (let i = 0; i < length;) {
            const idx = newLength++;
            const a = i++;
            const b = i++;
            if (b < length) {
                const total = buffer[a].weight + buffer[b].weight;
                const lerp = buffer[b].weight / total;
                Pod.Quat.slerp(buffer[idx].value, buffer[a].value, buffer[b].value, lerp);
                buffer[idx].weight = total;
            } else {
                Pod.Quat.copy(buffer[idx].value, buffer[a].value);
                buffer[idx].weight = buffer[a].weight;
            }
        }

        length = newLength;
    }

    const quaternion: Pod.Quaternion = model[key]! as Pod.Quaternion;
    Pod.Quat.copy(quaternion, buffer[0].value);
}

function human(): HumanFrame {
    return {
        root: Pod.Vec.clone(defaultHumanStructure.hip),
        hip: Pod.Quat.identity(),

        leftUpperLeg: Pod.Quat.identity(),
        leftLowerLeg: Pod.Quat.identity(),

        rightUpperLeg: Pod.Quat.identity(),
        rightLowerLeg: Pod.Quat.identity(),

        spine0: Pod.Quat.identity(),
        spine1: Pod.Quat.identity(),
        spine2: Pod.Quat.identity(),

        leftShoulder: Pod.Quat.identity(),
        leftUpperArm: Pod.Quat.identity(),
        leftLowerArm: Pod.Quat.identity(),

        rightShoulder: Pod.Quat.identity(),
        rightUpperArm: Pod.Quat.identity(),
        rightLowerArm: Pod.Quat.identity(),

        neck: Pod.Quat.identity(),
        head: Pod.Quat.identity()
    };
}

export function sample(t: number, anim: Anim<HumanFrame>): HumanFrame {
    t = t % anim.duration;
    const skeleton = human();

    let min = 0;
    let max = anim.frames.length;
    let prev = -1;
    while (max != min) {
        const midpoint = Math.floor((max + min) / 2);
        if (midpoint == prev) break;
        prev = midpoint;
        if (midpoint * anim.rate > t)
            max = midpoint;
        else
            min = midpoint;
    }

    const lerp = min >= (anim.frames.length - 1) ? 1 : Math.clamp01((t - anim.rate * min) / anim.rate);

    const a = anim.frames[min];
    const b = anim.frames[min + 1 >= (anim.frames.length - 1) ? anim.frames.length - 1 : min + 1];
    if (a !== b) {
        if (skeleton.root !== undefined && a.root !== undefined && b.root !== undefined) {
            Pod.Vec.lerp(skeleton.root, a.root, b.root, lerp);
        }
        Pod.Quat.slerp(skeleton.hip, a.hip, b.hip, lerp);

        Pod.Quat.slerp(skeleton.leftUpperLeg, a.leftUpperLeg, b.leftUpperLeg, lerp);
        Pod.Quat.slerp(skeleton.leftLowerLeg, a.leftLowerLeg, b.leftLowerLeg, lerp);

        Pod.Quat.slerp(skeleton.rightUpperLeg, a.rightUpperLeg, b.rightUpperLeg, lerp);
        Pod.Quat.slerp(skeleton.rightLowerLeg, a.rightLowerLeg, b.rightLowerLeg, lerp);

        Pod.Quat.slerp(skeleton.spine0, a.spine0, b.spine0, lerp);
        Pod.Quat.slerp(skeleton.spine1, a.spine1, b.spine1, lerp);
        Pod.Quat.slerp(skeleton.spine2, a.spine2, b.spine2, lerp);

        Pod.Quat.slerp(skeleton.leftShoulder, a.leftShoulder, b.leftShoulder, lerp);
        Pod.Quat.slerp(skeleton.leftUpperArm, a.leftUpperArm, b.leftUpperArm, lerp);
        Pod.Quat.slerp(skeleton.leftLowerArm, a.leftLowerArm, b.leftLowerArm, lerp);

        Pod.Quat.slerp(skeleton.rightShoulder, a.rightShoulder, b.rightShoulder, lerp);
        Pod.Quat.slerp(skeleton.rightUpperArm, a.rightUpperArm, b.rightUpperArm, lerp);
        Pod.Quat.slerp(skeleton.rightLowerArm, a.rightLowerArm, b.rightLowerArm, lerp);

        Pod.Quat.slerp(skeleton.neck, a.neck, b.neck, lerp);
        Pod.Quat.slerp(skeleton.head, a.head, b.head, lerp);
    } else {
        if (skeleton.root !== undefined && a.root !== undefined) {
            Pod.Vec.copy(skeleton.root, a.root);
        }
        Pod.Quat.copy(skeleton.hip, a.hip);

        Pod.Quat.copy(skeleton.leftUpperLeg, a.leftUpperLeg);
        Pod.Quat.copy(skeleton.leftLowerLeg, a.leftLowerLeg);

        Pod.Quat.copy(skeleton.rightUpperLeg, a.rightUpperLeg);
        Pod.Quat.copy(skeleton.rightLowerLeg, a.rightLowerLeg);

        Pod.Quat.copy(skeleton.spine0, a.spine0);
        Pod.Quat.copy(skeleton.spine1, a.spine1);
        Pod.Quat.copy(skeleton.spine2, a.spine2);

        Pod.Quat.copy(skeleton.leftShoulder, a.leftShoulder);
        Pod.Quat.copy(skeleton.leftUpperArm, a.leftUpperArm);
        Pod.Quat.copy(skeleton.leftLowerArm, a.leftLowerArm);

        Pod.Quat.copy(skeleton.rightShoulder, a.rightShoulder);
        Pod.Quat.copy(skeleton.rightUpperArm, a.rightUpperArm);
        Pod.Quat.copy(skeleton.rightLowerArm, a.rightLowerArm);

        Pod.Quat.copy(skeleton.neck, a.neck);
        Pod.Quat.copy(skeleton.head, a.head);
    }

    return skeleton;
}

export function blend(t: number, animBlend: AnimBlend<HumanFrame>): HumanFrame {
    const _states: {anim: HumanFrame, weight: number}[] = [];
    for (const { anim, weight } of animBlend.sample()) {
        let frame: HumanFrame;
        if (isAnimBlend(anim)) {
            frame = blend(t, anim);
        } else {
            frame = sample(t, anim);
        }
        _states.push({
            anim: frame,
            weight
        });
    }

    const model = human();

    blendRoot(model, _states);
    blendLimb(model, _states, "hip");

    blendLimb(model, _states, "leftUpperLeg");
    blendLimb(model, _states, "leftLowerLeg");

    blendLimb(model, _states, "rightUpperLeg");
    blendLimb(model, _states, "rightLowerLeg");

    blendLimb(model, _states, "spine0");
    blendLimb(model, _states, "spine1");
    blendLimb(model, _states, "spine2");

    blendLimb(model, _states, "leftShoulder");
    blendLimb(model, _states, "leftUpperArm");
    blendLimb(model, _states, "leftLowerArm");

    blendLimb(model, _states, "rightShoulder");
    blendLimb(model, _states, "rightUpperArm");
    blendLimb(model, _states, "rightLowerArm");

    blendLimb(model, _states, "neck");
    blendLimb(model, _states, "head");

    return model;
}

export function apply(skeleton: Human<Object3D>, frame: HumanFrame, mask?: Human<boolean>) {
    if (mask === undefined || (mask !== undefined && mask.hip)) {
        if (frame.root !== undefined) skeleton.hip.position.copy(frame.root);
        else skeleton.hip.position.copy(defaultHumanStructure.hip);
        skeleton.hip.quaternion.copy(frame.hip);
    }

    if (mask === undefined || (mask !== undefined && mask.leftUpperLeg)) skeleton.leftUpperLeg.quaternion.copy(frame.leftUpperLeg);
    if (mask === undefined || (mask !== undefined && mask.leftLowerLeg)) skeleton.leftLowerLeg.quaternion.copy(frame.leftLowerLeg);

    if (mask === undefined || (mask !== undefined && mask.rightUpperLeg)) skeleton.rightUpperLeg.quaternion.copy(frame.rightUpperLeg);
    if (mask === undefined || (mask !== undefined && mask.rightLowerLeg)) skeleton.rightLowerLeg.quaternion.copy(frame.rightLowerLeg);

    if (mask === undefined || (mask !== undefined && mask.spine0)) skeleton.spine0.quaternion.copy(frame.spine0);
    if (mask === undefined || (mask !== undefined && mask.spine1)) skeleton.spine1.quaternion.copy(frame.spine1);
    if (mask === undefined || (mask !== undefined && mask.spine2)) skeleton.spine2.quaternion.copy(frame.spine2);

    if (mask === undefined || (mask !== undefined && mask.leftShoulder)) skeleton.leftShoulder.quaternion.copy(frame.leftShoulder);
    if (mask === undefined || (mask !== undefined && mask.leftUpperArm)) skeleton.leftUpperArm.quaternion.copy(frame.leftUpperArm);
    if (mask === undefined || (mask !== undefined && mask.leftLowerArm)) skeleton.leftLowerArm.quaternion.copy(frame.leftLowerArm);

    if (mask === undefined || (mask !== undefined && mask.rightShoulder)) skeleton.rightShoulder.quaternion.copy(frame.rightShoulder);
    if (mask === undefined || (mask !== undefined && mask.rightUpperArm)) skeleton.rightUpperArm.quaternion.copy(frame.rightUpperArm);
    if (mask === undefined || (mask !== undefined && mask.rightLowerArm)) skeleton.rightLowerArm.quaternion.copy(frame.rightLowerArm);

    if (mask === undefined || (mask !== undefined && mask.neck)) skeleton.neck.quaternion.copy(frame.neck);
    if (mask === undefined || (mask !== undefined && mask.head)) skeleton.head.quaternion.copy(frame.head);
}