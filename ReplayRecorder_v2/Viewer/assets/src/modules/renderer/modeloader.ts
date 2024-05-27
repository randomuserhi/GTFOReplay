import { BufferGeometry, Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loadedGLTF = new Map<string, BufferGeometry>();
const loadingGLTF = new Map<string, Promise<BufferGeometry>>();

const loader = new GLTFLoader();

export async function loadGLTF(path: string): Promise<BufferGeometry> {
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
            const mesh: Mesh = (gltf.scene.children[0] as Mesh);
            const geometry = mesh.geometry.scale(mesh.scale.x, mesh.scale.y, mesh.scale.z);
            loadedGLTF.set(path, geometry);
            resolve(geometry);
        }, undefined, function (error) {
            console.error(error);
            reject();
        });
    });
    loadingGLTF.set(path, promise);
    return promise; 
}

