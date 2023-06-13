interface RHU
{

    WeakRefMap?: RHU.WeakRefMapConstructor;

    WeakCollection?: RHU.WeakCollectionConstructor;
}

declare namespace RHU
{
    interface WeakRefMap<K, V> extends Map<K, V>
    {
        prototype: WeakRefMap<K, V>;
        _registry: FinalizationRegistry<K>;
    }
    interface WeakRefMapConstructor extends ReflectConstruct<MapConstructor, WeakRefMapConstructor>
    {
        new(): WeakRefMap<any, any>;
        new <K, V>(entries?: readonly (readonly [K, V])[] | null): WeakRefMap<K, V>;
        readonly prototype: WeakRefMap<any, any>;
    }

    interface WeakCollection<T extends object> extends WeakSet<T>
    {
        prototype: WeakCollection<T>;
        _registry: FinalizationRegistry<T>;
        _collection: WeakRef<T>[];
        add(item: T): this;
        delete(item: T): boolean;
        add(...items: T[]): void;
        delete(...items: T[]): void;
        [Symbol.iterator](): IterableIterator<T>;
    }
    interface WeakCollectionConstructor extends ReflectConstruct<WeakSetConstructor, WeakCollectionConstructor>
    {
        new <T extends object = object>(values?: readonly T[] | null): WeakCollection<T>;
        readonly prototype: WeakCollection<object>;
    }
}