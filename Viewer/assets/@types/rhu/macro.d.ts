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
export declare class MacroWrapper<T extends Element | undefined = undefined> {
    element: T;
    constructor(element: T, bindings: any, target?: any);
}
interface Options {
    element?: string;
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
declare global {
    interface Node {
        macro: object;
    }
    interface Document {
        createMacro<T extends string & keyof TemplateMap>(type: T | Template<T>): TemplateMap[T];
    }
    interface Element {
        rhuMacro: string;
    }
}
declare const Template: <T extends never>(type: T) => Template<T>;
export declare const Macro: MacroObject;
export {};
