import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { Quat, Quaternion, Vec, Vector } from "@esm/@root/replay/pod.js";
import { ByteStream } from "@esm/@root/replay/stream.js";
import { Vector3, Vector3Like } from "@esm/three";

// NOTE(randomuserhi): Create an overload to support Pod Vector3 type
declare module "@esm/three" {
    interface Matrix4 {
        compose(translation: Vector3Like, rotation: Quaternion, scale: Vector3): this;
    }
}

export interface DynamicParse {
    dimension: number;
    absolute: boolean;
    position: Vector;
    rotation: Quaternion;
}

export interface DynamicSpawn {
    dimension: number;
    position: Vector;
    rotation: Quaternion;
}

export interface Dynamic {
    id: number;
}

export interface DynamicTransform extends Dynamic {
    position: Vector;
    rotation: Quaternion;
    dimension: number;
}

const temp: Vector = { x: 0, y: 0, z: 0 };

export namespace DynamicTransform {
    export function create({ id, position, rotation, dimension }: { id: number, position?: Vector, rotation?: Quaternion, dimension?: number }): { id: number, position: Vector, rotation: Quaternion, dimension: number } {
        return {
            id,
            dimension: dimension === undefined ? 0 : dimension,
            position: position === undefined ? Vec.zero() : position,
            rotation: rotation === undefined ? Quat.identity() : rotation
        };
    }
    export async function parseSpawn(data: ByteStream): Promise<{ dimension: number, position: Vector, rotation: Quaternion }> {
        return {
            dimension: await BitHelper.readByte(data),
            position: await BitHelper.readVector(data),
            rotation: await BitHelper.readHalfQuaternion(data)
        };
    }
    export async function parse(data: ByteStream): Promise<{ dimension: number, absolute: boolean, position: Vector, rotation: Quaternion }> {
        const dimension = await BitHelper.readByte(data);
        const absolute = await BitHelper.readBool(data);
        return {
            dimension, absolute,
            position: absolute ? await BitHelper.readVector(data) : await BitHelper.readHalfVector(data),
            rotation: await BitHelper.readHalfQuaternion(data)
        };
    }
    export function lerp(dyn: DynamicTransform, data: { dimension: number; absolute: boolean; position: Vector; rotation: Quaternion; }, lerp: number): void {
        const { absolute, position, rotation, dimension } = data;
        const fpos = absolute ? position : Vec.add(temp, dyn.position, position);
        Vec.lerp(dyn.position, dyn.position, fpos, lerp);
        Quat.slerp(dyn.rotation, dyn.rotation, rotation, lerp);
        dyn.dimension = dimension;
    }
}

export interface DynamicPosition extends Dynamic {
    position: Vector;
    dimension: number;
}

export namespace DynamicPosition {
    export async function parseSpawn(data: ByteStream): Promise<{ dimension: number, position: Vector }> {
        return {
            dimension: await BitHelper.readByte(data),
            position: await BitHelper.readVector(data)
        };
    }
    export async function parse(data: ByteStream): Promise<{ dimension: number, absolute: boolean, position: Vector }> {
        const dimension = await BitHelper.readByte(data);
        const absolute = await BitHelper.readBool(data);
        return {
            dimension, absolute,
            position: absolute ? await BitHelper.readVector(data) : await BitHelper.readHalfVector(data)
        };
    }
    export function lerp(dyn: DynamicPosition, data: { dimension: number; absolute: boolean; position: Vector; }, lerp: number): void {
        const { absolute, position, dimension } = data;
        const fpos = absolute ? position : Vec.add(temp, dyn.position, position);
        Vec.lerp(dyn.position, dyn.position, fpos, lerp);
        dyn.dimension = dimension;
    }
}

export interface DynamicRotation extends Dynamic {
    rotation: Quaternion;
}

export namespace DynamicRotation {
    export async function parseSpawn(data: ByteStream): Promise<{ rotation: Quaternion }> {
        return {
            rotation: await BitHelper.readHalfQuaternion(data)
        };
    }
    export async function parse(data: ByteStream): Promise<{ rotation: Quaternion }> {
        return {
            rotation: await BitHelper.readHalfQuaternion(data)
        };
    }
    export function lerp(dyn: DynamicRotation, data: { rotation: Quaternion; }, lerp: number): void {
        const { rotation } = data;
        Quat.slerp(dyn.rotation, dyn.rotation, rotation, lerp);
    }
}