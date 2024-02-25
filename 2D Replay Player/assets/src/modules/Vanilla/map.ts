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
        dimensions: Map<number, MapGeometry[]>;
    }
}

interface MapGeometry {
    vertices: Vector[];
    indices: number[];
}

(function(typename: string) {
    ModuleLoader.register(typename, "0.0.1", async (fs, header: Replay.Header) => {
        header.dimensions = new Map();

        const nDimensions = await BitHelper.readByte(fs);
        for (let i = 0; i < nDimensions; ++i) {
            const dimension = await BitHelper.readByte(fs);
            const nSurfaces = await BitHelper.readUShort(fs);
            const surfaces: MapGeometry[] = [];
            for (let j = 0; j < nSurfaces; ++j) {
                const nVertices = await BitHelper.readUShort(fs);
                const nIndicies = await BitHelper.readUInt(fs);
                const bytes = await fs.getBytes(nVertices * BitHelper.sizeof("vector") + nIndicies * BitHelper.sizeof("ushort"));
                surfaces.push({
                    vertices: await BitHelper.readVectorArray(bytes, nVertices),
                    indices: await BitHelper.readUShortArray(bytes, nIndicies)
                });
            }
            header.dimensions.set(dimension, surfaces);
        }
    });
})("Vanilla.Map.Geometry");