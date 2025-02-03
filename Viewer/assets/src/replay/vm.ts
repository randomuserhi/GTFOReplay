import { VM } from "./async-script-loader.js";

export interface ASLModule {
    readonly src: string;
    readonly isReady: boolean;
    readonly baseURI: string | undefined;
    readonly metadata: Metadata;
    readonly dispose: AbortSignal;
    destructor?: () => void;
    ready(): void;
    error(e: any, message?: string): Error;
    rel(path: string): string;
    root(path: string): string;
    exports: Record<PropertyKey, any>;
}

export interface Metadata {
    isParser: boolean;
}

export const ASL_VM = new VM<Metadata>({ isParser: false }, undefined, "../profiles");
(window as any).vm = ASL_VM;