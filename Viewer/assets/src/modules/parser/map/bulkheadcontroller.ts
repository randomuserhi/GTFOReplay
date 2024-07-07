import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Factory } from "../../library/factory.js";

export const layers = [
    "MainLayer",
    "SecondaryLayer",
    "ThirdLayer"
] as const;

export interface BulkheadController {
    id: number;
    dimension: number;
    position: Pod.Vector;
    rotation: Pod.Quaternion;
    connectedDoors: (number | undefined)[];
    serialNumber: number;
}

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Map.BulkheadControllers": Map<number, BulkheadController>;
        }
    }
}

ModuleLoader.registerHeader("Vanilla.Map.BulkheadControllers", "0.0.1", {
    parse: async (data, header) => {
        const controllers = header.getOrDefault("Vanilla.Map.BulkheadControllers", Factory("Map"));
        const count = await BitHelper.readUShort(data);
        for (let i = 0; i < count; ++i) {
            const id = await BitHelper.readInt(data);
            const dimension = await BitHelper.readByte(data);
            const position = await BitHelper.readVector(data);
            const rotation = await BitHelper.readHalfQuaternion(data);
            const serialNumber = await BitHelper.readUShort(data);

            const connectedDoors: (number | undefined)[] = [];
            for (let j = 0; j < layers.length; ++j) {
                const connected = await BitHelper.readBool(data);
                if (connected) {
                    connectedDoors[j] = await BitHelper.readInt(data);
                } else {
                    connectedDoors[j] = undefined;
                }
            }

            controllers.set(id, {
                id,
                dimension,
                position,
                rotation,
                connectedDoors,
                serialNumber
            });
        }
    }
});