import { ASLModule } from "../replay/async-script-loader";

declare global {
    const module: ASLModule;
    const exports: Record<PropertyKey, any>;
}

export { };

