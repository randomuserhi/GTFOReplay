import { ShimWorker } from "./es-shim-worker.js";
import { IpcInterface } from "./ipc.js";
import { ModuleLoader } from "./moduleloader.js";
import { Replay, ReplayBlock } from "./replay.js";
import { FileHandle } from "./stream.js";
import type { IndexedEvent } from "../main/interface.js";

export class Parser {
    private current?: Replay; 
    private shim?: ShimWorker;
    private cacheToken?: string;

    private readonly events = new EventTarget();
    private readonly listeners = new Map<string, Map<EventListenerOrEventListenerObject, EventListener>>();

    public addEventListener(type: string, callback: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
        const capture = typeof options === "boolean" ? options : options?.capture ?? false;
        const key = `${type}:${capture}`;
        let collection = this.listeners.get(key);
        if (!collection) this.listeners.set(key, collection = new Map());
        if (collection.has(callback) || (typeof options === "object" && options.signal?.aborted)) return;
        const wrapped: EventListener = event => {
            if (typeof options === "object" && options.once) this.removeEventListener(type, callback, capture);
            const detail = (event as CustomEvent).detail;
            if (typeof callback === "function") callback.call(this, detail);
            else callback.handleEvent(detail);
        };
        collection.set(callback, wrapped);
        this.events.addEventListener(type, wrapped, options);
        if (typeof options === "object") options.signal?.addEventListener("abort", () => this.removeEventListener(type, callback, capture), { once: true });
    }

    public removeEventListener(type: string, callback: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) {
        const capture = typeof options === "boolean" ? options : options?.capture ?? false;
        const collection = this.listeners.get(`${type}:${capture}`);
        const wrapped = collection?.get(callback);
        if (wrapped) this.events.removeEventListener(type, wrapped, capture);
        collection?.delete(callback);
    }

    private dispatchEvent(event: Event) { return this.events.dispatchEvent(event); }

    public parse(file: FileHandle) {
        if (this.current !== undefined) return this.current;
        if (this.shim !== undefined) this.terminate();
        const replay = this.current = new Replay();
        const fail = (err: { message: string; verbose: string; type?: "warning" | "error" }) => {
            if (this.current !== replay) return;
            if (err.type !== "warning") replay.error = new Error(err.message);
            this.dispatchEvent(new CustomEvent("error", { detail: err }));
        };
        if (file.path) replay.identity = `file:${file.path}`;

        // Setup worker and communication
        this.shim = new ShimWorker("../replay/worker.js", (worker) => {
            if (this.current !== replay) return;
            const _addEventListener = Worker.prototype.addEventListener.bind(worker);
            const ipc = new IpcInterface({
                on: (callback) => _addEventListener("message", (e: MessageEvent) => { if (this.current === replay) callback(e.data); }),
                send: worker.postMessage.bind(worker)
            });
            // Player owns opening the file. Reopening here also erased a live stream
            // that GTFOManager had already linked to its recording instance.
            ipc.resp("open", async () => ({}));
            ipc.on("close", (...args: any[]) => window.api.send("close", ...args));
            ipc.resp("getBytes", async (...args: any[]) => {
                const buffer: Uint8Array | undefined = await window.api.invoke("getBytes", ...args);
                return {
                    data: buffer,
                    args: [{
                        transfer: buffer === undefined ? undefined : [
                            buffer.buffer
                        ]
                    }]
                };
            });
            ipc.resp("getNetBytes", async (...args: any[]) => {
                const result: { cache: Uint8Array, cacheStart: number, cacheEnd: number } | undefined = await window.api.invoke("getNetBytes", ...args);
                return {
                    data: result,
                    args: [{
                        transfer: result === undefined ? undefined : [
                            result.cache.buffer
                        ]
                    }]
                };
            });
            ipc.resp("storeBlock", async (block: ReplayBlock) => ({
                data: await window.api.invoke("replayCacheAppend", this.cacheToken, block)
            }));

            // Events
            ipc.on("index", (events: IndexedEvent[]) => { replay.events = [...replay.events, ...events]; });
            ipc.on("eoh", (typemap, types, header) => {
                replay.typemap = typemap;
                replay.types = types;
                // NOTE(randomuserhi): Has to loop such that watch events work
                for (const [key, value] of header) {
                    replay.set(key, value);
                }
                const session = header.get("ReplayRecorder.Session");
                if (typeof session?.id === "string") replay.identity = `session:${session.id}`;
                this.dispatchEvent(new CustomEvent("eoh"));
            });
            ipc.on("preview", (block: ReplayBlock) => {
                replay.preview = block;
                this.dispatchEvent(new CustomEvent("snapshot"));
            });
            ipc.on("block", (block: { id: number; start: number; end: number }) => {
                replay.blocks.push(block);
                replay.preview = undefined;
                this.dispatchEvent(new CustomEvent("snapshot"));
            });
            ipc.on("end", () => {
                replay.complete = true;
                this.dispatchEvent(new CustomEvent("end"));
            });
            ipc.on("error", (err: { message: string, verbose: string }) => {
                fail(err);
            });

            // Start parsing
            void window.api.invoke("replayCacheCreate").then((token: string) => {
                if (this.current !== replay) {
                    void window.api.invoke("replayCacheClose", token).catch(console.error);
                    return;
                }
                this.cacheToken = token;
                replay.cacheToken = token;
                replay.loadBlock = id => window.api.invoke("replayCacheRead", token, id);
                ipc.send("init", file, [...ModuleLoader.links.values()], document.baseURI);
            }).catch((error: unknown) => fail({ message: String(error), verbose: String(error) }));
        });
        this.shim.worker.addEventListener("error", event => fail({ message: event.message || "Replay worker failed.", verbose: `${event.filename}:${event.lineno} ${event.message}` }));
        this.shim.worker.addEventListener("messageerror", () => fail({ message: "Replay worker message could not be decoded.", verbose: "Replay worker message could not be decoded." }));
        
        return replay;
    }

    public terminate() {
        this.current = undefined;
        if (this.cacheToken) void window.api.invoke("replayCacheClose", this.cacheToken).catch(console.error);
        this.cacheToken = undefined;
        if (this.shim !== undefined) {
            this.shim.terminate();
            this.shim = undefined;
            window.api.send("close");
        }
    }
}
