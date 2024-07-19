interface SignalEvent<T = any> {
    (): T;
    equals(other: T): boolean;
    on(callback: Callback<T>, options?: {
        signal?: AbortSignal;
    }): Callback<T>;
    off(handle: Callback<T>): boolean;
}
export interface Signal<T> extends SignalEvent<T> {
    (value: T): T;
    guard?: (value: T) => T;
}
type Callback<T> = (value: T) => void;
type Equality<T> = (a?: T, b?: T) => boolean;
export declare const isSignal: <T>(obj: any) => obj is SignalEvent<T>;
export declare const always: Equality<any>;
export declare function signal<T>(value: T, equality?: Equality<T>): Signal<T>;
declare const destructors: unique symbol;
export interface Effect {
    (): void;
    [destructors]: (() => void)[];
}
export declare const isEffect: (obj: any) => obj is Effect;
export declare function effect(expression: () => ((() => void) | void), dependencies: SignalEvent[], options?: {
    signal?: AbortSignal;
}): Effect;
export interface Computed<T> extends SignalEvent<T> {
    (): T;
    effect: Effect;
}
export declare function computed<T>(expression: (set: Signal<T>) => ((() => void) | void), dependencies: SignalEvent[], equality?: Equality<T>, options?: {
    signal?: AbortSignal;
}): Computed<T>;
export {};
