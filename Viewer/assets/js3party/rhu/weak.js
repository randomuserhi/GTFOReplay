function isConstructor(object) {
    try {
        Reflect.construct(String, [], object);
    }
    catch (e) {
        return false;
    }
    return true;
}
function inherit(child, base) {
    Object.setPrototypeOf(child.prototype, base.prototype);
    Object.setPrototypeOf(child, base);
}
function reflectConstruct(base, name, constructor, argnames) {
    if (!isConstructor(base))
        throw new TypeError("'constructor' and 'base' must be object constructors.");
    let args = argnames;
    if (args === undefined) {
        args = ["...args"];
        const STRIP_COMMENTS = /((\/\/.*$)|(\/\*.*\*\/))/mg;
        const funcString = constructor.toString().replace(STRIP_COMMENTS, "");
        if (funcString.indexOf("function") === 0) {
            const s = funcString.substring("function".length).trimStart();
            args = s.substring(s.indexOf("(") + 1, s.indexOf(")"))
                .split(",")
                .map((a) => {
                let clean = a.trim();
                clean = clean.split(/[ =]/)[0];
                return clean;
            })
                .filter((c) => c !== "");
        }
    }
    let definition;
    const argstr = args.join(",");
    if (name === undefined)
        name = constructor.name;
    name.replace(/[ \t\r\n]/g, "");
    if (name === "")
        name = "__ReflectConstruct__";
    const parts = name.split(".").filter(c => c !== "");
    let evalStr = "{ let ";
    for (let i = 0; i < parts.length - 1; ++i) {
        const part = parts[i];
        evalStr += `${part} = {}; ${part}.`;
    }
    evalStr += `${parts[parts.length - 1]} = function(${argstr}) { return definition.__reflect__.call(this, new.target, [${argstr}]); }; definition = ${parts.join(".")} }`;
    eval(evalStr);
    if (definition === undefined) {
        console.warn("eval() call failed to create reflect constructor. Using fallback...");
        definition = function (...args) {
            return definition.__reflect__.call(this, new.target, args);
        };
    }
    definition.__constructor__ = constructor;
    definition.__args__ = function () {
        return [];
    };
    definition.__reflect__ = function (newTarget, args = []) {
        if (newTarget !== undefined) {
            const obj = Reflect.construct(base, definition.__args__(...args), definition);
            definition.__constructor__.call(obj, ...args);
            return obj;
        }
        else
            definition.__constructor__.call(this, ...args);
    };
    return definition;
}
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
    if (raw === undefined)
        return undefined;
    const value = raw.deref();
    if (value === undefined)
        return undefined;
    return value;
};
WeakRefMap.prototype.values = function* () {
    for (const key of Map_keys.call(this)) {
        const value = Map_get.call(this, key).deref();
        if (value !== undefined)
            yield value;
        else
            this.delete(key);
    }
};
WeakRefMap.prototype[Symbol.iterator] = function* () {
    for (const key of Map_keys.call(this)) {
        const value = Map_get.call(this, key).deref();
        if (value !== undefined)
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
        if (ref.deref() !== undefined)
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
};
WeakCollection.prototype[Symbol.iterator] = function* () {
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
};
WeakCollection.prototype.size = function () {
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
