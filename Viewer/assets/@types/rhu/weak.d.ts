import { ReflectConstruct } from "./rhu.js";
export interface WeakRefMap<K, V> extends Map<K, V> {
    prototype: WeakRefMap<K, V>;
}
interface WeakRefMapConstructor extends ReflectConstruct<MapConstructor, WeakRefMapConstructor> {
    new (): WeakRefMap<any, any>;
    new <K, V>(entries?: readonly (readonly [K, V])[] | null): WeakRefMap<K, V>;
    readonly prototype: WeakRefMap<any, any>;
}
export interface WeakCollection<T extends object> extends WeakSet<T> {
    prototype: WeakCollection<T>;
    _collection: WeakRef<T>[];
    __collection: WeakRef<T>[];
    add(item: T): this;
    delete(item: T): boolean;
    add(...items: T[]): void;
    delete(...items: T[]): void;
    [Symbol.iterator](): IterableIterator<T>;
    size(): number;
}
interface WeakCollectionConstructor extends ReflectConstruct<WeakSetConstructor, WeakCollectionConstructor> {
    new <T extends object = object>(values?: readonly T[] | null): WeakCollection<T>;
    readonly prototype: WeakCollection<object>;
}
export interface WeakCollectionMap<K, V extends object> {
    prototype: WeakCollectionMap<K, V>;
    delete(key: K): boolean;
    clear(): void;
    set(key: K, value: V): WeakCollectionMap<K, V>;
    add(key: K, value: V): WeakCollectionMap<K, V>;
    get(key: K): WeakCollection<V> | undefined;
    has(key: K): boolean;
    values(): IterableIterator<WeakCollection<V>>;
    entries(): IterableIterator<[key: K, value: WeakCollection<V>]>;
    [Symbol.iterator](): IterableIterator<[key: K, value: WeakCollection<V>]>;
}
interface WeakCollectionMapConstructor extends ReflectConstruct<MapConstructor, WeakCollectionMapConstructor> {
    new (): WeakCollectionMap<any, any>;
    new <K, V extends object>(entries?: readonly (readonly [K, V])[] | null): WeakCollectionMap<K, V>;
    readonly prototype: WeakCollectionMap<any, any>;
}
export declare const WeakRefMap: WeakRefMapConstructor;
export declare const WeakCollection: WeakCollectionConstructor;
export declare const WeakCollectionMap: WeakCollectionMapConstructor;
export {};
