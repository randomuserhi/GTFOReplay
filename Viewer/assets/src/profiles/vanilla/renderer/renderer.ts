import { signal, Signal } from "@esm/@/rhu/signal.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Renderer } from "@esm/@root/replay/renderer.js";
import { ACESFilmicToneMapping, AmbientLight, Color, DirectionalLight, FogExp2, Frustum, Matrix4, PerspectiveCamera, PointLight, Vector3, VSMShadowMap } from "@esm/three";
import { RenderPass } from "@esm/three/examples/jsm/postprocessing/RenderPass.js";
import { dispose } from "../ui/main.js";
import { ObjectWrapper } from "./objectwrapper.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "ReplayRecorder.Init": void;
        }

        interface RenderData {
            "Camera": Camera;
            "Controls": Controls
            "MainLight": DirectionalLight;
        }
    }
}

export class Camera extends ObjectWrapper<PerspectiveCamera> {
    public frustum: Frustum = new Frustum();
    public renderDistance: Signal<number>;
    
    constructor(fov: number, aspect: number, near: number = 0.1, far: number = 1000, renderDistance: number = 100) {
        super();
        
        this.root = new PerspectiveCamera(fov, aspect, near, far);
        this.root.rotation.order = "YXZ";

        this.renderDistance = signal(renderDistance);
    }

    public resize(width: number, height: number) {
        this.root.aspect = width / height;
        this.root.updateProjectionMatrix();
    }

    private static FUNC_update = {
        pM: new Matrix4()
    } as const;
    public update() {
        const { pM } = Camera.FUNC_update;
        this.frustum.setFromProjectionMatrix(pM.multiplyMatrices(this.root.projectionMatrix, this.root.matrixWorldInverse));
    }
}

module.ready();
/* eslint-disable-next-line sort-imports */
import { Controls } from "./controls.js";

ModuleLoader.registerRender("ReplayRecorder.Init", (name, api) => {
    const init = api.getInitPasses();
    const pass = { 
        name, pass: (r: Renderer) => {
            r.scene.background = new Color(0x0);

            r.renderer.shadowMap.enabled = true;
            r.renderer.shadowMap.type = VSMShadowMap; //PCFSoftShadowMap;
            r.renderer.toneMapping = ACESFilmicToneMapping;

            r.scene.fog = new FogExp2(0x333333, 0.003);
            r.scene.add(new AmbientLight(0xFFFFFF, 0.5));

            const camera = new Camera(75, r.canvas.width / r.canvas.height, 0.1, 1000);
            camera.addToScene(r.scene);
            r.composer.addPass(new RenderPass(r.scene, camera.root));
            camera.root.position.set(0, 0, -10);
            camera.root.rotation.set(0, 180 * Math.deg2rad, 0);

            r.set("Camera", camera);
            r.addEventListener("resize", ({ width, height }) => {
                camera.resize(width, height);
            }, { signal: dispose.signal });

            const controls = new Controls(camera, r);
            r.set("Controls", controls);

            // Save camera state between refreshes
            r.addEventListener("pre-refresh", () => {
                controls.saveState();
            }, { signal: dispose.signal });
            r.addEventListener("post-refresh", () => {
                controls.loadState();
            }, { signal: dispose.signal });
            
            const pointLight = new PointLight(0xFFFFFF, 1, undefined, 1.2);
            camera.root.add(pointLight);
            pointLight.position.set(0, 0, 0);

            const light = new DirectionalLight(0xFFFFFF, 1);
            /*light.shadow.mapSize.x = 4096;
            light.shadow.mapSize.y = 4096;
            light.shadow.bias = -0.001;
            light.castShadow = true;

            light.shadow.camera.left = -250;
            light.shadow.camera.right = 250;
            light.shadow.camera.top = 100;
            light.shadow.camera.bottom = -200;
            light.shadow.camera.far = 200;
            light.shadow.camera.near = 0.1;*/
            light.target.translateX(0);
            light.target.translateY(-10);
            
            r.set("MainLight", light);
            r.scene.add(light);
            r.scene.add(light.target);
        } 
    };
    api.setInitPasses([pass, ...init]);

    const renderLoop = api.getRenderLoop();
    const FUNC_renderPass = {
        cameraPos: new Vector3()
    } as const;
    api.setRenderLoop([{ 
        name, pass: (renderer, snapshot, dt) => {
            const light = renderer.get("MainLight")!;
            const camera = renderer.get("Camera")!;
            const controls = renderer.get("Controls")!;
            const { cameraPos } = FUNC_renderPass;
            camera.root.getWorldPosition(cameraPos);
            light.position.set(cameraPos.x, cameraPos.y + 50, cameraPos.z); 
            light.target.position.set(cameraPos.x, cameraPos.y - 10, cameraPos.z);

            camera.update();
            controls.update(snapshot, dt);
        } 
    }, ...renderLoop]);
});

ModuleLoader.registerDispose((renderer) => {
    renderer.get("Controls")?.dispose();
});