import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { specification } from "../renderer/specification";
let metadataParser = ModuleLoader.registerHeader("Vanilla.Metadata", "0.0.1", {
    parse: async (data, header) => {
        if (header.has("Vanilla.Metadata"))
            throw new Error("Metadata was already written.");
        header.set("Vanilla.Metadata", {
            version: await BitHelper.readString(data),
            compatibility_OldBulkheadSound: false
        });
        header.set("Specification", specification);
        const module = 2;
        const obj = {
            module: 1
        };
        console.log(module);
        console.log(obj.module);
    }
});
metadataParser = ModuleLoader.registerHeader("Vanilla.Metadata", "0.0.2", {
    parse: async (data, header) => {
        metadataParser.parse(data, header);
        header.set("Vanilla.Metadata", {
            ...header.get("Vanilla.Metadata"),
            compatibility_OldBulkheadSound: await BitHelper.readBool(data)
        });
        console.log(module);
        console.log(obj.module);
        hello();
    }
});
export function module() { }
export const obj = {
    module: 1
};
console.log(module);
console.log(obj.module);
export function hello() {
    console.log("hello");
}
