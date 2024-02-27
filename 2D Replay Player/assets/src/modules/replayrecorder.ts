/* exported ReplayRecorder */
declare namespace ReplayRecorder {
    interface Headers {
        "ReplayRecorder.Header": {
            version: string;
            isMaster: boolean;
        }
    }
}
(function() {
    const typename = "ReplayRecorder.Header";
    ModuleLoader.register(typename, "0.0.1", { 
        parse: async (data) => {
            return {
                version: await BitHelper.readString(data),
                isMaster: await BitHelper.readByte(data) == 1
            };
        }
    });
})();

/* exported DynamicNotFound */
class DynamicNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

/* exported DuplicateDynamic */
class DuplicateDynamic extends Error {
    constructor(message?: string) {
        super(message);
    }
}

/* exported ReplayRecorder */
namespace ReplayRecorder {

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
}