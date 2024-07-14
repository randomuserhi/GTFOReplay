import { Rest } from "@esm/@/rhu/rest.js";
import { Anim, AvatarLike } from "./lib.js";

const loadedAnims = new Map<string, Anim>();
const loadingAnims = new Map<string, { promise: Promise<Anim>; terminate: (reason: any) => void }>();

interface AnimJson {
    rate: number;
    duration: number;
    frames: AvatarLike[];
}

const fetchAnimJson = Rest.fetch<AnimJson, [path: string]>({
    url: (path) => new URL(path, module.baseURI),
    fetch: async () => ({
        method: "GET"
    }),
    callback: async (resp) => {
        return await resp.json();
    }
});

export function deleteAnimCache(path: string) {
    loadedAnims.delete(path);
    if (loadingAnims.has(path)) {
        loadingAnims.get(path)!.terminate("Model cache invalidated.");
        loadingAnims.delete(path);
    }
}

export function loadAnimFromJson<T extends string = string>(joints: ReadonlyArray<T>, path: string): Promise<Anim<T>> {
    if (loadedAnims.has(path)) {
        return new Promise((resolve) => {
            resolve(loadedAnims.get(path)! as Anim<T>);
        });
    }
    
    if (loadingAnims.has(path)) {
        return loadingAnims.get(path)!.promise as Promise<Anim<T>>;
    }
    
    const promise = new Promise<Anim<T>>((resolve, reject) => {
        loadingAnims.set(path, { promise, terminate: reject });
        fetchAnimJson(path).then((json) => {
            resolve(new Anim<T>(joints, json.rate, json.duration, json.frames));
        }).catch((error) => {
            console.log(`Failed to load animation '${path}': ${error}`);
            reject(error);
        });
    });
    return promise;
}

export async function loadAllClips<T extends string = string, Joints extends string = string>(joints: ReadonlyArray<Joints>, clips: ReadonlyArray<T> | T[]): Promise<Record<T, Anim<Joints>>> {
    const collection: Record<T, Anim<Joints>> = {} as any;
    const promises: Promise<any>[] = [];
    for (const clip of clips) {
        promises.push(loadAnimFromJson(joints, `../js3party/animations/${clip}.json`).then((anim) => {
            if (clip in collection) throw new Error(`Duplicate clip '${clip}' being loaded.`);
            collection[clip] = anim;
        }));
    }
    await Promise.all(promises);
    return collection;
}