import { open } from "node:fs/promises";

// Persisted raw replays (including ZIP imports) have no footer. Skip payloads;
// only frame lengths and timestamps are needed before background parsing starts.
export async function readRawDuration(path: string, progress?: (loaded: number, total: number) => void) {
    const file = await open(path, "r");
    try {
        const { size } = await file.stat();
        const header = Buffer.alloc(8);
        let offset = 0, duration = 0;
        progress?.(0, size);
        while (offset < size) {
            const { bytesRead } = await file.read(header, 0, Math.min(8, size - offset), offset);
            if (bytesRead < 4) throw new Error("Truncated replay frame length.");
            const length = header.readInt32LE(0);
            if (length < (offset === 0 ? 1 : 4) || length > 64 * 1024 * 1024 - 4 || offset + 4 + length > size) throw new Error("Invalid or truncated replay frame.");
            if (offset !== 0) {
                const time = header.readUInt32LE(4);
                if (time < duration) throw new Error("Replay timestamps are out of order.");
                duration = time;
            }
            offset += 4 + length;
            progress?.(offset, size);
        }
        if (offset === 0) throw new Error("Replay file is empty.");
        return { duration, rawBytes: size };
    } finally { await file.close(); }
}
