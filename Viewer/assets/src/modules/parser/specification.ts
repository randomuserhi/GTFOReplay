import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { specification } from "../renderer/specification.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Specification": typeof specification;
        }
    }
}

ModuleLoader.registerInit((header) => {
    header.set("Specification", specification);
});