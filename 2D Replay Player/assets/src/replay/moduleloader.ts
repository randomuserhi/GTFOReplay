const library: Map<string, Map<string, ParseFunc>> = new Map();

/* exported register */
function register(typename: string, version: string, func: ParseFunc) {
    if (!library.has(typename)) {
        library.set(typename, new Map());
    }
    library.get(typename)!.set(version, func);
}

/* exported ModuleLoader */
namespace ModuleLoader {
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
}