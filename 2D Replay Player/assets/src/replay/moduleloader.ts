interface Module { 
    typename: string; 
    version: string;
}

/* exported ModuleLoader */
namespace ModuleLoader {
    const links = new Map<string, Module[]>();
    export const library: Map<string, Map<string, ParseFunc>> = new Map();

    export function get(module: Module): ParseFunc | undefined {
        return library.get(module.typename)?.get(module.version);
    }

    // TODO(randomuserhi): console message / warning when replacing or updating an existing type
    export function register(typename: string, version: string, func: ParseFunc) {
        const link = document.currentScript?.getAttribute("src");
        if (link == null) {
            console.warn(`Unable to link parser for type '${typename}(${version})'.`);
            return;
        }
        if (!links.has(link)) {
            links.set(link, []);
        }
        links.get(link)!.push({ typename, version });

        if (!library.has(typename)) {
            library.set(typename, new Map());
        }
        library.get(typename)!.set(version, func);
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