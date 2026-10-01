import { BufferGeometry, Group, Mesh, Texture, TextureLoader } from '@esm/three';
import { modelLoader as loader } from '@esm/@root/replay/model-loader.js';
import * as BufferGeometryUtils from '@esm/three/examples/jsm/utils/BufferGeometryUtils.js';
import { clone as cloneSkeleton } from '@esm/three/examples/jsm/utils/SkeletonUtils.js';
import { ownModelMaterials, disposeModelMaterials } from './modelMaterials.js';
import { ModuleLoader } from '@esm/@root/replay/moduleloader.js';

ModuleLoader.registerDispose(renderer => disposeModelMaterials(renderer.scene));

const geometryCache = new Map<string, { promise: Promise<BufferGeometry>; terminate: (reason: any) => void }>();


export function deleteGLTFGeometryCache(path: string) {
    if (geometryCache.has(path)) {
        geometryCache.get(path)!.terminate("Model cache invalidated.");
        geometryCache.delete(path);
    }
}

// NOTE(randomuserhi): `newLoader` exists due to old models being imported without transforms. All models should have transforms applied, but old models were implemented prior to this.
export async function loadGLTFGeometry(path: string, newLoader: boolean = true): Promise<BufferGeometry> {
    if (geometryCache.has(path)) {
        return geometryCache.get(path)!.promise;
    }

    let terminate!: (reason: unknown) => void;
    const promise = new Promise<BufferGeometry>((resolve, reject) => {
        terminate = reject;
        loader.load(path, function (gltf) {
            try {
                const geometries: BufferGeometry[] = [];
                gltf.scene.traverse((obj) => {
                    const mesh = obj as Mesh;
                    if (mesh.isMesh === true) {
                        mesh.updateWorldMatrix(true, true);
                        const geometry = mesh.geometry;
                        if (newLoader) geometry.applyMatrix4(mesh.matrixWorld);
                        else geometry.scale(mesh.scale.x, mesh.scale.y, mesh.scale.z);
                        geometries.push(geometry);
                    }
                });
                
                const geometry = BufferGeometryUtils.mergeGeometries(geometries);
                resolve(geometry);
            } catch(error) {
                console.log(`Failed to load GLTF Geometry '${path}': ${error}`);
                reject(error);
            }
        }, undefined, function (error) {
            console.log(`Failed to load GLTF Geometry '${path}': ${error}`);
            reject(error);
        });
    });
    geometryCache.set(path, { promise, terminate });
    return promise; 
}

const modelCache = new Map<string, { promise: Promise<() => Group>; terminate: (reason: any) => void }>();

export function deleteGLTFCache(path: string) {
    if (modelCache.has(path)) {
        modelCache.get(path)!.terminate("Model cache invalidated.");
        modelCache.delete(path);
    }
}

export async function loadGLTF(path: string): Promise<() => Group> {
    if (modelCache.has(path)) {
        return modelCache.get(path)!.promise;
    }

    let terminate!: (reason: unknown) => void;
    const promise = new Promise<() => Group>((resolve, reject) => {
        terminate = reject;
        loader.load(path, function (gltf) {
            try {
                gltf.scene.animations = gltf.animations;
                const factory = () => { const model = cloneSkeleton(gltf.scene) as Group; ownModelMaterials(model); return model; };
                resolve(factory);
            } catch(error) {
                console.log(`Failed to load GLTF '${path}': ${error}`);
                reject(error);
            }
        }, undefined, function (error) {
            console.log(`Failed to load GLTF '${path}': ${error}`);
            reject(error);
        });
    });
    modelCache.set(path, { promise, terminate });
    return promise; 
}

const textureCache = new Map<string, Promise<Texture>>();
const textureLoader = new TextureLoader();

export function loadTexture(path: string): Promise<Texture> {
    let promise = textureCache.get(path);
    if (!promise) {
        // Pings need Three's placeholder texture immediately, before image decoding.
        promise = new Promise(resolve => resolve(textureLoader.load(path)));
        textureCache.set(path, promise);
    }
    return promise;
}
