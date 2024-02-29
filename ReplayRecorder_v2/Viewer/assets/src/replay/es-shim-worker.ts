// TODO(randomuserhi): Move into mRHU => or make an API for it in RHU

export class ShimWorker {
    worker: Worker;
    
    constructor(path: string, onready: (worker: Worker) => void) {
        const importMap = document.querySelector('script[type="importmap"]')?.textContent;
        if (importMap === undefined) throw new Error("Could not start web worker as no importMap was found.");
        this.worker = new Worker("../js3party/es-module-shim-worker.js");
        this.worker.postMessage({ worker: "../replay/worker.js", importMap: importMap });
        this.worker.addEventListener("message", (e) => {
            if (e.data !== "es-module-shim-ready") return;
            onready(this.worker);
        });
    }

    public terminate() {
        this.worker.terminate();
    }
}