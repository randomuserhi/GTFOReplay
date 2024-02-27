(function(typename: string) {
    ModuleLoader.register(typename, "0.0.1", async (data) => {
        return {
            version: await BitHelper.readString(data),
            isMaster: await BitHelper.readByte(data) == 1
        };
    });
})("ReplayRecorder.Header");

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


namespace ReplayRecorder {
    export async function Spawn(data: ByteStream): Promise<any> {
        return {
            id: await BitHelper.readInt(data)
        };
    }

    export async function SpawnAt(data: ByteStream): Promise<any> {
        const spawn = await ReplayRecorder.Spawn(data);
        return {
            ...spawn,
            position: await BitHelper.readVector(data),
            rotation: await BitHelper.readHalfQuaternion(data),
            dimension: await BitHelper.readByte(data)
        };
    }

    export async function Despawn(data: ByteStream): Promise<any> {
        return {
            id: await BitHelper.readInt(data)
        };
    }

    export namespace Dynamic {
        export function create({ id, position, rotation, dimension }: { id: number, position?: Vector, rotation?: Quaternion, dimension?: number }): { id: number, position: Vector, rotation: Quaternion, dimension: number } {
            return {
                id,
                position: position === undefined ? Vec.zero() : position,
                rotation: rotation === undefined ? Quat.identity() : rotation,
                dimension: dimension === undefined ? 0 : dimension
            };
        }
        export async function parse(data: ByteStream): Promise<any> {
            const absolute = await BitHelper.readByte(data) != 0;
            return {
                absolute,
                position: absolute ? await BitHelper.readVector(data) : await BitHelper.readHalfVector(data),
                rotation: await BitHelper.readHalfQuaternion(data),
                dimension: await BitHelper.readByte(data)
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

(function(typename: string) {
    ModuleLoader.register(typename, "0.0.1", async (data) => {
        return await ReplayRecorder.Spawn(data);
    }, (data, snapshot) => {
        const dynamics = snapshot.get("ReplayRecorder.Dynamic", "0.0.1");

        const { id } = data;
        if (dynamics.has(id)) throw new DuplicateDynamic(`Dynamic of id '${id}' already exists.`);
        dynamics.set(id, ReplayRecorder.Dynamic.create(data));
    });
})("ReplayRecorder.Spawn");

(function(typename: string) {
    ModuleLoader.register(typename, "0.0.1", async (data) => {
        return await ReplayRecorder.SpawnAt(data);
    }, (data, snapshot) => {
        const dynamics = snapshot.get("ReplayRecorder.Dynamic", "0.0.1");

        const { id } = data;
        if (dynamics.has(id)) throw new DuplicateDynamic(`Dynamic of id '${id}' already exists.`);
        dynamics.set(id, ReplayRecorder.Dynamic.create(data));
    });
})("ReplayRecorder.SpawnAt");

(function(typename: string) {
    ModuleLoader.register(typename, "0.0.1", async (data) => {
        return await ReplayRecorder.Despawn(data);
    }, (data, snapshot) => {
        const dynamics = snapshot.get("ReplayRecorder.Dynamic", "0.0.1");

        const { id } = data;
        if (!dynamics.has(id)) throw new DuplicateDynamic(`Dynamic of id '${id}' does not exist.`);
        dynamics.delete(id);
    });
})("ReplayRecorder.Despawn");

(function(typename: string) {
    ModuleLoader.register(typename, "0.0.1", async (data) => {
        return await ReplayRecorder.Dynamic.parse(data);
    }, (id, data, snapshot, lerp) => {
        const dynamics = snapshot.get("ReplayRecorder.Dynamic", "0.0.1") as Map<number, Dynamic>;

        if (!dynamics.has(id)) throw new DynamicNotFound(`Dynamic of id '${id}' was not found.`);
        ReplayRecorder.Dynamic.lerp(dynamics.get(id)!, data, lerp);
    });
})("ReplayRecorder.Dynamic");