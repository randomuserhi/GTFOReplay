import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader, ReplayApi } from "@esm/@root/replay/moduleloader.js";
import { ByteStream } from "@esm/@root/replay/stream.js";
import { Factory } from "../../library/factory.js";
import { StatTracker } from "../stattracker/stattracker.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Player.Stats": {
                parse: Omit<PlayerStats, "id">;
                spawn: Omit<PlayerStats, "id">;
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Player.Stats": Map<number, PlayerStats>;
        }
    }
}

export interface PlayerStats {
    id: number;
    health: number;
    infection: number;
    
    primaryAmmo: number;
    secondaryAmmo: number;
    toolAmmo: number;
    consumableAmmo: number;
    resourceAmmo: number;
}

const parse = async (data: ByteStream): Promise<Omit<PlayerStats, "id">> => {
    return {
        health: await BitHelper.readByte(data) / 255,
        infection: await BitHelper.readByte(data) / 255,

        primaryAmmo: await BitHelper.readByte(data) / 255,
        secondaryAmmo: await BitHelper.readByte(data) / 255,
        toolAmmo: await BitHelper.readByte(data) / 255,
        consumableAmmo: await BitHelper.readByte(data) / 255,
        resourceAmmo: await BitHelper.readByte(data) / 255,
    };
};

const updateStats = (status: PlayerStats, snapshot: ReplayApi) => {
    const { id } = status;
    const time = snapshot.time();
    const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
    if (players.has(id)) {
        const player = players.get(id)!;
        const statTracker = StatTracker.from(snapshot);

        const playerStats = StatTracker.getPlayer(player.snet, statTracker);
        if (playerStats._downedTimeStamp === undefined && status.health <= 0) {
            playerStats._downedTimeStamp = time;
        } else if (playerStats._downedTimeStamp !== undefined && status.health > 0) {
            playerStats.timeSpentDowned += time - playerStats._downedTimeStamp;
            playerStats._downedTimeStamp = undefined;
        }
    }
};

ModuleLoader.registerDynamic("Vanilla.Player.Stats", "0.0.1", {
    main: {
        parse, exec: (id, data, snapshot) => {
            const stats = snapshot.getOrDefault("Vanilla.Player.Stats", Factory("Map"));
            
            if (!stats.has(id)) throw new Error(`PlayerStats of id '${id}' was not found.`);
            const status = stats.get(id)!;
            status.health = data.health;
            status.infection = data.infection;
            status.primaryAmmo = data.primaryAmmo;
            status.secondaryAmmo = data.secondaryAmmo;
            status.toolAmmo = data.toolAmmo;
            status.consumableAmmo = data.consumableAmmo;
            status.resourceAmmo = data.resourceAmmo;

            updateStats(status, snapshot);            
        }
    },
    spawn: {
        parse, exec: (id, data, snapshot) => {
            const stats = snapshot.getOrDefault("Vanilla.Player.Stats", Factory("Map"));

            if (stats.has(id)) throw new Error(`PlayerStats of id '${id}' already exists.`);
            const status = { 
                id, ...data
            };
            stats.set(id, status);

            updateStats(status, snapshot);
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const stats = snapshot.getOrDefault("Vanilla.Player.Stats", Factory("Map"));

            if (!stats.has(id)) throw new Error(`PlayerStats of id '${id}' did not exist.`);
            stats.delete(id);
        }
    }
});