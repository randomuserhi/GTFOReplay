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
}

/* exported Replay */
declare namespace Replay {
    interface Header {
        dimensions: { [k in number]: MapGeometry[] };
    }
}

interface MapGeometry {
    vertices: Vector[];
    indices: number[];
}

(function(typename: string) {
    ModuleLoader.register(typename, "0.0.1", async (data, header: Replay.Header) => {
        header.dimensions = {};

        const nDimensions = await BitHelper.readByte(data);
        for (let i = 0; i < nDimensions; ++i) {
            const dimension = await BitHelper.readByte(data);
            const nSurfaces = await BitHelper.readUShort(data);
            const surfaces: MapGeometry[] = [];
            for (let j = 0; j < nSurfaces; ++j) {
                const nVertices = await BitHelper.readUShort(data);
                const nIndicies = await BitHelper.readUInt(data);
                surfaces.push({
                    vertices: await BitHelper.readVectorArray(data, nVertices),
                    indices: await BitHelper.readUShortArray(data, nIndicies)
                });
            }
            header.dimensions[dimension] = surfaces;
        }
    });
})("Vanilla.Map.Geometry");