import { BufferGeometry, Mesh } from '@esm/three';
import { GLTFLoader } from '@esm/three/examples/jsm/loaders/GLTFLoader.js';
import * as BufferGeometryUtils from '@esm/three/examples/jsm/utils/BufferGeometryUtils.js';

const loadedGLTF = new Map<string, BufferGeometry>();
const loadingGLTF = new Map<string, { promise: Promise<BufferGeometry>; terminate: (reason: any) => void }>();

const loader = new GLTFLoader();

const empty = new BufferGeometry();

export function deleteGLTFCache(path: string) {
    loadedGLTF.delete(path);
    if (loadingGLTF.has(path)) {
        loadingGLTF.get(path)!.terminate("Model cache invalidated.");
        loadingGLTF.delete(path);
    }
}

// NOTE(randomuserhi): `newLoader` exists due to old models being imported without transforms. All models should have transforms applied, but old models were implemented prior to this.
export async function loadGLTF(path: string, newLoader: boolean = true): Promise<BufferGeometry> {
    if (loadedGLTF.has(path)) {
        return new Promise((resolve) => {
            resolve(loadedGLTF.get(path)!);
        });
    }

    if (loadingGLTF.has(path)) {
        return loadingGLTF.get(path)!.promise;
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
                loadedGLTF.set(path, geometry);
                resolve(geometry);
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