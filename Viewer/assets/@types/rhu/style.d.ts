import { ThemeVariable } from "./theme.js";
export type ClassName<T extends {} = {}> = {
    [Symbol.toPrimitive]: () => string;
    name: string;
} & T;
interface ClassNameConstructor {
    new <T extends {} = {}>(name?: string): ClassName<T>;
    prototype: ClassName;
}
export declare const ClassName: ClassNameConstructor;
interface Generator {
    (first: TemplateStringsArray, ...interpolations: (string | ClassName | ThemeVariable)[]): void;
    class<T extends {} = {}>(first: TemplateStringsArray, ...interpolations: (string | ThemeVariable)[]): ClassName & T;
}
interface Factory {
    css: Generator;
}
interface Style {
    <T>(factory: (worker: Factory) => T): T;
    dispose(obj: any): void;
}
export declare const Style: Style;
export {};
