/* exported BitHelper */
namespace BitHelper {
    export async function readUShortArray(stream: ByteStream | FileStream, length: number): Promise<number[]> {
        const array = new Array(length);
        for (let i = 0; i < length; ++i)
            array[i] = await BitHelper.readUShort(stream);
        return array;
    }
    export async function readVectorArray(stream: ByteStream | FileStream, length: number): Promise<Vector[]> {
        const array = new Array<Vector>(length);
        for (let i = 0; i < length; ++i) {
            array[i] = await BitHelper.readVector(stream);
        }
        return array;
    }
    export async function readFloat32Array(stream: ByteStream | FileStream, length: number): Promise<Float32Array> {
        const array = new Array<number>(length);
        for (let i = 0; i < length; ++i) {
            array[i] = await BitHelper.readFloat(stream);
        }
        return new Float32Array(array);
    }
}

declare namespace Vanilla {
    interface MapGeometry {
        vertices: Float32Array;
        indices: number[];
    }
}

/* exported Typemap */
declare namespace Typemap {
    interface Headers {
        "Vanilla.Map.Geometry": Map<number, Vanilla.MapGeometry[]>;
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