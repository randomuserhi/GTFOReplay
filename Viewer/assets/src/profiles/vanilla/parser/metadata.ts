import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";

ModuleLoader.registerASLModule(module.src);

export interface Metadata {
    version: string;
    compatibility_OldBulkheadSound: boolean; 
    compatibility_NoArtifact: boolean;
    recordEnemyRagdolls: boolean;
}

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Metadata": Metadata;
        }
    }
}

ModuleLoader.registerHeader("Vanilla.Metadata", "0.0.1", {
    parse: async (data, header) => {
        if (header.has("Vanilla.Metadata")) throw new Error("Metadata was already written.");
        header.set("Vanilla.Metadata", {
            version: await BitHelper.readString(data),
            compatibility_OldBulkheadSound: false,
            compatibility_NoArtifact: false,
            recordEnemyRagdolls: false,
        });
    }
});
ModuleLoader.registerHeader("Vanilla.Metadata", "0.0.2", {
    parse: async (data, header, snapshot) => {
        await ModuleLoader.getHeader(["Vanilla.Metadata", "0.0.1"]).parse(data, header, snapshot);
        header.set("Vanilla.Metadata", {
            ...header.get("Vanilla.Metadata")!,
            compatibility_OldBulkheadSound: await BitHelper.readBool(data),
            compatibility_NoArtifact: false,
        });
    }
});
ModuleLoader.registerHeader("Vanilla.Metadata", "0.0.3", {
    parse: async (data, header, snapshot) => {
        await ModuleLoader.getHeader(["Vanilla.Metadata", "0.0.2"]).parse(data, header, snapshot);
        header.set("Vanilla.Metadata", {
            ...header.get("Vanilla.Metadata")!,
            compatibility_NoArtifact: await BitHelper.readBool(data),
        });
    }
});
ModuleLoader.registerHeader("Vanilla.Metadata", "0.0.4", {
    parse: async (data, header, snapshot) => {
        await ModuleLoader.getHeader(["Vanilla.Metadata", "0.0.3"]).parse(data, header, snapshot);
        header.set("Vanilla.Metadata", {
            ...header.get("Vanilla.Metadata")!,
            recordEnemyRagdolls: await BitHelper.readBool(data),
        });
    }
});