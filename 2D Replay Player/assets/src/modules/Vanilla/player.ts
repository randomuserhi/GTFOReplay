/* exported Player */
interface Player {
    snet: bigint;
    dyn: number;
    nickname: string;
    slot: number;
}

/* exported PlayerNotFound */
class PlayerNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

/* exported DuplicatePlayer */
class DuplicatePlayer extends Error {
    constructor(message?: string) {
        super(message);
    }
}

// Example event
/*(function() {
    const typename = "TestEvent";
    ModuleLoader.register(typename, "0.0.1", {
        parse: async (data) => {
            return await BitHelper.readString(data);
        }, 
        exec: (data, snapshot) => {
            const block = snapshot.data("TestEvent", "0.0.1") as any;
            if (block.count === undefined) block.count = 0;
            block.count += 1;
            block.text = data;
        }
    });
})();*/

/* exported ReplayRecorder */
declare namespace ReplayRecorder {
    interface Events {
        "TestEvent": string
    }

    interface Dynamics {
        "Vanilla.Player": {
            dimension: number;
            absolute: boolean;
            position: Vector;
            rotation: Quaternion;
        };
    }

    interface Spawn {
        "Vanilla.Player": {
            dimension: number;
            position: Vector;
            rotation: Quaternion;
            snet: bigint;
            slot: number;
            nickname: string;
        };
    }

    interface Despawn {
        "Vanilla.Player": {
            snet: bigint;
        };
    }
}

(function() {
    const typename = "Vanilla.Player";
    ModuleLoader.register(typename, "0.0.1", {
        parse: async (data) => {
            const result = await ReplayRecorder.Dynamic.parseTransform(data);
            return result;
        }, 
        exec: (id, data, snapshot, lerp) => {
            const dynamics = snapshot.buffer("Vanilla.Player.Dynamic", "0.0.1") as Map<number, Dynamic>;

            if (!dynamics.has(id)) throw new DynamicNotFound(`Dynamic of id '${id}' was not found.`);
            ReplayRecorder.Dynamic.lerp(dynamics.get(id)!, data, lerp);
        }
    }, {
        parse: async (data) => {
            return {
                dimension: await BitHelper.readByte(data),
                position: await BitHelper.readVector(data),
                rotation: await BitHelper.readHalfQuaternion(data),
                snet: await BitHelper.readULong(data),
                slot: await BitHelper.readByte(data),
                nickname: await BitHelper.readString(data)
            };
        },
        exec: (id, data, snapshot) => {
            const players = snapshot.buffer("Vanilla.Player", "0.0.1");
            const dynamics = snapshot.buffer("Vanilla.Player.Dynamic", "0.0.1") as Map<number, Dynamic>;
    
            const { snet } = data;
    
            if (players.has(snet)) throw new DuplicatePlayer(`Player of snet '${snet}' already exists.`);
            players.set(snet, data);
    
            if (dynamics.has(id)) throw new DuplicateDynamic(`Player.Dynamic of id '${id}' already exists.`);
            dynamics.set(id, ReplayRecorder.Dynamic.create(data));
        }
    }, {
        parse: async (data) => {
            return {
                snet: await BitHelper.readULong(data),
            };
        }, 
        exec: (id, data, snapshot) => {
            const players = snapshot.buffer("Vanilla.Player", "0.0.1");
            const dynamics = snapshot.buffer("Vanilla.Player.Dynamic", "0.0.1") as Map<number, Dynamic>;
    
            const { snet } = data;
    
            if (!players.has(snet)) throw new PlayerNotFound(`Player of snet '${snet}' did not exist.`);
            players.delete(snet);
    
            if (!dynamics.has(id)) throw new DynamicNotFound(`Player.Dynamic of id '${id}' did not exist.`);
            dynamics.delete(id);
        }
    });
})();