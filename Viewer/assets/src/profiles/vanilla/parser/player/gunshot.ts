import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Factory } from "../../library/factory.js";
import { StatTracker } from "../stattracker/stattracker.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Events {
            "Vanilla.Player.Gunshots": {
                owner: number;
                dimension: number;
                damage: number;
                start: Pod.Vector;
                end: Pod.Vector;
                sentry: boolean;
                silent: boolean;
            };
        }
    
        interface Data {
            "Vanilla.Player.Gunshots": Gunshot[]
        }
    }
}

export interface Gunshot {
    owner: number;
    dimension: number;
    damage: number;
    start: Pod.Vector;
    end: Pod.Vector;
    sentry: boolean;
    time: number;
    silent: boolean;
}

let parser = ModuleLoader.registerEvent("Vanilla.Player.Gunshots", "0.0.1", {
    parse: async (bytes) => {
        return {
            owner: await BitHelper.readInt(bytes),
            dimension: await BitHelper.readByte(bytes),
            damage: await BitHelper.readHalf(bytes),
            sentry: await BitHelper.readBool(bytes),
            start: await BitHelper.readVector(bytes),
            end: await BitHelper.readVector(bytes),
            silent: false,
        };
    },
    exec: async (data, snapshot) => {
        const time = snapshot.time();

        const gunshots = snapshot.getOrDefault("Vanilla.Player.Gunshots", Factory("Array"));
        gunshots.push({ time, ...data });

        const anims = snapshot.getOrDefault("Vanilla.Player.Animation", Factory("Map"));
        if (anims.has(data.owner) && data.sentry === false) { 
            anims.get(data.owner)!.lastShot = time;
        }

        // Count silent shots
        // - To handle shotguns / penetration, check when the last silent shot was received
        //   If it was recieved less than 10ms ago, then it dont count it as its probably
        //   penetration or a shotgun
        if (data.silent === true) {
            const statTracker = StatTracker.from(snapshot);
            const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
            const player = players.get(data.owner);
            if (player !== undefined && time > player.lastSilentShotTime + 10) {
                const stats = StatTracker.getPlayer(player.snet, statTracker);
                stats.silentShots += 1;
                player.lastSilentShotTime = time;
            }
        }
    }
});
parser = ModuleLoader.registerEvent("Vanilla.Player.Gunshots", "0.0.2", {
    ...parser,
    parse: async (bytes) => {
        return {
            owner: await BitHelper.readInt(bytes),
            dimension: await BitHelper.readByte(bytes),
            damage: await BitHelper.readHalf(bytes),
            sentry: await BitHelper.readBool(bytes),
            start: await BitHelper.readVector(bytes),
            end: await BitHelper.readVector(bytes),
            silent: await BitHelper.readBool(bytes)
        };
    }
});

export const duration = 200;
ModuleLoader.registerTick((snapshot) => {
    const t = snapshot.time();
    const gunshots = snapshot.getOrDefault("Vanilla.Player.Gunshots", Factory("Array"));
    snapshot.set("Vanilla.Player.Gunshots", gunshots.filter((p) => (t - p.time) < duration));
});