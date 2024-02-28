/* exported Typemap */
declare namespace Typemap {
    interface Dynamics {
        "Vanilla.Player": {
            parse: {
                dimension: number;
                absolute: boolean;
                position: Vector;
                rotation: Quaternion;
            };
            spawn: {
                dimension: number;
                position: Vector;
                rotation: Quaternion;
                snet: bigint;
                slot: number;
                nickname: string;
            };
            despawn: void;
        };
    }

    interface Buffers {
        "Vanilla.Player": Vanilla.Player
    }
}

declare namespace Vanilla {
    interface Player extends ReplayRecorder.Dynamic {
        snet: bigint;
        slot: number;
        nickname: string;
    }
}

ModuleLoader.registerDynamic("Vanilla.Player", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await ReplayRecorder.Dynamic.parseTransform(data);
            return result;
        }, 
        exec: (id, data, snapshot, lerp) => {
            const players = snapshot.buffer("Vanilla.Player");
    
            if (!players.has(id)) throw new DynamicNotFound(`Dynamic of id '${id}' was not found.`);
            ReplayRecorder.Dynamic.lerp(players.get(id)!, data, lerp);
        }
    },
    spawn: {
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
            const players = snapshot.buffer("Vanilla.Player");
        
            const { snet } = data;
        
            if (players.has(id)) throw new DuplicatePlayer(`Player of snet '${snet}' already exists.`);
            players.set(id, { id, ...data });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const players = snapshot.buffer("Vanilla.Player");

            if (!players.has(id)) throw new DynamicNotFound(`Player.Dynamic of id '${id}' did not exist.`);
            players.delete(id);
        }
    }
});

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