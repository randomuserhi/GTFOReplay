declare const isDirty: unique symbol;
interface SignalEvent<T = any> {
    equals(other: T): boolean;
    on(callback: Callback<T>): Callback<T>;
    off(handle: Callback<T>): boolean;
}
export interface Signal<T = any> extends SignalEvent<T> {
    (): T;
    (value: T): T;
}
type Callback<T = any> = (value: T) => void;
type Equality<T = any> = (a: T, b: T) => boolean;
export declare function isSignalType<T = any>(obj: any): obj is SignalEvent<T>;
export declare const always: Equality;
export declare function signal<T = any>(value: T, equality?: Equality<T>): Signal<T>;
export interface Computed<T = any> extends SignalEvent<T> {
    (): T;
    [isDirty]: boolean;
}
export declare function computed<T = any>(expression: () => T, dependencies: Signal[], equality?: Equality<T>): Computed<T>;
export {};