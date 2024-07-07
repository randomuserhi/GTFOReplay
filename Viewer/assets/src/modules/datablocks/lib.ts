export class Datablock<K, V> {
    private map = new Map();
    private hash?: (key: K) => any;

    constructor(hash?: (key: K) => any) {
        this.hash = hash;
    }

    public delete(key: K) {
        if (this.hash !== undefined) key = this.hash(key);
        return this.map.delete(key);
    }

    public set(key: K, value: V) {
        if (this.hash !== undefined) key = this.hash(key);
        return this.map.set(key, value);
    }

    public get(key: K): V | undefined {
        if (this.hash !== undefined) key = this.hash(key); 
        return this.map.get(key);
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
}