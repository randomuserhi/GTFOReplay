import { core, Core } from "./core.cjs";

export interface Weak
{
    WeakRefMap: WeakRefMapConstructor;
    WeakCollection: WeakCollectionConstructor;
}

export interface WeakRefMap<K, V> extends Map<K, V>
{
    prototype: WeakRefMap<K, V>;
    _registry: FinalizationRegistry<K>;
}
interface WeakRefMapConstructor extends Core.ReflectConstruct<MapConstructor, WeakRefMapConstructor>
{
    new(): WeakRefMap<any, any>;
    new <K, V>(entries?: readonly (readonly [K, V])[] | null): WeakRefMap<K, V>;
    readonly prototype: WeakRefMap<any, any>;
}

export interface WeakCollection<T extends object> extends WeakSet<T>
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
interface WeakCollectionConstructor extends Core.ReflectConstruct<WeakSetConstructor, WeakCollectionConstructor>
{
    new <T extends object = object>(values?: readonly T[] | null): WeakCollection<T>;
    readonly prototype: WeakCollection<object>;
}

const Map_set = Map.prototype.set;
const Map_keys = Map.prototype.keys;
const Map_get = Map.prototype.get;

export const WeakRefMap: WeakRefMapConstructor = core.reflectConstruct(Map, "WeakRefMap", function<K, V>(this: WeakRefMap<K, V>) {
    // TODO(randomuserhi): Consider moving FinalizationRegistry to a soft dependency since this just assists
    //                     cleaning up huge amounts of divs being created, since otherwise cleanup of the
    //                     collection only occures on deletion / iteration of the collection which can
    //                     cause huge memory consumption as the collection of WeakRef grows.
    //                     - The version that runs without FinalizationRegistry, if it is moved, to a soft
    //                       dependency, would simply run a setTimeout loop which will filter the collection every
    //                       30 seconds or something (or do analysis on how frequent its used to determine how often)
    //                       cleanup is required.
    this._registry = new FinalizationRegistry((key) => {
        this.delete(key);
    });
}) as WeakRefMapConstructor;
WeakRefMap.prototype.set = function(key, value) {
    this._registry.register(value, key);
    return Map_set.call(this, key, new WeakRef(value));
};
WeakRefMap.prototype.get = function(key) {
    const raw = Map_get.call(this, key);
    if (!core.exists(raw)) return undefined;
    const value = raw.deref();
    if (!core.exists(value)) return undefined;
    return value;
};
WeakRefMap.prototype.values = function* () {
    for (const key of Map_keys.call(this)) {
        const value = Map_get.call(this, key).deref();
        if (core.exists(value)) yield value;
        else this.delete(key);
    }
};
WeakRefMap.prototype[Symbol.iterator] = function* () {
    for (const key of Map_keys.call(this)) {
        const value = Map_get.call(this, key).deref();
        if (core.exists(value)) yield [ key, value ];
        else this.delete(key);
    }
};
core.inherit(WeakRefMap, Map);

const WeakSet_add = WeakSet.prototype.add;
const WeakSet_delete = WeakSet.prototype.delete;

export const WeakCollection: WeakCollectionConstructor = core.reflectConstruct(WeakSet, "WeakCollection", function<T extends object>(this: WeakCollection<T>) {
    this._collection = [];
    // TODO(randomuserhi): Consider moving FinalizationRegistry to a soft dependency since this just assists
    //                     cleaning up huge amounts of divs being created, since otherwise cleanup of the
    //                     collection only occures on deletion / iteration of the collection which can
    //                     cause huge memory consumption as the collection of WeakRef grows.
    //                     - The version that runs without FinalizationRegistry, if it is moved, to a soft
    //                       dependency, would simply run a setTimeout loop which will filter the collection every
    //                       30 seconds or something (or do analysis on how frequent its used to determine how often)
    //                       cleanup is required.
    this._registry = new FinalizationRegistry(() => {
        this._collection = this._collection.filter((i) => {
            return core.exists(i.deref()); 
        });
    });
}) as WeakCollectionConstructor;
WeakCollection.prototype.add = function(...items) {
    if (items.length === 1) {
        this._collection.push(new WeakRef(items[0]));
        this._registry.register(items[0], undefined as any);
        return WeakSet_add.call(this, items[0]);
    }
    
    for (const item of items) {
        if (!this.has(item)) {
            this._collection.push(new WeakRef(item));
            WeakSet_add.call(this, item);
            this._registry.register(item, undefined as any);
        }
    }
};
WeakCollection.prototype.delete = function(...items) {
    if (items.length === 1) {
        this._collection = this._collection.filter((ref: WeakRef<object>) => {
            const item: object | undefined = ref.deref();
            return core.exists(item) && !items.includes(item); 
        });
        return WeakSet_delete.call(this, items[0]);
    }

    for (const item of items)
        WeakSet_delete.call(this, item);
    this._collection = this._collection.filter((ref) => {
        const item: object | undefined = ref.deref();
        return core.exists(item) && !items.includes(item); 
    });
};
WeakCollection.prototype[Symbol.iterator] = function* () {
    const collection = this._collection;
    this._collection = []; 
    for (const ref of collection) {
        const item: object | undefined = ref.deref();
        if (core.exists(item)) {
            this._collection.push(new WeakRef(item));
            yield item;
        }
    }
};
core.inherit(WeakCollection, WeakSet);

export const weak: Weak = {
    WeakRefMap: WeakRefMap,
    WeakCollection: WeakCollection
};