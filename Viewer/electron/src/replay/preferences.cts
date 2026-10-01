import { mkdir, readFile, writeFile, rename, unlink } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { createHash, randomUUID } from "node:crypto";

export interface Bookmark { id: string; time: number; label: string; note: string }
interface Entry { bookmarks: Bookmark[] }
export interface LibraryFile { path: string; identity?: string; favorite?: boolean; duration?: number; viewedAt?: number }
interface Preferences { version: 1; entries: Record<string, Entry>; folders?: string[]; defaultFolder?: string; lastImportFolder?: string; files?: Record<string, LibraryFile> }

function validateBookmarks(bookmarks: unknown): asserts bookmarks is Bookmark[] {
    if (!Array.isArray(bookmarks) || bookmarks.length > 10000) throw new Error("Invalid bookmark list.");
    const ids = new Set<string>();
    for (const note of bookmarks) {
        if (!note || typeof note.id !== "string" || note.id.length > 80 || ids.has(note.id) || !Number.isFinite(note.time) || note.time < 0 ||
            typeof note.label !== "string" || note.label.length > 120 || typeof note.note !== "string" || note.note.length > 8000) throw new Error("Invalid bookmark.");
        ids.add(note.id);
    }
}

export class ReplayPreferences {
    private data: Preferences = { version: 1, entries: {} };
    private readonly ready: Promise<void>;
    private writes: Promise<unknown> = Promise.resolve();
    constructor(private readonly path: string) {
        this.ready = this.load();
        void this.ready.catch(error => console.error("Replay preferences could not be loaded:", error));
    }
    private async load() {
        try {
            const text = await readFile(this.path, "utf8");
            const data = JSON.parse(text);
            if (data.version !== 1 || !data.entries || typeof data.entries !== "object" || Array.isArray(data.entries)) throw new Error("Invalid replay preferences file.");
            for (const entry of Object.values(data.entries) as Entry[]) validateBookmarks(entry?.bookmarks);
            if (data.folders !== undefined && (!Array.isArray(data.folders) || data.folders.length > 32 || data.folders.some((folder: unknown) => typeof folder !== "string" || !isAbsolute(folder)))) throw new Error("Invalid saved recording folders.");
            for (const folder of [data.defaultFolder, data.lastImportFolder]) if (folder !== undefined && (typeof folder !== "string" || !isAbsolute(folder))) throw new Error("Invalid saved folder.");
            if (data.files !== undefined) {
                if (!data.files || typeof data.files !== "object" || Array.isArray(data.files)) throw new Error("Invalid saved replay files.");
                for (const file of Object.values(data.files) as LibraryFile[]) {
                    if (!file || typeof file.path !== "string" || !isAbsolute(file.path)) throw new Error("Invalid saved replay file.");
                    for (const value of [file.duration, file.viewedAt]) if (value !== undefined && (!Number.isFinite(value) || value < 0)) throw new Error("Invalid saved progress.");
                    if (file.identity !== undefined) this.key(file.identity);
                    if (file.favorite !== undefined && typeof file.favorite !== "boolean") throw new Error("Invalid saved favorite.");
                }
            }
            this.data = data;
        } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    }
    private key(identity: string) {
        if (typeof identity !== "string" || !identity.length || identity.length > 4096) throw new Error("Invalid replay identity.");
        return createHash("sha256").update(identity).digest("hex");
    }
    async bookmarks(identity: string): Promise<Bookmark[]> {
        await this.ready;
        return structuredClone(this.data.entries[this.key(identity)]?.bookmarks ?? []);
    }
    async library() {
        await this.ready;
        return structuredClone({ folders: this.data.folders ?? [], defaultFolder: this.data.defaultFolder, lastImportFolder: this.data.lastImportFolder, files: Object.values(this.data.files ?? {}) });
    }
    async flush() { await this.ready; await this.writes; }
    configureFolders(folders: string[], defaultFolder?: string) {
        if (!Array.isArray(folders) || folders.length > 32 || folders.some(folder => typeof folder !== "string" || !isAbsolute(folder))) throw new Error("Invalid recording folders.");
        const normalized = [...new Set(folders.map(folder => resolve(folder)))];
        if (defaultFolder !== undefined && !normalized.includes(resolve(defaultFolder))) throw new Error("Default folder must belong to the recording library.");
        return this.change(next => { next.folders = normalized; next.defaultFolder = defaultFolder && resolve(defaultFolder); });
    }
    rememberImport(folder: string) {
        if (!isAbsolute(folder)) throw new Error("Invalid import folder.");
        return this.change(next => { next.lastImportFolder = resolve(folder); });
    }
    saveFile(file: LibraryFile) {
        if (!file || typeof file.path !== "string" || !isAbsolute(file.path)) throw new Error("Invalid replay file path.");
        for (const value of [file.duration, file.viewedAt]) if (value !== undefined && (!Number.isFinite(value) || value < 0)) throw new Error("Invalid replay progress.");
        if (file.favorite !== undefined && typeof file.favorite !== "boolean") throw new Error("Invalid favorite value.");
        if (file.identity !== undefined) this.key(file.identity);
        const copy = structuredClone(file);
        copy.path = resolve(file.path);
        const key = this.key(copy.path);
        return this.change(next => { next.files ??= {}; next.files[key] = { ...next.files[key], ...copy }; });
    }
    saveBookmarks(identity: string, bookmarks: Bookmark[]) {
        const key = this.key(identity);
        validateBookmarks(bookmarks);
        const copy = structuredClone(bookmarks);
        return this.change(next => { next.entries[key] = { ...next.entries[key], bookmarks: copy }; });
    }
    private change(mutate: (next: Preferences) => void) {
        const write = this.writes.then(async () => {
            await this.ready;
            const next = structuredClone(this.data);
            mutate(next);
            const json = JSON.stringify(next);
            if (Buffer.byteLength(json) > 64 * 1024 * 1024) throw new Error("Replay preferences exceeded 64 MB.");
            await mkdir(dirname(this.path), { recursive: true });
            const temporary = this.path + "." + randomUUID() + ".tmp";
            try {
                await writeFile(temporary, json, { encoding: "utf8", flag: "wx" });
                await rename(temporary, this.path);
                this.data = next;
            } finally {
                await unlink(temporary).catch(error => { if (error.code !== "ENOENT") throw error; });
            }
        });
        // Return the failure to the caller, while allowing a later user-initiated save to run.
        this.writes = write.catch(() => undefined);
        return write;
    }
}
