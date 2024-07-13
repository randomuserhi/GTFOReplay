declare abstract class NODE {
    static is: (object: any) => object is NODE;
}
declare class CLOSURE extends NODE {
    static instance: CLOSURE;
    static is: (object: any) => object is CLOSURE;
}
declare const symbols: {
    readonly factory: unique symbol;
};
declare class ELEMENT extends NODE {
    private _bind?;
    bind(key?: PropertyKey): this;
    static is: (object: any) => object is ELEMENT;
}
declare class SIGNAL extends ELEMENT {
    constructor(binding: string);
    private _value?;
    value(value?: string): this;
    static is: (object: any) => object is SIGNAL;
}
export declare class MacroElement {
    dom: Node[];
    constructor(dom: Node[], bindings?: any, target?: any);
    static is: (object: any) => object is MacroElement;
}
type MacroClass = new (dom: Node[], bindings: any, children: Node[], ...args: any[]) => any;
type MacroParameters<T extends MacroClass> = T extends new (dom: Node[], bindings: any, children: Node[], ...args: infer P) => any ? P : never;
declare class MACRO<T extends MacroClass = MacroClass> extends ELEMENT {
    type: T;
    html: HTML;
    args: MacroParameters<T>;
    callbacks: Set<(macro: InstanceType<T>) => void>;
    constructor(html: HTML, type: T, args: MacroParameters<T>);
    then(callback: (macro: InstanceType<T>) => void): this;
    static is: (object: any) => object is MACRO;
}
declare class MACRO_OPEN<T extends MacroClass = MacroClass> extends MACRO<T> {
    static is: (object: any) => object is MACRO_OPEN;
}
export declare function html<T extends {} = any>(first: HTML["first"], ...interpolations: HTML["interpolations"]): HTML<T>;
export declare class HTML<T extends {} = any> {
    static empty: HTML<any>;
    private first;
    private interpolations;
    constructor(first: HTML["first"], interpolations: HTML["interpolations"]);
    private _bind?;
    bind(key?: PropertyKey): this;
    callbacks: Set<(bindings: T) => void>;
    then(callback: (bindings: T) => void): this;
    dom<B extends Record<PropertyKey, any> | void = void>(): [bindings: B extends void ? T : B, fragment: DocumentFragment];
    static is: (object: any) => object is HTML;
}
interface FACTORY<T extends MacroClass> {
    (...args: MacroParameters<T>): MACRO<T>;
    readonly open: (...args: MacroParameters<T>) => MACRO_OPEN<T>;
    readonly close: CLOSURE;
    readonly [symbols.factory]: boolean;
}
export type Macro<F extends FACTORY<any>> = F extends FACTORY<infer T> ? InstanceType<T> : any;
interface MacroNamespace {
    <T extends MacroClass>(type: T, html: HTML): FACTORY<T>;
    signal(binding: string, value?: string): SIGNAL;
    create<T extends MACRO>(macro: T): T extends MACRO<infer R> ? InstanceType<R> : never;
    observe(node: Node): void;
}
export declare const Macro: MacroNamespace;
declare global {
    interface GlobalEventHandlersEventMap {
        "mount": CustomEvent;
    }
}
export {};
