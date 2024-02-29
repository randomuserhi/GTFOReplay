(function () {
    const RHU = window.RHU;
    if (RHU === null || RHU === undefined)
        throw new Error("No RHU found. Did you import RHU before running?");
    RHU.module(new Error(), "rhu/weak", {}, function () {
        const Map_set = Map.prototype.set;
        const Map_keys = Map.prototype.keys;
        const Map_get = Map.prototype.get;
        const WeakRefMap = RHU.reflectConstruct(Map, "WeakRefMap", function () {
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
            if (!RHU.exists(raw))
                return undefined;
            const value = raw.deref();
            if (!RHU.exists(value))
                return undefined;
            return value;
        };
        WeakRefMap.prototype.values = function* () {
            for (const key of Map_keys.call(this)) {
                const value = Map_get.call(this, key).deref();
                if (RHU.exists(value))
                    yield value;
                else
                    this.delete(key);
            }
        };
        WeakRefMap.prototype[Symbol.iterator] = function* () {
            for (const key of Map_keys.call(this)) {
                const value = Map_get.call(this, key).deref();
                if (RHU.exists(value))
                    yield [key, value];
                else
                    this.delete(key);
            }
        };
        RHU.inherit(WeakRefMap, Map);
        const WeakSet_add = WeakSet.prototype.add;
        const WeakSet_delete = WeakSet.prototype.delete;
        const WeakCollection = RHU.reflectConstruct(WeakSet, "WeakCollection", function () {
            this._collection = [];
            this._registry = new FinalizationRegistry(() => {
                this._collection = this._collection.filter((i) => {
                    return RHU.exists(i.deref());
                });
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
                    return RHU.exists(item) && !items.includes(item);
                });
                return WeakSet_delete.call(this, items[0]);
            }
            for (const item of items)
                WeakSet_delete.call(this, item);
            this._collection = this._collection.filter((ref) => {
                const item = ref.deref();
                return RHU.exists(item) && !items.includes(item);
            });
        };
        WeakCollection.prototype[Symbol.iterator] = function* () {
            const collection = this._collection;
            this._collection = [];
            for (const ref of collection) {
                const item = ref.deref();
                if (RHU.exists(item)) {
                    this._collection.push(new WeakRef(item));
                    yield item;
                }
            }
        };
        RHU.inherit(WeakCollection, WeakSet);
        return {
            WeakRefMap,
            WeakCollection,
        };
    });
})();
