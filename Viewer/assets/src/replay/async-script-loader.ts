import { Rest } from "@/rhu/rest.js";

// TODO(randomuserhi): Documentation & Refactor => code is a mess

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
    exports?: any;
    readonly baseURI: string | undefined;
}

type ASLExec = (require: Require, module: Exports) => Promise<void>;
class _ASLModule implements ASLModule, Exports {
    readonly src: string;
    exec?: ASLExec;
    
    isReady: boolean = false;
    destructed: boolean = false;

    exports?: any;
    destructor?: () => void;

    public destruct() {
        if (this.destructor !== undefined) this.destructor();
        this.destructed = true;
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

    type: number[]; // The dependencies for the given modules in this archetype
    modules: Map<string, _ASLModule> = new Map();
    addMap: Map<number, Archetype> = new Map(); // Map to traverse to move to other archetypes as dependencies are added

    constructor(type: number[] = []) {
        this.type = type;

        Archetype.all.push(this);
        Archetype.allMap.set(this.type.join(","), this);
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

    export const archetype: Archetype = new Archetype();

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

    const setProps: (string | symbol)[] = ["exports", "destructor"];
    const getProps: (string | symbol)[] = [...setProps, "ready", "src", "isReady", "baseURI"];
    export async function exec(module: _ASLModule) {
        module.exports = {};
        const __module__ = new Proxy(module, {
            set: (module, prop, newValue, receiver) => {
                if (setProps.indexOf(prop) === -1) module.raise(new Error(`Invalid operation set '${prop.toString()}'.`));
                if (module.isReady) module.raise(new Error("You cannot create exports once a module has loaded."));
                return Reflect.set(module, prop, newValue, receiver);
            },
            get: (module, prop, receiver) => {
                if (getProps.indexOf(prop) === -1) module.raise(new Error(`Invalid operation get '${prop.toString()}'.`));
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

        if (module.exec === undefined) throw new Error(`Module '${module.src}' was not assigned an exec function.`);
        
        try {
            await module.exec(_require, __module__);
        } catch(e) {
            throw new _ASLModuleError(`Failed to execute module [${module.src}]:`, e);    
        }

        finalize(module);
    }

    export function finalize(module: _ASLModule) {
        if (module.isReady) return;
        module.isReady = true;
        module.archetype.add(module);

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

    export function invalidate(url: string) {
        if (!_cache.has(url)) return false;
        const module = _cache.get(url)!;
        if (module.destructed === true) return false;
        
        const type = getType(module.src);
        module.destruct();
        _cache.delete(url);

        _getList = _getList.filter((i) => i.root.src !== module.src);

        for (const archetype of Archetype.all) {
            if (archetype.type.indexOf(type) !== -1) {
                for (const module of archetype.modules.values()) {
                    if (invalidate(module.src)) {
                        const m = new _ASLModule(module.src, module.exec);
                        cache(m);
                        exec(m);
                    }
                }
            }
        }

        return true;
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
            invalidate(module.src);
        }

        _getList = [];
    }
}

// NOTE(randomuserhi): Exposed for debugging purposes
(globalThis as any).waiting = AsyncScriptCache.logWaiting;

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
        return (new Function(`const __code__ = async function(require, module) { ${typescriptModuleSupport(await resp.text())} }; return __code__.bind(undefined);`))();
    }
});

function fetchModule(path: string, baseURI?: string, root?: _ASLModule): Promise<_ASLModule> {
    if (path === "") throw new Error("Cannot use 'require()' on a blank string.");
    const url = new URL(path, path.startsWith(".") ? baseURI : undefined); // TODO(randomuserhi): On error => log what the url was (path)
    path = url.toString();
    if (AsyncScriptCache.has(path)) {
        //console.log(`cached ${url}.`);
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
    export async function load(path: string) {
        path = new URL(path, baseURI).toString();
        AsyncScriptCache.invalidate(path);
        await fetchModule(path);
    }
}

export type ASLRequireType = "asl" | "esm";
export type Require = <T>(path: string, mode?: ASLRequireType) => Promise<T>;
export type Exports = {
    exports?: any
};