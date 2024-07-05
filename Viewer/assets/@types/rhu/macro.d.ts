export type Templates = keyof TemplateMap;
export interface TemplateMap {
}
interface Template<T extends Templates> {
    (first: TemplateStringsArray, ...interpolations: (string | {
        [Symbol.toPrimitive]: (...args: any[]) => string;
    })[]): string;
    type: T;
    toString: () => T;
    [Symbol.toPrimitive]: () => string;
}
export interface Constructor<T extends Element = Element> {
    (this: T): void;
    prototype: T;
}
interface Options {
    element: string;
    floating?: boolean;
    strict?: boolean;
    encapsulate?: PropertyKey;
    content?: PropertyKey;
}
interface MacroObject {
    <T extends Templates>(constructor: Function, type: T, source: string, options: Options): Template<T>;
    parseDomString(str: string): DocumentFragment;
    anon<T extends {} = {}>(source: string): [T, DocumentFragment];
    parse(element: Element, type?: string & {} | Templates | undefined | null, force?: boolean): void;
    observe(target: Node): void;
    signal(name: string, initial?: string): string;
}
type Macro = HTMLElement | {};
declare global {
    interface Node {
        macro: Macro;
    }
    interface Document {
        createMacro<T extends string & keyof TemplateMap>(type: T | Template<T>): TemplateMap[T];
        Macro<T extends string & keyof TemplateMap>(type: T | Template<T>, attributes: Record<string, string>): string;
    }
    interface Element {
        rhuMacro: string;
    }
}
declare const Template: <T extends never>(type: T) => Template<T>;
export declare const Macro: MacroObject;
export {};
