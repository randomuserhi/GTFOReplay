import * as BitHelper from "../../replay/bithelper.js";
import { ModuleLoader } from "../../replay/moduleloader.js";

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

// TODO(randomuserhi): Refactor to be more maintainable

ModuleLoader.registerHeader("Vanilla.Metadata", "0.0.1", {
    parse: async (data, header) => {
        if (header.has("Vanilla.Metadata")) throw new Error("Metadata was already written.");
        header.set("Vanilla.Metadata", {
            version: await BitHelper.readString(data),
            compatibility_OldBulkheadSound: false
        });
    }
});

ModuleLoader.registerHeader("Vanilla.Metadata", "0.0.2", {
    parse: async (data, header) => {
        if (header.has("Vanilla.Metadata")) throw new Error("Metadata was already written.");
        header.set("Vanilla.Metadata", {
            version: await BitHelper.readString(data),
            compatibility_OldBulkheadSound: await BitHelper.readBool(data)
        });
    }
});