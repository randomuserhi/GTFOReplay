/// signal.ts 
///
/// @randomuserhi
/** Default string operation that all signals use as `ToString` */
const noStringOp = (v) => `${v}`;
/**
 * Equality operator that always returns false. Forces signals to always update on writes.
 * Often used for signals of objects where Javascript equality is based on the reference.
 */
export const always = () => false;
/**
 * Symbol used for accessing internal state of objects.
 * We expose the internal state through this symbol for reflect / debugging purposes.
 */
const internal = Symbol("Signal.[[Internal]]");
/** Internal dependency map that maps signals to what effects depend on them. */
const dependencyMap = new WeakMap();
/**
 * Signal prototype object.
 *
 * Used for identifying signal objects.
 */
const signalProto = {};
/** Utiltiy function that checks if the provided object is a signal. */
export const isSignal = Object.prototype.isPrototypeOf.bind(signalProto);
/**
 * Creates a signal
 *
 * @param value Starting value of the signal
 * @param equality Equality function used to determine if two values of type `T` are equal, if not provided, default javscript equality (`===`) is used.
 */
export function signal(value, equality) {
    // Recycled buffer used to reduce garbage collections
    let _callbacks = new Map();
    // Instantiate main object and interface
    const signal = function Signal(...args) {
        const self = signal[internal];
        if (args.length !== 0) {
            // Handle `signal(value)` call.
            let [value] = args;
            if (signal.guard !== undefined) {
                // If a guard is provided, obtain value from guard.
                try {
                    value = signal.guard(value, self.value);
                }
                catch (e) {
                    console.error(e);
                }
            }
            // Check equality - use the provided equality operator if provided.
            let isNotEqual = (self.equality === undefined && self.value !== value);
            if (!isNotEqual && self.equality !== undefined) {
                try {
                    isNotEqual = !self.equality(self.value, value);
                }
                catch (e) {
                    console.error(e);
                }
            }
            if (isNotEqual) {
                // If new value is not equal to current value, trigger state change.
                // Get any effects that depend on this signal
                const dependencies = dependencyMap.get(signal);
                // Call destructors PRIOR updating the internal value
                // destructors should run accessing the old value of the updating signal
                if (dependencies !== undefined) {
                    for (const effect of dependencies) {
                        const { destructor } = effect[internal];
                        if (destructor !== undefined) {
                            try {
                                destructor();
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                    }
                }
                // Update value and trigger regular callbacks, removing callbacks as per conditions.
                self.value = value;
                for (const [callback, condition] of self.callbacks) {
                    // Skip callbacks that are no longer valid as per their condition.
                    if (condition !== undefined && !condition()) {
                        continue;
                    }
                    try {
                        callback(self.value);
                    }
                    catch (e) {
                        console.error(e);
                    }
                    // Add callback to list as it is still valid.
                    _callbacks.set(callback, condition);
                }
                // Clear old callbacks list and swap with `recycledCbBuffer`.
                // This is done to reduce garbage collections.
                self.callbacks.clear();
                const temp = _callbacks;
                _callbacks = self.callbacks;
                self.callbacks = temp;
                // Trigger effect dependencies AFTER updating internal value
                if (dependencies !== undefined) {
                    for (const effect of dependencies) {
                        effect[internal].trigger();
                    }
                }
            }
        }
        // Both `signal()` and `signal(value)` calls return the internal value.
        return self.value;
    };
    signal.on = function (callback, options) {
        const self = signal[internal];
        if (!self.callbacks.has(callback)) {
            // If the callback does not already exist, add it.
            // Check condition, if it fails, don't even add callback.
            if (options?.condition !== undefined && !options.condition()) {
                return callback;
            }
            // Trigger callback for current value.
            try {
                callback(self.value);
            }
            catch (e) {
                console.error(e);
            }
            // Add callback to signal's internal book keeping.
            self.callbacks.set(callback, options?.condition);
            if (options?.signal !== undefined) {
                // If required, create abort signal event to clear callback.
                options.signal.addEventListener("abort", () => self.callbacks.delete(callback), { once: true });
            }
        }
        return callback;
    };
    signal.off = function (callback) {
        const self = signal[internal];
        return self.callbacks.delete(callback);
    };
    signal.equals = function (other) {
        const self = signal[internal];
        if (self.equality === undefined) {
            return self.value === other;
        }
        return self.equality(self.value, other);
    };
    signal.release = function () {
        const self = signal[internal];
        // Clear callbacks
        self.callbacks.clear();
        // Remove from dependency map
        dependencyMap.delete(signal);
    };
    signal.check = function () {
        const self = signal[internal];
        for (const [callback, condition] of self.callbacks) {
            if (condition !== undefined && !condition()) {
                continue;
            }
            // Add callback to list as it is still valid.
            _callbacks.set(callback, condition);
        }
        // Clear old callbacks list and swap with `self._callbacks`.
        // This is done to reduce garbage collections.
        self.callbacks.clear();
        const temp = _callbacks;
        _callbacks = self.callbacks;
        self.callbacks = temp;
        return self.callbacks.size;
    };
    signal.string = noStringOp;
    signal[Symbol.toPrimitive] = function (hint) {
        const self = signal[internal];
        if (self.value[Symbol.toPrimitive]) {
            return self.value[Symbol.toPrimitive](hint);
        }
        else {
            return self.value;
        }
    };
    Object.setPrototypeOf(signal, signalProto);
    // Generate internal state
    signal[internal] = {
        value,
        equality,
        callbacks: new Map()
    };
    return signal;
}
/**
 * Effect prototype object.
 *
 * Used for identifying effect objects.
 */
const effectProto = {};
export const isEffect = Object.prototype.isPrototypeOf.bind(effectProto);
/**
 * Creates an effect
 *
 * @param expression Effect that occures when the given dependencies change.
 * @param dependencies List if signals / computed dependencies. The effect is triggered when any one of these change.
 * @param options.signal An AbortSignal which when triggered will automatically remove this callback from the signal.
 * @param options.condition A user provided function that when returns true, will release this effect.
 *                          This condition is only checked on state changes.
 */
export function effect(expression, dependencies, options) {
    // Keep track of dependency sets this effect is apart of.
    // Use a weak ref such that when a dependency is cleaned up, the set can be GC'd even if this effect holds a reference to it.
    let dependencySets = [];
    // Instantiate main object and interface
    const effect = function Effect() {
        const self = effect[internal];
        self.destructor?.();
        self.trigger();
    };
    effect.release = function () {
        if (dependencySets === undefined)
            return;
        for (const ref of dependencySets) {
            ref.deref()?.delete(effect);
        }
        dependencySets = undefined;
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
    // Generate internal state
    effect[internal] = {
        destructor: undefined,
        trigger: function () {
            const self = effect[internal];
            // Check guard
            if (!effect.check())
                return;
            // Execute effect
            self.destructor = expression();
        }
    };
    // Add effect to dependency map
    for (const signal of dependencies) {
        if (isEffect(signal))
            throw new Error("Effect cannot be used as a dependency.");
        if (!isSignal(signal))
            throw new Error("Only signals can be used as a dependency.");
        if (!dependencyMap.has(signal)) {
            dependencyMap.set(signal, new Set());
        }
        const dependency = dependencyMap.get(signal);
        dependency.add(effect);
        // Keep track of all dependencies this effect is attached to
        dependencySets.push(new WeakRef(dependency));
    }
    if (options?.signal !== undefined) {
        // If required, create abort signal event to clear effect.
        options.signal.addEventListener("abort", () => { effect.release(); }, { once: true });
    }
    // Execute effect for the first time manually
    effect();
    return effect;
}
/**
 * Creates a computed signal.
 *
 * Syntax sugar around a signal and effect, where effect updates the signal.
 *
 * @param expression Effect that occures when the given dependencies change, provides the internal signal to update the computed state.
 * @param dependencies List if signals / computed dependencies. The effect is triggered when any one of these change.
 * @param options.signal An AbortSignal which when triggered will automatically remove this callback from the signal.
 * @param options.condition A user provided function that when returns true, will release this effect.
 *                          This condition is only checked on state changes.
 * @param options.guard User provided function that is called when the signal is written to.
 *                      The returned value is what actually gets written.
 *                      This allows the signal to guard against invalid values.
 */
export function computed(expression, dependencies, equality, options) {
    // Instantiate main object and interface
    const computed = function () {
        const self = computed[internal];
        return self.value();
    };
    computed.on = function (callback, options) {
        const self = computed[internal];
        return self.value.on(callback, options);
    };
    computed.equals = function (other) {
        const self = computed[internal];
        return self.value.equals(other);
    };
    computed.release = function () {
        const self = computed[internal];
        self.effect.release();
        self.value.release();
    };
    computed.check = function () {
        const self = computed[internal];
        if (!self.effect.check()) {
            // If the effect is released, release the internal signal as well.
            self.value.release();
        }
        return 0;
    };
    computed.string = noStringOp;
    computed[Symbol.toPrimitive] = function (hint) {
        const self = computed[internal];
        return self.value[Symbol.toPrimitive](hint);
    };
    Object.setPrototypeOf(computed, signalProto);
    // Generate internal state
    computed[internal] = {
        expression,
        value: signal(undefined, equality),
    };
    // NOTE(randomuserhi): is set after such that `.expression` is constructed and valid.
    computed[internal].effect = effect(() => computed[internal].expression(computed[internal].value), dependencies, options);
    return computed;
}
