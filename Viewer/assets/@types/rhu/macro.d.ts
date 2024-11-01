import { Signal } from "./signal.js";
export declare abstract class RHU_NODE {
    static is: (object: any) => object is RHU_NODE;
}
export declare class RHU_CLOSURE extends RHU_NODE {
    static instance: RHU_CLOSURE;
    static is: (object: any) => object is RHU_CLOSURE;
}
export declare class RHU_ELEMENT<T = any, Frag extends Node = Node> extends RHU_NODE {
    protected _bind?: PropertyKey;
    bind(key?: PropertyKey): this;
    protected boxed: boolean;
    box(): this;
    unbox(): this;
    callbacks: Set<(element: T, children: RHU_CHILDREN, dom: Node[]) => void>;
    then(callback: (element: T, children: RHU_CHILDREN, dom: Node[]) => void): this;
    copy(): RHU_ELEMENT<T, Frag>;
    protected _dom(target?: Record<PropertyKey, any>, children?: RHU_CHILDREN): [instance: T, fragment: Frag, dom: Node[]];
    dom<B extends T | void = void>(target?: Record<PropertyKey, any>, children?: RHU_CHILDREN): [instance: B extends void ? T : B, fragment: Frag];
    static is: (object: any) => object is RHU_ELEMENT;
}
type ElementInstance<T extends RHU_ELEMENT> = T extends RHU_ELEMENT<infer Bindings> ? Bindings : never;
export declare class RHU_ELEMENT_OPEN<T extends RHU_ELEMENT = any> extends RHU_NODE {
    element: T;
    constructor(element: T);
    box(): this;
    unbox(): this;
    copy(): RHU_ELEMENT_OPEN<T>;
    bind(key?: PropertyKey): this;
    then(callback: (element: ElementInstance<T>, children: RHU_CHILDREN, dom: Node[]) => void): this;
    dom<B extends ElementInstance<T> | void = void>(target?: Record<PropertyKey, any>, children?: RHU_CHILDREN): [instance: B extends void ? any : B, fragment: Node];
    static is: (object: any) => object is RHU_ELEMENT_OPEN;
}
export declare class RHU_SIGNAL<T = any> extends RHU_ELEMENT<Signal<T>> {
    constructor(binding: PropertyKey, toString?: (value: T) => string);
    protected _toString?: (value: T) => string;
    string(toString: (value: T) => string): void;
    protected _value: T;
    value(value: T): this;
    copy(): RHU_SIGNAL<T>;
    protected _dom(target?: Record<PropertyKey, any>): [instance: Signal<T>, fragment: Node, dom: Node[]];
    static is: (object: any) => object is RHU_SIGNAL;
}
export declare class MacroElement {
    readonly dom: Node[];
    constructor(dom: Node[], bindings?: any);
    static is: (object: any) => object is MacroElement;
}
export type RHU_CHILDREN = NodeListOf<ChildNode>;
type MacroClass = new (dom: Node[], bindings: any, children: RHU_CHILDREN, ...args: any[]) => any;
type MacroParameters<T extends MacroClass> = T extends new (dom: Node[], bindings: any, children: RHU_CHILDREN, ...args: infer P) => any ? P : never;
export declare class RHU_MACRO<T extends MacroClass = MacroClass> extends RHU_ELEMENT<InstanceType<T>, DocumentFragment> {
    type: T;
    html: RHU_HTML;
    args: MacroParameters<T>;
    constructor(html: RHU_HTML, type: T, args: MacroParameters<T>);
    open(): RHU_ELEMENT_OPEN<RHU_MACRO<T>>;
    copy(): RHU_MACRO<T>;
    protected _dom(target?: Record<PropertyKey, any>, children?: RHU_CHILDREN): [instance: InstanceType<T>, fragment: DocumentFragment, dom: Node[]];
    static is: (object: any) => object is RHU_MACRO;
}
export type MACRO<F extends FACTORY<any>> = RHU_MACRO<F extends FACTORY<infer T> ? T : any>;
interface FACTORY_HTML {
    <T extends {} = any>(first: RHU_HTML["first"], ...interpolations: RHU_HTML["interpolations"]): RHU_HTML<T>;
    readonly close: RHU_CLOSURE;
}
export declare const html: FACTORY_HTML;
export declare class RHU_HTML<T extends Record<PropertyKey, any> = any> extends RHU_ELEMENT<T, DocumentFragment> {
    static empty: RHU_HTML<any>;
    private first;
    private interpolations;
    constructor(first: RHU_HTML["first"], interpolations: RHU_HTML["interpolations"]);
    readonly close: RHU_CLOSURE;
    open(): RHU_ELEMENT_OPEN<RHU_HTML<T>>;
    copy(): RHU_HTML<T>;
    private stitch;
    protected _dom(target?: Record<PropertyKey, any>): [instance: T, fragment: DocumentFragment, dom: Node[]];
    static is: (object: any) => object is RHU_HTML;
}
export type HTML<T extends Record<PropertyKey, any> = any> = RHU_HTML<T>;
export type html<T extends () => RHU_HTML<any>> = ReturnType<T> extends RHU_HTML<infer Binds> ? Binds : any;
export type RHU_COMPONENT = RHU_HTML | RHU_MACRO;
declare const isFactorySymbol: unique symbol;
interface FACTORY<T extends MacroClass> {
    (...args: MacroParameters<T>): RHU_MACRO<T>;
    readonly close: RHU_CLOSURE;
    readonly [isFactorySymbol]: boolean;
}
export type Macro<F extends FACTORY<any>> = F extends FACTORY<infer T> ? InstanceType<T> : any;
interface MacroNamespace {
    <T extends MacroClass>(type: T, html: (...args: MacroParameters<T>) => RHU_HTML): FACTORY<T>;
    signal<T>(binding: string, value?: T, toString?: (value: T) => string): RHU_SIGNAL<T>;
    create<T extends RHU_MACRO>(macro: T): T extends RHU_MACRO<infer R> ? InstanceType<R> : never;
    observe(node: Node): void;
    map: typeof MapFactory;
    set: typeof SetFactory;
    list: typeof ListFactory;
}
export declare const Macro: MacroNamespace;
type SetValue<T extends Set<any>> = T extends Set<infer V> ? V : unknown;
export declare class RHU_MAP<K, V, Wrapper extends RHU_COMPONENT = any, Item extends RHU_COMPONENT = any> extends MacroElement {
    constructor(dom: Node[], bindings: ElementInstance<Wrapper>, children: RHU_CHILDREN, wrapperFactory: RHU_COMPONENT, itemFactory: RHU_COMPONENT, append?: SetValue<RHU_MAP<K, V, Wrapper, Item>["onappend"]>, update?: SetValue<RHU_MAP<K, V, Wrapper, Item>["onupdate"]>, remove?: SetValue<RHU_MAP<K, V, Wrapper, Item>["onremove"]>);
    private itemFactory;
    wrapper: ElementInstance<Wrapper>;
    onappend: Set<(wrapper: ElementInstance<Wrapper>, dom: Node[], item: ElementInstance<Item>, key: K, value: V) => void>;
    onupdate: Set<(item: ElementInstance<Item>, key: K, value: V) => void>;
    onremove: Set<(wrapper: ElementInstance<Wrapper>, dom: Node[], item: ElementInstance<Item>, key: K, value: V) => void>;
    private _items;
    private items;
    entries(): IterableIterator<[key: K, value: V, item: ElementInstance<Item>]>;
    values(): IterableIterator<[value: V, item: ElementInstance<Item>]>;
    keys(): IterableIterator<K>;
    clear(): void;
    get size(): number;
    has(key: K): boolean;
    get(key: K): V | undefined;
    getElement(key: K): ElementInstance<Item> | undefined;
    set(key: K, value: V): void;
    remove(key: K): void;
    assign(entries: Iterable<[key: K, value: V]>): void;
}
declare const MapFactory: <K, V, Wrapper extends RHU_COMPONENT, Item extends RHU_COMPONENT>(wrapper: Wrapper, item: Item, append?: ((wrapper: ElementInstance<Wrapper>, dom: Node[], item: ElementInstance<Item>, key: K, value: V) => void) | undefined, update?: ((item: ElementInstance<Item>, key: K, value: V) => void) | undefined, remove?: ((wrapper: ElementInstance<Wrapper>, dom: Node[], item: ElementInstance<Item>, key: K, value: V) => void) | undefined) => RHU_MACRO<{
    new (dom: Node[], bindings: ElementInstance<Wrapper>, children: RHU_CHILDREN, wrapperFactory: RHU_COMPONENT, itemFactory: RHU_COMPONENT, append?: ((wrapper: ElementInstance<Wrapper>, dom: Node[], item: ElementInstance<Item>, key: K, value: V) => void) | undefined, update?: ((item: ElementInstance<Item>, key: K, value: V) => void) | undefined, remove?: ((wrapper: ElementInstance<Wrapper>, dom: Node[], item: ElementInstance<Item>, key: K, value: V) => void) | undefined): RHU_MAP<K, V, Wrapper, Item>;
    is: (object: any) => object is MacroElement;
}>;
export declare class RHU_SET<V, Wrapper extends RHU_COMPONENT = any, Item extends RHU_COMPONENT = any> extends MacroElement {
    constructor(dom: Node[], bindings: ElementInstance<Wrapper>, children: RHU_CHILDREN, wrapperFactory: RHU_COMPONENT, itemFactory: RHU_COMPONENT, append?: SetValue<RHU_SET<V, Wrapper, Item>["onappend"]>, update?: SetValue<RHU_SET<V, Wrapper, Item>["onupdate"]>, remove?: SetValue<RHU_SET<V, Wrapper, Item>["onremove"]>);
    private itemFactory;
    wrapper: ElementInstance<Wrapper>;
    onappend: Set<(wrapper: ElementInstance<Wrapper>, dom: Node[], item: ElementInstance<Item>, value: V) => void>;
    onupdate: Set<(item: ElementInstance<Item>, value: V) => void>;
    onremove: Set<(wrapper: ElementInstance<Wrapper>, dom: Node[], item: ElementInstance<Item>, value: V) => void>;
    private _items;
    private items;
    entries(): IterableIterator<[value: V, item: ElementInstance<Item>]>;
    clear(): void;
    get size(): number;
    has(value: V): boolean;
    getElement(value: V): ElementInstance<Item> | undefined;
    add(value: V): void;
    remove(value: V): void;
    assign(entries: Iterable<V>): void;
}
declare const SetFactory: <V, Wrapper extends RHU_COMPONENT, Item extends RHU_COMPONENT>(wrapper: Wrapper, item: Item, append?: ((wrapper: ElementInstance<Wrapper>, dom: Node[], item: ElementInstance<Item>, value: V) => void) | undefined, update?: ((item: ElementInstance<Item>, value: V) => void) | undefined, remove?: ((wrapper: ElementInstance<Wrapper>, dom: Node[], item: ElementInstance<Item>, value: V) => void) | undefined) => RHU_MACRO<{
    new (dom: Node[], bindings: ElementInstance<Wrapper>, children: RHU_CHILDREN, wrapperFactory: RHU_COMPONENT, itemFactory: RHU_COMPONENT, append?: ((wrapper: ElementInstance<Wrapper>, dom: Node[], item: ElementInstance<Item>, value: V) => void) | undefined, update?: ((item: ElementInstance<Item>, value: V) => void) | undefined, remove?: ((wrapper: ElementInstance<Wrapper>, dom: Node[], item: ElementInstance<Item>, value: V) => void) | undefined): RHU_SET<V, Wrapper, Item>;
    is: (object: any) => object is MacroElement;
}>;
export declare class RHU_LIST<V, Wrapper extends RHU_COMPONENT = any, Item extends RHU_COMPONENT = any> extends MacroElement {
    constructor(dom: Node[], bindings: ElementInstance<Wrapper>, children: RHU_CHILDREN, wrapperFactory: RHU_COMPONENT, itemFactory: RHU_COMPONENT, append?: SetValue<RHU_LIST<V, Wrapper, Item>["onappend"]>, update?: SetValue<RHU_LIST<V, Wrapper, Item>["onupdate"]>, remove?: SetValue<RHU_LIST<V, Wrapper, Item>["onremove"]>);
    private itemFactory;
    wrapper: ElementInstance<Wrapper>;
    onappend: Set<(wrapper: ElementInstance<Wrapper>, dom: Node[], item: ElementInstance<Item>, value: V, index: number) => void>;
    onupdate: Set<(item: ElementInstance<Item>, value: V, index: number) => void>;
    onremove: Set<(wrapper: ElementInstance<Wrapper>, dom: Node[], item: ElementInstance<Item>, value: V, index: number) => void>;
    private _items;
    private items;
    entries(): IterableIterator<[index: number, value: V, item: ElementInstance<Item>]>;
    values(): IterableIterator<[value: V, item: ElementInstance<Item>]>;
    clear(): void;
    get length(): number;
    get(index: number): V;
    getElement(index: number): ElementInstance<Item>;
    remove(index: number): void;
    push(value: V): void;
    insert(value: V, index: number): void;
    assign(entries: Iterable<V>): void;
}
declare const ListFactory: <V, Wrapper extends RHU_COMPONENT, Item extends RHU_COMPONENT>(wrapper: Wrapper, item: Item, append?: ((wrapper: ElementInstance<Wrapper>, dom: Node[], item: ElementInstance<Item>, value: V, index: number) => void) | undefined, update?: ((item: ElementInstance<Item>, value: V, index: number) => void) | undefined, remove?: ((wrapper: ElementInstance<Wrapper>, dom: Node[], item: ElementInstance<Item>, value: V, index: number) => void) | undefined) => RHU_MACRO<{
    new (dom: Node[], bindings: ElementInstance<Wrapper>, children: RHU_CHILDREN, wrapperFactory: RHU_COMPONENT, itemFactory: RHU_COMPONENT, append?: ((wrapper: ElementInstance<Wrapper>, dom: Node[], item: ElementInstance<Item>, value: V, index: number) => void) | undefined, update?: ((item: ElementInstance<Item>, value: V, index: number) => void) | undefined, remove?: ((wrapper: ElementInstance<Wrapper>, dom: Node[], item: ElementInstance<Item>, value: V, index: number) => void) | undefined): RHU_LIST<V, Wrapper, Item>;
    is: (object: any) => object is MacroElement;
}>;
declare global {
    interface GlobalEventHandlersEventMap {
        "mount": CustomEvent;
        "dismount": CustomEvent;
    }
}
export {};
