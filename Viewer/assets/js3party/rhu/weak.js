import { exists, inherit, reflectConstruct } from "./rhu.js";
const Map_set = Map.prototype.set;
const Map_keys = Map.prototype.keys;
const Map_get = Map.prototype.get;
const Map_has = Map.prototype.has;
export const WeakRefMap = reflectConstruct(Map, "WeakRefMap", function () {
    this._registry = new FinalizationRegistry((key) => {
        this.delete(key);
    });
});
WeakRefMap.prototype.set = function (key, value) {
    this._registry.register(value, key);
    return Map_set.call(this, key, new WeakRef(value));
};
WeakRefMap.prototype.get = function (key) {
    const raw = Map_get.call(this, key);
    if (!exists(raw))
        return undefined;
    const value = raw.deref();
    if (!exists(value))
        return undefined;
    return value;
};
WeakRefMap.prototype.values = function* () {
    for (const key of Map_keys.call(this)) {
        const value = Map_get.call(this, key).deref();
        if (exists(value))
            yield value;
        else
            this.delete(key);
    }
};
WeakRefMap.prototype[Symbol.iterator] = function* () {
    for (const key of Map_keys.call(this)) {
        const value = Map_get.call(this, key).deref();
        if (exists(value))
            yield [key, value];
        else
            this.delete(key);
    }
};
inherit(WeakRefMap, Map);
const WeakSet_add = WeakSet.prototype.add;
const WeakSet_delete = WeakSet.prototype.delete;
export const WeakCollection = reflectConstruct(WeakSet, "WeakCollection", function () {
    this._collection = [];
    this.__collection = [];
    this._registry = new FinalizationRegistry(() => {
        const collection = this._collection;
        this._collection = this.__collection;
        for (const ref of collection) {
            if (exists(ref.deref()))
                this._collection.push(ref);
        }
        this.__collection = collection;
        this.__collection.length = 0;
    });
});
WeakCollection.prototype.add = function (...items) {
    if (items.length === 1) {
        this._collection.push(new WeakRef(items[0]));
        this._registry.register(items[0], undefined);
        return WeakSet_add.call(this, items[0]);
    }
    for (const item of items) {
        if (!this.has(item)) {
            this._collection.push(new WeakRef(item));
            WeakSet_add.call(this, item);
            this._registry.register(item, undefined);
        }
    }
};
WeakCollection.prototype.delete = function (...items) {
    if (items.length === 1) {
        this._collection = this._collection.filter((ref) => {
            const item = ref.deref();
            return exists(item) && !items.includes(item);
        });
        return WeakSet_delete.call(this, items[0]);
    }
    for (const item of items)
        WeakSet_delete.call(this, item);
    this._collection = this._collection.filter((ref) => {
        const item = ref.deref();
        return exists(item) && !items.includes(item);
    });
};
WeakCollection.prototype[Symbol.iterator] = function* () {
    const collection = this._collection;
    this._collection = this.__collection;
    for (const ref of collection) {
        const item = ref.deref();
        if (exists(item)) {
            this._collection.push(ref);
            yield item;
        }
    }
    this.__collection = collection;
    this.__collection.length = 0;
};
WeakCollection.prototype.size = function () {
    let count = 0;
    const collection = this._collection;
    this._collection = this.__collection;
    for (const ref of collection) {
        const item = ref.deref();
        if (exists(item)) {
            this._collection.push(ref);
            ++count;
        }
    }
    this.__collection = collection;
    this.__collection.length = 0;
    return count;
};
inherit(WeakCollection, WeakSet);
export const WeakCollectionMap = reflectConstruct(Map, "WeakCollectionMap", function () {
    this._registry = new FinalizationRegistry(({ key, collection }) => {
        if (collection.size() === 0)
            this.delete(key);
    });
});
WeakCollectionMap.prototype.set = function (key, value) {
    if (!Map_has.call(this, key)) {
        Map_set.call(this, key, new WeakCollection());
    }
    const collection = Map_get.call(this, key);
    collection.add(value);
    this._registry.register(value, { key, collection });
    return Map_set.call(this, key, collection);
};
WeakCollectionMap.prototype.add = WeakCollectionMap.prototype.set;
inherit(WeakCollectionMap, Map);
