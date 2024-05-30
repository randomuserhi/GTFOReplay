import { Vector3, Vector3Like } from "three";
import * as BitHelper from "../../replay/bithelper.js";
import { ModuleLoader } from "../../replay/moduleloader.js";
import { Quat, Quaternion, Vec, Vector } from "../../replay/pod.js";
import { ByteStream } from "../../replay/stream.js";

declare module "three" {
    interface Matrix4 {
        compose(translation: Vector3Like, rotation: Quaternion, scale: Vector3): this;
    }
}

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "ReplayRecorder.Header": {
                version: string;
                isMaster: boolean;
            }
        }
    }
}

ModuleLoader.registerHeader("ReplayRecorder.Header", "0.0.1", { 
    parse: async (data, header) => {
        if (header.has("ReplayRecorder.Header")) throw new DuplicateHeaderData("Replay header was already written.");
        header.set("ReplayRecorder.Header", {
            version: await BitHelper.readString(data),
            isMaster: await BitHelper.readByte(data) == 1
        });
    }
});

export class HeaderNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicateHeaderData extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DynamicNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicateDynamic extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export type Id<T> = T & { id: number }; 

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