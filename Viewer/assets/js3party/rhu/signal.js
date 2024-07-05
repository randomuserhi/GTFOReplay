import { WeakCollectionMap } from "./weak.js";
const _isDirty = Symbol("isDirty");
const _callbacks = Symbol("callbacks");
const proto = {};
const dependencyMap = new WeakCollectionMap();
const dirtySet = new Set();
function markDirty(signal, root = true) {
    const dependencies = dependencyMap.get(signal);
    if (dependencies === undefined)
        return;
    for (const computed of dependencies) {
        if (computed[_isDirty])
            continue;
        computed[_isDirty] = true;
        dirtySet.add(computed);
        markDirty(computed, false);
    }
    if (root) {
        for (const dirty of dirtySet) {
            for (const callback of dirty[_callbacks]) {
                callback(dirty());
            }
        }
        dirtySet.clear();
    }
}
globalThis.signals = dependencyMap;
export function isSignalType(obj) {
    return Object.prototype.isPrototypeOf.call(proto, obj);
}
export const always = () => false;
export function signal(value, equality) {
    const ref = { value };
    const callbacks = new Set();
    const signal = function (...args) {
        if (args.length !== 0) {
            const [value] = args;
            if ((equality === undefined && ref.value !== value) ||
                (equality !== undefined && !equality(ref.value, value))) {
                ref.value = value;
                for (const callback of callbacks) {
                    callback(ref.value);
                }
                markDirty(signal);
            }
        }
        return ref.value;
    };
    signal.on = function (callback) {
        if (!callbacks.has(callback)) {
            callback(ref.value);
            callbacks.add(callback);
        }
        return callback;
    };
    signal.off = function (callback) {
        return callbacks.delete(callback);
    };
    signal.equals = function (other) {
        if (equality === undefined) {
            return ref.value === other;
        }
        return equality(ref.value, other);
    };
    Object.setPrototypeOf(signal, proto);
    return signal;
}
export function computed(expression, dependencies, equality) {
    const ref = { value: undefined };
    const callbacks = new Set();
    const computed = function () {
        if (computed[_isDirty]) {
            ref.value = expression();
            computed[_isDirty] = false;
        }
        return ref.value;
    };
    computed.on = function (callback) {
        if (!callbacks.has(callback)) {
            callback(computed());
            callbacks.add(callback);
        }
        return callback;
    };
    computed.off = function (callback) {
        return callbacks.delete(callback);
    };
    computed.equals = function (other) {
        if (equality === undefined) {
            return ref.value === other;
        }
        return equality(ref.value, other);
    };
    computed[_isDirty] = true;
    computed[_callbacks] = callbacks;
    Object.setPrototypeOf(computed, proto);
    for (const signal of dependencies) {
        dependencyMap.set(signal, computed);
    }
    return computed;
}
