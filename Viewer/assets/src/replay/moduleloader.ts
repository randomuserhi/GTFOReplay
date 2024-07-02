import { Renderer, RendererApi } from "./renderer.js";
import { ByteStream } from "./stream.js";

export declare namespace Typemap {
    interface Headers {
    }
    type HeaderNames = keyof Headers;

    interface Events {
    }
    type EventNames = keyof Events;

    interface Dynamics {
    }
    type DynamicNames = keyof Dynamics;
    type AllNames = HeaderNames | EventNames | DynamicNames;

    interface Data {

    }
    type DataNames = keyof Data;

    interface RenderData {
    }
    type RenderDataNames = keyof RenderData;

    interface RenderPasses {
    }
    type RenderPassNames = keyof RenderPasses;
}

export interface ModuleDesc<T extends Typemap.AllNames | string & {} = string> {
    typename: T;
    version: string;
}

export interface ReplayApi {
    time(): number;
    tick(): number;
    getOrDefault<T extends keyof Typemap.Data>(typename: T, def: () => Typemap.Data[T]): Typemap.Data[T];
    get<T extends keyof Typemap.Data>(typename: T): Typemap.Data[T] | undefined;
    set<T extends keyof Typemap.Data>(typename: T, value: Typemap.Data[T]): void;
    has<T extends keyof Typemap.Data>(typename: T): boolean;
    header: HeaderApi;
}

export interface HeaderApi {
    getOrDefault<T extends keyof Typemap.Headers>(typename: T, def: () => Typemap.Headers[T]): Typemap.Headers[T];
    get<T extends keyof Typemap.Headers>(typename: T): Typemap.Headers[T] | undefined;
    set<T extends keyof Typemap.Headers>(typename: T, value: Typemap.Headers[T]): void;
    has<T extends keyof Typemap.Headers>(typename: T): boolean;
}

export interface DynamicParser<T extends Typemap.DynamicNames> {
    parse(bytes: ByteStream, snapshot: ReplayApi): Promise<Typemap.Dynamics[T]["parse"]>;
    exec(id: number, data: Typemap.Dynamics[T]["parse"], snapshot: ReplayApi, lerp: number): void;
}
export interface DynamicSpawner<T extends Typemap.DynamicNames> {
    parse(bytes: ByteStream, snapshot: ReplayApi): Promise<Typemap.Dynamics[T]["spawn"]>;
    exec(id: number, data: Typemap.Dynamics[T]["spawn"], snapshot: ReplayApi): void;
}
export interface DynamicDespawner<T extends Typemap.DynamicNames> {
    parse(bytes: ByteStream, snapshot: ReplayApi): Promise<Typemap.Dynamics[T]["despawn"]>;
    exec(id: number, data: Typemap.Dynamics[T]["despawn"], snapshot: ReplayApi): void;
}

export interface EventParser<T extends Typemap.EventNames> {
    parse(bytes: ByteStream, snapshot: ReplayApi): Promise<Typemap.Events[T]>;
    exec(data: Typemap.Events[T], snapshot: ReplayApi): void;
}
export interface HeaderParser {
    parse(bytes: ByteStream, header: ReplayApi["header"]): Promise<void>;
}

export namespace ModuleLoader {
    interface HeaderModule extends HeaderParser { 
    }
    interface EventModule<T extends Typemap.EventNames = never> extends EventParser<T> {
    }
    export interface DynamicModule<T extends Typemap.DynamicNames = never> { 
        main: DynamicParser<T>;
        spawn: DynamicSpawner<T>;
        despawn: DynamicDespawner<T>;
    }
    type RenderModule = (name: string, renderer: RendererApi) => void;

    type ModuleLibrary<T> = Map<string, Map<string, T>>;

    export const links = new Set<string>();
    export const library: {
        header: ModuleLibrary<HeaderModule>
        event: ModuleLibrary<EventModule>
        dynamic: ModuleLibrary<DynamicModule>
        render: Map<string, RenderModule>
        tick: Set<(snapshot: ReplayApi) => void>
        dispose: Set<(renderer: Renderer) => void>
    } = {
        header: new Map(),
        event: new Map(),
        dynamic: new Map(),
        render: new Map(),
        tick: new Set(),
        dispose: new Set(),
    };

    export function getHeader<T extends Typemap.HeaderNames>({ typename, version }: ModuleDesc<T>): HeaderModule {
        const result = library.header.get(typename as string)?.get(version);
        if (result === undefined) throw new ModuleNotFound(`No module of type '${typename}(${version})' was found.`);
        return result;
    }
    export function getEvent<T extends Typemap.EventNames>({ typename, version }: ModuleDesc<T>): EventModule {
        const result = library.event.get(typename as string)?.get(version);
        if (result === undefined) throw new ModuleNotFound(`No module of type '${typename}(${version})' was found.`);
        return result;
    }
    export function getDynamic<T extends Typemap.DynamicNames>({ typename, version }: ModuleDesc<T>): DynamicModule {
        const result = library.dynamic.get(typename as string)?.get(version);
        if (result === undefined) throw new ModuleNotFound(`No module of type '${typename}(${version})' was found.`);
        return result;
    }

    export function registerHeader<T extends Typemap.HeaderNames>(typename: T, version: string, parser: HeaderModule) {
        if (!library.header.has(typename as string)) {
            library.header.set(typename as string, new Map());
        }
        library.header.get(typename as string)!.set(version, parser);
        return parser;
    }
    export function registerEvent<T extends Typemap.EventNames>(typename: T, version: string, parser: EventModule<T>) {
        if (!library.event.has(typename as string)) {
            library.event.set(typename as string, new Map());
        }
        library.event.get(typename as string)!.set(version, parser as any);
        return parser;
    }
    export function registerDynamic<T extends Typemap.DynamicNames>(typename: T, version: string, parser: DynamicModule<T>) {
        if (!library.dynamic.has(typename as string)) {
            library.dynamic.set(typename as string, new Map());
        }
        library.dynamic.get(typename as string)!.set(version, parser as any);
        return parser;
    }

    export function registerRender<T extends Typemap.RenderPassNames>(name: T, func: RenderModule) {
        library.render.set(name, func);
    }

    export function registerTick(func: (snapshot: ReplayApi) => void) {
        library.tick.add(func);
    }

    export function registerDispose(func: (renderer: Renderer) => void) {
        library.dispose.add(func);
    }

    export function registerScriptModule(path: string) {
        links.add(path);
    }
}

export class NoExecFunc extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class UnknownModuleType extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class ModuleNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}