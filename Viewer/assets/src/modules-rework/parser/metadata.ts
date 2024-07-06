import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";

export interface Metadata {
    version: string;
    compatibility_OldBulkheadSound: boolean; 
}

declare module "@esm/@root/replay/moduleloader.js" {
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
        await ModuleLoader.getHeader(["Vanilla.Metadata", "0.0.1"]).parse(data, header);
        header.set("Vanilla.Metadata", {
            ...header.get("Vanilla.Metadata")!,
            compatibility_OldBulkheadSound: await BitHelper.readBool(data)
        });
    }
});