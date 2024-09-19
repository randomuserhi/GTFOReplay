import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Factory } from "../../library/factory.js";
import { Identifier } from "../identifier.js";
import { layers, ObjectiveLayer } from "../map/bulkheadcontroller.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Objectives.Reactor":  {
                parse: {
                    status: ReactorStatus;
                    wave: number;
                    waveDuration: number;
                    waveProgress: number;
                };
                spawn: {
                    serialNumber: number;
                    layer: ObjectiveLayer;
                    masterTerminal: number;
                    numWaves: number;
                    codes: string[];
                    codeTerminalSerial: number[]; // 65535 - ushort.MaxValue indicates no terminal is required for the code
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Objectives.Reactor": Map<number, Reactor>
        }
    }
}

export const reactorStatus = [
    "Inactive_idle",
    "Active_idle",
    "Startup_intro",
    "Startup_intense",
    "Startup_waitForVerify",
    "Startup_complete",
    "Shutdown_intro",
    "Shutdown_waitForVerify",
    "Shutdown_puzzleChaos",
    "Shutdown_complete"
] as const;
export type ReactorStatus = typeof reactorStatus[number]; 

export interface Reactor {
    serialNumber: number;
    layer: ObjectiveLayer;
    masterTerminal: number;
    numWaves: number;
    codes: string[];
    codeTerminalSerial: number[];

    status: ReactorStatus;
    wave: number;
    waveDuration: number;
    waveProgress: number;
}

ModuleLoader.registerDynamic("Vanilla.Objectives.Reactor", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                status: reactorStatus[await BitHelper.readByte(data)],
                wave: await BitHelper.readByte(data),
                waveDuration: await BitHelper.readHalf(data),
                waveProgress: await BitHelper.readByte(data) / 255
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const reactors = snapshot.getOrDefault("Vanilla.Objectives.Reactor", Factory("Map"));

            if (!reactors.has(id)) throw new Error(`Reactor of id '${id}' does not exists.`);
            const reactor = reactors.get(id)!;
            reactor.status = data.status;
            reactor.wave = data.wave;
            reactor.waveDuration = data.waveDuration;
            reactor.waveProgress = reactor.waveProgress + (data.waveProgress - reactor.waveProgress) * lerp;
        }
    },
    spawn: {
        parse: async (data) => {
            const result = {
                serialNumber: await BitHelper.readUShort(data),
                layer: layers[await BitHelper.readByte(data)],
                masterTerminal: await BitHelper.readInt(data),
                numWaves: await BitHelper.readByte(data),
                codes: [] as string[],
                codeTerminalSerial: [] as number[]
            };
            for (let i = 0; i < result.numWaves; ++i) {
                result.codeTerminalSerial.push(await BitHelper.readUShort(data));
                result.codes.push(await BitHelper.readString(data));
            }
            return result;
        },
        exec: (id, data, snapshot) => {
            const reactors = snapshot.getOrDefault("Vanilla.Objectives.Reactor", Factory("Map"));

            if (reactors.has(id)) throw new Error(`Reactor of id '${id}' already exists.`);
            reactors.set(id, {
                ...data,
                status: "Inactive_idle",
                wave: 0,
                waveDuration: 0,
                waveProgress: 0
            });

            // Find terminal and spawn an item to generate an item finder entry 
            const terminals = snapshot.header.getOrDefault("Vanilla.Map.Terminals", Factory("Map"));
            if (!terminals.has(data.masterTerminal)) throw new Error(`Could not find reactor's master terminal '${data.masterTerminal}'.`);
            const terminal = terminals.get(data.masterTerminal)!;

            const items = snapshot.getOrDefault("Vanilla.Map.Items", Factory("Map"));
            items.set(id, { 
                id,
                dimension: terminal.dimension,
                position: terminal.position,
                rotation: terminal.rotation,
                onGround: true,
                linkedToMachine: false,
                serialNumber: data.serialNumber, // 65535 (ushort.MaxValue) indicates item has no serial number
                itemID: Identifier.create("Internal_Finder_Item", undefined, "REACTOR"),
                player: undefined,
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const reactors = snapshot.getOrDefault("Vanilla.Objectives.Reactor", Factory("Map"));

            if (!reactors.has(id)) throw new Error(`Reactor of id '${id}' did not exist.`);
            reactors.delete(id);
        }
    }
});