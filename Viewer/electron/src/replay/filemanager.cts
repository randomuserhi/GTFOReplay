import { AppDialogs } from "./dialogs.cjs";
import { readRecordingDiagnostics } from "./diagnostics.cjs";
import * as chokidar from "chokidar";
import { randomUUID } from "crypto";
import { app, shell } from "electron";
import * as fs from "fs";
import path from "path";
import * as yauzl from "yauzl";
import Program from "../main.cjs";
import { ReplayContainerReader } from "./container.cjs";
import { ReplayBlockStore } from "./blockstore.cjs";
import { ReplayPreferences, Bookmark } from "./preferences.cjs";
import { ReplayLibrary } from "./library.cjs";
import { tmpdir } from "node:os";
import { pipeline } from "node:stream/promises";
import { isClip, readClip } from "./clip.cjs";
import type { OpenClip } from "../../../shared/clip.js";
import type { ReplayOpenProgress } from "../../../shared/loading.js";
import { readRawDuration } from "./duration.cjs";

interface FileHandle {
    path: string;
    finite?: boolean ;
}

// TODO(randomuserhi): Don't store entire net buffer -> deallocate early blocks as they are read and parsed
class NetBuffer {
    static chunkSize = 4096 * 5;

    private chunks: Uint8Array[];
    private reserveChunks(offset: number, size: number) {
        const index = Math.floor((offset + size) / NetBuffer.chunkSize);
        while (this.chunks.length <= index) {
            this.chunks.push(new Uint8Array(NetBuffer.chunkSize));
        }
    }

    private ranges: { start: number, end: number }[];
    private query(index: number): number {
        // NOTE(randomuserhi): returns negative index if not found

        if (this.ranges.length == 0) throw new Error("Cannot query length of 0");
        if (this.ranges.length == 1) {
            if (index < this.ranges[0].start || index > this.ranges[0].end) return -1;
            return 0;
        }

        let min = 0;
        let max = this.ranges.length - 1;

        while (min < max) {
            const mid = Math.floor((min + max) / 2);
            const range = this.ranges[mid];

            if (index < range.start) {
                max = mid - 1;
            } else if (index > range.end) {
                min = mid + 1;
            } else {
                return mid;
            }
        }

        return -min - 1;
    }

    constructor() {
        this.chunks = [];
        this.ranges = [];
    }

    public getAllBytes(start: number): { cache: ArrayBufferLike, cacheStart: number, cacheEnd: number } | undefined {
        if (this.ranges.length === 0) return undefined;

        const startRange = this.query(start);
        if (startRange < 0) return undefined;

        // Free memory of previous chunks as they should not need to be re-accessed
        for (let i = 0; i < Math.floor(start / NetBuffer.chunkSize) - 1; ++i) {
            this.chunks[i] = undefined!;
        }

        const range = this.ranges[startRange];

        const length = range.end - start + 1;
        const data = new Uint8Array(length);
        let byteOffset = start;

        for (let i = 0; i < length; ++i, ++byteOffset) {
            const chunkIndex = Math.floor(byteOffset / NetBuffer.chunkSize);
            data[i] = this.chunks[chunkIndex][byteOffset - NetBuffer.chunkSize * chunkIndex];
        }

        return { cache: data, cacheStart: start, cacheEnd: range.end };
    }

    public getBytes(start: number, end: number, numBytes: number): Uint8Array | undefined {
        if (this.ranges.length === 0) return undefined;

        const startRange = this.query(start);
        const endRange = this.query(end);
        if (startRange < 0 || endRange < 0) return undefined;
        if (startRange !== endRange) return undefined;

        const data = new Uint8Array(numBytes);
        let byteOffset = start;
        for (let i = 0; i < numBytes; ++i, ++byteOffset) {
            const chunkIndex = Math.floor(byteOffset / NetBuffer.chunkSize);
            data[i] = this.chunks[chunkIndex][byteOffset - NetBuffer.chunkSize * chunkIndex];
        }

        return data;
    }

    public setByteRange(start: number, data: Uint8Array) {
        const length = data.byteLength;
        let end = start + length - 1;

        // Write data
        this.reserveChunks(start, length);
        let byteOffset = start;
        for (let i = 0; i < length; ++i, ++byteOffset) {
            const chunkIndex = Math.floor(byteOffset / NetBuffer.chunkSize);
            this.chunks[chunkIndex][byteOffset - NetBuffer.chunkSize * chunkIndex] = data[i];
        }

        // Assign ranges
        const newRanges: { start: number, end: number }[] = [];

        for (const range of this.ranges) {
            if (end < range.start - 1) {
                newRanges.push({ start, end });
                start = range.start;
                end = range.end;
            } else if (start > range.end + 1) {
                newRanges.push(range);
            } else {
                start = Math.min(start, range.start);
                end = Math.max(end, range.end);
            }
        }
        newRanges.push({ start, end });

        this.ranges = newRanges;

        // console.log(this.ranges);
        // TODO(randomuserhi): display the byte range for feedback when loading spectator view
    }
}

class File {
    container?: ReplayContainerReader;
    rawInfo?: { duration: number; rawBytes: number };
    readonly path: string | undefined;
    private watcher: chokidar.FSWatcher | undefined;
    private opening?: Promise<void>;
    private closing?: Promise<void>;
    private closed = false;
    private requests: {
        start: number;
        end: number;
        numBytes: number;
        callback: (bytes?: ArrayBufferLike) => void;
    }[];

    private replayInstanceId: number;
    public link(replayInstanceId: number) {
        this.replayInstanceId = replayInstanceId;
    }

    constructor(path: string | undefined) {
        this.path = path;
        this.requests = [];
        this.replayInstanceId = -1;
        this.netBuffer = new NetBuffer();
    }

    netBuffer: NetBuffer;
    public receiveLiveBytes(data: { replayInstanceId: number, offset: number, bytes: Uint8Array }) {
        if (this.closed) return;
        const { replayInstanceId, offset, bytes } = data;

        // console.log(`recv: ${offset} ${bytes.byteLength} ${replayInstanceId} -> ${this.replayInstanceId}`);

        if (replayInstanceId != this.replayInstanceId) {
            console.log(`${replayInstanceId} != ${this.replayInstanceId}`);
            return;
        }
        this.netBuffer.setByteRange(offset, bytes);

        this.doAllRequests();
    }

    public open(progress?: (loaded: number, total: number) => void) {
        return this.opening ??= this.load(progress);
    }

    private async load(progress?: (loaded: number, total: number) => void) {
        if (this.closed || this.path === undefined) return;
        const container = await ReplayContainerReader.open(this.path, progress);
        if (this.closed) { await container?.close(); return; }
        this.container = container;
        if (!container) this.rawInfo = await readRawDuration(this.path, progress);
        if (this.closed) return;
        this.watcher = chokidar.watch(this.path, {
            usePolling: true
        }); // TODO(randomuserhi): requires polling for some reason => shouldn't need to tho?
        this.watcher.on("all", () => {
            this.doAllRequests();
        });
    }

    public close(): Promise<void> {
        if (this.closing) return this.closing;
        this.closed = true;
        const container = this.container, watcher = this.watcher;
        this.container = undefined;
        this.watcher = undefined;
        const requests = this.requests;
        this.requests = [];
        requests.forEach(r => r.callback());
        return this.closing = Promise.all([
            this.opening?.catch(() => undefined), container?.close(), watcher?.close()
        ]).then(() => undefined);
    }

    private doAllRequests() {
        const requests = this.requests;
        this.requests = [];
        requests.forEach(r => this.doRequest(r));
    }

    private doRequest(request: { start: number; end: number; numBytes: number; callback: (bytes?: ArrayBufferLike) => void }, wait: boolean = true) {
        const { start, end, numBytes, callback } = request;
        if (this.closed || end < start) {
            callback();
            return;
        }
        this.getBytesImpl(start, end, numBytes).then(callback).catch(() => {
            if (wait && !this.closed) {
                this.requests.push({
                    start,
                    end,
                    numBytes,
                    callback
                });
            } else callback();
        });
    }

    public async getNetBytes(start: number): Promise<{ cache: ArrayBufferLike, cacheStart: number, cacheEnd: number } | undefined> {
        return this.closed ? undefined : this.netBuffer.getAllBytes(start);
    }

    private getBytesImpl(start: number, end: number, numBytes: number): Promise<ArrayBufferLike> {
        if (this.container) return this.container.read(start, numBytes).then(bytes => {
            if (bytes === undefined) throw new Error("End of complete replay data.");
            return bytes;
        });
        return new Promise((resolve, reject) => {
            const netBytes = this.netBuffer.getBytes(start, end, numBytes);
            if (netBytes !== undefined) {
                // If we have it in our net cache, use that
                resolve(netBytes);
            } else if (this.path !== undefined) {
                const stream = fs.createReadStream(this.path, {
                    flags: "r",
                    start,
                    end
                });
                stream.on("error", reject);
                const chunks: Buffer[] = [];
                stream.on("data", (chunk: Buffer | string) => {
                    chunks.push(chunk as Buffer);
                });
                stream.on("end", () => {
                    const buffer = Buffer.concat(chunks);
                    if (buffer.byteLength === numBytes) {
                        resolve(buffer);
                    } else reject();
                    stream.close();
                });
            } else reject();
        });
    }
    public async getBytes(index: number, numBytes: number, wait: boolean = true, readAhead: number = 0): Promise<ArrayBufferLike | undefined> {
        if (this.closed) return undefined;
        if (!Number.isSafeInteger(readAhead) || readAhead < 0 || readAhead > 1024 * 1024) throw new Error("Invalid replay read-ahead size.");
        if (!wait && this.path !== undefined && readAhead > numBytes) {
            const available = (this.container?.info.rawBytes ?? this.rawInfo?.rawBytes ?? 0) - index;
            if (available >= numBytes) numBytes = Math.min(readAhead, available);
        }
        const container = this.container;
        if (container) {
            const bytes = await container.read(index, numBytes);
            if (this.closed || bytes !== undefined || !wait || container.info.complete || container.info.warning) return bytes;
        }
        const start = index;
        const end = index + numBytes - 1;
        return new Promise((resolve) => {
            this.doRequest({
                start,
                end,
                numBytes,
                callback: resolve
            }, wait);
        });
    }

}

const zipSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]); // "PK\x03\x04"
function isZipFile(filePath: string) {
    const buffer = Buffer.alloc(4);

    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);

    return buffer.equals(zipSignature);
}

export class FileManager {
    private library?: ReplayLibrary;
    private preferences?: ReplayPreferences;
    private sourcePath?: string;
    private readonly blockStores = new Map<string, ReplayBlockStore>();
    file?: File;
    readonly uuid: string;
    readonly tempPath: string;

    constructor() {
        this.uuid = randomUUID();
        this.tempPath = path.join(tmpdir(), `gtfo-replay-${this.uuid}.replay`);
    }

    private async _open(filePath?: string, progress?: (value: ReplayOpenProgress) => void) {
        const file = this.file = new File(filePath);
        try {
            progress?.({ phase: "readingDuration" });
            await file.open((loaded, total) => progress?.({ phase: "readingDuration", loaded, total }));
        } catch (error) {
            if (this.file === file) this.file = undefined;
            await file.close();
            throw error;
        }
    }

    public link(replayInstanceId: number) {
        if (this.file === undefined) return;
        this.file.link(replayInstanceId);
    }

    public async open(filePath?: string, progress?: (value: ReplayOpenProgress) => void): Promise<OpenClip | undefined> {
        this.sourcePath = filePath;
        void this.file?.close().catch(error => console.error("Replay close:", error));
        this.file = undefined;
        if (filePath && await isClip(filePath)) {
            const store = await ReplayBlockStore.create();
            const token = randomUUID();
            this.blockStores.set(token, store);
            try { return { token, ...await readClip(filePath, block => store.append(block)) }; } catch (error) { this.blockStores.delete(token); await store.close(); throw error; }
        }

        // check if file is a zip -> if it is uncompress it to temp location and open that
        if (filePath !== undefined && isZipFile(filePath)) {
            progress?.({ phase: "extracting" });
            await new Promise<void>((resolve, reject) => {
                yauzl.open(filePath, { lazyEntries: true }, (err, zipfile) => {
                    if (err) return reject(err);

                    if (zipfile.entryCount !== 1) { zipfile.close(); return reject(new Error("Compressed replays must follow the format of a single replay file in an archive.")); }

                    zipfile.on("entry", (entry) => {
                        if (!entry.fileName.endsWith('/')) {
                            // File entry (Should only be 1 file entry in zipped replay)

                            zipfile.openReadStream(entry, (err, readStream) => {
                                if (err) { zipfile.close(); return reject(err); }

                                Program.post("console.log", `Zipped replay => extracted to '${this.tempPath}'`);

                                const writeStream = fs.createWriteStream(this.tempPath);
                                let loaded = 0;
                                readStream.on("data", chunk => { loaded += chunk.length; progress?.({ phase: "extracting", loaded, total: entry.uncompressedSize }); });
                                pipeline(readStream, writeStream).then(() => {
                                    zipfile.close();
                                    return this._open(this.tempPath, progress);
                                }, error => { zipfile.close(); throw error; }).then(resolve, reject);
                            });
                        } else { zipfile.close(); reject(new Error("Archive contains a directory instead of a replay.")); }
                    });
                    zipfile.on("error", reject);

                    zipfile.readEntry();
                });
            });
        } else {
            await this._open(filePath, progress);
        }
    }

    public async dispose() {
        const results = await Promise.allSettled([
            this.preferences?.flush(), this.library?.close(),
            ...[...this.blockStores.values()].map(store => store.close()), this.file?.close()
        ]);
        this.blockStores.clear();
        this.file = undefined;
        try { await fs.promises.rm(this.tempPath, { force: true }); } catch (reason) { results.push({ status: "rejected", reason }); }
        const errors = results.filter((result): result is PromiseRejectedResult => result.status === "rejected").map(result => result.reason);
        if (errors.length) throw new AggregateError(errors, errors.map(String).join("; "));
    }

    public setupIPC(ipc: Electron.IpcMain) {
        const dialogs = new AppDialogs(ipc);
        const preferences = this.preferences = new ReplayPreferences(path.join(app.getPath("userData"), "replay-library.json"));
        const library = this.library = new ReplayLibrary(preferences);
        ipc.handle("replayLibrary", () => library.snapshot());
        ipc.handle("recordingFolders", (_, folders: string[], defaultFolder?: string) => library.configure(folders, defaultFolder));
        ipc.handle("chooseRecordingFolder", async (event) => {
            const settings = await preferences.library();
            const selected = await dialogs.request(event.sender, { kind: "folder", path: settings.defaultFolder ?? settings.lastImportFolder });
            if (!selected) return;
            await library.configure([...new Set([...settings.folders, selected])], settings.defaultFolder ?? selected);
        });
        ipc.handle("favoriteReplay", async (_, file: string, favorite: boolean) => preferences.saveFile({ path: await library.requireFile(file), favorite }));
        ipc.handle("recordReplayViewing", async (_, file: string, identity: string, duration: number) => {
            if (file !== this.sourcePath) throw new Error("Replay changed before viewing metadata was saved.");
            await preferences.saveFile({ path: file, identity, duration, viewedAt: Date.now() });
        });
        ipc.handle("revealReplay", async (_, file: string) => shell.showItemInFolder(await library.requireFile(file)));
        ipc.handle("trashReplay", async (event, file: string, labels: { title: string; message: string; cancel: string; remove: string }) => {
            file = await library.requireFile(file);
            if (file === this.sourcePath) throw new Error("Close this replay before moving it to the recycle bin.");
            const result = await dialogs.request(event.sender, { kind: "confirm", path: file, title: labels.title, message: labels.message, accept: labels.remove });
            if (result) { await shell.trashItem(file); return true; }
            return false;
        });
        ipc.handle("replayBookmarks", (_, identity: string) => preferences.bookmarks(identity));
        ipc.handle("saveReplayBookmarks", (_, identity: string, bookmarks: Bookmark[]) => preferences.saveBookmarks(identity, bookmarks));
        ipc.handle("replayCacheCreate", async () => {
            const store = await ReplayBlockStore.create();
            const token = randomUUID();
            this.blockStores.set(token, store);
            return token;
        });
        const cache = (token: string) => {
            const store = this.blockStores.get(token);
            if (!store) throw new Error("Replay cache session has expired.");
            return store;
        };
        ipc.handle("recordingDiagnostics", async (_, sessionId?: string) => {
            const source = this.sourcePath;
            if (!source) return undefined;
            const report = await readRecordingDiagnostics(source, sessionId);
            if (source !== this.sourcePath) throw new Error("Replay changed while reading diagnostics.");
            return report;
        });
        ipc.handle("exportReplayDiagnostics", async (event, report: string) => {
            if (typeof report !== "string" || Buffer.byteLength(report) > 8 * 1024 * 1024) throw new Error("Invalid diagnostic report size.");
            JSON.parse(report);
            const destination = await dialogs.request(event.sender, { kind: "save", path: "replay-diagnostics.json", extensions: ["json"] });
            if (!destination) return false;
            if (destination === this.sourcePath) throw new Error("Choose a separate file for the viewer report.");
            await fs.promises.writeFile(destination, report, "utf8");
            return true;
        });
        ipc.handle("saveReplayScreenshot", async (event, data: Uint8Array) => {
            if (!(data instanceof Uint8Array) || data.byteLength > 64 * 1024 * 1024 || !Buffer.from(data.subarray(0, 8)).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error("Invalid replay screenshot.");
            const destination = await dialogs.request(event.sender, { kind: "save", path: "replay-screenshot.png", extensions: ["png"] });
            if (!destination) return false;
            if (destination === this.sourcePath) throw new Error("Screenshot must use a different file from the open replay.");
            await fs.promises.writeFile(destination, data);
            return true;
        });
        ipc.handle("replayCacheAppend", (_, token: string, block: unknown) => cache(token).append(block));
        ipc.handle("replayCacheRead", (_, token: string, id: number) => cache(token).read(id));
        ipc.handle("replayCacheClose", async (_, token: string) => {
            const store = this.blockStores.get(token);
            this.blockStores.delete(token);
            await store?.close();
        });
        ipc.handle("chooseFile", async (event) => {
            const settings = await preferences.library();
            const selected = await dialogs.request(event.sender, { kind: "open", path: settings.defaultFolder ?? settings.lastImportFolder, extensions: ["gtfo", "zip", "gtfoclip"] });
            if (selected) await preferences.rememberImport(path.dirname(selected));
            return selected ? [selected] : [];
        });
        ipc.handle("open", async (event, file: FileHandle) => {
            let lastSent = 0;
            const result = await this.open(file.path, value => {
                const now = Date.now();
                if (value.loaded !== undefined && value.loaded !== value.total && now - lastSent < 100) return;
                lastSent = now;
                if (!event.sender.isDestroyed()) event.sender.send("replayOpenProgress", value);
            });
            if (file.path) await library.remember(file.path);
            if (!event.sender.isDestroyed()) event.sender.send("replayOpenProgress", { phase: "loadingScene" });
            return result;
        });
        ipc.on("close", () => {
            void this.file?.close().catch(error => console.error("Replay close:", error));
        });
        ipc.on("forgetReplay", () => { this.sourcePath = undefined; });
        ipc.handle("lastFile", () => {
            return this.sourcePath;
        });
        ipc.handle("replayFileInfo", async () => {
            await this.file?.container?.refresh();
            return this.file?.container?.info ?? this.file?.rawInfo;
        });

        ipc.handle("getBytes", async (_, index: number, numBytes: number, wait?: boolean, readAhead?: number) => {
            return await this.file?.getBytes(index, numBytes, wait, readAhead);
        });
        ipc.handle("getNetBytes", async (_, index: number) => {
            return await this.file?.getNetBytes(index);
        });
    }
}
