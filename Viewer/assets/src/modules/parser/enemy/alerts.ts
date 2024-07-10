import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "Vanilla.Enemy.Alert": {
                enemy: number;
                slot: number;
            };
        }

        interface Data {
            "Vanilla.Enemy.Alert": EnemyAlert[];
        }
    }
}

export interface EnemyAlert {
    enemy: number;
    player?: number;
    time: number;
}

ModuleLoader.registerEvent("Vanilla.Enemy.Alert", "0.0.1", {
    parse: async (bytes) => {
        return {
            enemy: await BitHelper.readInt(bytes),
            slot: await BitHelper.readByte(bytes)
        };
    },
    exec: async (data, snapshot) => {
        const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
        const { enemy, slot } = data;
        let player: number | undefined = undefined;
        for (const p of players.values()) {
            if (p.slot === slot) {
                player = p.id;
                break;
            }
        }
        const alerts = snapshot.getOrDefault("Vanilla.Enemy.Alert", () => []);
        alerts.push({ time: snapshot.time(), enemy, player });
    }
});

const duration = 1500;
ModuleLoader.registerTick((snapshot) => {
    const t = snapshot.time();
    const alerts = snapshot.getOrDefault("Vanilla.Enemy.Alert", () => []);
    snapshot.set("Vanilla.Enemy.Alert", alerts.filter((a) => (t - a.time) < duration));
});