import { Rest } from "@esm/@/rhu/rest.js";
import { Anim, AvatarLike } from "./lib.js";

const animationCache = new Map<string, { promise: Promise<Anim>; terminate: (reason: any) => void }>();

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
    if (animationCache.has(path)) {
        animationCache.get(path)!.terminate("Anim cache invalidated.");
        animationCache.delete(path);
    }
}

export function loadAnimFromJson<T extends string = string>(joints: ReadonlyArray<T>, path: string): Promise<Anim<T>> {
    if (animationCache.has(path)) {
        return animationCache.get(path)!.promise as Promise<Anim<T>>;
    }
    
    let terminate!: (reason: unknown) => void;
    const promise = new Promise<Anim<T>>((resolve, reject) => {
        terminate = reject;
        fetchAnimJson(path).then((json) => {
            resolve(new Anim<T>(joints, json.rate, json.duration, json.frames));
        }).catch((error) => {
            console.log(`Failed to load animation '${path}': ${error}`);
            reject(error);
        });
    });
    animationCache.set(path, { promise, terminate });
    return promise;
}

export async function loadAllClips<T extends string = string, Joints extends string = string>(joints: ReadonlyArray<Joints>, clips: ReadonlyArray<T> | T[], directory: string): Promise<Record<T, Anim<Joints>>> {
    const collection: Record<T, Anim<Joints>> = {} as any;
    await Promise.all(clips.map(async clip => {
        const anim = await loadAnimFromJson(joints, `${directory}/${clip}.json`);
        if (clip in collection) throw new Error(`Duplicate clip '${clip}' being loaded.`);
        collection[clip] = anim;
    }));
    return collection;
}
