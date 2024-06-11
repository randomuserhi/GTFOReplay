import * as BitHelper from "../../replay/bithelper.js";
import { ModuleLoader } from "../../replay/moduleloader.js";

export interface Metadata {
    version: string;
}

declare module "../../replay/moduleloader.js" {
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
        });
    }
});