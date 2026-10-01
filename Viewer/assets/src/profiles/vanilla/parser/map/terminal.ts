import { readScale } from "./transform.js";
import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Factory } from "../../library/factory.js";
import { Identifier } from "../identifier.js";

ModuleLoader.registerASLModule(module.src);

export interface Terminal {
    id: number;
    dimension: number;
    position: Pod.Vector;
    rotation: Pod.Quaternion;
    scale: Pod.Vector;
    modelName: string;
    serialNumber: number;
}

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Map.Terminals": Map<number, Terminal>;
        }
    }
}

ModuleLoader.registerHeader("Vanilla.Map.Terminals", "0.0.3", {
    parse: async (data, header, snapshot) => {
        const terminals = header.getOrDefault("Vanilla.Map.Terminals", Factory("Map"));
        const count = await BitHelper.readUShort(data);
        for (let i = 0; i < count; ++i) {
            const id = await BitHelper.readInt(data);
            const terminal = {
                id,
                dimension: await BitHelper.readByte(data),
                position: await BitHelper.readVector(data),
                rotation: await BitHelper.readHalfQuaternion(data),
                serialNumber: await BitHelper.readUShort(data),
                scale: await readScale(data),
                modelName: await BitHelper.readString(data)
            };
            terminals.set(id, terminal);

            // Spawn an item to generate an item finder entry
            const items = snapshot.getOrDefault("Vanilla.Map.Items", Factory("Map"));

            items.set(id, { 
                id,
                dimension: terminal.dimension,
                position: terminal.position,
                rotation: terminal.rotation,
                onGround: true,
                linkedToMachine: false,
                serialNumber: terminal.serialNumber, // 65535 (ushort.MaxValue) indicates item has no serial number
                itemID: Identifier.create("Internal_Finder_Item", undefined, "TERMINAL"),
                player: undefined,
            });
        }
    }
});