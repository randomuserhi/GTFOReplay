interface Module { 
    typename: string; 
    version: string;
}

/* exported ModuleLoader */
namespace ModuleLoader {
    export interface ModuleFunc { 
        parse: ParseFunc;
        exec?: ExecFunc;
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

    // TODO(randomuserhi): console message / warning when replacing or updating an existing type
    export function register(typename: string, version: string, main: ModuleFunc, spawn?: ModuleFunc, despawn?: ModuleFunc) {
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