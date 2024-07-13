// Used for managing state between async-script-loader refreshes

import { signal, Signal } from "@/rhu/signal.js";

export interface DataStoreTypes {
}

export namespace DataStore {
    const data = new Map<string, unknown>();
    const signals = new Map<string, Signal<any>>();
    export function clear() {
        data.clear();
        signals.clear();
    }

    export function getOrDefault<T extends keyof DataStoreTypes>(typename: T, def: () => DataStoreTypes[T]): DataStoreTypes[T] {
        if (typename as string === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
        if (!data.has(typename)) DataStore.set(typename, def());
        return data.get(typename) as any;
    }
    export function get<T extends keyof DataStoreTypes>(typename: T): DataStoreTypes[T] | undefined {
        if (typename as string === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
        return data.get(typename) as any;
    }
    export function set<T extends keyof DataStoreTypes>(typename: T, value: DataStoreTypes[T]): void {
        if (typename as string === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
        data.set(typename, value);
        if (signals.has(typename)) {
            signals.get(typename)!(value);
        }
    }
    export function has<T extends keyof DataStoreTypes>(typename: T): boolean{
        if (typename as string === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
        return data.has(typename);
    }
    export function watch<T extends keyof DataStoreTypes>(typename: T): Signal<DataStoreTypes[T] | undefined> {
        if (typename as string === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
        if (!signals.has(typename)) {
            signals.set(typename, signal(get(typename)));
        }
        return signals.get(typename)!;
    }
}