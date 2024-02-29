declare namespace Typemap {
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

    interface Buffers {

    }
    type BufferNames = keyof Buffers;

    interface Data {

    }
    type DataNames = keyof Data;
}

interface ModuleDesc<T extends Typemap.AllNames | string & {} = string> {
    typename: T;
    version: string;
}

interface DynamicParser<T extends Typemap.DynamicNames> {
    parse(bytes: ByteStream): Promise<Typemap.Dynamics[T]["parse"]>;
    exec(id: number, data: Typemap.Dynamics[T]["parse"], snapshot: Replay.Api, lerp: number): void;
}
interface DynamicSpawner<T extends Typemap.DynamicNames> {
    parse(bytes: ByteStream): Promise<Typemap.Dynamics[T]["spawn"]>;
    exec(id: number, data: Typemap.Dynamics[T]["spawn"], snapshot: Replay.Api): void;
}
interface DynamicDespawner<T extends Typemap.DynamicNames> {
    parse(bytes: ByteStream): Promise<Typemap.Dynamics[T]["despawn"]>;
    exec(id: number, data: Typemap.Dynamics[T]["despawn"], snapshot: Replay.Api): void;
}

interface EventParser<T extends Typemap.EventNames> {
    parse(bytes: ByteStream): Promise<Typemap.Events[T]>;
    exec(data: Typemap.Events[T], snapshot: Replay.Api): void;
}
interface HeaderParser {
    parse(bytes: ByteStream, header: Replay.Api["header"]): Promise<void>;
}

/* exported ModuleLoader */
namespace ModuleLoader {
    interface HeaderModule extends HeaderParser { 
    }
    interface EventModule<T extends Typemap.EventNames = never> extends EventParser<T> {
    }
    interface DynamicModule<T extends Typemap.DynamicNames = never> { 
        main: DynamicParser<T>;
        spawn: DynamicSpawner<T>;
        despawn: DynamicDespawner<T>;
    }

    type ModuleLibrary<T> = Map<string, Map<string, T>>;

    export const links = new Map<string, ModuleDesc[]>();
    export const library: {
        header: ModuleLibrary<HeaderModule>
        event: ModuleLibrary<EventModule>
        dynamic: ModuleLibrary<DynamicModule>
    } = {
        header: new Map(),
        event: new Map(),
        dynamic: new Map()
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
        link(typename as string, version);

        if (!library.header.has(typename as string)) {
            library.header.set(typename as string, new Map());
        }
        library.header.get(typename as string)!.set(version, parser);
    }
    export function registerEvent<T extends Typemap.EventNames>(typename: T, version: string, parser: EventModule<T>) {
        link(typename as string, version);

        if (!library.event.has(typename as string)) {
            library.event.set(typename as string, new Map());
        }
        library.event.get(typename as string)!.set(version, parser);
    }
    export function registerDynamic<T extends Typemap.DynamicNames>(typename: T, version: string, parser: DynamicModule<T>) {
        link(typename as string, version);

        if (!library.dynamic.has(typename as string)) {
            library.dynamic.set(typename as string, new Map());
        }
        library.dynamic.get(typename as string)!.set(version, parser as any);
    }

    export function link(typename: string, version: string) {
        if (self.document !== undefined) {
            const link = self.document.currentScript?.getAttribute("src");
            if (link == null) {
                console.warn(`Unable to link parser for type '${typename}(${version})'.`);
                return;
            }
            if (!links.has(link)) {
                links.set(link, []);
            }
            links.get(link)!.push({ typename, version });
        }
    }

    export function loadModule(path: string) {
        const script = document.createElement("script");
        script.addEventListener("load", () => {
            script.replaceWith();
        });
        script.addEventListener("error", () => {
            script.replaceWith();
        });
        script.src = path;
        document.head.append(script);
    }

    export function unlinkModule(path: string) {
        if (links.has(path)) {
            const modules = links.get(path)!;
            for (const { typename, version } of modules) {
                library.header.get(typename)?.delete(version);
                library.event.get(typename)?.delete(version);
                library.dynamic.get(typename)?.delete(version);
            }
            links.delete(path);
        }
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

/* exported ModuleNotFound */
class ModuleNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}