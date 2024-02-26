/* exported ParseFunc */
type ParseFunc = (data: ByteStream, ...args: any[]) => Promise<any>; // TODO(randomuserhi): Typescript templates for header and snapshot parse funcs
/* exported ExecFunc */
type ExecFunc = (data: any, snapshot: Partial<Replay.Snapshot>, lerp: number) => void; // TODO(randomuserhi): Typescript templates for header and snapshot parse funcs

/* exported Parser */
class Parser {
    readonly path: string;
    private current?: Replay; 
    private worker?: Worker;

    private static isEventListener = function (callback: EventListenerOrEventListenerObject): callback is EventListener {
        return callback instanceof Function;
    };

    private listeners: Map<string, Map<EventListenerOrEventListenerObject, (e: CustomEvent) => void>>;
    public addEventListener: (type: string, callback: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined) => void;
    public removeEventListener: (type: string, callback: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean) => void;
    private dispatchEvent: (event: Event) => boolean;

    constructor(path: string) {
        this.path = path;

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

    public parse(finite: boolean = true) {
        if (this.current !== undefined) return this.current;
        if (this.worker !== undefined) this.terminate();
        const replay = this.current = new Replay();

        // Setup worker and communication
        this.worker = new Worker("../replay/worker.js");
        const _addEventListener = this.worker.addEventListener.bind(this.worker);
        const ipc = new IpcInterface({
            on: (callback) => _addEventListener("message", (e: MessageEvent) => { callback(e.data); }),
            send: this.worker.postMessage.bind(this.worker)
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

        // Events
        ipc.on("eoh", (header) => {
            replay.header = header;
            this.dispatchEvent(RHU.CustomEvent("eoh", undefined));
        });

        // Start parsing
        ipc.send("init", this.path, [...ModuleLoader.links.keys()], finite);
        return replay;
    }

    public terminate() {
        if (this.worker !== undefined) {
            this.worker.terminate();
            window.api.send("close", this.path);
        }
    }
}

/* exported InvalidWorkerEvent */
class InvalidWorkerEvent extends Error {
    constructor(message: string) {
        super(message);
    }
}