import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Factory } from "../../library/factory.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.WardenEvents.Survival": {
                parse: {
                    state: State;
                    timeLeft: number;
                };
                spawn: {
                    survivalText: string;
                    toActivateText: string;
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.WardenEvents.Survival": Map<number, SurvivalEvent>;
        }
    }
}

const states = [
    "Inactive",
    "TimeToActivate",
    "Survival",
    "Completed"
] as const;
type State = typeof states[number];

export interface SurvivalEvent {
    survivalText: string;
    toActivateText: string;
    state: State;
    timeLeft: number;
}

ModuleLoader.registerDynamic("Vanilla.WardenEvents.Survival", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                state: states[await BitHelper.readByte(data)],
                timeLeft: await BitHelper.readHalf(data)
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const events = snapshot.getOrDefault("Vanilla.WardenEvents.Survival", Factory("Map"));
    
            if (!events.has(id)) throw new Error(`WardenEvents.Survival of id '${id}' does not exist.`);
            const event = events.get(id)!;

            event.state = data.state;
            event.timeLeft = event.timeLeft + (data.timeLeft - event.timeLeft) * lerp;
        }
    },
    spawn: {
        parse: async (data) => {
            return {
                survivalText: (await BitHelper.readString(data)).replace(/<\/?[^>]+(>|$)/g, ""),
                toActivateText: (await BitHelper.readString(data)).replace(/<\/?[^>]+(>|$)/g, "")
            };
        },
        exec: (id, data, snapshot) => {
            const events = snapshot.getOrDefault("Vanilla.WardenEvents.Survival", Factory("Map"));
        
            if (events.has(id)) throw new Error(`WardenEvents.Survival of id '${id}' already exists.`);
            const event: SurvivalEvent = { 
                ...data,
                state: "Inactive",
                timeLeft: 0
            };

            events.set(id, event);
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const events = snapshot.getOrDefault("Vanilla.WardenEvents.Survival", Factory("Map"));

            if (!events.has(id)) throw new Error(`WardenEvents.Survival of id '${id}' did not exist.`);
            events.delete(id);
        }
    }
});