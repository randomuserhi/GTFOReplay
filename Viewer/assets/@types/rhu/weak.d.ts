export declare class WeakRefMap<K, V extends object> extends Map<K, V> {
    set(key: K, value: V): any;
    get(key: K): V | undefined;
    values(): Generator<any, void, unknown>;
    [Symbol.iterator](): IterableIterator<[key: K, value: V]>;
}
export declare class WeakCollection<T extends object> extends WeakSet<T> {
    private _collection;
    private __collection;
    add(...items: T[]): any;
    delete(...items: T[]): any;
    [Symbol.iterator](): Generator<T, void, unknown>;
    size(): number;
}
export declare class WeakCollectionMap<K, V extends object> extends Map<K, V> {
    set(key: K, value: V): any;
    add: (key: any, value: any) => any;
}
