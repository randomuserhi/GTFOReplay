import { Rest } from "@/rhu/rest.js";

interface ASLModule {
    exec(require: Require, exports: {}): Promise<void>;
    id: string;
}

export namespace AsyncScriptCache {
    export function cache(exports: any) {
        console.log(exports);      
    }
}

export namespace AsyncScriptLoader {
    const fetchScript = Rest.fetch<ASLModule | undefined, [url: string]>({
        url: (url: string) => new URL(url, document.baseURI),
        fetch: async () => ({
            method: "GET"
        }),
        callback: async (resp) => {
            let module: ASLModule | undefined;
            try {
                let code: ASLModule["exec"] | undefined;
                eval(`code = async function(require, exports) { ${await resp.text()} };`);
                if (code === undefined) throw new Error("Could not extract 'code' from ASLModule.");
                module = {
                    id: resp.url,
                    exec: code
                };
            } catch (e) {
                console.error(`Failed to parse ASLModule '${resp.url}':\n${e}`);
                module = undefined;
            }
            return module;
        }
    });

    export async function require(id: string): Promise<any> {
        console.log(id);
    }

    export async function load(url: string) {
        const module = await fetchScript(url);
        if (module === undefined) return;

        const exports = {};
        try {
            await module.exec(require, exports);
        } catch(e) {
            console.error(`Failed to execute ASLModule '${module.id}':\n${e}`);
            return;
        }

        AsyncScriptCache.cache(exports);
    }
}

export type Require = typeof AsyncScriptLoader.require;
export type Exports = any;