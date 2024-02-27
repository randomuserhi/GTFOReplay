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
        return await ReplayRecorder.Dynamic.parse(data);
    }, (id, data, snapshot, lerp) => {
        const dynamics = snapshot.get("Vanilla.Player.Dynamic", "0.0.1") as Map<number, Dynamic>;

        if (!dynamics.has(id)) throw new DynamicNotFound(`Dynamic of id '${id}' was not found.`);
        ReplayRecorder.Dynamic.lerp(dynamics.get(id)!, data, lerp);
    });
})("Vanilla.Player");

((typename: string) => {
    ModuleLoader.register(typename, "0.0.1", async (data) => {
        const spawn = await ReplayRecorder.SpawnAt(data);
        return {
            ...spawn,
            snet: await BitHelper.readULong(data),
            slot: await BitHelper.readByte(data),
            nickname: await BitHelper.readString(data)
        };
    }, (data, snapshot) => {
        const players = snapshot.get("Vanilla.Player", "0.0.1");
        const dynamics = snapshot.get("Vanilla.Player.Dynamic", "0.0.1") as Map<number, Dynamic>;

        const { snet, id } = data;

        if (players.has(snet)) throw new DuplicatePlayer(`Player of snet '${snet}' already exists.`);
        players.set(snet, data);

        if (dynamics.has(id)) throw new DuplicateDynamic(`Player.Dynamic of id '${id}' already exists.`);
        dynamics.set(id, ReplayRecorder.Dynamic.create(data));
    });
})("Vanilla.Player.Spawn");

((typename: string) => {
    ModuleLoader.register(typename, "0.0.1", async (data) => {
        const despawn = await ReplayRecorder.Despawn(data);
        return {
            ...despawn,
            snet: await BitHelper.readULong(data),
        };
    }, (data, snapshot) => {
        const players = snapshot.get("Vanilla.Player", "0.0.1");
        const dynamics = snapshot.get("Vanilla.Player.Dynamic", "0.0.1") as Map<number, Dynamic>;

        const { snet, id } = data;

        if (!players.has(snet)) throw new PlayerNotFound(`Player of snet '${snet}' did not exist.`);
        players.delete(snet);

        if (!dynamics.has(id)) throw new DynamicNotFound(`Player.Dynamic of id '${id}' did not exist.`);
        dynamics.delete(id);
    });
})("Vanilla.Player.Despawn");