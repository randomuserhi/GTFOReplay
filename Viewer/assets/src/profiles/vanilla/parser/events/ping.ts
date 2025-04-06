import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Factory } from "../../library/factory.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Pings": {
                parse: {
                    dimension: number;
                    position: Pod.Vector;
                    style: PingStyle;
                    visible: boolean;
                };
                spawn: Ping;
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Pings": Map<number, Ping>
        }
    }
}

const pingStyles = [
    "LocationBeacon",
    "PlayerPingLookat",
    "PlayerPingEnemy",
    "PlayerPingAmmo",
    "PlayerPingHealth",
    "PlayerPingLoot",
    "PlayerPingTerminal",
    "PlayerPingCaution",
    "PlayerPingHSU",
    "PlayerPingDoor",
    "PlayerPingResourceLocker",
    "PlayerPingResourceBox",
    "PlayerInCompass",
    "PlayerPingSign",
    "LocationBeaconNoText",
    "TerminalPing",
    "PlayerPingGenerator",
    "PlayerPingDisinfection",
    "PlayerPingCarryItem",
    "PlayerPingConsumable",
    "PlayerPingPickupObjectiveItem",
    "PlayerPingToolRefill",
    "PlayerPingSecurityDoor",
    "PlayerPingBulkheadDoor",
    "PlayerPingApexDoor",
    "PlayerPingBloodDoor",
    "PlayerPingSecurityCheckpointDoor",
    "PlayerPingBulkheadCheckpointDoor",
    "PlayerPingApexCheckpointDoor",
    "PlayerPingBloodCheckpointDoor",
    "PlayerPingBulkheadDC"
] as const;
export type PingStyle = typeof pingStyles[number];

export interface Ping {
    slot: number;
    dimension: number;
    position: Pod.Vector;
    style: PingStyle;
    visible: boolean;
}

ModuleLoader.registerDynamic("Vanilla.Pings", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                dimension: await BitHelper.readByte(data),
                position: await BitHelper.readVector(data),
                visible: await BitHelper.readBool(data),
                style: pingStyles[await BitHelper.readByte(data)],
            };
        }, 
        exec: (id, data, snapshot) => {
            const pings = snapshot.getOrDefault("Vanilla.Pings", Factory("Map"));
    
            if (!pings.has(id)) throw new Error(`Ping of id '${id}' was not found.`);
            const ping = pings.get(id)!;

            ping.dimension = data.dimension;
            ping.position = data.position;
            ping.visible = data.visible;
            ping.style = data.style;
        }
    },
    spawn: {
        parse: async (data) => {
            return {
                slot: await BitHelper.readByte(data),
                dimension: await BitHelper.readByte(data),
                position: await BitHelper.readVector(data),
                visible: await BitHelper.readBool(data),
                style: pingStyles[await BitHelper.readByte(data)],
            };
        },
        exec: (id, data, snapshot) => {
            const pings = snapshot.getOrDefault("Vanilla.Pings", Factory("Map"));
        
            if (pings.has(id)) throw new Error(`Ping of id '${id}' already exists.`);
            pings.set(id, { ...data });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const pings = snapshot.getOrDefault("Vanilla.Pings", Factory("Map"));

            if (!pings.has(id)) throw new Error(`Ping of id '${id}' did not exist.`);
            pings.delete(id);
        }
    }
});