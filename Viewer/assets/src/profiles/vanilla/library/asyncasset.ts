export class AsyncAsset<T = any> {
    asset: T | undefined;

    constructor(promise: Promise<T>) {
        this.asset = undefined;
        promise.then((asset) => this.asset = asset);
    }
}

type AsyncAssetCollection<K extends PropertyKey = PropertyKey, V = any> = Record<K, AsyncAsset<V>>;

export function AsyncAssetCollection<K extends PropertyKey = PropertyKey, V = any>(loader: (asset: K) => Promise<V>): AsyncAssetCollection<K, V> {
    const collection: Record<PropertyKey, AsyncAsset<V>> = {};
    return new Proxy(collection, {
        get(target, p, receiver) {
            if (!(p in collection)) {
                collection[p] = new AsyncAsset<V>(loader(p as K));
            }
            return Reflect.get(target, p, receiver);
        },
        set() {
            throw new Error("Invalid operation.");
        }
    }) as AsyncAssetCollection<K, V>;
}

export function isAsyncAsset<T = any>(obj: any): obj is AsyncAsset<T> {
    return Object.prototype.isPrototypeOf.call(AsyncAsset.prototype, obj);
}