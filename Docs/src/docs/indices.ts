declare namespace RHU {
    interface Modules {
        "docs/indices": {
            DOCUSCRIPT_ROOT: string;
        };
    }
}

(() => {
    let DOCUSCRIPT_ROOT = "";
    if (document.currentScript) {
        const s = document.currentScript as HTMLScriptElement;
        const r = s.src.match(/(.*)[/\\]/);
        if (r)
            DOCUSCRIPT_ROOT = r[1] || "";
    } else {
        throw new Error("Failed to get document root.");
    }

    RHU.module(new Error(), "docs/indices", { 
        docs: "docs",
    }, function({
        docs,
    }) {
        ((docs: Docs) => {
            const stack: string[] = [];
            const dir = (dir: string, func: (docs: (path: string, page?: string, index?: number) => string) => void) => {
                stack.push(dir);
                const current = [...stack];
                let prio = 0;
                const d = (path: string, page?: string) => {
                    docs.set(`${[...current, ...path.split("/")].join("/")}`, page, prio++);
                    return path;
                };
                func(d);
                stack.pop();
            };
            let prio = 0;
            const set = (path: string, page?: string) => {
                docs.set(path, page, prio++);
                return path;
            };

            set("About", "About.js");
            set("Known Issues", "KnownIssues.js");
            set("Roadmap", "Roadmap.js");
            dir(set("Viewer", "Viewer.js"), (set) => {
                set("Client vs Host Replays", "Viewer/ClientHostReplays.js");
                set("Backwards Compatability", "Viewer/BackwardsCompatability.js");
            });
            dir(set("Dev"), (set) => {
                set("Replay Binary Format", "Dev/BinaryFormat.js");
            });
        })(docs.create("1.0.0", "About"));

        ((docs: Docs) => {
            const stack: string[] = [];
            const dir = (dir: string, func: (docs: (path: string, page?: string, index?: number) => string) => void) => {
                stack.push(dir);
                const current = [...stack];
                let prio = 0;
                const d = (path: string, page?: string) => {
                    docs.set(`${[...current, ...path.split("/")].join("/")}`, page, prio++);
                    return path;
                };
                func(d);
                stack.pop();
            };
            let prio = 0;
            const set = (path: string, page?: string) => {
                docs.set(path, page, prio++);
                return path;
            };

            set("About", "About.js");
        })(docs.create("2.0.0", "About"));

        return {
            DOCUSCRIPT_ROOT
        };
    });
})();