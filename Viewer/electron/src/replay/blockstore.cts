import { mkdtemp, open, rm, type FileHandle } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { serialize, deserialize } from "node:v8";

// One append-only temporary file. Only offsets live in memory; Maps/BigInts survive V8 serialization.
export class ReplayBlockStore {
    private file?: FileHandle;
    private directory?: string;
    private entries: { offset: number; size: number }[] = [];
    private offset = 0;
    private writes: Promise<unknown> = Promise.resolve();
    private closing?: Promise<void>;
    private readonly reads = new Set<Promise<unknown>>();
    static async create() {
        const store = new ReplayBlockStore();
        store.directory = await mkdtemp(join(tmpdir(), "gtfo-replay-cache-"));
        try { store.file = await open(join(store.directory, "blocks"), "wx+"); } catch (error) { await store.cleanup(); throw error; }
        return store;
    }
    async append(block: unknown) {
        if (!this.file || this.closing) throw new Error("Replay cache is closed.");
        const bytes = serialize(block);
        if (bytes.length > 256 * 1024 * 1024) throw new Error("Replay state exceeds the 256 MB cache block limit.");
        const write = this.writes.then(() => this.write(bytes));
        this.writes = write;
        return write;
    }
    private async write(bytes: Buffer) {
        const file = this.file!;
        let written = 0;
        while (written < bytes.length) {
            const result = await file.write(bytes, written, bytes.length - written, this.offset + written);
            if (!result.bytesWritten) throw new Error("Replay cache write made no progress.");
            written += result.bytesWritten;
        }
        const id = this.entries.length;
        this.entries.push({ offset: this.offset, size: bytes.length });
        this.offset += bytes.length;
        return id;
    }
    async read(id: number) {
        const file = this.file;
        if (!file || this.closing) throw new Error("Replay cache is closed.");
        if (!Number.isSafeInteger(id) || id < 0 || id >= this.entries.length) throw new Error("Invalid replay cache block.");
        const entry = this.entries[id];
        const task = (async () => {
            const bytes = Buffer.alloc(entry.size);
            let read = 0;
            while (read < bytes.length) {
                const result = await file.read(bytes, read, bytes.length - read, entry.offset + read);
                if (!result.bytesRead) throw new Error("Replay cache was truncated.");
                read += result.bytesRead;
            }
            return deserialize(bytes);
        })();
        this.reads.add(task);
        try { return await task; } finally { this.reads.delete(task); }
    }
    close(): Promise<void> {
        return this.closing ??= this.finish();
    }
    private async finish() {
        try { await this.writes; } finally { await Promise.allSettled(this.reads); await this.cleanup(); }
    }
    private async cleanup() {
        const file = this.file;
        this.file = undefined;
        try { await file?.close(); } finally {
            // Only the directory created by mkdtemp above is owned by this store.
            if (this.directory) await rm(this.directory, { recursive: true, force: true });
            this.directory = undefined;
            this.entries = [];
        }
    }
}
