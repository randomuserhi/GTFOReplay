const Map_set = Map.prototype.set;
const Map_keys = Map.prototype.keys;
const Map_get = Map.prototype.get;
const Map_has = Map.prototype.has;
const WeakSet_add = WeakSet.prototype.add;
const WeakSet_delete = WeakSet.prototype.delete;
const weakRefMapRegistry = new FinalizationRegistry(({ map, key }) => {
    map.delete(key);
});
export class WeakRefMap extends Map {
    set(key, value) {
        weakRefMapRegistry.register(value, { map: this, key });
        return Map_set.call(this, key, new WeakRef(value));
    }
    get(key) {
        const raw = Map_get.call(this, key);
        if (raw === undefined)
            return undefined;
        const value = raw.deref();
        if (value === undefined)
            return undefined;
        return value;
    }
    *values() {
        for (const key of Map_keys.call(this)) {
            const value = Map_get.call(this, key).deref();
            if (value !== undefined)
                yield value;
            else
                this.delete(key);
        }
    }
    *[Symbol.iterator]() {
        for (const key of Map_keys.call(this)) {
            const value = Map_get.call(this, key).deref();
            if (value !== undefined)
                yield [key, value];
            else
                this.delete(key);
        }
    }
}
const weakCollectionRegistry = new FinalizationRegistry((map) => {
    const collection = map._collection;
    map._collection = map.__collection;
    for (const ref of collection) {
        if (ref.deref() !== undefined)
            map._collection.push(ref);
    }
    map.__collection = collection;
    map.__collection.length = 0;
});
export class WeakCollection extends WeakSet {
    constructor() {
        super(...arguments);
        this._collection = [];
        this.__collection = [];
    }
    add(...items) {
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
    }
    delete(...items) {
        if (items.length === 1) {
            this._collection = this._collection.filter((ref) => {
                const item = ref.deref();
                return item !== undefined && !items.includes(item);
            });
            return WeakSet_delete.call(this, items[0]);
        }
        for (const item of items)
            WeakSet_delete.call(this, item);
        this._collection = this._collection.filter((ref) => {
            const item = ref.deref();
            return item !== undefined && !items.includes(item);
        });
    }
    *[Symbol.iterator]() {
        const collection = this._collection;
        this._collection = this.__collection;
        for (const ref of collection) {
            const item = ref.deref();
            if (item !== undefined) {
                this._collection.push(ref);
                yield item;
            }
        }
        this.__collection = collection;
        this.__collection.length = 0;
    }
    size() {
        let count = 0;
        const collection = this._collection;
        this._collection = this.__collection;
        for (const ref of collection) {
            const item = ref.deref();
            if (item !== undefined) {
                this._collection.push(ref);
                ++count;
            }
        }
        this.__collection = collection;
        this.__collection.length = 0;
        return count;
    }
}
const weakCollectionMapRegistry = new FinalizationRegistry(({ map, key, collection }) => {
    if (collection.size() === 0)
        map.delete(key);
});
export class WeakCollectionMap extends Map {
    constructor() {
        super(...arguments);
        this.add = WeakCollectionMap.prototype.set;
    }
    set(key, value) {
        if (!Map_has.call(this, key)) {
            Map_set.call(this, key, new WeakCollection());
        }
        const collection = Map_get.call(this, key);
        collection.add(value);
        weakCollectionMapRegistry.register(value, { map: this, key, collection });
        return Map_set.call(this, key, collection);
    }
}
