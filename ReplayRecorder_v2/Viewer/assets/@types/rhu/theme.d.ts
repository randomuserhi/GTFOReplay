import { ClassName } from "./style.js";
export type ThemeVariable<T extends {} = {}> = {
    [Symbol.toPrimitive]: () => string;
    name: string;
} & T;
interface ThemeVariableConstructor {
    new <T extends {} = {}>(name?: string): ThemeVariable<T>;
    prototype: ThemeVariable;
}
interface Generator {
    (first: TemplateStringsArray, ...interpolations: (string | ThemeVariable)[]): ThemeVariable;
}
interface Factory {
    theme: Generator;
}
export declare const ThemeVariable: ThemeVariableConstructor;
export declare function Theme<T extends {} = {}>(factory: (worker: Factory) => T): ClassName<T>;
export {};
