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
 * Signal base prototype object.
 *
 * Used for identifying signal objects.
 */
const signalProto = {};
/** Utility function that checks if the provided object is a signal. */
export const isSignal = Object.prototype.isPrototypeOf.bind(signalProto);
/**
 * Signal prototype implementation.
 */
const signalImpl = {
    on(callback, options) {
        const self = this[internal];
        if (!self.callbacks.has(callback)) {
            // If the callback does not already exist, add it.
            // Check condition, if it fails, don't even add callback.
            if (options?.condition !== undefined && !options.condition()) {
                return callback;
            }
            // Add callback to signal's internal book keeping.
            self.callbacks.set(callback, options?.condition);
            if (options?.signal !== undefined) {
                // If required, create abort signal event to clear callback.
                options.signal.addEventListener("abort", () => self.callbacks.delete(callback), { once: true });
            }
            // Trigger callback for current value.
            try {
                callback(self.value);
            }
            catch (e) {
                console.error(e);
            }
        }
        return callback;
    },
    off(callback) {
        const self = this[internal];
        return self.callbacks.delete(callback);
    },
    equals(other) {
        const self = this[internal];
        if (self.equality === undefined) {
            return self.value === other;
        }
        return self.equality(self.value, other);
    },
    release() {
        const self = this[internal];
        // Clear callbacks
        self.callbacks.clear();
        // Remove from dependency map
        dependencyMap.delete(this);
    },
    check() {
        const self = this[internal];
        // Iterate through callback conditions
        for (const [callback, condition] of self.callbacks) {
            if (condition !== undefined && !condition()) {
                // If a condition exists and it returns false, delete the callback. 
                self.callbacks.delete(callback);
            }
        }
        return self.callbacks.size;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    [Symbol.toPrimitive](hint) {
        const self = this[internal];
        return self.value;
    }
};
Object.setPrototypeOf(signalImpl, signalProto);
/**
 * Creates a signal
 *
 * @param value Starting value of the signal
 * @param equality Equality function used to determine if two values of type `T` are equal, if not provided, default javscript equality (`===`) is used.
 */
export function signal(value, equality) {
    // Instantiate main object and interface
    const signal = ((...args) => {
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
                // Call and clear destructors PRIOR updating the internal value
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
                            effect[internal].destructor = undefined;
                        }
                    }
                }
                // Update value and trigger regular callbacks, removing callbacks as per conditions.
                self.value = value;
                for (const [callback, condition] of self.callbacks) {
                    // Skip and remove callbacks that are no longer valid as per their condition.
                    if (condition !== undefined && !condition()) {
                        self.callbacks.delete(callback);
                        continue;
                    }
                    try {
                        callback(self.value);
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
                // Trigger effect dependencies AFTER updating internal value
                if (dependencies !== undefined) {
                    for (const effect of dependencies) {
                        effect(internal);
                    }
                }
            }
        }
        // Both `signal()` and `signal(value)` calls return the internal value.
        return self.value;
    });
    signal.string = noStringOp;
    Object.setPrototypeOf(signal, signalImpl);
    // Generate internal state
    signal[internal] = {
        value,
        equality,
        callbacks: new Map()
    };
    return signal;
}
/**
 * Effect base prototype object.
 *
 * Used for identifying effect objects.
 */
const effectProto = {};
export const isEffect = Object.prototype.isPrototypeOf.bind(effectProto);
/**
 * Effect prototype implementation.
 */
const effectImpl = {
    release() {
        const self = this[internal];
        // Call and clear destructor if present
        if (self.destructor !== undefined) {
            try {
                self.destructor();
            }
            catch (e) {
                console.error(e);
            }
            self.destructor = undefined;
        }
        // Remove effect from dependency map
        if (self.dependencySets === undefined)
            return;
        for (const ref of self.dependencySets) {
            ref.deref()?.delete(this);
        }
        self.dependencySets = undefined;
    },
    check() {
        const self = this[internal];
        if (self.condition !== undefined) {
            if (!self.condition()) {
                this.release();
                return false;
            }
        }
        return true;
    }
};
Object.setPrototypeOf(effectImpl, effectProto);
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
    // Instantiate main object and interface
    const effect = ((caller) => {
        const self = effect[internal];
        // Call and clear destructor if not called internally as signals have different
        // execution order for the destructor.
        if (caller !== internal && self.destructor !== undefined) {
            try {
                self.destructor();
            }
            catch (e) {
                console.error(e);
            }
            self.destructor = undefined;
        }
        // Check guard
        if (!effect.check())
            return;
        // Execute effect
        self.destructor = expression();
    });
    Object.setPrototypeOf(effect, effectImpl);
    // Generate internal state
    effect[internal] = {
        destructor: undefined,
        dependencySets: [],
        signal: options?.signal,
        condition: options?.condition
    };
    const self = effect[internal];
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
        // Keep track of all dependencies this effect is attached to.
        //
        // We do not need to check for duplicates as there are no side effects if this contains the same 
        // dependency set twice.
        self.dependencySets.push(new WeakRef(dependency));
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
 * Computed prototype implementation.
 */
const computedImpl = {
    on(callback, options) {
        const self = this[internal];
        return self.value.on(callback, options);
    },
    equals(other) {
        const self = this[internal];
        return self.value.equals(other);
    },
    release() {
        const self = this[internal];
        self.effect.release();
        self.value.release();
    },
    check() {
        const self = this[internal];
        if (!self.effect.check()) {
            // If the effect is released, release the internal signal as well.
            self.value.release();
        }
        return 0;
    },
    [Symbol.toPrimitive](hint) {
        const self = this[internal];
        return self.value[Symbol.toPrimitive](hint);
    }
};
Object.setPrototypeOf(computedImpl, signalProto);
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
    computed.string = noStringOp;
    Object.setPrototypeOf(computed, computedImpl);
    // Generate internal state
    computed[internal] = {
        expression,
        value: signal(undefined, equality),
    };
    // NOTE(randomuserhi): is set after such that `.expression` is constructed and valid.
    computed[internal].effect = effect(() => computed[internal].expression(computed[internal].value), dependencies, options);
    return computed;
}
