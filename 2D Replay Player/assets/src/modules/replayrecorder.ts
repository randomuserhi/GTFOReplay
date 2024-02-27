(function(typename: string) {
    ModuleLoader.register(typename, "0.0.1", { 
        parse: async (data) => {
            return {
                version: await BitHelper.readString(data),
                isMaster: await BitHelper.readByte(data) == 1
            };
        }
    });
})("ReplayRecorder.Header");

/* exported Dynamic */
interface Dynamic {
    id: number;
    position: Vector;
    rotation: Quaternion;
    dimension: number;
}

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
    export namespace Dynamic {
        export function create({ id, position, rotation, dimension }: { id: number, position?: Vector, rotation?: Quaternion, dimension?: number }): { id: number, position: Vector, rotation: Quaternion, dimension: number } {
            return {
                id,
                dimension: dimension === undefined ? 0 : dimension,
                position: position === undefined ? Vec.zero() : position,
                rotation: rotation === undefined ? Quat.identity() : rotation
            };
        }
        export async function parse(data: ByteStream): Promise<any> {
            const dimension = await BitHelper.readByte(data);
            const absolute = await BitHelper.readByte(data) != 0;
            return {
                dimension, absolute,
                position: absolute ? await BitHelper.readVector(data) : await BitHelper.readHalfVector(data),
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