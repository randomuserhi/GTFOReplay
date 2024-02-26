/* exported ParseFunc */
type ParseFunc = (data: ByteStream, ...args: any[]) => Promise<any>; // TODO(randomuserhi): Typescript templates for header and snapshot parse funcs
/* exported ExecFunc */
type ExecFunc = (data: any, snapshot: Partial<Replay.Snapshot>, lerp: number) => void; // TODO(randomuserhi): Typescript templates for header and snapshot parse funcs

/* exported Parser */
class Parser {
    readonly path: string;
    private current?: Replay; 
    private worker?: Worker;

    constructor(path: string) {
        this.path = path;
    }

    public parse() {
        if (this.current !== undefined) return this.current;
        if (this.worker !== undefined) this.worker.terminate();
        const replay = this.current = new Replay();

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

        ipc.send("init", this.path, [...ModuleLoader.links.keys()]);

        return replay;
    }

    public terminate() {
        if (this.worker !== undefined) this.worker.terminate();
    }
}

/* exported InvalidWorkerEvent */
class InvalidWorkerEvent extends Error {
    constructor(message: string) {
        super(message);
    }
}

/* exported NoExecFunc */
class NoExecFunc extends Error {
    constructor(message?: string) {
        super(message);
    }
}

/* exported UnknownModuleType */
class UnknownModuleType extends Error {
    constructor(message?: string) {
        super(message);
    }
}

/* exported ModuleVersionNotFound */
class ModuleNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}