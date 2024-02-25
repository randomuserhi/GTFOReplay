/* exported BitHelper */
namespace BitHelper {
    export async function readUShortArray(stream: ByteStream | Replay, length: number): Promise<number[]> {
        const array = new Array(length);
        for (let i = 0; i < length; ++i)
            array[i] = await BitHelper.readUShort(stream);
        return array;
    }
    export async function readVectorArray(stream: ByteStream | Replay, length: number): Promise<Vector[]> {
        const array = new Array<Vector>(length);
        for (let i = 0; i < length; ++i) {
            array[i] = await BitHelper.readVector(stream);
        }
        return array;
    }
}

(function(typename: string) {
    ModuleLoader.register(typename, "0.0.1", () => {
        
    });
})("Vanilla.Map.MapGeometry");