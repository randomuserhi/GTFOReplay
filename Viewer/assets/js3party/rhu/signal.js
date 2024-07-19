const proto = {};
export const isSignal = Object.prototype.isPrototypeOf.bind(proto);
export const always = () => false;
export function signal(value, equality) {
    const ref = { value };
    const callbacks = new Set();
    const signal = function (...args) {
        if (args.length !== 0) {
            let [value] = args;
            if (signal.guard !== undefined) {
                value = signal.guard(value);
            }
            if ((equality === undefined && ref.value !== value) ||
                (equality !== undefined && !equality(ref.value, value))) {
                ref.value = value;
                for (const callback of callbacks) {
                    callback(ref.value);
                }
                triggerEffects(signal);
            }
        }
        return ref.value;
    };
    signal.on = function (callback, options) {
        if (!callbacks.has(callback)) {
            callback(ref.value);
            callbacks.add(callback);
            if (options?.signal !== undefined) {
                options.signal.addEventListener("abort", () => callbacks.delete(callback), { once: true });
            }
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
const destructors = Symbol("effect.destructors");
const effectProto = {};
Object.setPrototypeOf(effectProto, proto);
export const isEffect = Object.prototype.isPrototypeOf.bind(effectProto);
export function effect(expression, dependencies, options) {
    const effect = function () {
        for (const destructor of effect[destructors]) {
            destructor();
        }
        effect[destructors] = [];
        const destructor = expression();
        if (destructor !== undefined) {
            effect[destructors].push(destructor);
        }
    };
    effect[destructors] = [];
    const destructor = expression();
    if (destructor !== undefined) {
        effect[destructors].push(destructor);
    }
    Object.setPrototypeOf(effect, effectProto);
    for (const signal of dependencies) {
        if (isEffect(signal))
            throw new Error("Effect cannot be used as a dependency.");
        if (!dependencyMap.has(signal)) {
            dependencyMap.set(signal, new Set());
        }
        const dependency = dependencyMap.get(signal);
        dependency.add(effect);
        if (options?.signal !== undefined) {
            options.signal.addEventListener("abort", () => dependency.delete(effect), { once: true });
        }
    }
    return effect;
}
const dependencyMap = new WeakMap();
function triggerEffects(signal) {
    const dependencies = dependencyMap.get(signal);
    if (dependencies === undefined)
        return;
    for (const effect of dependencies) {
        effect();
    }
}
export function computed(expression, dependencies, equality, options) {
    const value = signal(undefined, equality);
    const computed = function () {
        return value();
    };
    computed.on = function (callback, options) {
        value.on(callback, options);
        return callback;
    };
    computed.off = function (callback) {
        return value.off(callback);
    };
    computed.equals = function (other) {
        return value.equals(other);
    };
    computed.effect = effect(() => expression(value), dependencies, options);
    Object.setPrototypeOf(computed, proto);
    return computed;
}
