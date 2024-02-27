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

(function(typename: string) {
    ModuleLoader.register(typename, "0.0.1", async (data) => {
        return {
            id: await BitHelper.readInt(data)
        };
    }, (data, snapshot) => {
        const dynamics = snapshot.get("ReplayRecorder.Dynamic", "0.0.1");

        const { id } = data;
        if (dynamics.has(id)) throw new DuplicateDynamic(`Dynamic of id '${id}' already exists.`);
        dynamics.set(id, {
            id,
            position: Vec.zero(),
            rotation: Quat.identity(),
            dimension: 0
        });
    });
})("ReplayRecorder.Spawn.Dynamic");

(function(typename: string) {
    ModuleLoader.register(typename, "0.0.1", async (data) => {
        return {
            id: await BitHelper.readInt(data),
            position: await BitHelper.readVector(data),
            rotation: await BitHelper.readHalfQuaternion(data),
            dimension: await BitHelper.readByte(data)
        };
    }, (data, snapshot) => {
        const dynamics = snapshot.get("ReplayRecorder.Dynamic", "0.0.1");

        const { id } = data;
        if (dynamics.has(id)) throw new DuplicateDynamic(`Dynamic of id '${id}' already exists.`);
        dynamics.set(id, data);
    });
})("ReplayRecorder.Spawn.DynamicAt");

(function(typename: string) {
    ModuleLoader.register(typename, "0.0.1", async (data) => {
        return {
            id: await BitHelper.readInt(data)
        };
    }, (data, snapshot) => {
        const dynamics = snapshot.get("ReplayRecorder.Dynamic", "0.0.1");

        const { id } = data;
        if (!dynamics.has(id)) throw new DuplicateDynamic(`Dynamic of id '${id}' does not exist.`);
        dynamics.delete(id);
    });
})("ReplayRecorder.Despawn.Dynamic");

namespace ReplayRecorder {
    export namespace Dynamic {
        export async function parse(data: ByteStream): Promise<any> {
            const id = await BitHelper.readInt(data);
            const absolute = await BitHelper.readByte(data) != 0;
            return {
                id, absolute,
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
        return ReplayRecorder.Dynamic.parse(data);
    }, (data, snapshot, lerp) => {
        const dynamics = snapshot.get("ReplayRecorder.Dynamic", "0.0.1") as Map<number, Dynamic>;

        const { id } = data;
        if (!dynamics.has(id)) throw new DynamicNotFound(`Dynamic of id '${id}' was not found.`);
        ReplayRecorder.Dynamic.lerp(dynamics.get(id)!, data, lerp);
    });
})("ReplayRecorder.Dynamic");