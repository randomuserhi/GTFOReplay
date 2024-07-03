import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { specification } from "../renderer/specification";

export interface Metadata {
    version: string;
    compatibility_OldBulkheadSound: boolean; 
}

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Metadata": Metadata;
            "Specification": typeof specification;
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

        header.set("Specification", specification);

        const module = 2; // test
        const obj = {
            module: 1
        }; // test

        console.log(module); // test
        console.log(obj.module); // test
    }
});
metadataParser = ModuleLoader.registerHeader("Vanilla.Metadata", "0.0.2", {
    parse: async (data, header) => {
        metadataParser.parse(data, header);
        header.set("Vanilla.Metadata", {
            ...header.get("Vanilla.Metadata")!,
            compatibility_OldBulkheadSound: await BitHelper.readBool(data)
        });

        console.log(module); // test
        console.log(obj.module); // test

        hello();
    }
});

export function module() {} // test
export const obj = {
    module: 1
}; // test

console.log(module); // test
console.log(obj.module); // test

export function hello() {
    console.log("hello");
}