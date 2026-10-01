import { stat, realpath } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import { watch, FSWatcher } from "chokidar";
import { ReplayPreferences } from "./preferences.cjs";

export interface LibraryRow { path: string; name: string; size: number; modified: number }
export class ReplayLibrary {
    private readonly rows = new Map<string, LibraryRow>();
    private watcher?: FSWatcher;
    private errors: string[] = [];
    private generation = 0;
    private readonly ready: Promise<void>;
    private changes: Promise<unknown> = Promise.resolve();
    constructor(private readonly preferences: ReplayPreferences) {
        this.ready = this.restart();
        void this.ready.catch(error => console.error("Replay library:", error));
    }
    private supported(path: string) { return [".gtfo", ".zip", ".gtfoclip"].includes(extname(path).toLowerCase()); }
    private report(error: string) { this.errors.push(error); if (this.errors.length > 20) this.errors.shift(); }
    private async update(path: string, generation: number) {
        path = resolve(path);
        if (!this.supported(path)) return;
        try {
            const info = await stat(path);
            if (generation !== this.generation) return;
            if (info.isFile()) this.rows.set(path, { path, name: basename(path), size: info.size, modified: info.mtimeMs });
        } catch (error) {
            if (generation !== this.generation) return;
            this.rows.delete(path);
            if ((error as NodeJS.ErrnoException).code !== "ENOENT") this.report(`${path}: ${error}`);
        }
    }
    private async restart() {
        const generation = ++this.generation;
        await this.watcher?.close();
        this.rows.clear(); this.errors = [];
        const settings = await this.preferences.library();
        const paths = [...new Set([...settings.folders, ...settings.files.map(file => file.path)])];
        if (!paths.length) return;
        for (const folder of settings.folders) {
            try { if (!(await stat(folder)).isDirectory()) throw new Error("Not a folder"); }
            catch (error) { this.report(`${folder}: ${error}`); }
        }
        const pending = new Set<Promise<void>>();
        const watcher = this.watcher = watch(paths, { ignoreInitial: false, followSymlinks: false, ignored: (path: string, info?: import("node:fs").Stats) => !!info?.isFile() && !this.supported(path) });
        const update = (path: string) => { const task = this.update(path, generation); pending.add(task); void task.finally(() => pending.delete(task)); };
        watcher.on("add", update).on("change", update).on("unlink", path => this.rows.delete(resolve(path)));
        watcher.on("error", error => { this.report(String(error)); console.error("Replay library watcher:", error); });
        await new Promise<void>(done => watcher.once("ready", done));
        await Promise.all(pending);
    }
    async snapshot() {
        await this.ready; await this.changes;
        const settings = await this.preferences.library();
        const saved = new Map(settings.files.map(file => [file.path, file]));
        return { folders: settings.folders, defaultFolder: settings.defaultFolder, errors: [...new Set(this.errors)].slice(-20),
            files: [...this.rows.values()].map(row => ({ ...row, ...saved.get(row.path) })) };
    }
    configure(folders: string[], defaultFolder?: string) {
        const change = this.changes.then(async () => {
            await this.ready;
            const normalized = await Promise.all(folders.map(async folder => { const path = await realpath(folder); if (!(await stat(path)).isDirectory()) throw new Error("Not a folder."); return path; }));
            const selected = defaultFolder ? await realpath(defaultFolder) : undefined;
            await this.preferences.configureFolders(normalized, selected);
            await this.restart();
        });
        this.changes = change.catch(() => undefined);
        return change;
    }
    async remember(path: string) {
        await this.ready; await this.changes;
        path = resolve(path);
        await this.preferences.saveFile({ path });
        if (!this.watcher) await this.restart(); else this.watcher.add(path);
        await this.update(path, this.generation);
    }
    async requireFile(path: string) {
        await this.ready; await this.changes;
        const row = this.rows.get(resolve(path));
        if (!row || !this.supported(path) || !(await stat(path)).isFile()) throw new Error("Replay file is no longer available in the library.");
        return row.path;
    }
    async close() { await this.ready; await this.changes; ++this.generation; await this.watcher?.close(); }
}
