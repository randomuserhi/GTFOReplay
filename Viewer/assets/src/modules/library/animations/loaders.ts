import { Rest } from "@esm/@/rhu/rest.js";
import { Anim, AvatarLike } from "./lib.js";

const loadedAnims = new Map<string, Anim>();
const loadingAnims = new Map<string, Promise<Anim>>();

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

export function loadAnimFromJson<T extends string = string>(joints: ReadonlyArray<T>, path: string): Promise<Anim<T>> {
    if (loadedAnims.has(path)) {
        return new Promise((resolve) => {
            resolve(loadedAnims.get(path)! as Anim<T>);
        });
    }

    if (loadingAnims.has(path)) {
        const promise = loadingAnims.get(path)!;
        return new Promise((resolve) => {
            promise.then((anim) => resolve(anim as Anim<T>));
        });
    }
    
    const promise = new Promise<Anim<T>>((resolve, reject) => {
        fetchAnimJson(path).then((json) => {
            resolve(new Anim<T>(joints, json.rate, json.duration, json.frames));
        }).catch((error) => {
            console.log(`Failed to load animation '${path}': ${error}`);
            reject(error);
        });
    });
    loadingAnims.set(path, promise);
    return promise;
}

export async function loadAllClips<T extends string = string, Joints extends string = string>(joints: ReadonlyArray<Joints>, clips: ReadonlyArray<T> | T[]): Promise<Record<T, Anim<Joints>>> {
    const collection: Record<T, Anim<Joints>> = {} as any;
    for (const clip of clips) {
        if (clip in collection) throw new Error(`Duplicate clip '${clip}' being loaded.`);
        collection[clip] = await loadAnimFromJson(joints, `../js3party/animations/${clip}.json`);
    }
    return collection;
}