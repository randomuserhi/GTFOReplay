interface PropertyOptions {
    enumerable?: boolean;
    configurable?: boolean;
    symbols?: boolean;
    hasOwn?: boolean;
    writable?: boolean;
    get?: boolean;
    set?: boolean;
}
interface PropertyFlags {
    replace?: boolean;
    warn?: boolean;
    err?: boolean;
}
export declare function exists<T>(obj: T | undefined | null): obj is T;
export declare function parseOptions<T extends {}>(template: T, options: any | undefined | null): T;
export declare function properties(object: any, options?: PropertyOptions, operation?: (object: any, property: PropertyKey) => void): Set<PropertyKey>;
export declare function defineProperty(object: any, property: PropertyKey, options: PropertyDescriptor, flags?: PropertyFlags): boolean;
export declare function definePublicProperty(object: any, property: PropertyKey, options: PropertyDescriptor, flags?: PropertyFlags): boolean;
export declare function definePublicAccessor(object: any, property: PropertyKey, options: PropertyDescriptor, flags?: PropertyFlags): boolean;
export declare function defineProperties(object: any, props: {
    [x: PropertyKey]: PropertyDescriptor;
}, flags?: PropertyFlags): void;
export declare function definePublicProperties(object: any, props: {
    [x: PropertyKey]: PropertyDescriptor;
}, flags?: PropertyFlags): void;
export declare function definePublicAccessors(object: any, props: {
    [x: PropertyKey]: PropertyDescriptor;
}, flags?: PropertyFlags): void;
export declare function assign<T>(target: T, source: any, options?: PropertyFlags): T;
export declare function deleteProperties(object: any, preserve?: {}): void;
export declare function clone<T extends object>(object: any, prototype?: T): T;
export declare function clearAttributes(element: HTMLElement): void;
export declare function getElementById(id: string, clearID?: boolean): HTMLElement | null;
export declare function CreateEvent(type: string, detail: any): CustomEvent;
export interface Constructor {
    new (...args: any[]): any;
    prototype: any;
}
export type Prototype<T extends Constructor> = T extends {
    new (...args: any[]): any;
    prototype: infer Proto;
} ? Proto : never;
export interface ReflectConstruct<Base extends Constructor, T> extends Constructor {
    __reflect__(newTarget: any, args: any[]): T | undefined;
    __constructor__(...args: any[]): void;
    __args__(...args: any[]): ConstructorParameters<Base>;
}
export declare function isConstructor(object: any): boolean;
export declare function inherit(child: Function, base: Function): void;
export declare function reflectConstruct<T extends Constructor, K extends T>(base: T, name: string, constructor: (...args: any[]) => void, argnames?: string[]): ReflectConstruct<T, Prototype<K>>;
export {};
