import { open, FileHandle } from "node:fs/promises";
import { brotliDecompressSync } from "node:zlib";

const magic = Buffer.from("GTRPLY03");
type ContainerFormat = "GTRPLY02" | "GTRPLY03";
const headerSize = 32;
const maxFrameSize = 64 * 1024 * 1024;
const crcTable = Uint32Array.from({ length: 256 }, (_, i) => {
    let crc = i;
    for (let bit = 0; bit < 8; ++bit) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    return crc >>> 0;
});
export function crc32(bytes: Uint8Array): number {
    let crc = 0xffffffff;
    for (const value of bytes) crc = crcTable[(crc ^ value) & 255] ^ (crc >>> 8);
    return (~crc) >>> 0;
}

interface Chunk {
    position: number;
    encodedSize: number;
    size: number;
    offset: number;
    time: number;
    crc: number;
}

export interface ContainerInfo {
    format: ContainerFormat;
    complete: boolean;
    recovered: boolean;
    warning?: string;
    duration: number;
    rawBytes: number;
    physicalBytes: number;
    chunks: number;
}

export class ReplayContainerReader {
    private chunks: Chunk[] = [];
    private cache = new Map<number, Buffer>();
    private cacheBytes = 0;
    private refreshing?: Promise<void>;
    private decoding = new Map<number, Promise<Buffer>>();
    private position = magic.length;
    private file: FileHandle;
    private diagnostics?: Chunk;
    readonly info: ContainerInfo;

    private constructor(file: FileHandle, format: ContainerFormat) {
        this.file = file;
        this.info = { format, complete: false, recovered: false, duration: 0, rawBytes: 0, physicalBytes: 0, chunks: 0 };
    }

    static async open(path: string, progress?: (loaded: number, total: number) => void): Promise<ReplayContainerReader | undefined> {
        const file = await open(path, "r");
        try {
            const bytes = Buffer.alloc(magic.length);
            const read = await file.read(bytes, 0, bytes.length, 0);
            const format = bytes.toString();
            const supported = format === "GTRPLY02" || format === "GTRPLY03";
            if (bytes.subarray(0, 6).toString() === "GTRPLY" && !supported) throw new Error("Unsupported replay container version.");
            if (read.bytesRead !== bytes.length || !supported) {
                await file.close();
                return undefined;
            }
            const reader = new ReplayContainerReader(file, format as ContainerFormat);
            await reader.scan(progress);
            return reader;
        } catch (error) {
            await file.close();
            throw error;
        }
    }

    refresh(): Promise<void> {
        if (!this.refreshing) this.refreshing = this.scan().finally(() => { this.refreshing = undefined; });
        return this.refreshing;
    }

    private async scan(progress?: (loaded: number, total: number) => void): Promise<void> {
        if (this.info.complete || this.info.warning) return;
        const { size } = await this.file.stat();
        this.info.physicalBytes = size;
        progress?.(this.position, size);
        const header = Buffer.alloc(headerSize);
        while (this.position + headerSize <= size) {
            const { bytesRead } = await this.file.read(header, 0, headerSize, this.position);
            if (bytesRead !== headerSize) break;
            const encodedSize = header.readUInt32LE(4);
            const rawSize = header.readUInt32LE(8);
            const offset = Number(header.readBigUInt64LE(12));
            const time = header.readUInt32LE(20);
            const crc = header.readUInt32LE(24);
            const flags = header.readUInt32LE(28);
            const chunkMagic = this.info.format === "GTRPLY03" ? 0x334b4843 : 0x324b4843;
            if (header.readUInt32LE(0) !== chunkMagic || !Number.isSafeInteger(offset) || offset !== this.info.rawBytes || time < this.info.duration || (this.chunks.length === 0 && time !== 0)) {
                this.info.warning = `Invalid chunk header at byte ${this.position}; only the complete prefix is available.`;
                break;
            }
            if (flags === 2) {
                if (rawSize !== 0 || encodedSize !== 0 || crc !== 0 || this.chunks.length === 0 || this.position + headerSize !== size) {
                    this.info.warning = "Invalid replay completion record.";
                    break;
                }
                this.info.complete = true;
                this.info.duration = time;
                this.position += headerSize;
                progress?.(this.position, size);
                break;
            }
            if (flags === 4 && this.info.format === "GTRPLY03") {
                if (this.diagnostics || rawSize < 2 || rawSize > 1024 * 1024 || encodedSize === 0 || encodedSize > 2 * 1024 * 1024 || time !== this.info.duration) {
                    this.info.warning = "Invalid recording diagnostics block.";
                    break;
                }
                if (this.position + headerSize + encodedSize > size) break;
                this.diagnostics = { position: this.position + headerSize, encodedSize, size: rawSize, offset, time, crc };
                this.position += headerSize + encodedSize;
                progress?.(this.position, size);
                continue;
            }
            if (this.diagnostics || flags !== (this.chunks.length === 0 ? 1 : 0) || rawSize < 4 || rawSize > maxFrameSize || encodedSize === 0 || encodedSize > maxFrameSize + 1048576) {
                this.info.warning = `Invalid chunk size or flags at byte ${this.position}.`;
                break;
            }
            if (this.position + headerSize + encodedSize > size) break;
            this.chunks.push({ position: this.position + headerSize, encodedSize, size: rawSize, offset, time, crc });
            this.position += headerSize + encodedSize;
            progress?.(this.position, size);
            this.info.rawBytes += rawSize;
            this.info.duration = time;
        }
        this.info.chunks = this.chunks.length;
        this.info.recovered = !this.info.complete;
    }

    async readDiagnostics(sessionId?: string): Promise<Record<string, unknown> | undefined> {
        await this.refresh();
        const chunk = this.diagnostics;
        if (!chunk) {
            if (this.info.warning) throw new Error(this.info.warning);
            return undefined;
        }
        const encoded = Buffer.alloc(chunk.encodedSize);
        const { bytesRead } = await this.file.read(encoded, 0, encoded.length, chunk.position);
        if (bytesRead !== encoded.length) throw new Error("Truncated recording diagnostics.");
        const bytes = brotliDecompressSync(encoded, { maxOutputLength: chunk.size });
        if (bytes.length !== chunk.size || crc32(bytes) !== chunk.crc) throw new Error("Recording diagnostics checksum failed.");
        const report = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
        if (!report || typeof report !== "object" || Array.isArray(report)) throw new Error("Invalid recording diagnostics.");
        if (sessionId && report.SessionId !== sessionId) throw new Error("Recording diagnostics belong to a different session.");
        return report;
    }

    private decode(index: number): Promise<Buffer> {
        let pending = this.decoding.get(index);
        if (!pending) {
            pending = this.decodeChunk(index).finally(() => this.decoding.delete(index));
            this.decoding.set(index, pending);
        }
        return pending;
    }

    private async decodeChunk(index: number): Promise<Buffer> {
        const cached = this.cache.get(index);
        if (cached) {
            this.cache.delete(index);
            this.cache.set(index, cached);
            return cached;
        }
        const chunk = this.chunks[index];
        const encoded = Buffer.alloc(chunk.encodedSize);
        const { bytesRead } = await this.file.read(encoded, 0, encoded.length, chunk.position);
        if (bytesRead !== encoded.length) throw new Error("Replay changed or was truncated while reading.");
        const bytes = brotliDecompressSync(encoded, { maxOutputLength: chunk.size });
        const invalid = () => new Error(`Replay integrity check failed near ${Math.floor(chunk.time / 1000)}s (chunk ${index}).`);
        if (bytes.length !== chunk.size || crc32(bytes) !== chunk.crc) throw invalid();
        let position = 0, time = index === 0 ? 0 : this.chunks[index - 1].time;
        while (position < bytes.length) {
            if (bytes.length - position < (index === 0 ? 4 : 8)) throw invalid();
            const size = bytes.readInt32LE(position);
            if (size < (index === 0 ? 0 : 4) || size > bytes.length - position - 4) throw invalid();
            if (index > 0) {
                const nextTime = bytes.readUInt32LE(position + 4);
                if (nextTime < time) throw invalid();
                time = nextTime;
            }
            position += size + 4;
            if ((index === 0 || this.info.format === "GTRPLY02") && position !== bytes.length) throw invalid();
        }
        if (time !== chunk.time) throw invalid();
        // Large headers are returned once without retaining another copy in the cache.
        if (bytes.length <= 8 * 1024 * 1024) {
            while (this.cacheBytes + bytes.length > 8 * 1024 * 1024) {
                const oldest = this.cache.keys().next().value!;
                this.cacheBytes -= this.cache.get(oldest)!.length;
                this.cache.delete(oldest);
            }
            this.cache.set(index, bytes);
            this.cacheBytes += bytes.length;
        }
        return bytes;
    }

    async read(offset: number, length: number): Promise<Buffer | undefined> {
        if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) || offset < 0 || length < 0 || length > maxFrameSize) throw new Error("Invalid replay read range.");
        if (offset + length > this.info.rawBytes) await this.refresh();
        if (offset + length > this.info.rawBytes) return undefined;
        const result = Buffer.alloc(length);
        let low = 0, high = this.chunks.length;
        while (low < high) {
            const middle = (low + high) >>> 1;
            if (this.chunks[middle].offset + this.chunks[middle].size <= offset) low = middle + 1;
            else high = middle;
        }
        let copied = 0;
        for (let i = low; copied < length && i < this.chunks.length; ++i) {
            const chunk = this.chunks[i];
            const bytes = await this.decode(i);
            const start = offset + copied - chunk.offset;
            const count = Math.min(bytes.length - start, length - copied);
            bytes.copy(result, copied, start, start + count);
            copied += count;
        }
        return result;
    }

    async close(): Promise<void> {
        this.cache.clear();
        this.cacheBytes = 0;
        await this.file.close();
    }
}
