/* exported Typemap */
namespace Typemap {
    export const parsers: { [v in string]: ParseFunc } = {
        "0.0.1": async (data: ByteStream, replay: Replay) => {
            const size = await BitHelper.readUShort(data);
            for (let i = 0; i < size; ++i) {
                replay.typemap.set(await BitHelper.readUShort(data), {
                    typename: await BitHelper.readString(data),
                    version: await BitHelper.readString(data)
                });
            }
        }
    };
}