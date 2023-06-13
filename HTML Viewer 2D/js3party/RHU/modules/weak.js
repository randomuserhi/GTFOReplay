(function () {
    let RHU = window.RHU;
    if (RHU === null || RHU === undefined)
        throw new Error("No RHU found. Did you import RHU before running?");
    RHU.import(RHU.module({ trace: new Error(),
        name: "rhu/weak", hard: ["Map", "WeakRef", "WeakSet", "FinalizationRegistry"],
        callback: function () {
            let { RHU } = window.RHU.require(window, this);
            let Map_set = Map.prototype.set;
            let Map_keys = Map.prototype.keys;
            let Map_get = Map.prototype.get;
            let a = new Map();
            RHU.WeakRefMap = RHU.reflectConstruct(Map, "WeakRefMap", function () {
                this._registry = new FinalizationRegistry((key) => {
                    this.delete(key);
                });
            });
            RHU.WeakRefMap.prototype.set = function (key, value) {
                this._registry.register(value, key);
                return Map_set.call(this, key, new WeakRef(value));
            };
            RHU.WeakRefMap.prototype.get = function (key) {
                let raw = Map_get.call(this, key);
                if (!RHU.exists(raw))
                    return undefined;
                let value = raw.deref();
                if (!RHU.exists(value))
                    return undefined;
                return value;
            };
            RHU.WeakRefMap.prototype.values = function* () {
                for (let key of Map_keys.call(this)) {
                    let value = Map_get.call(this, key).deref();
                    if (RHU.exists(value))
                        yield value;
                    else
                        this.delete(key);
                }
            };
            RHU.WeakRefMap.prototype[Symbol.iterator] = function* () {
                for (let key of Map_keys.call(this)) {
                    let value = Map_get.call(this, key).deref();
                    if (RHU.exists(value))
                        yield [key, value];
                    else
                        this.delete(key);
                }
            };
            RHU.inherit(RHU.WeakRefMap, Map);
            let WeakSet_add = WeakSet.prototype.add;
            let WeakSet_delete = WeakSet.prototype.delete;
            RHU.WeakCollection = RHU.reflectConstruct(WeakSet, "WeakCollection", function () {
                this._collection = [];
                this._registry = new FinalizationRegistry(() => {
                    this._collection = this._collection.filter((i) => {
                        return RHU.exists(i.deref());
                    });
                });
            });
            RHU.WeakCollection.prototype.add = function (...items) {
                if (items.length === 1) {
                    this._collection.push(new WeakRef(items[0]));
                    this._registry.register(items[0], undefined);
                    return WeakSet_add.call(this, items[0]);
                }
                for (let item of items) {
                    if (!this.has(item)) {
                        this._collection.push(new WeakRef(item));
                        WeakSet_add.call(this, item);
                        this._registry.register(item, undefined);
                    }
                }
            };
            RHU.WeakCollection.prototype.delete = function (...items) {
                if (items.length === 1) {
                    this._collection = this._collection.filter((ref) => {
                        let item = ref.deref();
                        return RHU.exists(item) && !items.includes(item);
                    });
                    return WeakSet_delete.call(this, items[0]);
                }
                for (let item of items)
                    WeakSet_delete.call(this, item);
                this._collection = this._collection.filter((ref) => {
                    let item = ref.deref();
                    return RHU.exists(item) && !items.includes(item);
                });
            };
            RHU.WeakCollection.prototype[Symbol.iterator] = function* () {
                let collection = this._collection;
                this._collection = [];
                for (let ref of collection) {
                    let item = ref.deref();
                    if (RHU.exists(item)) {
                        this._collection.push(new WeakRef(item));
                        yield item;
                    }
                }
            };
            RHU.inherit(RHU.WeakCollection, WeakSet);
        }
    }));
})();
