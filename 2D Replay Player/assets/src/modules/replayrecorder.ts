(function(typename: string) {
    ModuleLoader.register(typename, "0.0.1", async (data, header: Replay.Header) => {
        header.version = await BitHelper.readString(data);
        header.isMaster = await BitHelper.readByte(data) == 1;
    });
})("ReplayRecorder.Header");

/* exported Replay */
declare namespace Replay {
    interface Snapshot {
        dynamics: Map<number, Dynamic>;
    }
}

interface Dynamic {
    id: number;
    position: Vector;
    rotation: Quaternion;
}

/* exported DynamicNotFound */
class DynamicNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

(function(typename: string) {
    ModuleLoader.register(typename, "0.0.1", async (data) => {
        const id = await BitHelper.readInt(data);
        const absolute = await BitHelper.readByte(data) != 0;
        return {
            id, absolute,
            position: absolute ? await BitHelper.readVector(data) : await BitHelper.readHalfVector(data),
            rotation: await BitHelper.readHalfQuaternion(data)
        };
    }, (data, snapshot, lerp) => {
        if (snapshot.dynamics === undefined) {
            snapshot.dynamics = new Map();
        }

        const { id, absolute, position, rotation } = data;
        if (!snapshot.dynamics.has(id)) throw new DynamicNotFound(`Dynamic of id '${id}' was not found.`);
        const dyn = snapshot.dynamics.get(id)!;
        const fpos = absolute ? position : Vec.add(dyn.position, position);
        dyn.position = Vec.lerp(dyn.position, fpos, lerp);
        dyn.rotation = Quat.slerp(dyn.rotation, rotation, lerp);
    });
})("ReplayRecorder.Dynamic");