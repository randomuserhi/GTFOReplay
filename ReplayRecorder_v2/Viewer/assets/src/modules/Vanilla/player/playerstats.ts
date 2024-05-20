import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import { ByteStream } from "../../../replay/stream.js";
import { Id } from "../../replayrecorder.js";
import { StatTracker, getPlayerStats } from "../stattracker/stats.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Player.Stats": {
                parse: PlayerStats;
                spawn: PlayerStats;
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Player.Stats": Map<number, Id<PlayerStats>>;
        }
    }
}

export interface PlayerStats {
    health: number;
    infection: number;
    
    primaryAmmo: number;
    secondaryAmmo: number;
    toolAmmo: number;
    consumableAmmo: number;
    resourceAmmo: number;
}

const parse = async (data: ByteStream): Promise<PlayerStats> => {
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

ModuleLoader.registerDynamic("Vanilla.Player.Stats", "0.0.1", {
    main: {
        parse, exec: (id, data, snapshot) => {
            const stats = snapshot.getOrDefault("Vanilla.Player.Stats", () => new Map());
            
            if (!stats.has(id)) throw new PlayerStatsNotFound(`PlayerStats of id '${id}' was not found.`);
            const status = stats.get(id)!;
            status.health = data.health;
            status.infection = data.infection;
            status.primaryAmmo = data.primaryAmmo;
            status.secondaryAmmo = data.secondaryAmmo;
            status.toolAmmo = data.toolAmmo;
            status.consumableAmmo = data.consumableAmmo;
            status.resourceAmmo = data.resourceAmmo;

            const time = snapshot.time();
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
            if (players.has(id)) {
                const player = players.get(id)!;
                const statTracker = snapshot.getOrDefault("Vanilla.StatTracker", StatTracker);

                const playerStats = getPlayerStats(player.snet, statTracker);
                if (playerStats._downedTimeStamp === undefined && status.health <= 0) {
                    playerStats._downedTimeStamp = time;
                } else if (playerStats._downedTimeStamp !== undefined && status.health > 0) {
                    playerStats.timeSpentDowned += time - playerStats._downedTimeStamp;
                    playerStats._downedTimeStamp = undefined;
                }
            }
        }
    },
    spawn: {
        parse, exec: (id, data, snapshot) => {
            const stats = snapshot.getOrDefault("Vanilla.Player.Stats", () => new Map());

            if (stats.has(id)) throw new DuplicatePlayerStats(`PlayerStats of id '${id}' already exists.`);
            stats.set(id, { 
                id, ...data
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const stats = snapshot.getOrDefault("Vanilla.Player.Stats", () => new Map());

            if (!stats.has(id)) throw new PlayerStatsNotFound(`PlayerStats of id '${id}' did not exist.`);
            stats.delete(id);
        }
    }
});

export class PlayerStatsNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicatePlayerStats extends Error {
    constructor(message?: string) {
        super(message);
    }
}