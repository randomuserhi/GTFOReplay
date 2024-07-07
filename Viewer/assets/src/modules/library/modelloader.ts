import { BufferGeometry, Mesh } from '@esm/three';
import { GLTFLoader } from '@esm/three/examples/jsm/loaders/GLTFLoader.js';
import * as BufferGeometryUtils from '@esm/three/examples/jsm/utils/BufferGeometryUtils.js';

const loadedGLTF = new Map<string, BufferGeometry>();
const loadingGLTF = new Map<string, Promise<BufferGeometry>>();

const loader = new GLTFLoader();

// NOTE(randomuserhi): `newLoader` exists due to old models being imported without transforms. All models should have transforms applied, but old models were implemented prior to this.
export async function loadGLTF(path: string, newLoader: boolean = true): Promise<BufferGeometry> {
    if (loadedGLTF.has(path)) {
        return new Promise((resolve) => {
            resolve(loadedGLTF.get(path)!);
        });
    }

    if (loadingGLTF.has(path)) {
        const promise = loadingGLTF.get(path)!;
        return new Promise((resolve) => {
            promise.then((geometry) => resolve(geometry));
        });
    }

    const promise = new Promise<BufferGeometry>((resolve, reject) => {
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
    loadingGLTF.set(path, promise);
    return promise; 
}