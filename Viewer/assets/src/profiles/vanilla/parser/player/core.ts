import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Factory } from "../../library/factory.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "ReplayRecorder.Player": {
                parse: {
                    hasReplayMod: boolean,
                    isMaster: boolean
                };
                spawn: {
                    snet: bigint;
                    nickname: string;
                };
                despawn: void;
            };
        }

        interface Data {
            "ReplayRecorder.Player": Map<number, rPlayer>;
        }
    }
}

export interface rPlayer {
    id: number;
    snet: bigint;
    nickname: string;
    hasReplayMod: boolean;
    isMaster: boolean;
}

ModuleLoader.registerDynamic("ReplayRecorder.Player", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                hasReplayMod: await BitHelper.readBool(data),
                isMaster: await BitHelper.readBool(data)
            };
        }, 
        exec: (id, data, snapshot) => {
            const players = snapshot.getOrDefault("ReplayRecorder.Player", Factory("Map"));
    
            if (!players.has(id)) throw new Error(`rPlayer of id '${id}' was not found.`);
            const player = players.get(id)!;
            player.hasReplayMod = data.hasReplayMod;
            player.isMaster = data.isMaster;
        }
    },
    spawn: {
        parse: async (data) => {
            const result = {
                snet: await BitHelper.readULong(data),
                nickname: (await BitHelper.readString(data)).replace(/<\/?[^>]+(>|$)/g, "")
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const players = snapshot.getOrDefault("ReplayRecorder.Player", Factory("Map"));
        
            if (players.has(id)) throw new Error(`rPlayer of id '${id}(${data.snet})' already exists.`);
            const player = { 
                id, ...data,
                hasReplayMod: false,
                isMaster: false
            };

            players.set(id, player);
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const players = snapshot.getOrDefault("ReplayRecorder.Player", Factory("Map"));

            if (!players.has(id)) throw new Error(`rPlayer of id '${id}' did not exist.`);
            players.delete(id);
        }
    }
});