import { open, rename, unlink, type FileHandle } from "node:fs/promises";
import { serialize, deserialize } from "node:v8";
import { randomUUID } from "node:crypto";
import { brotliCompress, brotliDecompress, constants } from "node:zlib";
import { promisify } from "node:util";
import { crc32 } from "./container.cjs";
import type { ClipBlock, ClipHeader, ClipSelection } from "../../../shared/clip.js";

const magic = Buffer.from("GTRCLP01");
const compress = promisify(brotliCompress), decompress = promisify(brotliDecompress);
const limit = 256 * 1024 * 1024;
function validateHeader(value: ClipHeader) {
    if (!value || value.version !== 1 || typeof value.identity !== "string" || !value.identity.startsWith("clip:") || value.identity.length > 200 ||
        !Number.isFinite(value.start) || !Number.isFinite(value.end) || value.start < 0 || value.start >= value.end ||
        !Number.isSafeInteger(value.blockCount) || value.blockCount < 1 || value.blockCount > 1000000 ||
        !(value.typemap instanceof Map) || !(value.types instanceof Map) || !(value.header instanceof Map) || !Array.isArray(value.events)) throw new Error("Invalid replay clip metadata.");
    for (const [id, type] of value.typemap) if (!Number.isSafeInteger(id) || !Array.isArray(type) || typeof type[0] !== "string" || typeof type[1] !== "string" || type.typename !== type[0] || type.version !== type[1]) throw new Error("Invalid clip module map.");
    for (const event of value.events) if (!Number.isFinite(event.time) || event.time < value.start || event.time > value.end || typeof event.kind !== "string") throw new Error("Invalid clip event index.");
}
function validateBlock(block: ClipBlock) {
    if (!block?.state || !Number.isFinite(block.state.time) || !Number.isSafeInteger(block.state.tick) || !(block.state.data instanceof Map) || !(block.state.typedTime instanceof Map) || !Array.isArray(block.timeline) || block.timeline.length > 10000) throw new Error("Invalid replay clip state.");
    let time = block.state.time;
    for (const frame of block.timeline) {
        if (!frame || !Number.isFinite(frame.time) || frame.time < time || !Number.isSafeInteger(frame.tick) || !Array.isArray(frame.events) || !(frame.dynamics instanceof Map)) throw new Error("Invalid replay clip frame.");
        time = frame.time;
    }
}
async function writeRecord(file: FileHandle, value: unknown) {
    const raw = serialize(value);
    if (raw.length > limit) throw new Error("Clip block exceeds 256 MiB.");
    const encoded = await compress(raw, { params: { [constants.BROTLI_PARAM_QUALITY]: 4 } });
    const header = Buffer.alloc(12);
    header.writeUInt32LE(encoded.length, 0); header.writeUInt32LE(raw.length, 4); header.writeUInt32LE(crc32(raw), 8);
    await file.writeFile(header); await file.writeFile(encoded);
}
export async function writeClip(path: string, selection: ClipSelection, read: (id: number) => Promise<ClipBlock>) {
    const manifest: ClipHeader = { version: 1, identity: `clip:${randomUUID()}`, sourceIdentity: selection.sourceIdentity,
        start: selection.start, end: selection.end, blockCount: selection.blocks.length, typemap: selection.typemap, types: selection.types, header: selection.header, events: selection.events };
    validateHeader(manifest);
    const temporary = `${path}.${randomUUID()}.tmp`;
    try {
        const file = await open(temporary, "wx");
        try {
            await file.writeFile(magic); await writeRecord(file, manifest);
            for (const metadata of selection.blocks) {
                const block = await read(metadata.id);
                const selected = { ...block, timeline: block.timeline.filter(frame => frame.time <= selection.end + 200).map(frame => ({ ...frame, events: frame.events.filter(event => frame.time - event.delta <= selection.end) })) };
                validateBlock(selected);
                await writeRecord(file, selected);
            }
            await file.sync();
        } finally { await file.close(); }
        await rename(temporary, path);
    } finally { await unlink(temporary).catch(error => { if (error.code !== "ENOENT") throw error; }); }
}
export async function isClip(path: string) {
    const file = await open(path, "r");
    try { const bytes = Buffer.alloc(8); await file.read(bytes, 0, 8, 0); return bytes.subarray(0, 6).toString() === "GTRCLP"; }
    finally { await file.close(); }
}
export async function readClip(path: string, append: (block: ClipBlock) => Promise<number>) {
    const file = await open(path, "r");
    try {
        const size = (await file.stat()).size;
        let position = 0;
        const bytes = async (length: number) => {
            if (position + length > size) throw new Error("Replay clip is truncated.");
            const buffer = Buffer.alloc(length);
            let offset = 0;
            while (offset < length) { const result = await file.read(buffer, offset, length - offset, position + offset); if (!result.bytesRead) throw new Error("Replay clip is truncated."); offset += result.bytesRead; }
            position += length;
            return buffer;
        };
        if (!(await bytes(8)).equals(magic)) throw new Error("Unsupported replay clip version.");
        const record = async () => {
            const header = await bytes(12);
            const encodedSize = header.readUInt32LE(0), rawSize = header.readUInt32LE(4);
            if (!rawSize || rawSize > limit || !encodedSize || encodedSize > limit + 1048576) throw new Error("Invalid replay clip block size.");
            const raw = await decompress(await bytes(encodedSize), { maxOutputLength: rawSize });
            if (raw.length !== rawSize || crc32(raw) !== header.readUInt32LE(8)) throw new Error("Replay clip integrity check failed.");
            return deserialize(raw);
        };
        const manifest: ClipHeader = await record(); validateHeader(manifest);
        const blocks: { id: number; start: number; end: number }[] = [];
        for (let i = 0; i < manifest.blockCount; ++i) {
            const block: ClipBlock = await record(); validateBlock(block);
            const start = block.state.time, end = block.timeline[block.timeline.length - 1]?.time ?? start;
            if (i === 0 ? start > manifest.start : start !== blocks[i - 1].end) throw new Error("Replay clip has a gap between playback states.");
            blocks.push({ id: await append(block), start, end });
        }
        if (position !== size || blocks[blocks.length - 1].end < manifest.end) throw new Error("Replay clip interval is incomplete.");
        return { manifest, blocks };
    } finally { await file.close(); }
}
