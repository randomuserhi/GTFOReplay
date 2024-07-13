import { Rest } from "@/rhu/rest.js";

// TODO(randomuserhi): Documentation & Refactor => code is a mess
// NOTE(randomuserhi): ExecutionContext vs Module isReady
//                     - ExecutionContext refers to when the entire module has executed (all code has run)
//                     - Module isReady refers to when its exports are safe to use (no more to be added or changed)

function isASLModuleError(e: Error): e is _ASLModuleError {
    return Object.prototype.isPrototypeOf.call(_ASLModuleError.prototype, e);
}
class _ASLModuleError extends Error {
    constructor(message?: string, e?: Error) {
        super(`${message}\n\t${e !== undefined ? e.toString().split("\n").join("\n\t") : ""}`);
    }
}

export interface ASLModule {
    readonly src: string;
    readonly isReady: boolean;
    destructor?: () => void;
    ready(): void;
    exports: Record<PropertyKey, any>;
    readonly baseURI: string | undefined;
    manual: boolean;
}

type ASLExec = (require: Require, module: ASLModule, exports: Record<PropertyKey, any>) => Promise<void>;
class _ASLModule implements ASLModule, Exports {
    readonly src: string;
    exec?: ASLExec;
    executionContext?: Promise<void>;
    terminate?: () => void;
    
    isReady: boolean = false;
    destructed: boolean = false;
    manual: boolean = false;

    private _exports: Record<PropertyKey, any> = {};
    private proxy: Record<PropertyKey, any> = new Proxy(this, {
        set(module, prop, newValue, receiver) {
            if (module.isReady) module.raise(new Error(`You cannot add exports once a module has loaded.`));
            return Reflect.set(module._exports, prop, newValue, receiver);
        }
    });
    get exports() {
        return this.proxy;
    }
    set exports(value) {
        this._exports = value;
    }

    destructor?: () => void;

    public destruct() {
        if (this.destructor !== undefined) this.destructor();
        this.destructed = true;
        
        if (this.terminate !== undefined) this.terminate();
    }

    constructor(url: string, exec?: ASLExec) {
        this.src = url;
        this.exec = exec;
    }
    
    public ready() {
        AsyncScriptCache.finalize(this);
    }

    public raise(e: Error) {
        if (isASLModuleError(e)) throw e;
        else throw new _ASLModuleError(`[${this.src}]:`, e);
    }

    _archetype: Archetype = AsyncScriptCache.archetype;
    set archetype(value: Archetype) {
        value.add(this);
    }
    get archetype() {
        return this._archetype;
    }

    get baseURI() {
        return AsyncScriptLoader.baseURI;
    }
}

// Represents module dependencies
class Archetype {
    static all: Archetype[] = [];
    static allMap = new Map<string, Archetype>();
    static typemap: Archetype[][] = []; // Maps a type to all archetypes that contain said type

    type: number[]; // The dependencies for the given modules in this archetype
    modules: Map<string, _ASLModule> = new Map();
    addMap: Map<number, Archetype> = new Map(); // Map to traverse to move to other archetypes as dependencies are added

    constructor(type: number[] = []) {
        this.type = type;

        Archetype.all.push(this);
        Archetype.allMap.set(this.type.join(","), this);
        for (const t of type) {
            if (Archetype.typemap[t] === undefined) {
                Archetype.typemap[t] = [];
            }
            Archetype.typemap[t].push(this);
        }
    }

    public add(module: _ASLModule) {
        module._archetype.modules.delete(module.src);
        this.modules.set(module.src, module);
        module._archetype = this;
    }

    public static traverse(module: _ASLModule, path: string) {
        const archetype = module.archetype;

        const type = AsyncScriptCache.getType(path);
        if (!archetype.addMap.has(type)) {
            const typelist = [...archetype.type, type].sort();
            let newArchetype = this.allMap.get(typelist.join(","));
            if (newArchetype === undefined) {
                newArchetype = new Archetype(typelist);
            }
            archetype.addMap.set(type, newArchetype);
        }
        archetype.addMap.get(type)!.add(module);
    }
}

export namespace AsyncScriptCache {
    const _cache = new Map<string, _ASLModule>();

    export let archetype: Archetype = new Archetype();

    let _type: number = 0;
    const typemap = new Map<string, number>();
    export function getType(path: string) {
        if (!typemap.has(path)) throw new Error(`Type '${path}' does not exist.`);
        return typemap.get(path)!;
    }

    export function cache(module: _ASLModule) {
        const { src: url } = module;
        if (_cache.has(url)) throw new Error("Cannot cache an existing module, call 'invalidate' on it first.");
        
        if (!typemap.has(url)) {
            typemap.set(url, _type++);
            
            // TODO(randomuserhi): handle integer overflow
        }

        _cache.set(url, module);
    }

    const callbacks = new Set<() => void>();
    export function onExecutionsCompleted(callback: () => void) {
        callbacks.add(callback);
    }

    const executionContexts = new Set<_ASLModule>();
    const onExec = (module: _ASLModule) => {
        executionContexts.delete(module);
        if (executionContexts.size === 0) {
            for (const callback of callbacks) {
                callback();
            }
        }
    };
    const setProps: (string | symbol)[] = ["destructor", "manual"];
    const getProps: (string | symbol)[] = [...setProps, "exports", "ready", "src", "isReady", "baseURI"];
    export async function exec(module: _ASLModule) {
        if (module.executionContext === undefined) {
            module.executionContext = new Promise((resolve, reject) => {
                module.terminate = resolve;

                module.exports = {};
                const __module__ = new Proxy(module, {
                    set: (module, prop, newValue, receiver) => {
                        if (setProps.indexOf(prop) === -1) module.raise(new Error(`Invalid operation set '${prop.toString()}'.`));
                        if (module.isReady) module.raise(new Error(`You cannot change '${prop.toString()}' once a module has loaded.`));
                        return Reflect.set(module, prop, newValue, receiver);
                    },
                    get: (module, prop, receiver) => {
                        if (getProps.indexOf(prop) === -1) module.raise(new Error(`Invalid operation get '${prop.toString()}'.`));
                        if (prop === "exports") return module.exports;
                        const value = Reflect.get(module, prop, receiver);
                        if (typeof value === "function") {
                            return value.bind(module);
                        }
                        return value;
                    }
                });
                const _require = async (_path: string, type: ASLRequireType = "asl") => {
                    try {
                        switch (type) {
                        case "asl": {
                            const m = await fetchModule(_path, module.src, module);
                            if (m === module) throw new Error("Cannot 'require()' self.");
                            Archetype.traverse(module!, m.src);
                            return m.exports;
                        }
                        case "esm": {
                            return await import(_path.startsWith(".") ? new URL(_path, module.src).toString() : _path);
                        }
                        default: throw new Error(`Invalid ASLRequireType '${type}'`);
                        }
                    } catch (e) {
                        throw new _ASLModuleError(`[${module.src}] Failed to require('${_path}', ${type}):`, e);
                    }
                };

                if (module.exec === undefined) {
                    reject(new Error(`Module '${module.src}' was not assigned an exec function.`));
                    return;
                }
            
                module.exec(_require, __module__, module.exports).then(() => {
                    finalize(module);
                    // NOTE(randomuserhi): if manual termination is set to false, module terminates execution context once it has completed
                    //                     execution
                    if (module.manual === false) resolve();
                }).catch((e) => {
                    reject(new _ASLModuleError(`Failed to execute module [${module.src}]:`, e));
                });
            });
            executionContexts.add(module);
            module.executionContext.then(() => { onExec(module); });
        }
        return module.executionContext;
    }

    export function finalize(module: _ASLModule) {
        if (module.isReady) return;
        module.isReady = true;
        module.archetype.add(module);

        // NOTE(randomuserhi): if manual termination is set to true, module terminates execution context once module.ready() is called (aka the finalized runs)
        if (module.manual === true && module.terminate !== undefined) module.terminate();

        let currentListLength: number;
        do {
            currentListLength = _getList.length;
            const getList = _getList;
            _getList = [];
            for (const item of getList) {
                const { module, resolve } = item;
                if (module.destructed) continue;
                if (module.isReady) {
                    if (resolve !== undefined) resolve(module);
                } else _getList.push(item);
            }
        } while (_getList.length !== currentListLength);
    }

    // NOTE(randomuserhi): returns:
    //                     - a boolean for if the file was removed from cache or not (wont remove from cache if it was already invalidated)
    //                     - a list promises for dependencies that were also invalidated and are waiting to re-execute
    //                       - these promises resolve once the dependency finishes re-executing once the original module is re-imported
    //                       - useful to Promise.all() this returned list to wait for all modules to finish executing after invalidating and re-importing a module
    export function invalidate(url: string): [boolean, Promise<void>[] | undefined] {
        if (!_cache.has(url)) return [false, undefined];
        const module = _cache.get(url)!;
        if (module.destructed === true) return [false, undefined];
        
        const type = getType(module.src);
        module.destruct();
        _cache.delete(url);

        _getList = _getList.filter((i) => i.root.src !== module.src);

        const archetypesContainingModule = Archetype.typemap[type];
        const executions = [];
        if (archetypesContainingModule !== undefined) {
            for (const archetype of archetypesContainingModule) {
                for (const module of archetype.modules.values()) {
                    if (invalidate(module.src)[0]) {
                        const m = new _ASLModule(module.src, module.exec);
                        cache(m);
                        executions.push(exec(m));
                    }
                }
            }
        }

        return [true, executions];
    }

    export function has(path: string) {
        return _cache.has(path);
    }

    let _getList: { module: _ASLModule, resolve?: (value: _ASLModule) => void, root: _ASLModule }[] = []; 
    export function get(path: string, root?: _ASLModule): Promise<_ASLModule> {
        return new Promise((resolve) => {
            const module = _cache.get(path);
            if (module === undefined) throw new Error(`Could not find module '${path}'.`);
            if (module.destructed) throw new Error(`Cannot load the invalidated module '${path}'.`);
            if (module.isReady) {
                resolve(module);
                return;
            }

            if (root !== undefined) watch(root, module, resolve);
        });
    }

    // NOTE(randomuserhi): internal function used for debugging modules waiting to get other modules
    export function watch(root: _ASLModule, module: _ASLModule, resolve?: (value: _ASLModule) => void) {
        _getList.push({ module, resolve, root });
    }

    export function getWaiting() {
        const result: Map<_ASLModule, string[]> = new Map();
        for (const { module, root } of _getList) {
            if (root.isReady) continue;
            if (!result.has(root)) result.set(root, []);
            result.get(root)!.push(module.src);
        }
        return result;
    }

    export function logWaiting() {
        const waiting = [...getWaiting().entries()];
        if (waiting.length === 0) {
            console.log("No modules are waiting to finalize.");
            return;
        }
        console.log(`Modules waiting to finalize:\n${waiting.map((entry) => `[${entry[0].src}]\n\t- ${entry[1].join("\n\t- ")}`).join("\n\n")}`);
    }

    export function reset() {
        for (const module of _cache.values()) {
            module.destruct();
        }

        _cache.clear();
        typemap.clear();
        executionContexts.clear();
        archetype = new Archetype();

        _getList = [];
    }

    export function getLoaded() {
        return [..._cache.values()];
    }

    export function getExecutionContexts() {
        return [...executionContexts.values()];
    }
}

// NOTE(randomuserhi): Exposed for debugging purposes
(globalThis as any).waiting = AsyncScriptCache.logWaiting;
(globalThis as any).executions = AsyncScriptCache.getExecutionContexts;
(globalThis as any).loaded = () => {
    console.log(`Loaded modules:\n\t${AsyncScriptCache.getLoaded().map(m => m.src).join("\n\t")}`);
};

// NOTE(randomuserhi): Trim the automatically placed 'export {};' from typescript at the end.
//                     This is done as a hack for my module-esc use of types :P
function typescriptModuleSupport(code: string) {
    const match = "export {};";
    const lastIndex = code.lastIndexOf(match);
    
    if (lastIndex === -1) {
        return code;
    }

    return code.substring(0, lastIndex) + code.substring(lastIndex + match.length);
}

const fetchScript = Rest.fetch<_ASLModule["exec"], [url: URL]>({
    url: (url) => url,
    fetch: async () => ({
        method: "GET"
    }),
    callback: async (resp) => {
        return (new Function(`const __code__ = async function(require, module, exports) { ${typescriptModuleSupport(await resp.text())} }; return __code__.bind(undefined);`))();
    }
});

function fetchModule(path: string, baseURI?: string, root?: _ASLModule): Promise<_ASLModule> {
    if (path === "") throw new Error("Cannot use 'require()' on a blank string.");
    const url = new URL(path, path.startsWith(".") ? baseURI : undefined); // TODO(randomuserhi): On error => log what the url was (path)
    path = url.toString();
    if (AsyncScriptCache.has(path)) {
        return AsyncScriptCache.get(path, root);
    }

    return new Promise((resolve, reject) => {
        const module = new _ASLModule(path);
        AsyncScriptCache.cache(module);
        if (root !== undefined) AsyncScriptCache.watch(root, module, resolve);
        fetchScript(url).then((exec) => {
            module.exec = exec;
            return AsyncScriptCache.exec(module);
        }).then(() => resolve(module)).catch((e) => {
            if (isASLModuleError(e)) reject(e);
            else throw new _ASLModuleError(`Error whilst fetching [${url}] in [${root === undefined ? "@root" : root.src}]:`, e);
        });
    });
}

export namespace AsyncScriptLoader {
    // eslint-disable-next-line prefer-const
    export let baseURI: string | undefined = globalThis.document === undefined ? undefined : globalThis.document.baseURI; 

    // NOTE(randomuserhi): returns undefined if there are no remaining executions 
    export async function load(path: string) {
        path = new URL(path, baseURI).toString();
        const [_, executions] = AsyncScriptCache.invalidate(path);
        await fetchModule(path);
        if (executions !== undefined) await Promise.all(executions);
    }
}

export type ASLRequireType = "asl" | "esm";
export type Require = <T>(path: string, mode?: ASLRequireType) => Promise<T>;
export type Exports = {
    exports?: any
};