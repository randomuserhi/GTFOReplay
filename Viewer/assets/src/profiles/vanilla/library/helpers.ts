import * as BitHelper from "@esm/@root/replay/bithelper.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { ByteStream } from "@esm/@root/replay/stream.js";
import { Quaternion, Vector3, Vector3Like } from "@esm/three";

// NOTE(randomuserhi): Create an overload to support Pod Vector3 type
declare module "@esm/three" {
    interface Matrix4 {
        compose(translation: Vector3Like, rotation: Quaternion, scale: Vector3): this;
    }
}

export namespace DynamicTransform {
    export interface Type {
        dimension: number;
        position: Pod.Vector;
        rotation: Pod.Quaternion;
    }

    export type Spawn = Type;

    export async function spawn(data: ByteStream): Promise<Spawn> {
        return {
            dimension: await BitHelper.readByte(data),
            position: await BitHelper.readVector(data),
            rotation: await BitHelper.readHalfQuaternion(data)
        };
    }

    export interface Parse {
        dimension: number; 
        absolute: boolean;
        position: Pod.Vector; 
        rotation: Pod.Quaternion;
    }

    export async function parse(data: ByteStream): Promise<Parse> {
        const dimension = await BitHelper.readByte(data);
        const absolute = await BitHelper.readBool(data);
        return {
            dimension, absolute,
            position: absolute ? await BitHelper.readVector(data) : await BitHelper.readHalfVector(data),
            rotation: await BitHelper.readHalfQuaternion(data)
        };
    }

    const FUNC_lerp = {
        temp: Pod.Vec.zero()
    } as const;
    export function lerp(dyn: Spawn, data: Parse, lerp: number): void {
        const { temp } = FUNC_lerp;

        const { position, rotation, dimension } = data;
        const fpos = Pod.Vec.add(temp, dyn.position, position);
        Pod.Vec.lerp(dyn.position, dyn.position, fpos, lerp);
        Pod.Quat.slerp(dyn.rotation, dyn.rotation, rotation, lerp);
        dyn.dimension = dimension;
    }
}

export namespace DynamicPosition {
    export interface Type {
        dimension: number;
        position: Pod.Vector;
    }

    export type Spawn = Type;

    export async function spawn(data: ByteStream): Promise<Spawn> {
        return {
            dimension: await BitHelper.readByte(data),
            position: await BitHelper.readVector(data),
        };
    }

    export interface Parse {
        dimension: number; 
        absolute: boolean;
        position: Pod.Vector; 
    }

    export async function parse(data: ByteStream): Promise<Parse> {
        const dimension = await BitHelper.readByte(data);
        const absolute = await BitHelper.readBool(data);
        return {
            dimension, absolute,
            position: absolute ? await BitHelper.readVector(data) : await BitHelper.readHalfVector(data),
        };
    }

    const FUNC_lerp = {
        temp: Pod.Vec.zero()
    } as const;
    export function lerp(dyn: Spawn, data: Parse, lerp: number): void {
        const { temp } = FUNC_lerp;

        const { position, dimension } = data;
        const fpos = Pod.Vec.add(temp, dyn.position, position);
        Pod.Vec.lerp(dyn.position, dyn.position, fpos, lerp);
        dyn.dimension = dimension;
    }
}

export namespace DynamicRotation {
    export interface Type {
        rotation: Pod.Quaternion;
    }

    export type Spawn = Type;

    export async function spawn(data: ByteStream): Promise<Spawn> {
        return {
            rotation: await BitHelper.readHalfQuaternion(data)
        };
    }
    
    export interface Parse {
        rotation: Pod.Quaternion;
    }

    export async function parse(data: ByteStream): Promise<Parse> {
        return {
            rotation: await BitHelper.readHalfQuaternion(data)
        };
    }

    export function lerp(dyn: Spawn, data: Parse, lerp: number): void {
        const { rotation } = data;
        Pod.Quat.slerp(dyn.rotation, dyn.rotation, rotation, lerp);
    }
}