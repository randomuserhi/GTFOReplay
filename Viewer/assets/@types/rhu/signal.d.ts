/** Type representing a signal callback for type `T` */
type Callback<T> = (value: T) => void;
/** Type representing an equality check between 2 objects of type `T` */
type Equality<T> = (a?: T, b?: T) => boolean;
/** Common interface shared by all signals */
export interface SignalBase<T = any> {
    /** @returns Value stored within the signal */
    (): T;
    /** toPrimitive conversion for type coercion. Typically just returns the stored internal value. */
    [Symbol.toPrimitive](hint: "string" | "number" | "default"): any;
    /**
     * Check if the value within the signal equals another according to
     * its equality function.
     *
     * @param other Value to compare.
     * @returns True if the value of the signal matches, otherwise false.
     */
    equals(other: T): boolean;
    /**
     * Trigger `callback` when the signal value changes.
     *
     * @param callback The callback to be triggered.
     *
     * @param options.signal An AbortSignal which when triggered will automatically remove this callback from the signal.
     *
     * @param options.condition A user provided function that when returns true, will remove this callback from the signal.
     *                          This condition is only checked on state changes to the signal (writes, not reads).
     *                          This includes memoization such that writing the same value to the signal also will not trigger a guard check.
     *
     * @returns the callback given - which is used as the handle when removing callbacks.
     */
    on(callback: Callback<T>, options?: {
        signal?: AbortSignal;
        condition?: () => boolean;
    }): Callback<T>;
    /** Remove the provided `callback` from the signal. */
    off(handle: Callback<T>): boolean;
    /** Removes all attached callbacks from the signal. */
    release(): void;
    /** Manually trigger a check that all callbacks are valid as determined by `condition` option in `signal.on(callback, options)`. */
    check(): number;
    /** User provided ToString() method that is used when converting the signal to string. */
    string: (value: T) => string;
    /** Debug name that can be used for debugging. */
    __name__: string | undefined;
}
/**
 * Equality operator that always returns false. Forces signals to always update on writes.
 * Often used for signals of objects where Javascript equality is based on the reference.
 */
export declare const always: Equality<any>;
/**
 * Symbol used for accessing internal state of objects.
 * We expose the internal state through this symbol for reflect / debugging purposes.
 */
declare const internal: unique symbol;
export interface Signal<T> extends SignalBase<T> {
    /** Write a new value to the signal. */
    (value: T): T;
    /**
     * User provided function that is called when the signal is written to.
     * The returned value is what actually gets written.
     *
     * This allows the signal to guard against invalid values.
     */
    guard?: (newValue: T, oldValue: T) => T;
    /** Internal state, exposed for reflection / debugging purposes. */
    [internal]: {
        /** Internal value of the signal. */
        value: T;
        /** Callbacks attached to the signal. */
        callbacks: Map<Callback<T>, undefined | (() => boolean)>;
        /** Equality operator used by the signal */
        readonly equality?: Equality<T>;
    };
}
/** Utiltiy function that checks if the provided object is a signal. */
export declare const isSignal: <T>(obj: any) => obj is SignalBase<T>;
/**
 * Creates a signal
 *
 * @param value Starting value of the signal
 * @param equality Equality function used to determine if two values of type `T` are equal, if not provided, default javscript equality (`===`) is used.
 */
export declare function signal<T>(value: T, equality?: Equality<T>): Signal<T>;
export interface Effect {
    /**
     * Exectues the effect regardless of dependencies.
     *
     * Executes effect destructor when NOT provided the internal flag. This is because signals trigger destructors manually to
     * ensure proper order of events.
     *
     * When called externally, the destructors should run immediately.
     */
    (caller?: typeof internal): void;
    /**
     * Releases the effect, removing it from internal dependency chain.
     * The effect is no longer triggered when its dependencies change.
     */
    release(): void;
    check(): boolean;
    /** Internal state, exposed for reflection / debugging purposes. */
    [internal]: {
        /** Destructor thats called prior the effect triggering. */
        destructor: (() => void) | void | undefined;
        /**
         * Keeps track of dependency sets this effect is apart of.
         *
         * Uses a weak ref such that when a dependency is cleaned up, the set can be GC'd even if this effect holds a reference to it.
         */
        dependencySets: (WeakRef<Set<Effect>>[]) | undefined;
        /**
         * The abort signal the effect is assigned.
         * When the abort signal is triggered, the effect automatically destroys itself.
         */
        signal?: AbortSignal;
        /**
         * A condition that determines when the effect should destroy itself.
         * This condition is checked when the effect is due to be triggered.
         */
        condition?: () => boolean;
    };
    /** Debug name that can be used for debugging. */
    __name__: string | undefined;
}
export declare const isEffect: (obj: any) => obj is Effect;
/**
 * Creates an effect
 *
 * @param expression Effect that occures when the given dependencies change.
 * @param dependencies List if signals / computed dependencies. The effect is triggered when any one of these change.
 * @param options.signal An AbortSignal which when triggered will automatically remove this callback from the signal.
 * @param options.condition A user provided function that when returns true, will release this effect.
 *                          This condition is only checked on state changes.
 */
export declare function effect(expression: () => ((() => void) | void | undefined), dependencies: SignalBase[], options?: {
    signal?: AbortSignal;
    condition?: () => boolean;
}): Effect;
export interface Computed<T> extends SignalBase<T> {
    /** Get the value of the computed signal */
    (): T;
    /** Internal state, exposed for reflection / debugging purposes. */
    [internal]: {
        /** The expression the computed signal is using */
        readonly expression: (set: Signal<T>) => ((() => void) | void);
        /** The internal effect */
        readonly effect: Effect;
        /** The internal signal */
        readonly value: Signal<T>;
    };
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
export declare function computed<T>(expression: (set: Signal<T>) => ((() => void) | void), dependencies: SignalBase[], equality?: Equality<T>, options?: {
    signal?: AbortSignal;
    condition?: () => boolean;
    guard?: () => boolean;
}): Computed<T>;
export {};
