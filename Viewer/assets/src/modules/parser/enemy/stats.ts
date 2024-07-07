import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { ByteStream } from "@esm/@root/replay/stream.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Enemy.Stats": {
                parse: Omit<EnemyStats, "id">;
                spawn: Omit<EnemyStats, "id">;
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Enemy.Stats": Map<number, EnemyStats>;
        }
    }
}

export interface EnemyStats {
    id: number;
    tagged: boolean;
}

const parse = async (data: ByteStream): Promise<Omit<EnemyStats, "id">> => {
    return {
        tagged: await BitHelper.readBool(data),
    };
};

ModuleLoader.registerDynamic("Vanilla.Enemy.Stats", "0.0.1", {
    main: {
        parse, exec: (id, data, snapshot) => {
            const stats = snapshot.getOrDefault("Vanilla.Enemy.Stats", () => new Map());
    
            if (!stats.has(id)) throw new Error(`PlayerStats of id '${id}' was not found.`);
            const enemy = stats.get(id)!;
            enemy.tagged = data.tagged;
        }
    },
    spawn: {
        parse, exec: (id, data, snapshot) => {
            const stats = snapshot.getOrDefault("Vanilla.Enemy.Stats", () => new Map());
        
            if (stats.has(id)) throw new Error(`EnemyStats of id '${id}' already exists.`);
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

            if (!stats.has(id)) throw new Error(`EnemyStats of id '${id}' did not exist.`);
            stats.delete(id);
        }
    }
});