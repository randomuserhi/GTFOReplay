import { VM } from "./async-script-loader.js";

export interface ASLModule {
    readonly src: string;
    readonly isReady: boolean;
    readonly baseURI: string | undefined;
    readonly metadata: Metadata;
    destructor?: () => void;
    ready(): void;
    rel(path: string): string;
    exports: Record<PropertyKey, any>;
}

export interface Metadata {
    isParser: boolean;
}

export const ASL_VM = new VM<Metadata>({ isParser: false });
(window as any).vm = ASL_VM;