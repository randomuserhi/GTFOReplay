import { ACESFilmicToneMapping, AmbientLight, Camera, Color, CylinderGeometry, DirectionalLight, DynamicDrawUsage, FogExp2, MeshPhongMaterial, PerspectiveCamera, SphereGeometry, VSMShadowMap, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { createInstance } from "../../replay/instancing.js";
import { ModuleLoader, ReplayApi } from "../../replay/moduleloader.js";
import { Renderer } from "../../replay/renderer.js";

declare module "../../replay/instancing.js" {
    interface InstanceTypes {
        "Cylinder.MeshPhong": void;
        "Sphere.MeshPhong": void;
    } 
}

(() => {
    const cylinders = createInstance("Cylinder.MeshPhong", new CylinderGeometry(1, 1, 1, 10, 10).translate(0, 0.5, 0).rotateX(Math.PI * 0.5), new MeshPhongMaterial(), 100);
    cylinders.frustumCulled = false;
    cylinders.instanceMatrix.setUsage( DynamicDrawUsage );
    cylinders.castShadow = true;
    cylinders.receiveShadow = true;

    const spheres = createInstance("Sphere.MeshPhong", new SphereGeometry(1, 10, 10), new MeshPhongMaterial(), 100);
    spheres.frustumCulled = false;
    spheres.instanceMatrix.setUsage( DynamicDrawUsage );
    spheres.castShadow = true;
    spheres.receiveShadow = true;
})();

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "ReplayRecorder.Init": void;
        }

        interface RenderData {
            "Camera": PerspectiveCamera;
            "CameraControls": CameraControls;
            "FakeCamera": PerspectiveCamera;
            "OrbitControls": OrbitControls;
            "MainLight": DirectionalLight;
        }
    }
}

// TODO(randomuserhi): make better
// TODO(randomuserhi): fix bug related to event listeners stacking up
const move: Vector3 = new Vector3();

class CameraControls {
    slot?: number;

    up: boolean;
    down: boolean;
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;

    speed: number;

    private wheel: (e: WheelEvent) => void;

    private keydown: (e: KeyboardEvent) => void;
    private keyup: (e: KeyboardEvent) => void;

    private mousedown: (e: MouseEvent) => void;
    private mousemove: (e: MouseEvent) => void;
    private mouseup: (e: MouseEvent) => void;
    private canvas: HTMLCanvasElement;

    constructor(camera: Camera, canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.speed = 20;
        const mouse = {
            x: 0,
            y: 0,
            left: false,
            right: false
        };
        const origin = { x: 0, y: 0 };
        const old = { x: 0, y: 0 };
        this.wheel = (e: WheelEvent) => {
            if (this.slot !== undefined) return;
    
            e.preventDefault();
            this.speed -= e.deltaY * 0.1;
            this.speed = Math.clamp(this.speed, 1, 1000);
        };
        canvas.addEventListener("wheel", this.wheel);
        this.keyup = (e) => {
            switch (e.keyCode) {
            case 32:
                e.preventDefault();
                this.up = false;
                break;
            case 17:
                e.preventDefault();
                this.down = false;
                break;
            case 68:
                e.preventDefault();
                this.right = false;
                break;
            case 65:
                e.preventDefault();
                this.left = false;
                break;
            case 87:
                e.preventDefault();
                this.forward = false;
                break;
            case 83:
                e.preventDefault();
                this.backward = false;
                break;
    
            case 9:
                e.preventDefault();
                (window as any).player.scoreboardMount.style.display = "none";
                break;
            }
        };
        this.keydown = (e: KeyboardEvent) => {
            switch (e.keyCode) {
            case 70:
                e.preventDefault();
                (window as any).player.pause = !(window as any).player.pause;
                (window as any).player.seeker.setPause((window as any).player.pause);
                break;
            case 32:
                e.preventDefault();
                this.up = true;
                break;
            case 17:
                e.preventDefault();
                this.down = true;
                break;
            case 68:
                e.preventDefault();
                this.right = true;
                break;
            case 65:
                e.preventDefault();
                this.left = true;
                break;
            case 87:
                e.preventDefault();
                this.forward = true;
                break;
            case 83:
                e.preventDefault();
                this.backward = true;
                break;
    
            case 49:
                e.preventDefault();
                this.slot = 0;
                break;
            case 50:
                e.preventDefault();
                this.slot = 1;
                break;
            case 51:
                e.preventDefault();
                this.slot = 2;
                break;
            case 52:
                e.preventDefault();
                this.slot = 3;
                break;
    
            case 38:
                e.preventDefault();
                (window as any).player.time += 10000;
                break;
            case 40:
                e.preventDefault();
                (window as any).player.time -= 10000;
                break;
            case 37:
                e.preventDefault();
                (window as any).player.time -= 5000;
                break;
            case 39:
                e.preventDefault();
                (window as any).player.time += 5000;
                break;
    
            case 9:
                e.preventDefault();
                (window as any).player.scoreboardMount.style.display = "block";
                break;
            }
        };
        window.addEventListener("keydown", this.keydown);
        window.addEventListener("keyup", this.keyup);
        this.mousedown = (e: MouseEvent) => {
            e.preventDefault();
            if (e.button === 0)
                mouse.left = true;
            else if (e.button === 2)
                mouse.right = true;

            old.x = mouse.x;
            old.y = mouse.y;
            origin.x = mouse.x;
            origin.y = mouse.y;
        };
        canvas.addEventListener("mousedown", this.mousedown);
        this.mousemove = (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            
            if (mouse.left) {
                const deltaY = mouse.x - old.x;
                const deltaX = mouse.y - old.y;
                
                camera.rotation.y -= deltaY * 0.002;
                camera.rotation.x -= deltaX * 0.002;
                
                old.x = mouse.x;
                old.y = mouse.y;
            }
        };
        canvas.addEventListener("mousemove", this.mousemove);
        this.mouseup = (e) => {
            e.preventDefault();
            if (e.button === 0)
                mouse.left = false;
            else if (e.button === 2)
                mouse.right = false;
        };
        canvas.addEventListener("mouseup", this.mouseup);
    }

    public update(renderer: Renderer, snapshot: ReplayApi, dt: number) {
        const camera = renderer.get("Camera")!;
        if (this.slot !== undefined) {
            if (this.forward || this.backward || this.left || this.right || this.up || this.down) {
                this.slot = undefined;
                const worldPos = new Vector3();
                camera.getWorldPosition(worldPos);
                camera.parent = renderer.scene;
                camera.position.copy(worldPos);
            } else {
                const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
                const models = renderer.getOrDefault("Players", () => new Map());
                const first = [...players.values()][Math.clamp(this.slot, 0, 3)];
                if (first !== undefined) {
                    renderer.set("Dimension", first.dimension);
                    
                    const model = models.get(first.id)!;
                    if (model !== undefined) {
                        if (camera.parent !== model.root) {
                            camera.parent = model.root;
                        }

                        const fake = renderer.get("FakeCamera")!;
                        camera.position.copy(fake.position);
                        camera.translateY(1);
                        camera.quaternion.copy(fake.quaternion);
                    }
                }
            }
        } else {
            const speed = this.speed * dt;
            if (this.forward) {
                const fwd = move.set(0, 0, 1).multiplyScalar(speed);
                fwd.applyQuaternion(camera.quaternion);
                camera.position.sub(fwd);
            }
            if (this.backward) {
                const bwd = move.set(0, 0, -1).multiplyScalar(speed);
                bwd.applyQuaternion(camera.quaternion);
                camera.position.sub(bwd);
            }

            if (this.left) {
                const left = move.set(-1, 0, 0).multiplyScalar(speed);
                left.applyQuaternion(camera.quaternion);
                camera.position.add(left);
            }
            if (this.right) {
                const right = move.set(1, 0, 0).multiplyScalar(speed);
                right.applyQuaternion(camera.quaternion);
                camera.position.add(right);
            }

            if (this.up) {
                const up = move.set(0, 1, 0).multiplyScalar(speed);
                camera.position.add(up);
            }
            if (this.down) {
                const down = move.set(0, -1, 0).multiplyScalar(speed);
                camera.position.add(down);
            }
        }
    }

    public dispose() {
        window.removeEventListener("keyup", this.keyup);
        window.removeEventListener("keydown", this.keydown);
        this.canvas.removeEventListener("wheel", this.wheel);
        this.canvas.removeEventListener("mousedown", this.mousedown);
        this.canvas.removeEventListener("mouseup", this.mouseup);
        this.canvas.removeEventListener("mousemove", this.mousemove);
    }
}

ModuleLoader.registerRender("ReplayRecorder.Init", (name, api) => {
    const init = api.getInitPasses();
    const pass = { 
        name, pass: (r: Renderer) => {
            r.scene.background = new Color(0x0);

            const camera = new PerspectiveCamera(75, r.canvas.width / r.canvas.height, 0.1, 1000);
            camera.rotation.order = "YXZ";

            r.set("Camera", camera);
            r.scene.add(camera);
            
            r.renderer.shadowMap.enabled = true;
            r.renderer.shadowMap.type = VSMShadowMap; //PCFSoftShadowMap;
            r.renderer.toneMapping = ACESFilmicToneMapping;

            r.composer.addPass(new RenderPass(r.scene, camera));

            r.scene.fog = new FogExp2(0x333333, 0.003);
            r.scene.add(new AmbientLight(0xFFFFFF, 0.5));

            // TODO(randomuserhi): Scale light based on map size -> also position properly
            const light = new DirectionalLight(0xFFFFFF, 1);
            light.shadow.mapSize.x = 4096;
            light.shadow.mapSize.y = 4096;
            light.shadow.bias = -0.001;
            light.castShadow = true;

            light.shadow.camera.left = -250;
            light.shadow.camera.right = 250;
            light.shadow.camera.top = 250;
            light.shadow.camera.bottom = -250;
            light.shadow.camera.far = 200;
            light.shadow.camera.near = 0.1;
            light.target.translateX(0);
            light.target.translateY(-10);

            //const helper = new CameraHelper(light.shadow.camera);
            //r.scene.add(helper);

            r.set("MainLight", light);
            r.scene.add(light);
            r.scene.add(light.target);

            camera.position.set(0, 0, -10);
            const fakeCamera = camera.clone();
            r.set("FakeCamera", fakeCamera);
            const controls = new OrbitControls(fakeCamera, r.renderer.domElement);
            controls.enablePan = false;
            r.set("OrbitControls",  controls);

            r.set("CameraControls",  new CameraControls(camera, r.renderer.domElement));

            // Setup resize event
            r.addEventListener("resize", ({ width, height }) => {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            });
        } 
    };
    api.setInitPasses([pass, ...init]);

    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([{ 
        name, pass: (renderer, snapshot, dt) => {
            const light = renderer.get("MainLight")!;
            const cameraPos = renderer.get("Camera")!.position;
            light.position.set(cameraPos.x, cameraPos.y + 50, cameraPos.z); 
            light.target.position.set(cameraPos.x, cameraPos.y - 10, cameraPos.z);

            renderer.get("CameraControls")!.update(renderer, snapshot, dt);
        } 
    }, ...renderLoop]);
});

ModuleLoader.registerDispose((renderer) => {
    renderer.get("CameraControls")?.dispose();
});