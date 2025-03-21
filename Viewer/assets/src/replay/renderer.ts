import { signal, Signal } from "@/rhu/signal.js";
import { Scene, WebGLRenderer } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { DynamicInstanceManager } from "./instancing.js";
import { HeaderApi, ModuleLoader, ReplayApi, Typemap } from "./moduleloader.js";
import { Replay } from "./replay.js";
import { ASL_VM } from "./vm.js";

export interface RendererApi {
    getRenderLoop(): RenderPass[];
    setRenderLoop(loop: RenderPass[]): void;

    getInitPasses(): InitPass[];
    setInitPasses(loop: InitPass[]): void;

    setAfter<T extends Typemap.RenderPassNames>(target: T, pass: Pass, passes: Pass[]): Pass[];
    setBefore<T extends Typemap.RenderPassNames>(target: T, pass: Pass, passes: Pass[]): Pass[];
}

interface Pass<T extends Typemap.RenderPassNames | unknown = unknown> {
    name: T;
}

export interface InitPass<T extends Typemap.RenderPassNames | unknown = unknown> extends Pass<T> {
    pass: (renderer: Renderer, header: HeaderApi) => void;
}

export interface RenderPass<T extends Typemap.RenderPassNames | unknown = unknown> extends Pass<T> {
    pass: (renderer: Renderer, snapshot: ReplayApi, dt: number) => void;
}

interface RendererEventMap {
    "resize": { 
        width: number;
        height: number;
    };

    "pre-refresh": void;
    "post-refresh": void;
}

export class Renderer {
    canvas: HTMLCanvasElement;

    renderer: WebGLRenderer;
    scene: Scene;
    composer: EffectComposer;

    renderLoop: RenderPass[];
    initPasses: InitPass[];

    private data: Map<string, unknown>;
    private signals: Map<string, Signal<any>>;

    constructor(canvas: HTMLCanvasElement) {
        this.data = new Map();
        this.signals = new Map();

        this.canvas = canvas;

        this.scene = new Scene();
        this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.composer = new EffectComposer(this.renderer);

        this.listeners = new Map();
        const node = document.createTextNode("");
        const addEventListener = node.addEventListener.bind(node);
        this.addEventListener = function (type, callback: (...args: any[]) => void, options) {
            if (!this.listeners.has(type)) this.listeners.set(type, new Map());
            const collection = this.listeners.get(type)!;
            if (collection.has(callback)) return;
            const context = this;
            if (Renderer.isEventListener(callback)) {
                const cb = (e: CustomEvent) => { callback.call(context, e.detail); };
                collection.set(callback, cb);
                addEventListener(type, cb, options);
            } else {
                const cb = (e: CustomEvent) => { (callback as any).handleEvent.call(context, e.detail); };
                collection.set(callback, cb);
                addEventListener(type, cb, options);
            }
        };
        this.removeEventListener = node.removeEventListener.bind(node);
        this.dispatchEvent = node.dispatchEvent.bind(node);
    }

    public refresh(canvas?: HTMLCanvasElement, replay?: Replay) {
        if (canvas !== undefined) {
            this.canvas = canvas;
        }

        this.renderer?.dispose();
        this.composer?.dispose();
        
        this.scene = new Scene();
        this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.composer = new EffectComposer(this.renderer);

        this.dispatchEvent(new CustomEvent("pre-refresh"));

        if (replay !== undefined) {
            this.init(replay);
        }

        this.dispatchEvent(new CustomEvent("post-refresh"));
    }

    private static isEventListener = function (callback: EventListenerOrEventListenerObject): callback is EventListener {
        return callback instanceof Function;
    };

    private listeners: Map<string, Map<EventListenerOrEventListenerObject, (e: CustomEvent) => void>>;
    public addEventListener: <T extends keyof RendererEventMap>(type: T, callback: (data: T extends keyof RendererEventMap ? RendererEventMap[T] : unknown) => void, options?: boolean | AddEventListenerOptions | undefined) => void;
    public removeEventListener: <T extends keyof RendererEventMap>(type: T, callback: (data: T extends keyof RendererEventMap ? RendererEventMap[T] : unknown) => void, options?: EventListenerOptions | boolean) => void;
    private dispatchEvent: (event: Event) => boolean;

    public getOrDefault<T extends keyof Typemap.RenderData>(typename: T, def: () => Typemap.RenderData[T]): Typemap.RenderData[T] {
        if (typename as string === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
        if (!this.data.has(typename)) this.set(typename, def() as any);
        return this.data.get(typename) as any;
    }
    public get<T extends keyof Typemap.RenderData>(typename: T): (T extends keyof Typemap.RenderData ? Typemap.RenderData[T] : any) | undefined {
        if (typename as string === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
        return this.data.get(typename) as any;
    }
    public set<T extends keyof Typemap.RenderData>(typename: T, value: (T extends keyof Typemap.RenderData ? Typemap.RenderData[T] : any)): void {
        if (typename as string === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
        this.data.set(typename, value);
        if (this.signals.has(typename)) {
            this.signals.get(typename)!(value);
        }
    }
    public has<T extends keyof Typemap.RenderData>(typename: T): boolean{
        if (typename as string === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
        return this.data.has(typename);
    }
    public watch<T extends keyof Typemap.RenderData>(typename: T): Signal<(T extends keyof Typemap.RenderData ? Typemap.RenderData[T] : any) | undefined> {
        if (typename as string === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
        if (!this.signals.has(typename)) {
            this.signals.set(typename, signal(this.get(typename)));
        }
        return this.signals.get(typename)!;
    }

    private loadModules() {
        const api = this.api();
        for (const [name, module] of ModuleLoader.library.render) {
            module(name, api); 
        }
    }

    public api(): RendererApi {
        return {
            getRenderLoop: () => this.renderLoop,
            setRenderLoop: (loop: RenderPass[]) => this.renderLoop = loop,

            getInitPasses: () => this.initPasses,
            setInitPasses: (loop: InitPass[]) => this.initPasses = loop,

            // NOTE(randomuserhi): These only apply to current order -> this means that you need to ensure the
            //                     target pass is already loaded. This can be guaranteed by loading it prior
            //                     in the same file / register call.
            setAfter: (target, pass, passes) => {
                const index = passes.findIndex(p => p.name === target);
                if (index === -1) throw new Error(`Target, '${target}', was not found.`);
                return [...passes.slice(0, index), pass, ...passes.slice(index)];
            },
            setBefore: (target, pass, passes) => {
                let index = passes.findIndex(p => p.name === target);
                if (index === -1) throw new Error(`Target, '${target}', was not found.`);
                index -= 1;
                return [...passes.slice(0, index), pass, ...passes.slice(index)];
            }
        };
    }

    public init(replay: Replay) {
        this.dispose();

        this.renderLoop = [];
        this.initPasses = [];
        this.loadModules();

        this.data.clear();
        this.scene.clear();
        this.composer.dispose();
        this.composer = new EffectComposer(this.renderer);

        const header: HeaderApi = {
            getOrDefault: Replay.prototype.getOrDefault.bind(replay),
            get: Replay.prototype.get.bind(replay),
            set: Replay.prototype.set.bind(replay),
            has: Replay.prototype.has.bind(replay),
        };
        for (const func of this.initPasses.values()) {
            try {
                func.pass(this, header);
            } catch (e) {
                console.error(`An error occured executing render init pass '${func.name}':\n\n${ASL_VM.verboseError(e)}`);
            }
        }
    }

    public render(dt: number, snapshot: ReplayApi) {
        for (const manager of DynamicInstanceManager.all) {
            manager.mesh.count = 0;
            this.scene.add(manager.mesh);
        }
        for (const func of this.renderLoop.values()) {
            try {
                func.pass(this, snapshot, dt);
            } catch (e) {
                console.error(`An error occured executing render pass '${func.name}':\n\n${ASL_VM.verboseError(e)}`);
            }
        }
        for (const manager of DynamicInstanceManager.all) {
            manager.mesh.instanceMatrix.needsUpdate = true;
            if (manager.mesh.instanceColor !== null) manager.mesh.instanceColor.needsUpdate = true;
        }
        this.composer.render();
    }

    public resize(width: number, height: number) {
        this.dispatchEvent(new CustomEvent("resize", { detail: { width, height } }));
        this.renderer.setSize(width, height, false);
        this.composer.setSize(width, height);
    }

    public dispose() {
        for (const dispose of ModuleLoader.library.dispose) {
            dispose(this);
        }
    }
}