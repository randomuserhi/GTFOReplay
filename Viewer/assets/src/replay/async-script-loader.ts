
// Represents module dependencies
class Archetype {
    static all: Archetype[] = [];
    static allMap = new Map<string, Archetype>();
    static typemap: Archetype[][] = []; // Maps a type to all archetypes that contain said type

    type: number[]; // The dependencies for the given modules in this archetype
    modules: Map<string, Module> = new Map();
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

    public add(module: Module) {
        module._archetype.modules.delete(module.src);
        this.modules.set(module.src, module);
        module._archetype = this;
    }

    public static traverse(module: Module, src: string) {
        const archetype = module.archetype;

        const type = Archetype.getAlias(src);
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

    private static _type: number = 0;
    private static readonly aliases = new Map<string, number>();
    public static getAlias(src: string) {
        if (!Archetype.aliases.has(src)) {
            Archetype.aliases.set(src, Archetype._type++);
        }
        return Archetype.aliases.get(src)!;
    }
}

type RequireType = "asl" | "esm";
type Require = <T>(path: string, mode?: RequireType) => Promise<T>;
type Exec = (require: Require, module: Module, exports: Record<PropertyKey, any>) => Promise<void>;

class Module {
    static silent = {}; // When passed to `terminate`, will silently terminate instead of throwing an error
    
    readonly src: string; // path to module (also used as the module identifier)
    
    public rel(path: string) {
        return new URL(path, this.src).toString();
    }

    public _exports: Record<PropertyKey, any> = {};
    private proxy: Record<PropertyKey, any> = new Proxy(this, {
        set(module, prop, newValue) {
            if (module.isReady) throw new Error(`You cannot add exports once a module has loaded.`);
            if (module.destructed) throw new Error(`You cannot add exports once a module has been destructed.`);
            module._exports[prop] = newValue;
            return true;
        },
        get(module, prop) {
            return module._exports[prop];
        }
    });
    get exports() {
        return this.proxy;
    }
    set exports(value) {
        this._exports = value;
    }

    constructor(vm: VM, src: string) {
        this.vm = vm;
        this.src = src;
        this._archetype = vm.baseArchetype;

        const promise = new Promise<Module>((resolve) => {
            this.resolve = () => {
                this.isReady = true;
                resolve(this);
            };
        });
        this.resolution = promise;
    }

    public clone() {
        const clone = new Module(this.vm, this.src);
        clone.code = this.code;
        clone.build = this.build;
        return clone;
    }

    readonly vm: VM; // the VM the module is running in
    code: string | undefined; //internal immedate access to code, is undefined if still fetching
    build?: Exec; // built source code that can be executed
    destructor?: (() => void) | undefined;
    execution?: Promise<void>; // represents the execution of the module, if not fullfilled, module hasn't finished executing
    readonly resolution: Promise<Module>; // represents the resolve of the module, if not fullfilled, exports are not ready to be used
    resolve: () => void; // resolve the module exports as ready for use
    terminate?: (reason?: any) => void; // terminate the execution of the module
    public ready() { // mark this modules exports as ready for use
        this.resolve();
    }

    isReady: boolean = false; // are the exports of the module ready for use?
    destructed: boolean = false; // has this module been destructed

    // Module dependencies managed by Archetype class
    _archetype: Archetype;
    set archetype(value: Archetype) {
        value.add(this);
    }
    get archetype() {
        return this._archetype;
    }
}

interface ExecutionCallback {
    callback: () => void;
    options?: {
        once?: boolean;
    }
}

export class VM<T = any> {
    readonly baseURI: string | undefined;
    readonly metadata?: T;
    constructor(metadata?: T, baseURI?: string) {
        this.baseURI = baseURI === undefined ? globalThis.document === undefined ? undefined : globalThis.document.baseURI : baseURI;
        
        try {
            this.metadata = structuredClone(metadata);
        } catch {
            console.warn("Metadata must be serializable.");
            this.metadata = undefined;
        }
    }

    baseArchetype = new Archetype();

    // Ongoing require requests
    private requires = new Map<Module, Set<string>>();

    // Cache of loaded modules
    private cache = new Map<string, Module>();

    // Map of modules still executing
    private executing = new Map<string, Set<Module>>();

    // Callback when no executions are left
    private callbacks = new Set<ExecutionCallback>();
    public onNoExecutionsLeft(callback: () => void, options?: ExecutionCallback["options"]) {
        this.callbacks.add({
            callback,
            options
        });
    }

    private static setProps: (string | symbol)[] = ["destructor"];
    private static getProps: (string | symbol)[] = [...VM.setProps, "exports", "ready", "src", "isReady", "baseURI", "metadata", "rel"]; 
    // Execute a module
    private execute(module: Module): Promise<void> {
        const vm = this;

        // Check if this module is already executing
        if (module.execution !== undefined) return module.execution; 
        module.archetype.add(module);
        module.execution = new Promise<string>((resolve) => {
            // Fetch code if needed
            if (module.code !== undefined) resolve(module.code);
            else resolve(fetch(new URL(module.src), { method: "GET" }).then((req) => req.text()));
        }).then((code) => new Promise<void>((resolve, reject) => {
            module.code = code; // cache code

            // add this execution to the executing tracker
            if (!this.executing.has(module.src)) {
                this.executing.set(module.src, new Set());
            }
            this.executing.get(module.src)!.add(module);

            // Build source code if not built already
            if (module.build === undefined) {
                module.build = (new Function(`const __code__ = async function(require, module, exports) {\n${code}\n}; return __code__.bind(undefined); //# sourceURL=${module.src}`))() as Exec;
            }

            // Check if an existing module is still executing, if it is - terminate it
            if (this.executing.has(module.src)) {
                for (const old of this.executing.get(module.src)!) {
                    const kill = old.terminate;
                    if (kill !== undefined) kill(Module.silent);
                }
            }

            // Assign termination
            module.terminate = (reason?: any) => {
                reject(reason);
            };

            // Setup exports & module proxy
            module.exports = {};
            let metadata: T | undefined = undefined;
            const __module__ = new Proxy(module, {
                set: (module, prop, newValue, receiver) => {
                    if (module.destructed) throw new Error(`Module has been destructed`);
                    if (VM.setProps.indexOf(prop) === -1) throw new Error(`Invalid operation set '${prop.toString()}'.`);
                    if (module.isReady) throw new Error(`You cannot change '${prop.toString()}' once a module has loaded.`);
                    return Reflect.set(module, prop, newValue, receiver);
                },
                get: (module, prop, receiver) => {
                    if (module.destructed) throw new Error(`Module has been destructed`);
                    if (VM.getProps.indexOf(prop) === -1) throw new Error(`Invalid operation get '${prop.toString()}'.`);
                    if (prop === "exports") return module.exports;
                    else if (prop === "metadata") {
                        if (metadata === undefined && vm.metadata !== undefined) metadata = structuredClone(vm.metadata);
                        return metadata;
                    } else if (prop === "baseURI") return vm.baseURI;
                    const value = Reflect.get(module, prop, receiver);
                    if (typeof value === "function") {
                        return value.bind(module);
                    }
                    return value;
                }
            });

            // Create require method
            const _require = async (_path: string, type: RequireType = "asl") => {
                try {
                    switch (type) {
                    case "asl": {
                        const resolvedPath = new URL(_path, _path.startsWith(".") ? module.src : undefined).toString();
                        Archetype.traverse(module, resolvedPath);
                        const m = await this._load(resolvedPath, module);
                        if (m === module) throw new Error("Cannot 'require()' self");
                        return m.exports;
                    }
                    case "esm": {
                        return await import(_path.startsWith(".") ? new URL(_path, module.src).toString() : _path);
                    }
                    default: throw new Error(`Invalid RequireType '${type}'`);
                    }
                } catch (e) {
                    throw new Error(`Failed to fetch '${_path}':\n${vm.verboseError(e)}`);
                }
            };

            // Execute module
            module.build(_require, __module__, module.exports).then(() => {
                module.ready();
                resolve();
            }).catch((e) => {
                if (e !== Module.silent) reject(e);
            });
        })).catch((e) => {
            if (module.destructed !== true && e !== Module.silent) throw new Error(`Failed to execute '${module.src}':\n\n${this.verboseError(e)}`);
        }).finally(() => {
            // Clear module from execution
            const collection = this.executing.get(module.src);
            if (collection !== undefined) { 
                collection.delete(module);
                if (collection.size === 0) {
                    this.executing.delete(module.src);
                }
            }

            // Trigger onNoExecutionsLeft callback
            if (this.executing.size === 0) {
                for (const callback of [...this.callbacks.values()]) {
                    callback.callback();
                    if (callback.options?.once === true) {
                        this.callbacks.delete(callback);
                    } 
                }
            }
        });

        // Return execution
        return module.execution;
    }

    // Destruct a module
    private destruct(module: Module) {
        if (module.destructed) return;

        const kill = module.terminate;
        if (kill !== undefined) kill(Module.silent);

        const destructor = module.destructor;
        if (destructor !== undefined) {
            try {
                destructor();
            } catch (e) {
                console.warn(`Failed to destruct '${module.src}':\n\n${this.verboseError(e)}`);
            }
        }
        
        this.cache.delete(module.src);
        
        // Clear module from execution
        const exec = this.executing.get(module.src);
        if (exec !== undefined) { 
            exec.delete(module);
            if (exec.size === 0) {
                this.executing.delete(module.src);
            }
        }

        // Clear requests
        this.requires.delete(module);

        module.destructed = true;
    }

    // Dispose of all modules
    public async dispose() {
        for (const module of this.cache.values()) {
            const kill = module.terminate;
            if (kill !== undefined) kill(Module.silent);
            this.destruct(module);
        }
        this.cache.clear();
        this.baseArchetype = new Archetype();
    }

    // Load a module
    private _load(path: string, root?: Module): Promise<Module> {
        let promise: Promise<Module>;

        // If module exists already, resolve from cache, otherwise fetch and execute 
        if (this.cache.has(path)) promise = this.cache.get(path)!.resolution;
        else {
            // NOTE(randomuserhi): Wrap fetch in another promise to catch errors and produce a verbose one
            const module = new Module(this, path);
            this.cache.set(module.src, module);
            this.execute(module);
            promise = module.resolution;
        }

        // If load was called from another module (aka a require call), keep track of the request
        if (root !== undefined && root.destructed !== true) {
            // Add to watch list
            if (!this.requires.has(root)) {
                this.requires.set(root, new Set());
            }
            this.requires.get(root)!.add(path);

            // Remove on completion
            promise.finally(() => {
                const collection = this.requires.get(root);
                if (collection !== undefined) {
                    collection.delete(path);
                    if (collection.size === 0) {
                        this.requires.delete(root);
                    }
                }
            });
        }

        return promise;
    }

    private invalidate(path: string, reimport?: Map<string, Module>): boolean {
        if (!this.cache.has(path)) return false;
        const module = this.cache.get(path)!;

        // recursive calls to invalidate do not trigger reimport, only the root call.
        // this is guaranteed by passing a reimport map

        let _reimport: Map<string, Module>;
        if (reimport === undefined) _reimport = new Map();
        else _reimport = reimport;

        this.destruct(module);

        // invalidate and re-import modules that depended on the module being invalidated
        const archetypesContainingModule = Archetype.typemap[Archetype.getAlias(module.src)];
        if (archetypesContainingModule !== undefined) {
            for (const archetype of archetypesContainingModule) {
                for (const module of archetype.modules.values()) {
                    if (this.invalidate(module.src)) {
                        _reimport.set(module.src, module.clone());
                    }
                }
            }
        }

        if (reimport === undefined) {
            for (const module of _reimport.values()) {
                this.cache.set(module.src, module);
                this.execute(module);
            }
        }

        return true;
    }
    public async load(path: string) {
        path = new URL(path, this.baseURI).toString();
        this.invalidate(path);
        return this._load(path);
    }

    private static sourceRegex = /\(((?:https?|file):\/\/.*\.js):([0-9]+):([0-9]+)\)/g;
    public verboseError(e: Error) {
        let stack = e.stack;
        if (stack === undefined) return e.toString();

        let topLevel: { module: Module, line: number, col: number, isTop: boolean } | undefined = undefined;
        let isTop = true;
        for (const match of stack.matchAll(VM.sourceRegex)) {
            const src = match[1];
            const line = parseInt(match[2]) - 1;
            const col = match[3];
            
            const module = this.cache.get(src);
            if (module !== undefined) {
                if (topLevel === undefined) topLevel = { module, line: line - 3, col: parseInt(col), isTop };
                stack = stack.replace(match[0], `(${src}:${line}:${col})`);
            }

            isTop = false;
        }

        let codeSnippet: string | undefined = undefined; 
        if (topLevel?.module.code !== undefined) {
            const { module, line, col, isTop } = topLevel;

            const lines = module.code!.split("\n");
            const grab = 4;
            const error = lines[line];
            const top = lines.slice(Math.max(line - grab, 1), line);
            const bottom = lines.slice(Math.min(line + 1, lines.length - 2), Math.min(line + 1 + grab, lines.length - 1));
            let point = "";
            for (let i = 0; i < Math.min(col - 1, error.length); ++i) {
                if (error[i] !== "\t") point += " ";
                else point += "\t";
            }
            point += `^:${line+1}:${col}`;
            const message = isTop ? stack : `Callsite for nested error:\n\tat (${module.src}:${line+1}:${col})\n\n${stack}`;
            codeSnippet = `...\n\n${top.join("\n")}\n\n${error}\n${point}${stack !== undefined ? `\n\t| ${message.split("\n").join("\n\t| ")}` : ""}\n\n${bottom.join("\n")}\n\n...\n`;
        }

        return codeSnippet === undefined ? stack : codeSnippet;
    }
}