import { SignalBase } from "./signal.js";
import type { ClassName } from "./style.js";
/** Utility type that makes type `T` mutable, even if its marked as readonly. */
export type Mutable<T> = {
    -readonly [key in keyof T]: T[key];
};
/** Symbol for accessing DOM interface on a Fragment. */
export declare const DOM: unique symbol;
/** Represents valid children types of components. */
type RHU_CHILDREN = NodeListOf<ChildNode>;
/**
 * Collection of elements or components.
 *
 * Can be thought of as <></> from React.
 */
declare class RHU_FRAGMENT<T extends Record<PropertyKey, any> = Record<PropertyKey, any>> {
    /** Internal collection of nodes / components that make up this fragment. */
    private nodes;
    /** Access to component the fragment belongs to. */
    readonly [DOM]: RHU.Component<T>;
    /**
     * The node used as the fragment marker that always appears at the end of the fragment.
     * This is typically a comment.
     *
     * This is to control garbage collection when referencing components.
     * If some code needs to run without holding a strong reference to the elements / components,
     * it will pass all references through this comment.
     *
     * This way, if the component is GC'd but the comment remains on DOM, everything still
     * works and vice versa (since the comment holds a reference to the html object).
     *
     * But if both the comment and the component is GC'd then the reference can be cleared and detected
     * through the WeakRef to this comment node.
     *
     * The comment node also serves as a positional point so the code knows where to append / replace
     * nodes to.
     */
    private readonly marker;
    /** The first node in the fragment. */
    private _first;
    /**
     * The last node in the fragment
     *
     * This is always the comment marker, and thus can be readonly.
     */
    private readonly _last;
    /** The size of the fragment */
    private _length;
    constructor(owner: RHU.Component<T>, ...nodes: (RHU.Component | Node)[]);
    /**
     * Mark the provided node / component as not being owned by any fragment, clearing it of its metadata
     * and removing the node / component from the fragment.
     */
    static unbind(node: RHU.Component | Node): void;
    /** Append the nodes / components to this fragment. */
    append(...nodes: (RHU.Component | Node)[]): void;
    /** Remove nodes / components from this fragment */
    remove(...nodes: (RHU.Component | Node)[]): void;
    /** Insert `child` node before the target `node` */
    insertBefore(node: (RHU.Component | Node), child?: (RHU.Component | Node)): void;
    /** Replace the fragment with a node / component in the DOM. */
    replaceWith(...nodes: (RHU.Component | Node)[]): void;
    /** Get the first node / component in the fragment, not including the fragment marker. */
    get first(): Node | RHU.Component<Record<PropertyKey, any>> | undefined;
    /** Gets the actual first DOM Node, not including the fragment marker. */
    get firstNode(): Node | undefined;
    /** Get the last node / component in the fragment, not including the fragment marker. */
    get last(): Node | RHU.Component<Record<PropertyKey, any>> | undefined;
    /** Gets the actual last DOM Node, not including the fragment marker. */
    get lastNode(): Node | undefined;
    /** Get the first node / component in the fragment, including the fragment marker. */
    get __first(): Node | RHU.Component<Record<PropertyKey, any>>;
    /** Gets the actual first DOM Node, including the fragment marker. */
    get __firstNode(): Node;
    /** Get the last node / component in the fragment, including the fragment marker. */
    get __last(): Node | RHU.Component<Record<PropertyKey, any>>;
    /** Gets the actual last DOM Node, including the fragment marker. */
    get __lastNode(): Node;
    /** Get the parent of the fragment, when attached to DOM. */
    get parent(): ParentNode | null;
    /** Size of the fragment */
    get length(): number;
    /**
     * Get all elements / components within the fragment.
     * Includes the marker node.
     */
    [Symbol.iterator](): Generator<Node | RHU.Component<Record<PropertyKey, any>>, void, unknown>;
    /**
     * Get all elements of the fragment, decomponsing components into their elements.
     * Include the marker node.
     */
    childNodes(): Generator<Node, void, undefined>;
}
/**
 * A component is a custom element made up from other components / elements.
 */
declare class RHU_COMPONENT<T extends Record<PropertyKey, any> = Record<PropertyKey, any>> extends RHU_FRAGMENT<T> {
    private binds;
    /** Weak ref to the component's fragment marker. */
    readonly ref: {
        deref(): RHU.Component<T> | undefined;
        hasref(): boolean;
    };
    close: RHU_CLOSURE;
    private onChildren?;
    /** Set the callback which occures when children are added to the component. */
    children(cb?: (children: RHU_CHILDREN) => void): this;
    private boxed;
    /** If true, boxes the bindings such that they are not inheritted directly when used. */
    box(boxed?: boolean): this;
    static is: (object: any) => object is RHU_COMPONENT;
}
/**
 * A marker is just a html comment that marks a position in the DOM tree.
 */
declare class RHU_MARKER {
    readonly __RHU_MARKER__: never;
    static is: (object: any) => object is RHU_MARKER;
}
/**
 * Wrapper around any object that needs to be treated like a HTML DOM node.
 *
 * The wrapper allows providing HTML properties to the object without extending the object to support them.
 */
declare class RHU_NODE<T = any> {
    readonly node: T;
    private name?;
    private isOpen;
    /** Bind the node to a given property key. */
    bind(name?: PropertyKey): this;
    /**
     * Generate the opening tag for the given node.
     *
     * The opening tag must be closed by a RHU_CLOSURE.
     */
    open(): this;
    private boxed?;
    /**
     * If true, the bindings of the component are boxed behind a single property.
     * Otherwise, the bindings are directly inheritted.
     *
     * Only valid if wrapping a `RHU.Component`.
     */
    box(boxed?: boolean): this;
    /**
     * Executes a transformation onto this node immediately. Allows for applying changes to a given
     * component inline.
     */
    transform(transform: (node: T) => void): this;
    constructor(node: T);
    static is: (object: any) => object is RHU_NODE;
}
/**
 * Implementation the closing tag of an element.
 *
 * Used with opening tags to mark the end.
 */
declare class RHU_CLOSURE {
    readonly __RHU_CLOSURE__: never;
    static instance: RHU_CLOSURE;
    static is: (object: any) => object is RHU_CLOSURE;
}
export declare namespace RHU {
    type Marker = RHU_MARKER;
    type Node<T = any> = RHU_NODE<T>;
    type Component<T extends Record<PropertyKey, any> = Record<PropertyKey, any>> = T & {
        readonly [DOM]: RHU_COMPONENT<T>;
        [Symbol.iterator]: () => IterableIterator<globalThis.Node>;
    };
    type FC<T extends Record<PropertyKey, any> = Record<PropertyKey, any>> = (...args: any[]) => Component<T>;
}
export type html<T extends RHU.FC | Record<PropertyKey, any> = Record<PropertyKey, any>> = T extends RHU.FC ? ReturnType<T> extends RHU.Component ? ReturnType<T> : never : RHU.Component<T>;
/** Returns true if the node is a RHU.Component */
export declare const isHTML: <T extends Record<PropertyKey, any> = Record<PropertyKey, any>>(object: any) => object is RHU.Component<T>;
type First = TemplateStringsArray;
type Single = Node | string | RHU.Component | RHU_NODE | RHU_CLOSURE | RHU_MARKER | SignalBase<any> | ClassName;
type Interp = Single | (Single[]);
export declare namespace RHU {
    interface HTML {
        /**
         * @returns Internal DOM component state from a `RHU.Component`.
         * The internal DOM component state controls the whether the component is boxed, or how it reacts to children.
         */
        <T extends Record<PropertyKey, any> = Record<PropertyKey, any>>(html: RHU.Component<T>): RHU_COMPONENT<T>;
        /** @returns `RHU.Component` */
        <T extends Record<PropertyKey, any> = Record<PropertyKey, any>>(first: First, ...interpolations: Interp[]): RHU.Component<T>;
        /** Creates a closure to close any open components. */
        close(): RHU_CLOSURE;
        /** Static closure instance. */
        readonly closure: RHU_CLOSURE;
        /** Create a positional marker on the DOM. */
        marker(name?: PropertyKey): RHU.Node<RHU_MARKER>;
        /** Create an open tag for the given object that needs to be treated as a DOM element. */
        open<T = any>(object: T | RHU.Node<T>): RHU.Node<T>;
        /** Bind the provided object that needs to be treated as a DOM element such that it can be accessed in `RHU.Component`. */
        bind<T = any>(object: T | RHU.Node<T>, name: PropertyKey): RHU.Node<T>;
        /** Refer to `RHU.Component<T>.box` */
        box<T extends Record<PropertyKey, any> = Record<PropertyKey, any>>(html: RHU.Component<T> | RHU.Node<RHU.Component<T>>): RHU.Node<RHU.Component<T>>;
        /** Refer to `RHU.Node<T>.transform` */
        transform<T = any>(object: T | RHU.Node<T>, transform: (node: T) => void): RHU.Node<T>;
        /**
         * Map a signal of an array or map to elements.
         *
         * TODO(randomuserhi): Expand documentation here - provide an example of how to use.
         */
        map<T, H extends RHU.Component, K = T extends any[] ? number : T extends Map<infer K, any> ? K : any, V = T extends (infer V)[] ? V : T extends Map<any, infer V> ? V : any>(signal: SignalBase<T>, iterator: undefined, factory: (kv: [k: K, v: V], el?: H) => H | undefined): RHU.Component<{
            readonly signal: SignalBase<T>;
        }>;
        map<T, K, V, H extends RHU.Component>(signal: SignalBase<T>, iterator: (value: T) => IterableIterator<[key: K, value: V]> | [key: K, value: V][], factory: (kv: [k: K, v: V], el?: H) => H | undefined): RHU.Component<{
            readonly signal: SignalBase<T>;
        }>;
        /**
         * @returns Weakref to the given object where its lifetime is tied to the provided target.
         * - Whilst the target is still retained, the object is also retained.
         * - If the target is GC'd, the object may be GC'd as long as no other references to it exist.
         */
        ref<T extends object, R extends object>(target: T, obj: R): {
            deref(): R | undefined;
            hasref(): boolean;
        };
        /** @returs Weakref to the given object */
        ref<T extends object>(obj: T): {
            deref(): T | undefined;
            hasref(): boolean;
        };
        append(target: globalThis.Node | RHU.Component, ...nodes: (globalThis.Node | RHU.Component)[]): void;
        insertBefore(target: globalThis.Node | RHU.Component, node: (globalThis.Node | RHU.Component), ref: (globalThis.Node | RHU.Component)): void;
        remove(target: globalThis.Node | RHU.Component, ...nodes: (globalThis.Node | RHU.Component)[]): void;
        replaceWith(target: globalThis.Node | RHU.Component, ...nodes: (globalThis.Node | RHU.Component)[]): void;
        replaceChildren(target: Element, ...nodes: (globalThis.Node | RHU.Component)[]): void;
    }
}
export declare const html: RHU.HTML;
export {};
