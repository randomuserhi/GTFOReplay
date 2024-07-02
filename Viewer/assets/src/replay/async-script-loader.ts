import { Rest } from "@/rhu/rest.js";
import * as THREE from "three";
import * as TROIKA from "troika-three-text";
import * as BitHelper from "./bithelper.js";
import { ModuleLoader } from "./moduleloader.js";

// TODO(randomuserhi): Documentation => code is a mess

export type ASLModule_THREE = typeof THREE;
export type ASLModule_troika = typeof TROIKA;
export type ASLModule_ModuleLoader = typeof ModuleLoader;
export type ASLModule_BitHelper = typeof BitHelper;

export interface ASLModule {
    readonly src: string;
    destructor?: () => void;
    ready: () => void;
}

class _ASLModuleError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

type ASLExec = (__ASLModule__: ASLModule, require: Require, exports: {}, moduleLoader: ASLModule_ModuleLoader, three: ASLModule_THREE, troika: ASLModule_troika, bithelper: ASLModule_BitHelper) => Promise<void>;
class _ASLModule implements ASLModule {
    readonly src: string;
    exec?: ASLExec;
    
    isReady: boolean = false;
    destructed: boolean = false;

    exports?: any;
    readonly proxy: any;
    private readonly revoke: () => void;
    destructor?: () => void;

    public destruct() {
        if (this.destructor !== undefined) this.destructor();
        this.revoke();  
        this.destructed = true;
    }

    constructor(url: string, exec?: ASLExec) {
        this.src = url;
        this.exec = exec;
        const { proxy, revoke } = Proxy.revocable(this, {
            get(target, property, receiver) {
                if (target.isReady === false) throw new Error(`Accessing partially prepared module '${target.src}'.`);
                if (target.exports === undefined) return undefined;
                return Reflect.get(target.exports, property, receiver);
            },
            set() { return false; }
        });
        this.proxy = proxy;
        this.revoke = revoke;
    }
    
    public ready() {
        AsyncScriptCache.finalize(this);
    }

    public raise(e: Error) {
        if (Object.prototype.isPrototypeOf.call(_ASLModuleError.prototype, e)) throw e;
        else throw new _ASLModuleError(`[${this.src}]:\n\t${e}`);
    }

    get __asl__(): ASLModule {
        const result = {
            destructor: this.destructor,
            ready: () => this.ready(),
        };
        Object.defineProperty(result, "url", {
            value: this.src,
            writable: false
        });
        return result as ASLModule;
    }
    set __asl__(value: ASLModule) {
        this.destructor = value.destructor;
    }

    _archetype: Archetype = AsyncScriptCache.archetype;
    set archetype(value: Archetype) {
        value.add(this);
    }
    get archetype() {
        return this._archetype;
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

    export async function exec(module: _ASLModule) {
        module.exports = {};
        const exports = new Proxy(module, {
            set: (module: _ASLModule, prop, receiver) => {
                if (module.isReady) module.raise(new Error("You cannot create exports once a module has loaded."));
                return Reflect.set(module.exports, prop, receiver);
            }
        });
        const __asl__: ASLModule = module.__asl__;
        const _require = async (_path: string) => {
            const m = await AsyncScriptLoader.require(_path, module.src, module);
            if (m === module) throw new Error("Cannot 'require()' self.");
            Archetype.traverse(module!, m.src);
            return m.proxy;
        };

        if (module.exec === undefined) throw new Error(`Module '${module.src}' was not assigned an exec function.`);
        await module.exec.call(undefined, __asl__, _require, exports, ModuleLoader, THREE, TROIKA, BitHelper);
        
        module.__asl__ = __asl__;
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
        console.log(`Modules waiting to finalize:\n${waiting.map((entry) => `[${entry[0].src}]\n\t- ${entry[1].join("\n\t- ")}`).join("\n")}`);
    }
}

// NOTE(randomuserhi): Exposed for debugging purposes
(window as any).waiting = AsyncScriptCache.logWaiting;

// NOTE(randomuserhi): Trim the automatically placed 'export {};' from typescript at the end.
//                     This is done as a hack for my module-esc use of types :P
function typescriptModuleSupport(code: string) {
    const match = "export {};";
    const lastIndex = code.lastIndexOf(match);
    
    // If the match is not found, return the original string
    if (lastIndex === -1) {
        return code;
    }
  
    // Slice the string into two parts and remove the matched substring
    return code.substring(0, lastIndex) + code.substring(lastIndex + match.length);
}
  
export namespace AsyncScriptLoader {
    const fetchScript = Rest.fetch<_ASLModule["exec"], [url: URL]>({
        url: (url) => url,
        fetch: async () => ({
            method: "GET"
        }),
        callback: async (resp) => {
            return (new Function(`const __code__ = async function(__ASLModule__, require, exports, ModuleLoader, THREE, troika, BitHelper) { ${typescriptModuleSupport(await resp.text())} }; return __code__;`))();
        }
    });

    export function require(path: string, baseURI?: string, root?: _ASLModule): Promise<_ASLModule> {
        if (path === "") throw new Error("Cannot use 'require()' on a blank string.");
        const url = new URL(path, baseURI);
        path = url.toString();
        if (AsyncScriptCache.has(path)) {
            //console.log(`cached ${url}.`);
            return AsyncScriptCache.get(path, root);
        }

        return new Promise((resolve, reject) => {
            const module = new _ASLModule(path);
            AsyncScriptCache.cache(module);
            try {
                //console.log(`fetching ${url}.`);
                if (root !== undefined) AsyncScriptCache.watch(root, module, resolve);
                fetchScript(url).then((exec) => {
                    module.exec = exec;
                    return AsyncScriptCache.exec(module);
                }).then(() => resolve(module)).catch((e) => {
                    module.raise(e);
                    reject(new Error("Unreachable"));
                });
            } catch(e) {
                module.raise(e);
                reject(new Error("Unreachable"));
            }
        });
    }

    export async function load(path: string) {
        path = new URL(path, document.baseURI).toString();
        AsyncScriptCache.invalidate(path);
        await require(path);
    }
}

export type Require = (path: string) => any;
export type Exports = any;