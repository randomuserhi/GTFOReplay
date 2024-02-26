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

(function(typename: string) {
    ModuleLoader.register(typename, "0.0.1", async (data) => {
        return ModuleLoader.getParseFunc({ 
            typename: "ReplayRecorder.Dynamic", 
            version: "0.0.1" 
        })(data);
    }, (data, snapshot, lerp) => {
        return ModuleLoader.getExecFunc({ 
            typename: "ReplayRecorder.Dynamic", 
            version: "0.0.1" 
        })(data, snapshot, lerp);
    });
})("Vanilla.Player");

((typename: string) => {
    ModuleLoader.register(typename, "0.0.1", async (data) => {
        return {
            snet: await BitHelper.readULong(data),
            dyn: await BitHelper.readUShort(data),
            slot: await BitHelper.readByte(data),
            nickname: await BitHelper.readString(data)
        };
    }, (data, snapshot) => {
        const players = snapshot.get("Vanilla.Player", "0.0.1");

        const { snet } = data;
        if (players.has(snet)) throw new DuplicatePlayer(`Player of snet '${snet}' already exists.`);
        players.set(snet, data);
    });
})("Vanilla.Player.Spawn");

((typename: string) => {
    ModuleLoader.register(typename, "0.0.1", async (data) => {
        return {
            snet: await BitHelper.readULong(data),
        };
    }, (data, snapshot) => {
        const players = snapshot.get("Vanilla.Player", "0.0.1");

        const { snet } = data;
        if (!players.has(snet)) throw new PlayerNotFound(`Player of snet '${snet}' did not exist.`);
        players.delete(snet);
    });
})("Vanilla.Player.Despawn");