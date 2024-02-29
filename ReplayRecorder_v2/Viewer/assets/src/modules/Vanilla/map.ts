import * as BitHelper from "../../replay/bithelper.js";
import { ModuleLoader } from "../../replay/moduleloader.js";
import { DuplicateHeaderData } from "../replayrecorder.js";

declare namespace Vanilla {
    interface MapGeometry {
        vertices: Float32Array;
        indices: number[];
    }
}

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Map.Geometry": Map<number, Vanilla.MapGeometry[]>;
        }
    }
}

ModuleLoader.registerHeader("Vanilla.Map.Geometry", "0.0.1", {
    parse: async (data, header) => {
        const map = new Map<number, Vanilla.MapGeometry[]>();

        const nDimensions = await BitHelper.readByte(data);
        for (let i = 0; i < nDimensions; ++i) {
            const dimension = await BitHelper.readByte(data);
            const nSurfaces = await BitHelper.readUShort(data);
            const surfaces: Vanilla.MapGeometry[] = [];
            for (let j = 0; j < nSurfaces; ++j) {
                const nVertices = await BitHelper.readUShort(data);
                const nIndicies = await BitHelper.readUInt(data);
                surfaces.push({
                    vertices: await BitHelper.readFloat32Array(data, nVertices * 3),
                    indices: await BitHelper.readUShortArray(data, nIndicies)
                });
            }
            map.set(dimension, surfaces);
        }

        if (header.has("Vanilla.Map.Geometry")) throw new DuplicateHeaderData("Map Geometry was already written.");
        else header.set("Vanilla.Map.Geometry", map);
    }
});