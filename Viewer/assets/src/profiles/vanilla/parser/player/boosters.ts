import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Factory } from "../../library/factory.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Player.Boosters": {
                parse: {
                    conditionsMet: boolean[];
                };
                spawn: {
                    implants: BoosterImplant[]
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Player.Boosters": Map<number, PlayerBoosters>;
        }
    }
}

export interface BoosterImplant {
    id: number;
    effects: { type: number; value: number; }[];
    conditions: number[];
}

export interface PlayerBoosters {
    id: number;
    implants: BoosterImplant[];
    conditionsMet: boolean[];
    deleted: boolean;
}

const parser: ModuleLoader.DynamicModule<"Vanilla.Player.Boosters"> = ModuleLoader.registerDynamic("Vanilla.Player.Boosters", "0.0.1", {
    main: {
        parse: async (data, snapshot, id) => {
            const boosters = snapshot.getOrDefault("Vanilla.Player.Boosters", Factory("Map"));
            if (!boosters.has(id)) throw new Error(`Player boosters of id '${id}' was not found.`);
            const booster = boosters.get(id)!;
            
            const conditionsMet: boolean[] = new Array(booster.implants.length);
            for (let i = 0; i < conditionsMet.length; ++i) {
                conditionsMet[i] = await BitHelper.readBool(data);
            }

            return {
                conditionsMet
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const boosters = snapshot.getOrDefault("Vanilla.Player.Boosters", Factory("Map"));
    
            if (!boosters.has(id)) throw new Error(`Player boosters of id '${id}' was not found.`);
            const booster = boosters.get(id)!;

            booster.conditionsMet = data.conditionsMet;
        }
    },
    spawn: {
        parse: async (data) => {
            const implants: BoosterImplant[] = new Array(await BitHelper.readByte(data));

            for (let i = 0; i < implants.length; ++i) {
                const id = await BitHelper.readUShort(data);
                
                const effects: BoosterImplant["effects"] = new Array(await BitHelper.readByte(data));
                for (let j = 0; j < effects.length; ++j) {
                    effects[j] = {
                        type: await BitHelper.readByte(data),
                        value: await BitHelper.readHalf(data)
                    };
                }

                const conditions: BoosterImplant["conditions"] = new Array(await BitHelper.readByte(data));
                for (let j = 0; j < conditions.length; ++j) {
                    conditions[j] = await BitHelper.readByte(data);
                }

                implants[i] = {
                    id, effects, conditions
                };
            }

            return {
                implants
            };
        },
        exec: (id, data, snapshot) => {
            const boosters = snapshot.getOrDefault("Vanilla.Player.Boosters", Factory("Map"));
        
            if (boosters.get(id)?.deleted === false) throw new Error(`Player boosters of id '${id}' already exists.`);
            const booster = { 
                id, ...data, conditionsMet: new Array(data.implants.length), deleted: false
            };
            for (let i = 0; i < booster.conditionsMet.length; ++i) {
                booster.conditionsMet[i] = false;
            }

            boosters.set(id, booster);
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const boosters = snapshot.getOrDefault("Vanilla.Player.Boosters", Factory("Map"));

            if (!boosters.has(id)) throw new Error(`Player of id '${id}' did not exist.`);
            boosters.get(id)!.deleted = true;
        }
    }
});