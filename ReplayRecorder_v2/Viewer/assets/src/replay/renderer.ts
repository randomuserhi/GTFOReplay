import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { ReplayApi } from "./moduleloader";

export interface RendererApi {
    getRenderLoop(): RenderPass[];
    setRenderLoop(loop: RenderPass[]): void;

    getInitPasses(): void;
    setInitPasses(loop: InitPass[]): void;
}

interface Pass {
    name: string;
}

export interface InitPass extends Pass {
    pass: (renderer: Renderer) => void;
}

export interface RenderPass extends Pass {
    pass: (renderer: Renderer, snapshot: ReplayApi) => void;
}

export class Renderer {
    canvas: HTMLCanvasElement;

    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;
    composer: EffectComposer;

    renderLoop: RenderPass[];
    initPasses: InitPass[];

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        this.scene = new Scene();

        this.composer = new EffectComposer(this.renderer);
        //this.composer.addPass(new RenderPass(this.scene, this.camera)); // -> Should be written by user using API
    }

    public api(): RendererApi {
        return {
            getRenderLoop: () => this.renderLoop,
            setRenderLoop: (loop: RenderPass[]) => this.renderLoop = loop,

            getInitPasses: () => this.initPasses,
            setInitPasses: (loop: InitPass[]) => this.initPasses = loop,
        };
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