import { WeakCollection } from "./weak";
const isDirty = Symbol("isDirty");
const proto = {};
const dependencyMap = new WeakMap();
function markDirty(signal) {
    const dependencies = dependencyMap.get(signal);
    if (dependencies === undefined)
        return;
    for (const computed of dependencies) {
        computed[isDirty] = true;
        markDirty(computed);
    }
}
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
                markDirty(signal);
            }
        }
        return ref.value;
    };
    signal.on = function (callback) {
        callbacks.add(callback);
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
        if (computed[isDirty]) {
            ref.value = expression();
        }
        return ref.value;
    };
    computed.on = function (callback) {
        callbacks.add(callback);
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
    computed[isDirty] = false;
    Object.setPrototypeOf(computed, proto);
    for (const signal of dependencies) {
        if (!dependencyMap.has(signal)) {
            dependencyMap.set(signal, new WeakCollection());
        }
        const dependencies = dependencyMap.get(signal);
        dependencies.add(computed);
    }
    return computed;
}
