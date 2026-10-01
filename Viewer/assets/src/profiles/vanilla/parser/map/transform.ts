import * as BitHelper from "@esm/@root/replay/bithelper.js";

/** A coordinate reflection changes position/rotation, but never scale signs. */
export async function readScale(data: Parameters<typeof BitHelper.readFloat>[0]) {
    return { x: await BitHelper.readFloat(data), y: await BitHelper.readFloat(data), z: await BitHelper.readFloat(data) };
}
