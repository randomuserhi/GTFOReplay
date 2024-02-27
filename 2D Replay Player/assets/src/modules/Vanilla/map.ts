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

interface MapGeometry {
    vertices: Vector[];
    indices: number[];
}

((typename: string) => {
    ModuleLoader.register(typename, "0.0.1", {
        parse: async (data) => {
            const map = new Map<number, MapGeometry[]>();

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
                map.set(dimension, surfaces);
            }

            return map;
        }
    });
})("Vanilla.Map.Geometry");

/*(() => {
    Renderer.register((state) => {
        const map = header.get("Vanilla.Map.Geometry", "0.0.1");
    });
})();*/