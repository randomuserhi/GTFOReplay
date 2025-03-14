import * as Pod from "@esm/@root/replay/pod.js";
import { Object3D, Quaternion, QuaternionLike, Vector2Like, Vector3, Vector3Like } from "@esm/three";

export interface AvatarLike<T extends string = string> {
    root: Vector3Like;
    joints: Record<T, QuaternionLike>;
}

export class Avatar<T extends string = string> {
    root: Vector3Like;
    joints: Record<T, QuaternionLike>;
    keys: ReadonlyArray<T>;
    
    constructor(joints: ReadonlyArray<T>) {
        this.root = Pod.Vec.zero();
        this.joints = {} as Record<T, QuaternionLike>;
        this.keys = joints;

        for (const key of this.keys) {
            this.joints[key] = Pod.Quat.identity();
        }
    }
}

export type AvatarStructure<T extends string = string, V = Vector3Like> = Record<T, V>;
export function createAvatarStruct<T extends string = string, V = Vector3Like>(joints: ReadonlyArray<T>, factory: () => V): AvatarStructure<T, V> {
    const obj: any = {};

    for (const key of joints) {
        obj[key] = factory();
    }

    return obj;
}

const _vtemp: Vector3 = new Vector3();
const _qtemp: Quaternion = new Quaternion();
const _qtempPod: Pod.Quaternion = Pod.Quat.identity();
export class AvatarSkeleton<T extends string = string> {
    root: Object3D;
    joints: Record<T, Object3D>;
    keys: ReadonlyArray<T>;

    constructor(joints: ReadonlyArray<T>, root: T) {
        this.joints = {} as Record<T, Object3D>;
        this.keys = joints;
        
        for (const key of this.keys) {
            this.joints[key] = new Object3D();
        }
        this.root = this.joints[root];
    }

    public setPos(structure: AvatarStructure<T>) {
        for (const key of this.keys) {
            this.joints[key].position.copy(structure[key]);
        }
    }

    public setRot(structure: AvatarStructure<T, QuaternionLike>) {
        for (const key of this.keys) {
            this.joints[key].quaternion.copy(structure[key]);
        }
    }

    public override(frame: AvatarLike<T>, mask?: AvatarMask<T>): AvatarSkeleton<T> {
        if (mask === undefined || mask.root === true) {
            this.root.position.copy(frame.root);
        }
    
        for (const key of this.keys) {
            if (mask === undefined || mask.joints[key] === true) {
                this.joints[key].quaternion.copy(frame.joints[key]);
            }
        }
        return this;
    }
    
    public additive(diff: AvatarLike<T>, weight: number, mask?: AvatarMask<T>): AvatarSkeleton<T> {
        if (mask === undefined || mask.root === true) {
            const position = this.root.position;
            position.lerp(_vtemp.copy(position).add(diff.root), weight);
        }
    
        for (const key of this.keys) {
            if (mask === undefined || mask.joints[key] === true) {
                const quaternion = this.joints[key].quaternion;
                quaternion.slerp(_qtemp.copy(Pod.Quat.mul(_qtempPod, quaternion, diff.joints[key])), weight);
            }
        }
        return this;
    }

    public blend(frame: AvatarLike<T>, weight:number, mask?: AvatarMask<T>) {
        if (weight === 0) return this;

        if (mask === undefined || mask.root === true) {
            const position = this.root.position;
            position.lerp(frame.root, weight);
        }
    
        for (const key of this.keys) {
            if (mask === undefined || mask.joints[key] === true) {
                const quaternion = this.joints[key].quaternion;
                quaternion.copy(Pod.Quat.slerp(_qtempPod, quaternion, frame.joints[key], weight));
            }
        }
        return this;
    }
}

export interface AvatarMask<T extends string = string> {
    root: boolean;
    joints: Partial<Record<T, boolean>>;
}

export interface AnimFunc<T extends string> {
    joints: ReadonlyArray<T>;
    sample(t: number, timescale?: number): Avatar<T>;
    duration: number;
    first(): AvatarLike<T>;
}

export function mergeAnims<T extends string>(...anims: Anim<T>[]): Anim<T> {
    if (anims.length < 2) throw new Error("Cannot merge 1 or less animations.");
    
    const rate = anims[0].rate;
    let duration = 0;
    const frames: AvatarLike<T>[] = [];
    for (const anim of anims) {
        if (anim.rate !== rate) throw new Error("All animations must have the same rate to merge them.");   
        if (!isAnim(anim)) throw new Error("Can only merge raw animations, blends and scaled animations are not allowed.");  
        duration += anim.duration;
        frames.push(...anim.frames);
    }
    return new Anim(anims[0].joints, anims[0].rate, duration, frames);
}

export function toAnim<T extends string>(joints: ReadonlyArray<T>, rate: number, duration: number, ...frames: AvatarLike<T>[]): Anim<T> {
    return new Anim<T>(joints, rate, duration, frames);
}

export function difference<T extends string>(skeleton: AvatarLike<T>, reference: AvatarLike<T>, frame: AvatarLike<T>) {
    Pod.Vec.sub(skeleton.root, frame.root, reference.root);

    for (const key in skeleton.joints) {
        Pod.Quat.mul(skeleton.joints[key], reference.joints[key], Pod.Quat.inverse(_qtempPod, frame.joints[key]));
    }

    return skeleton;
}

export function empty<T extends string>(joints: ReadonlyArray<T>) {
    const avatar: AvatarLike<T> = {
        root: { x: 0, y: 0, z: 0 },
        joints: {}
    } as AvatarLike<T>;

    for (const joint of joints) {
        avatar.joints[joint] = {
            x: 0,
            y: 0,
            z: 0,
            w: 1
        };
    }

    return new Anim(joints, 0.05, 0.01, [avatar]);
}

export class Anim<T extends string = string> implements AnimFunc<T> {
    frames: AvatarLike<T>[];
    duration: number;
    rate: number;
    joints: ReadonlyArray<T>;

    private cache: Avatar<T>;

    constructor(joints: ReadonlyArray<T>, rate: number, duration: number, frames: AvatarLike<T>[]) {
        if (rate <= 0) throw new Error("Invalid animation rate.");

        this.joints = joints;
        this.duration = duration;
        this.rate = rate;
        this.frames = frames;

        this.cache = new Avatar(this.joints);
    }

    public first(): AvatarLike<T> {
        return this.frames[0];
    }

    public sample(t: number, timescale?: number): Avatar<T> {
        if (this.frames.length === 0) return this.cache; // NOTE(randomuserhi): returns blank pose - undefined behaviour really

        if (timescale !== undefined) t *= timescale;
        t = t % this.duration;
    
        let min = 0;
        let max = this.frames.length;
        let prev = -1;
        while (max != min) {
            const midpoint = Math.floor((max + min) / 2);
            if (midpoint == prev) break;
            prev = midpoint;
            if (midpoint * this.rate > t)
                max = midpoint;
            else
                min = midpoint;
        }
    
        const lerp = min >= (this.frames.length - 1) ? 1 : Math.clamp01((t - this.rate * min) / this.rate);
    
        const a = this.frames[min];
        const b = this.frames[min + 1 >= (this.frames.length - 1) ? this.frames.length - 1 : min + 1];
        if (a !== b) {
            Pod.Vec.lerp(this.cache.root, a.root, b.root, lerp);
    
            for (const joint in this.cache.joints) {
                Pod.Quat.slerp(this.cache.joints[joint], a.joints[joint], b.joints[joint], lerp);
            }
        } else {
            Pod.Vec.copy(this.cache.root, a.root);
    
            for (const joint in this.cache.joints) {
                Pod.Quat.copy(this.cache.joints[joint], a.joints[joint]);
            }
        }
    
        return this.cache;
    }
}

export class ScaledAnim<T extends string = string> implements AnimFunc<T> {
    anim: Anim<T>;
    duration: number;
    scale: number;
    joints: readonly T[];

    constructor(joints: ReadonlyArray<T>, anim: Anim<T>, scale: number) {
        if (!isAnim(anim)) throw new Error("Scaled anims only apply to raw animations.");

        this.joints = joints;
        this.scale = scale;
        this.anim = anim;
        this.duration = this.anim.duration / this.scale;
    }

    public first(): AvatarLike<T> {
        return this.anim.first();
    }

    public sample(t: number, timescale?: number): Avatar<T> {
        const scale = timescale === undefined ? this.scale : this.scale * timescale;
        return this.anim.sample(t, scale);
    }
}

export function isAnim<T extends string>(obj: AnimFunc<T>): obj is Anim<T> {
    return Object.prototype.isPrototypeOf.call(Anim.prototype, obj);
}

export function isAnimBlend<T extends string>(obj: AnimFunc<T>): obj is AnimBlend<T> {
    return Object.prototype.isPrototypeOf.call(AnimBlend.prototype, obj);
}

const diff_i = {x: 0, y: 0};
const diff_j = {x: 0, y: 0};

// NOTE: uses Cartesian Rune Skovbo Johansen's Gradient Band Interpolation
// NOTE: Cannot use 2 blends in the same blend tree, since result is cached, it will dirty the result
export class AnimBlend<T extends string> implements AnimFunc<T> {
    joints: ReadonlyArray<T>;

    point: { x: number, y: number };
    points: {
        anim: AnimFunc<T>,
        x: number,
        y: number,
        timescale?: number
    }[]; 
    readonly duration: number;

    private cache: Avatar<T>;
    private buffer: { value: any, weight: number }[];
    private states: { anim: AvatarLike<T>, weight: number }[];
    private numStates: number;

    constructor(joints: ReadonlyArray<T>, points: {
        anim: AnimFunc<T>,
        x: number,
        y: number,
        timescale?: number
    }[], point?: Vector2Like) {
        if (point === undefined) {
            this.point = {
                x: 0,
                y: 0
            };
        } else {
            this.point = point;
        }
        this.points = points;
        this.duration = Math.max(...points.map(p => p.timescale === undefined ? p.anim.duration : p.anim.duration / p.timescale));

        this.joints = joints;
        this.cache = new Avatar(this.joints);
        this.buffer = [];
        this.states = [];
        this.numStates = 0;
    }

    public first(): AvatarLike<T> {
        return this.sample(0);
    }

    private weights(): { anim: AnimFunc<T>, weight: number, timescale?: number }[] {
        // Implementation from https://www.shadertoy.com/view/XlKXWR
        let totalWeight: number = 0;
        const weights = [];
 
        for (let i = 0; i < this.points.length; ++i) {
            const point_i = this.points[i];
            diff_i.x = this.point.x - point_i.x;
            diff_i.y = this.point.y - point_i.y;
            
            let weight = 1.0;

            for (let j = 0; j < this.points.length; ++j) {
                if (j === i) continue;

                const point_j = this.points[j];
                diff_j.x = point_j.x - point_i.x;
                diff_j.y = point_j.y - point_i.y;

                const sqrlength = diff_j.x * diff_j.x + diff_j.y * diff_j.y;
                let newWeight = (diff_i.x * diff_j.x + diff_i.y * diff_j.y) / sqrlength;
                newWeight = 1.0 - newWeight;
                newWeight = Math.clamp01(newWeight);
                
                if (isNaN(newWeight)) continue;

                weight = Math.min(weight, newWeight);
            }

            if (weight > 0) {
                weights.push({ anim: point_i.anim, weight: weight, timescale: point_i.timescale });
            }
            totalWeight += weight;
        }

        for (let i = 0; i < weights.length; ++i) {
            weights[i].weight /= totalWeight;
        }
        return weights;
    }

    private blendRoot() {
        if (this.numStates === 0) return;
        
        for (let i = 0; i < this.numStates; ++i) {
            const state = this.states[i];
            while (i >= this.buffer.length) {
                this.buffer.push({
                    value: undefined,
                    weight: 0
                });
            }
            this.buffer[i].value = state.anim.root;
            this.buffer[i].weight = state.weight;
        }
        
        let length = this.numStates;
        while (length > 1) {
            let newLength = 0;
            for (let i = 0; i < length;) {
                const idx = newLength++;
                const a = i++;
                const b = i++;
                if (b < length) {
                    const total = this.buffer[a].weight + this.buffer[b].weight;
                    const lerp = this.buffer[b].weight / total;
                    Pod.Vec.lerp(this.buffer[idx].value, this.buffer[a].value, this.buffer[b].value, lerp);
                    this.buffer[idx].weight = total;
                } else {
                    Pod.Vec.copy(this.buffer[idx].value, this.buffer[a].value);
                    this.buffer[idx].weight = this.buffer[a].weight;
                }
            }
        
            length = newLength;
        }
        
        Pod.Vec.copy(this.cache.root, this.buffer[0].value);
    }

    private blendJoint(key: T) {
        if (this.numStates === 0) return;

        for (let i = 0; i < this.numStates; ++i) {
            const state = this.states[i];
            while (i >= this.buffer.length) {
                this.buffer.push({
                    value: undefined,
                    weight: 0
                });
            }
            this.buffer[i].value = state.anim.joints[key];
            this.buffer[i].weight = state.weight;
        }
        
        let length = this.numStates;
        while (length > 1) {
            let newLength = 0;
            for (let i = 0; i < length;) {
                const idx = newLength++;
                const a = i++;
                const b = i++;
                if (b < length) {
                    const total = this.buffer[a].weight + this.buffer[b].weight;
                    const lerp = this.buffer[b].weight / total;
                    Pod.Quat.slerp(this.buffer[idx].value, this.buffer[a].value, this.buffer[b].value, lerp);
                    this.buffer[idx].weight = total;
                } else {
                    Pod.Quat.copy(this.buffer[idx].value, this.buffer[a].value);
                    this.buffer[idx].weight = this.buffer[a].weight;
                }
            }

            length = newLength;
        }

        Pod.Quat.copy(this.cache.joints[key], this.buffer[0].value);
    }

    public sample(t: number, timescale?: number): Avatar<T> {        
        if (timescale !== undefined) t *= timescale;

        this.numStates = 0;
        for (const { anim, weight, timescale } of this.weights()) {
            const frame: Avatar<T> = anim.sample(t, timescale);
            while (this.numStates >= this.states.length) {
                this.states.push({
                    anim: undefined as any,
                    weight: 0
                });
            }
            this.states[this.numStates].anim = frame;
            this.states[this.numStates++].weight = weight;
        }

        this.blendRoot();
        
        for (const joint of this.joints) {
            this.blendJoint(joint);
        }

        return this.cache;
    }
}
