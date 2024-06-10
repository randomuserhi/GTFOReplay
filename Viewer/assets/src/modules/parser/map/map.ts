import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";

export interface MapGeometry {
    vertices: Float32Array;
    indices: number[];
}

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Map.Geometry": Map<number, MapGeometry[]>;
            "Vanilla.Map.Geometry.EOH": void;
        }
    }
}

ModuleLoader.registerHeader("Vanilla.Map.Geometry", "0.0.1", {
    parse: async (data, header) => {
        const dimension = await BitHelper.readByte(data);
        const nVertices = await BitHelper.readUShort(data);
        const nIndicies = await BitHelper.readUInt(data);
        const surface = {
            vertices: await BitHelper.readVectorArrayAsFloat32(data, nVertices),
            indices: await BitHelper.readUShortArray(data, nIndicies)
        };

        // offset surface a little to deal with bad navmesh
        for (let i = 0; i < surface.vertices.length; i += 3) {
            surface.vertices[i + 1] -= 0.1;
        }

        const map = header.getOrDefault("Vanilla.Map.Geometry", () => new Map());
        if (!map.has(dimension)) map.set(dimension, []);
        map.get(dimension)!.push(surface);
    }
});

ModuleLoader.registerHeader("Vanilla.Map.Geometry.EOH", "0.0.1", {
    parse: async () => {
    }
});