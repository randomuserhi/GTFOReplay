import { ASLModule } from "./replay/vm.js";

declare global {
    const module: ASLModule;
    const exports: Record<PropertyKey, any>;
}

export { };

