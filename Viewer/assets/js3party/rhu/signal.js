const proto = {};
const noStringOp = (v) => `${v}`;
export const isSignal = Object.prototype.isPrototypeOf.bind(proto);
export const always = () => false;
export function signal(value, equality) {
    const ref = { value };
    const callbacks = {
        value: new Map(),
        buffer: new Map()
    };
    const signal = function (...args) {
        if (args.length !== 0) {
            let [value] = args;
            if (signal.guard !== undefined) {
                value = signal.guard(value, ref.value);
            }
            if ((equality === undefined && ref.value !== value) ||
                (equality !== undefined && !equality(ref.value, value))) {
                const dependencies = dependencyMap.get(signal);
                if (dependencies !== undefined) {
                    for (const effect of dependencies) {
                        for (const destructor of effect[destructors]) {
                            destructor();
                        }
                    }
                }
                ref.value = value;
                for (const [callback, condition] of callbacks.value) {
                    if (condition !== undefined && !condition()) {
                        continue;
                    }
                    callback(ref.value);
                    callbacks.buffer.set(callback, condition);
                }
                callbacks.value.clear();
                const temp = callbacks.buffer;
                callbacks.buffer = callbacks.value;
                callbacks.value = temp;
                if (dependencies !== undefined) {
                    for (const effect of dependencies) {
                        effect();
                    }
                }
            }
        }
        return ref.value;
    };
    signal.on = function (callback, options) {
        if (!callbacks.value.has(callback)) {
            if (options?.condition !== undefined && !options.condition()) {
                return callback;
            }
            callback(ref.value);
            callbacks.value.set(callback, options?.condition);
            if (options?.signal !== undefined) {
                options.signal.addEventListener("abort", () => callbacks.value.delete(callback), { once: true });
            }
        }
        return callback;
    };
    signal.off = function (callback) {
        return callbacks.value.delete(callback);
    };
    signal.equals = function (other) {
        if (equality === undefined) {
            return ref.value === other;
        }
        return equality(ref.value, other);
    };
    signal.release = function () {
        callbacks.value.clear();
        callbacks.buffer.clear();
    };
    signal.check = function () {
        for (const [callback, condition] of callbacks.value) {
            if (condition !== undefined && !condition()) {
                continue;
            }
            callbacks.buffer.set(callback, condition);
        }
        callbacks.value.clear();
        const temp = callbacks.buffer;
        callbacks.buffer = callbacks.value;
        callbacks.value = temp;
        return callbacks.value.size;
    };
    signal.string = noStringOp;
    signal[Symbol.toPrimitive] = function (hint) {
        if (ref.value[Symbol.toPrimitive]) {
            return ref.value[Symbol.toPrimitive](hint);
        }
        else {
            return ref.value;
        }
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
        if (!effect.check())
            return;
        effect[destructors] = [];
        const destructor = expression();
        if (destructor !== undefined) {
            effect[destructors].push(destructor);
        }
    };
    let deps = [];
    for (const signal of dependencies) {
        if (isEffect(signal))
            throw new Error("Effect cannot be used as a dependency.");
        if (!dependencyMap.has(signal)) {
            dependencyMap.set(signal, new Set());
        }
        const dependency = dependencyMap.get(signal);
        dependency.add(effect);
        deps.push(new WeakRef(dependency));
    }
    effect.release = function () {
        if (deps === undefined)
            return;
        for (const ref of deps) {
            ref.deref()?.delete(effect);
        }
        deps = undefined;
    };
    effect.check = function () {
        if (options?.condition !== undefined) {
            if (!options.condition()) {
                effect.release();
                return false;
            }
        }
        return true;
    };
    Object.setPrototypeOf(effect, effectProto);
    if (options?.signal !== undefined) {
        options.signal.addEventListener("abort", () => {
            effect.release();
        }, { once: true });
    }
    effect();
    return effect;
}
const dependencyMap = new WeakMap();
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
    computed.release = computed.effect.release;
    computed.check = function () {
        if (!computed.effect.check()) {
            value.release();
        }
        return value.check();
    };
    computed.string = noStringOp;
    computed[Symbol.toPrimitive] = function (hint) {
        return value[Symbol.toPrimitive](hint);
    };
    Object.setPrototypeOf(computed, proto);
    return computed;
}
