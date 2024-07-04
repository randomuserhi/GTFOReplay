import { CreateEvent } from "@/rhu";
import { ShimWorker } from "./es-shim-worker.js";
import { IpcInterface } from "./ipc.js";
import { ModuleLoader } from "./moduleloader.js";
import { Replay, Snapshot, Timeline } from "./replay.js";
import { FileHandle } from "./stream.js";

export class Parser {
    private current?: Replay; 
    private shim?: ShimWorker;

    private static isEventListener = function (callback: EventListenerOrEventListenerObject): callback is EventListener {
        return callback instanceof Function;
    };

    private listeners: Map<string, Map<EventListenerOrEventListenerObject, (e: CustomEvent) => void>>;
    public addEventListener: (type: string, callback: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined) => void;
    public removeEventListener: (type: string, callback: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean) => void;
    private dispatchEvent: (event: Event) => boolean;

    constructor() {
        this.listeners = new Map();
        const node = document.createTextNode("");
        const addEventListener = node.addEventListener.bind(node);
        this.addEventListener = function (type, callback, options) {
            if (!this.listeners.has(type)) this.listeners.set(type, new Map());
            const collection = this.listeners.get(type)!;
            if (collection.has(callback)) return;
            const context = this;
            if (Parser.isEventListener(callback)) {
                const cb = (e: CustomEvent) => { callback.call(context, e.detail); };
                collection.set(callback, cb);
                addEventListener(type, cb, options);
            } else {
                const cb = (e: CustomEvent) => { callback.handleEvent.call(context, e.detail); };
                collection.set(callback, cb);
                addEventListener(type, cb, options);
            }
        };
        this.removeEventListener = node.removeEventListener.bind(node);
        this.dispatchEvent = node.dispatchEvent.bind(node);
    }

    public parse(file: FileHandle) {
        if (this.current !== undefined) return this.current;
        if (this.shim !== undefined) this.terminate();
        const replay = this.current = new Replay();

        // Setup worker and communication
        this.shim = new ShimWorker("../replay/worker.js", (worker) => {
            const _addEventListener = Worker.prototype.addEventListener.bind(worker);
            const ipc = new IpcInterface({
                on: (callback) => _addEventListener("message", (e: MessageEvent) => { callback(e.data); }),
                send: worker.postMessage.bind(worker)
            });
            ipc.resp("open", async (...args: any[]) => {
                await window.api.invoke("open", ...args);
                return {};
            });
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
            ipc.resp("getAllBytes", async (...args: any[]) => {
                const buffer: Uint8Array | undefined = await window.api.invoke("getAllBytes", ...args);
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

            // Events
            ipc.on("eoh", (typemap, types, header) => {
                replay.typemap = typemap;
                replay.types = types;
                replay.header = header;
                this.dispatchEvent(CreateEvent("eoh", undefined));
            });
            ipc.on("snapshot", (snapshot: Timeline.Snapshot) => {
                replay.timeline.push(snapshot);
                this.dispatchEvent(CreateEvent("snapshot", undefined));
            });
            ipc.on("state", (state: Snapshot) => {
                replay.snapshots.push(state);
            });
            ipc.on("end", () => {
                this.dispatchEvent(CreateEvent("end", undefined));
            });

            // Start parsing
            ipc.send("init", file, [...ModuleLoader.links.values()], document.baseURI);
        });
        const importMap = document.querySelector('script[type="importmap"]')?.textContent;
        if (importMap === undefined) throw new Error("Could not start web worker as no importMap was found.");
        
        return replay;
    }

    public terminate() {
        if (this.shim !== undefined) {
            this.shim.terminate();
            window.api.send("close");
        }
    }
}