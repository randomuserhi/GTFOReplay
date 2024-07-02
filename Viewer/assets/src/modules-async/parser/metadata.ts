/// === START TYPESCRIPT BOILERPLATE ===

import type { ASLModule, ASLModule_BitHelper, ASLModule_Macro, ASLModule_ModuleLoader, ASLModule_THREE, ASLModule_troika, Exports, Require } from "../../replay/async-script-loader.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const require: Require;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const module: Exports;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const __ASLModule__: ASLModule;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const THREE: ASLModule_THREE;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const troika: ASLModule_troika;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const ModuleLoader: ASLModule_ModuleLoader;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const BitHelper: ASLModule_BitHelper;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const Macro: ASLModule_Macro;

declare module "../../replay/async-script-loader.js" {
    interface ASLModule_Exports {
        "parser/metadata": typeof exports;
    }
}

/// === END TYPESCRIPT BOILERPLATE ===

export interface Metadata {
    version: string;
    compatibility_OldBulkheadSound: boolean; 
}

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Metadata": Metadata;
        }
    }
}

let metadataParser = ModuleLoader.registerHeader("Vanilla.Metadata", "0.0.1", {
    parse: async (data, header) => {
        if (header.has("Vanilla.Metadata")) throw new Error("Metadata was already written.");
        header.set("Vanilla.Metadata", {
            version: await BitHelper.readString(data),
            compatibility_OldBulkheadSound: false
        });
    }
});
metadataParser = ModuleLoader.registerHeader("Vanilla.Metadata", "0.0.2", {
    parse: async (data, header) => {
        metadataParser.parse(data, header);
        header.set("Vanilla.Metadata", {
            ...header.get("Vanilla.Metadata")!,
            compatibility_OldBulkheadSound: await BitHelper.readBool(data)
        });
    }
});

const bezier = await require("../renderer/bezier.js", "renderer/bezier");
console.log(bezier);

const exports = {};
module.exports = {};