import { ModuleLoader } from "../replay/moduleloader.js";
import * as BitHelper from "../replay/bithelper.js";
import { Quat, Quaternion, Vec, Vector } from "../replay/pod.js";
import { ByteStream } from "../replay/stream.js";

declare module "../replay/moduleloader.js" {
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

export interface Dynamic {
    id: number;
    position: Vector;
    rotation: Quaternion;
    dimension: number;
}

export namespace Dynamic {
    export function create({ id, position, rotation, dimension }: { id: number, position?: Vector, rotation?: Quaternion, dimension?: number }): { id: number, position: Vector, rotation: Quaternion, dimension: number } {
        return {
            id,
            dimension: dimension === undefined ? 0 : dimension,
            position: position === undefined ? Vec.zero() : position,
            rotation: rotation === undefined ? Quat.identity() : rotation
        };
    }
    export async function parseTransform(data: ByteStream): Promise<{ dimension: number, absolute: boolean, position: Vector, rotation: Quaternion }> {
        const dimension = await BitHelper.readByte(data);
        const absolute = await BitHelper.readByte(data) != 0;
        return {
            dimension, absolute,
            position: absolute ? await BitHelper.readVector(data) : await BitHelper.readHalfVector(data),
            rotation: await BitHelper.readHalfQuaternion(data)
        };
    }
    export async function parsePosition(data: ByteStream): Promise<{ dimension: number, absolute: boolean, position: Vector }> {
        const dimension = await BitHelper.readByte(data);
        const absolute = await BitHelper.readByte(data) != 0;
        return {
            dimension, absolute,
            position: absolute ? await BitHelper.readVector(data) : await BitHelper.readHalfVector(data)
        };
    }
    export async function parseRotation(data: ByteStream): Promise<{ rotation: Quaternion }> {
        return {
            rotation: await BitHelper.readHalfQuaternion(data)
        };
    }
    export function lerp(dyn: Dynamic, data: any, lerp: number): void {
        const { absolute, position, rotation, dimension } = data;
        const fpos = absolute ? position : Vec.add(dyn.position, position);
        dyn.position = Vec.lerp(dyn.position, fpos, lerp);
        dyn.rotation = Quat.slerp(dyn.rotation, rotation, lerp);
        dyn.dimension = dimension;
    }
}