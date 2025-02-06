import { Signal, SignalEvent } from "./signal.js";
import type { ClassName } from "./style.js";
export type Mutable<T> = {
    -readonly [key in keyof T]: T[key];
};
export declare const DOM: unique symbol;
declare class RHU_FRAGMENT<T extends Record<PropertyKey, any> = Record<PropertyKey, any>> {
    private set;
    constructor(owner: RHU_FRAG<T>, ...nodes: (RHU_FRAG | Node)[]);
    static unbind(node: RHU_FRAG | Node): void;
    replaceWith(...nodes: (RHU_FRAG | Node)[]): void;
    remove(...nodes: (RHU_FRAG | Node)[]): void;
    append(...nodes: (RHU_FRAG | Node)[]): void;
    insertBefore(node: (RHU_FRAG | Node), child?: (RHU_FRAG | Node)): void;
    readonly [DOM]: RHU_FRAG<T>;
    private _first;
    private _last;
    private _length;
    get firstNode(): Node;
    get lastNode(): Node;
    get parent(): ParentNode | null;
    get first(): Node | RHU_FRAG<Record<PropertyKey, any>>;
    readonly last: Node;
    get length(): number;
    [Symbol.iterator](): Generator<Node | RHU_FRAG<Record<PropertyKey, any>>, void, unknown>;
    childNodes(): Generator<Node, void, undefined>;
}
declare class RHU_CLOSURE {
    readonly __RHU_CLOSURE__: never;
    static instance: RHU_CLOSURE;
    static is: (object: any) => object is RHU_CLOSURE;
}
declare class RHU_MARKER {
    readonly __RHU_MARKER__: never;
    static is: (object: any) => object is RHU_MARKER;
}
declare class RHU_NODE<T = any> {
    readonly node: T;
    private name?;
    private isOpen;
    bind(name?: PropertyKey): this;
    open(): this;
    private boxed?;
    box(boxed?: boolean): this;
    transform(transform: (node: T) => void): this;
    constructor(node: T);
    static is: (object: any) => object is RHU_NODE;
}
type RHU_CHILDREN = NodeListOf<ChildNode>;
declare class RHU_DOM<T extends Record<PropertyKey, any> = Record<PropertyKey, any>> extends RHU_FRAGMENT<T> {
    private binds;
    readonly ref: {
        deref(): RHU_FRAG<T> | undefined;
        hasref(): boolean;
    };
    close: RHU_CLOSURE;
    private onChildren?;
    children(cb?: (children: RHU_CHILDREN) => void): this;
    private boxed;
    box(boxed?: boolean): this;
    static is: (object: any) => object is RHU_DOM;
}
type FACTORY<T extends Record<PropertyKey, any> = Record<PropertyKey, any>> = (...args: any[]) => RHU_FRAG<T>;
type RHU_FRAG<T extends Record<PropertyKey, any> = Record<PropertyKey, any>> = T & {
    readonly [DOM]: RHU_DOM<T>;
    [Symbol.iterator]: () => IterableIterator<Node>;
};
export type html<T extends FACTORY | Record<PropertyKey, any> = Record<PropertyKey, any>> = T extends FACTORY ? ReturnType<T> extends RHU_FRAG ? ReturnType<T> : never : RHU_FRAG<T>;
export declare const isHTML: <T extends Record<PropertyKey, any> = Record<PropertyKey, any>>(object: any) => object is RHU_FRAG<T>;
type First = TemplateStringsArray;
type Single = Node | string | RHU_FRAG | RHU_NODE | RHU_CLOSURE | RHU_MARKER | SignalEvent<any> | ClassName;
type Interp = Single | (Single[]);
interface RHU_HTML {
    <T extends Record<PropertyKey, any> = Record<PropertyKey, any>>(html: RHU_FRAG<T>): RHU_DOM<T>;
    <T extends Record<PropertyKey, any> = Record<PropertyKey, any>>(first: First, ...interpolations: Interp[]): RHU_FRAG<T>;
    observe(node: Node): void;
    close(): RHU_CLOSURE;
    readonly closure: RHU_CLOSURE;
    marker(name?: PropertyKey): RHU_NODE<RHU_MARKER>;
    open<T = any>(object: T | RHU_NODE<T>): RHU_NODE<T>;
    bind<T = any>(object: T | RHU_NODE<T>, name: PropertyKey): RHU_NODE<T>;
    box<T extends Record<PropertyKey, any> = Record<PropertyKey, any>>(html: RHU_FRAG<T> | RHU_NODE<RHU_FRAG<T>>): RHU_NODE<RHU_FRAG<T>>;
    transform<T = any>(object: T | RHU_NODE<T>, transform: (node: T) => void): RHU_NODE<T>;
    map<T, H extends RHU_FRAG, K = T extends any[] ? number : T extends Map<infer K, any> ? K : any, V = T extends (infer V)[] ? V : T extends Map<any, infer V> ? V : any>(signal: Signal<T>, iterator: undefined, factory: (kv: [k: K, v: V], el?: H) => H | undefined): RHU_FRAG<{
        readonly signal: Signal<T>;
    }>;
    map<T, K, V, H extends RHU_FRAG>(signal: Signal<T>, iterator: (value: T) => IterableIterator<[key: K, value: V]> | [key: K, value: V][], factory: (kv: [k: K, v: V], el?: H) => H | undefined): RHU_FRAG<{
        readonly signal: Signal<T>;
    }>;
    ref<T extends object, R extends object>(target: T, obj: R): {
        deref(): R | undefined;
        hasref(): boolean;
    };
    ref<T extends object>(obj: T): {
        deref(): T | undefined;
        hasref(): boolean;
    };
    append(target: Node | RHU_FRAG, ...nodes: (Node | RHU_FRAG)[]): void;
    insertBefore(target: Node | RHU_FRAG, node: (Node | RHU_FRAG), ref: (Node | RHU_FRAG)): void;
    remove(target: Node | RHU_FRAG, ...nodes: (Node | RHU_FRAG)[]): void;
    replaceWith(target: Node | RHU_FRAG, ...nodes: (Node | RHU_FRAG)[]): void;
    replaceChildren(target: Element, ...nodes: (Node | RHU_FRAG)[]): void;
}
export declare const html: RHU_HTML;
declare global {
    interface GlobalEventHandlersEventMap {
        "mount": CustomEvent;
        "dismount": CustomEvent;
    }
}
export {};
