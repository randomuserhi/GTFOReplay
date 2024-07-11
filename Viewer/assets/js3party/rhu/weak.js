import { exists, inherit, reflectConstruct } from "./rhu.js";
const Map_set = Map.prototype.set;
const Map_keys = Map.prototype.keys;
const Map_get = Map.prototype.get;
const Map_has = Map.prototype.has;
const weakRefMapRegistry = new FinalizationRegistry(({ map, key }) => {
    map.delete(key);
});
export const WeakRefMap = reflectConstruct(Map, "WeakRefMap", function () {
});
WeakRefMap.prototype.set = function (key, value) {
    weakRefMapRegistry.register(value, { map: this, key });
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
const weakCollectionRegistry = new FinalizationRegistry((map) => {
    const collection = map._collection;
    map._collection = map.__collection;
    for (const ref of collection) {
        if (exists(ref.deref()))
            map._collection.push(ref);
    }
    map.__collection = collection;
    map.__collection.length = 0;
});
export const WeakCollection = reflectConstruct(WeakSet, "WeakCollection", function () {
    this._collection = [];
    this.__collection = [];
});
WeakCollection.prototype.add = function (...items) {
    if (items.length === 1) {
        this._collection.push(new WeakRef(items[0]));
        weakCollectionRegistry.register(items[0], this);
        return WeakSet_add.call(this, items[0]);
    }
    for (const item of items) {
        if (!this.has(item)) {
            this._collection.push(new WeakRef(item));
            WeakSet_add.call(this, item);
            weakCollectionRegistry.register(item, this);
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
const weakCollectionMapRegistry = new FinalizationRegistry(({ map, key, collection }) => {
    if (collection.size() === 0)
        map.delete(key);
});
export const WeakCollectionMap = reflectConstruct(Map, "WeakCollectionMap", function () {
});
WeakCollectionMap.prototype.set = function (key, value) {
    if (!Map_has.call(this, key)) {
        Map_set.call(this, key, new WeakCollection());
    }
    const collection = Map_get.call(this, key);
    collection.add(value);
    weakCollectionMapRegistry.register(value, { map: this, key, collection });
    return Map_set.call(this, key, collection);
};
WeakCollectionMap.prototype.add = WeakCollectionMap.prototype.set;
inherit(WeakCollectionMap, Map);
