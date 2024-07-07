export interface Typemap {
    "Map": Map<any, any>;
    "Array": any[];
}

const factories = new Map<string, () => any>();

interface _Factory {
    <T extends keyof Typemap>(type: T): () => Typemap[T];
    register<T extends keyof Typemap>(type: T, factory: () => Typemap[T]): void
}

export const Factory = (<T extends keyof Typemap>(type: T): () => Typemap[T] => {
    if (!factories.has(type)) throw new Error(`Could not find factory for type '${type}'.`);
    return factories.get(type)!;
}) as _Factory;
Factory.register = (type, factory) => {
    factories.set(type, factory);
};