import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";

export class Renderer {
    canvas: HTMLCanvasElement;

    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;
    composer: EffectComposer;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        this.scene = new Scene();

        this.composer = new EffectComposer(this.renderer);
        //this.composer.addPass(new RenderPass(this.scene, this.camera)); // -> Should be written by user using API
    }

    public render() {
        this.composer.render();
    }

    public resize(width: number, height: number) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
    }
}