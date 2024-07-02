import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { ByteStream } from "@esm/@root/replay/stream.js";
import { Id } from "../replayrecorder.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Enemy.Stats": {
                parse: EnemyStats;
                spawn: EnemyStats;
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Enemy.Stats": Map<number, Id<EnemyStats>>;
        }
    }
}

export interface EnemyStats {
    tagged: boolean;
}

const parse = async (data: ByteStream): Promise<EnemyStats> => {
    return {
        tagged: await BitHelper.readBool(data),
    };
};

ModuleLoader.registerDynamic("Vanilla.Enemy.Stats", "0.0.1", {
    main: {
        parse, exec: (id, data, snapshot) => {
            const stats = snapshot.getOrDefault("Vanilla.Enemy.Stats", () => new Map());
    
            if (!stats.has(id)) throw new EnemyStatsNotFound(`PlayerStats of id '${id}' was not found.`);
            const enemy = stats.get(id)!;
            enemy.tagged = data.tagged;
        }
    },
    spawn: {
        parse, exec: (id, data, snapshot) => {
            const stats = snapshot.getOrDefault("Vanilla.Enemy.Stats", () => new Map());
        
            if (stats.has(id)) throw new DuplicateEnemyStats(`EnemyStats of id '${id}' already exists.`);
            stats.set(id, { 
                id, ...data
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const stats = snapshot.getOrDefault("Vanilla.Enemy.Stats", () => new Map());

            if (!stats.has(id)) throw new EnemyStatsNotFound(`EnemyStats of id '${id}' did not exist.`);
            stats.delete(id);
        }
    }
});

export class EnemyStatsNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicateEnemyStats extends Error {
    constructor(message?: string) {
        super(message);
    }
}