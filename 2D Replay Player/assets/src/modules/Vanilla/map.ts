/* exported BitHelper */
namespace BitHelper {
    export function readUShortArray(stream: ByteStream, length: number): number[] {
        const array = new Array(length);
        for (let i = 0; i < length; ++i)
            array[i] = BitHelper.readUShort(stream);
        return array;
    }
    export function readVectorArray(stream: ByteStream, length: number): Vector[] {
        const array = new Array<Vector>(length);
        for (let i = 0; i < length; ++i) {
            array[i] = BitHelper.readVector(stream);
        }
        return array;
    }
}

(function(typename: string) {
    ModuleLoader.register(typename, "0.0.1", () => {
        
    });
})("Vanilla.Map.MapGeometry");