interface Module { 
    typename: string; 
    version: string;
}

/* exported ModuleLoader */
namespace ModuleLoader {
    export interface ModuleFunc<T = unknown, R = any> { 
        parse: ParseFunc<R>;
        exec?: T extends keyof ReplayRecorder.Dynamics 
            ? (id: number, data: ReplayRecorder.Dynamics[T], snapshot: Snapshot.API, lerp: number) => void
            : T extends keyof ReplayRecorder.Events 
                ? (data: ReplayRecorder.Events[T], snapshot: Snapshot.API) => void
                : (...args: any[]) => void;
    }
    export interface SpawnModuleFunc<T = unknown, R = any> { 
        parse: ParseFunc<R>;
        exec?: T extends keyof ReplayRecorder.Spawn
            ? (id: number, data: ReplayRecorder.Spawn[T], snapshot: Snapshot.API, lerp: number) => void
            : (...args: any[]) => void;
    }
    export interface DespawnModuleFunc<T = unknown, R = any> { 
        parse: ParseFunc<R>;
        exec?: T extends keyof ReplayRecorder.Despawn 
            ? (id: number, data: ReplayRecorder.Despawn[T], snapshot: Snapshot.API, lerp: number) => void
            : (...args: any[]) => void;
    }

    export const links = new Map<string, Module[]>();
    export const library: Map<string, Map<string, { main: ModuleFunc, spawn?: ModuleFunc, despawn?: ModuleFunc }>> = new Map();

    export function getParseFunc(module: Module): ParseFunc {
        const func = library.get(module.typename)?.get(module.version)?.main.parse;
        if (func === undefined) throw new ModuleNotFound(`Could not find parser for ${module.typename}(${module.version})`);
        return func;
    }

    export function getExecFunc(module: Module): ExecFunc {
        const func = library.get(module.typename)?.get(module.version)?.main.exec;
        if (func === undefined) throw new ModuleNotFound(`Could not find exec function for ${module.typename}(${module.version})`);
        return func;
    }

    export function get(module: Module): { main: ModuleFunc, spawn?: ModuleFunc, despawn?: ModuleFunc } | undefined {
        return library.get(module.typename)?.get(module.version);
    }

    interface ModuleRetTypes extends ReplayRecorder.Headers, ReplayRecorder.Dynamics, ReplayRecorder.Events {}
    type ModuleTypename = keyof ModuleRetTypes;
    // TODO(randomuserhi): console message / warning when replacing or updating an existing type
    export function register<T extends ModuleTypename>(typename: T, version: string, main: ModuleFunc<T, ModuleRetTypes[T]>, spawn?: SpawnModuleFunc<T, T extends keyof ReplayRecorder.Spawn ? ReplayRecorder.Spawn[T] : unknown>, despawn?: DespawnModuleFunc<T, T extends keyof ReplayRecorder.Despawn ? ReplayRecorder.Despawn[T] : unknown>) {
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

        if (!library.has(typename)) {
            library.set(typename, new Map());
        }
        library.get(typename)!.set(version, {
            main,
            spawn,
            despawn
        });
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
                library.get(typename)?.delete(version);
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