import { BufferGeometry, Group, Mesh, Texture, TextureLoader } from '@esm/three';
import { DRACOLoader } from '@esm/three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from '@esm/three/examples/jsm/loaders/GLTFLoader.js';
import * as BufferGeometryUtils from '@esm/three/examples/jsm/utils/BufferGeometryUtils.js';

const loadedGLTFGeometry = new Map<string, BufferGeometry>();
const loadingGLTFGeometry = new Map<string, { promise: Promise<BufferGeometry>; terminate: (reason: any) => void }>();

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("../js3party/three/examples/jsm/libs/draco/");
loader.setDRACOLoader( dracoLoader );

export function deleteGLTFGeometryCache(path: string) {
    loadedGLTFGeometry.delete(path);
    if (loadingGLTFGeometry.has(path)) {
        loadingGLTFGeometry.get(path)!.terminate("Model cache invalidated.");
        loadingGLTFGeometry.delete(path);
    }
}

// NOTE(randomuserhi): `newLoader` exists due to old models being imported without transforms. All models should have transforms applied, but old models were implemented prior to this.
export async function loadGLTFGeometry(path: string, newLoader: boolean = true): Promise<BufferGeometry> {
    if (loadedGLTFGeometry.has(path)) {
        return new Promise((resolve) => {
            resolve(loadedGLTFGeometry.get(path)!);
        });
    }

    if (loadingGLTFGeometry.has(path)) {
        return loadingGLTFGeometry.get(path)!.promise;
    }

    let terminate: ((reason: any) => void) | undefined = undefined;
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
                loadedGLTFGeometry.set(path, geometry);
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
    if (terminate !== undefined) {
        loadingGLTFGeometry.set(path, { promise, terminate });
    } else {
        console.warn("Unable to obtain termination from model loading promise. This shouldn't happen!");
    }
    return promise; 
}

const loadedGLTF = new Map<string, () => Group>();
const loadingGLTF = new Map<string, { promise: Promise<() => Group>; terminate: (reason: any) => void }>();

export function deleteGLTFCache(path: string) {
    loadedGLTF.delete(path);
    if (loadingGLTF.has(path)) {
        loadingGLTF.get(path)!.terminate("Model cache invalidated.");
        loadingGLTF.delete(path);
    }
}

// NOTE(randomuserhi): `newLoader` exists due to old models being imported without transforms. All models should have transforms applied, but old models were implemented prior to this.
export async function loadGLTF(path: string): Promise<() => Group> {
    if (loadedGLTF.has(path)) {
        return new Promise((resolve) => {
            resolve(loadedGLTF.get(path)!);
        });
    }

    if (loadingGLTF.has(path)) {
        return loadingGLTF.get(path)!.promise;
    }

    let terminate: ((reason: any) => void) | undefined = undefined;
    const promise = new Promise<() => Group>((resolve, reject) => {
        terminate = reject;
        loader.load(path, function (gltf) {
            try {
                const factory = () => gltf.scene.clone();
                loadedGLTF.set(path, factory);
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
    if (terminate !== undefined) {
        loadingGLTF.set(path, { promise, terminate });
    } else {
        console.warn("Unable to obtain termination from model loading promise. This shouldn't happen!");
    }
    return promise; 
}

const loadedTextures = new Map<string, Texture>();
const loadingTextures = new Map<string, { promise: Promise<Texture>; terminate: (reason: any) => void }>();
const textureLoader = new TextureLoader();

export function loadTexture(path: string): Promise<Texture> {
    if (loadedTextures.has(path)) {
        return new Promise((resolve) => {
            resolve(loadedTextures.get(path)!);
        });
    }

    if (loadingTextures.has(path)) {
        return loadingTextures.get(path)!.promise;
    }

    let terminate: ((reason: any) => void) | undefined = undefined;
    const promise = new Promise<Texture>((resolve, reject) => {
        terminate = reject;
        resolve(textureLoader.load(path));
    });
    if (terminate !== undefined) {
        loadingTextures.set(path, { promise, terminate });
    } else {
        console.warn("Unable to obtain termination from image loading promise. This shouldn't happen!");
    }
    return promise; 
}