/* exported Typemap */
namespace Typemap {
    export const parsers: { [v in string]: (data: ByteStream, replay: Replay) => Promise<void> } = {
        "0.0.1": async (data: ByteStream, replay: Replay) => {
            const size = await BitHelper.readUShort(data);
            for (let i = 0; i < size; ++i) {
                const type = await BitHelper.readUShort(data);
                const typename = await BitHelper.readString(data);
                const version = await BitHelper.readString(data);
                replay.typemap.set(type, {
                    typename,
                    version
                });
                replay.types.set(typename, type);
            }
        }
    };
}