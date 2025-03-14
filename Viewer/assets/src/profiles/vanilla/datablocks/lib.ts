if (module.metadata.isParser) console.warn("Datablocks should not be loaded by the parser. This degrades performance greatly.");

export class Datablock<K, V, H extends string | number = K extends (string | number) ? K : string | number> {
    private map = new Map<K, V>();
    private keyHashMap?: Map<H, K>;
    private hash?: (key: K) => H | undefined;
    private signal?: AbortSignal;

    constructor(hash?: (key: K) => H | undefined) {
        this.hash = hash;
        if (this.hash !== undefined) {
            this.keyHashMap = new Map();
        }
    }

    public clear() {
        this.keyHashMap?.clear();
        this.map.clear();
    }

    public delete(key: K) {
        if (this.hash !== undefined) key = this.hash(key) as any;
        this.keyHashMap?.delete(key as any);
        return this.map.delete(key);
    }

    public set(key: K, value: V) {
        const original = key;
        if (this.hash !== undefined) key = this.hash(key) as any;
        if (key === undefined) throw new Error("Cannot set key to 'undefined'.");
        if (this.map.has(key)) console.warn(`Datablock already has key ${key}. If you meant to overwrite the original then ignore this warning.`);
        this.keyHashMap?.set(key as any, original);
        return this.map.set(key, value);
    }

    public get(key: K): V | undefined {
        if (this.hash !== undefined) key = this.hash(key) as any; 
        return this.map.get(key);
    }

    public getEntry(key: K): [K, V | undefined] {
        if (this.hash === undefined) return [key, this.map.get(key)];
        else {
            key = this.hash(key) as any;
            const original = this.keyHashMap!.get(key as any);
            if (original === undefined) throw new Error(`Could not find original key for entry '${key}'.`);
            return [original, this.map.get(key)];
        }
    }

    public obtain(key: K): V {
        if (this.hash !== undefined) key = this.hash(key) as any; 
        if (this.map.has(key)) return this.map.get(key)!;
        else throw new Error(`Could not find hash '${key}' in datablock.`);
    }

    public has(key: K): boolean {
        if (this.hash !== undefined) key = this.hash(key) as any; 
        return this.map.has(key);
    }

    public entries() {
        return this.map.entries();
    }

    public values() {
        return this.map.values();
    }

    public keys() {
        return this.map.keys();
    }

    public obj(): Record<H, V> {
        return Object.fromEntries(this.map);
    }
}