import { Object3D, QuaternionLike, Vector2Like, Vector3Like } from "three";



export interface AvatarLike<T extends string = string> {



    root: Vector3Like;



    joints: Record<T, QuaternionLike>;



}



export declare class Avatar<T extends string = string> {



    root: Vector3Like;



    joints: Record<T, QuaternionLike>;



    keys: ReadonlyArray<T>;



    constructor(joints: ReadonlyArray<T>);



}



export type AvatarStructure<T extends string = string, V = Vector3Like> = Record<T, V>;



export declare function createAvatarStruct<T extends string = string, V = Vector3Like>(joints: ReadonlyArray<T>, factory: () => V): AvatarStructure<T, V>;



export declare class AvatarSkeleton<T extends string = string> {



    root: Object3D;



    joints: Record<T, Object3D>;



    keys: ReadonlyArray<T>;



    constructor(joints: ReadonlyArray<T>, root: T);



    setPos(structure: AvatarStructure<T>): void;



    setRot(structure: AvatarStructure<T, QuaternionLike>): void;



    override(frame: AvatarLike<T>, mask?: AvatarMask<T>): AvatarSkeleton<T>;



    additive(diff: AvatarLike<T>, weight: number, mask?: AvatarMask<T>): AvatarSkeleton<T>;



    blend(frame: AvatarLike<T>, weight: number, mask?: AvatarMask<T>): this;



}



export interface AvatarMask<T extends string = string> {



    root: boolean;



    joints: Partial<Record<T, boolean>>;



}



export interface AnimFunc<T extends string> {



    joints: ReadonlyArray<T>;



    sample(t: number, timescale?: number): Avatar<T>;



    duration: number;



}



export declare function mergeAnims<T extends string>(...anims: Anim<T>[]): Anim<T>;



export declare function toAnim<T extends string>(joints: ReadonlyArray<T>, rate: number, duration: number, ...frames: AvatarLike<T>[]): Anim<T>;



export declare function difference<T extends string>(skeleton: AvatarLike<T>, reference: AvatarLike<T>, frame: AvatarLike<T>): AvatarLike<T>;



export declare class Anim<T extends string = string> implements AnimFunc<T> {



    frames: AvatarLike<T>[];



    duration: number;



    rate: number;



    joints: ReadonlyArray<T>;



    private cache;



    constructor(joints: ReadonlyArray<T>, rate: number, duration: number, frames: AvatarLike<T>[]);



    sample(t: number, timescale?: number): Avatar<T>;



}



export declare class ScaledAnim<T extends string = string> implements AnimFunc<T> {



    anim: Anim<T>;



    duration: number;



    scale: number;



    joints: readonly T[];



    constructor(joints: ReadonlyArray<T>, anim: Anim<T>, scale: number);



    sample(t: number, timescale?: number): Avatar<T>;



}



export declare function isAnimBlend<T extends string>(obj: Anim<T> | AnimBlend<T>): obj is AnimBlend<T>;



export declare class AnimBlend<T extends string> implements AnimFunc<T> {



    joints: ReadonlyArray<T>;



    point: {



        x: number;



        y: number;



    };



    points: {



        anim: AnimFunc<T>;



        x: number;



        y: number;



        timescale?: number;



    }[];



    readonly duration: number;



    private cache;



    private buffer;



    private states;



    private numStates;



    constructor(joints: ReadonlyArray<T>, points: {



        anim: AnimFunc<T>;



        x: number;



        y: number;



        timescale?: number;



    }[], point?: Vector2Like);



    private weights;



    private blendRoot;



    private blendJoint;



    sample(t: number, timescale?: number): Avatar<T>;



}



