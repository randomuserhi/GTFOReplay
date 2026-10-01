import { WebGLRenderer } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const libraries = new URL("../js3party/three/examples/jsm/libs/", import.meta.url);
const textures = new KTX2Loader().setTranscoderPath(new URL("basis/", libraries).href).setWorkerLimit(2);
const draco = new DRACOLoader().setDecoderPath(new URL("draco/", libraries).href);

// Actor and prop caches share the decoder workers for the desktop window.
export const modelLoader = new GLTFLoader()
    .setDRACOLoader(draco)
    .setMeshoptDecoder(MeshoptDecoder)
    .setKTX2Loader(textures);

export function configureModelLoader(renderer: WebGLRenderer): void {
    textures.detectSupport(renderer);
}
