import { ACESFilmicToneMapping, AmbientLight, Camera, CameraHelper, Color, DirectionalLight, FogExp2, PerspectiveCamera, VSMShadowMap, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import * as BitHelper from "../replay/bithelper.js";
import { ModuleLoader, ReplayApi } from "../replay/moduleloader.js";
import { Quat, Quaternion, Vec, Vector } from "../replay/pod.js";
import { Renderer } from "../replay/renderer.js";
import { ByteStream } from "../replay/stream.js";

declare module "../replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "ReplayRecorder.Header": {
                version: string;
                isMaster: boolean;
            }
        }
    }
}

ModuleLoader.registerHeader("ReplayRecorder.Header", "0.0.1", { 
    parse: async (data, header) => {
        if (header.has("ReplayRecorder.Header")) throw new DuplicateHeaderData("Replay header was already written.");
        header.set("ReplayRecorder.Header", {
            version: await BitHelper.readString(data),
            isMaster: await BitHelper.readByte(data) == 1
        });
    }
});

export class HeaderNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicateHeaderData extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DynamicNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicateDynamic extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export interface DynamicParse {
    dimension: number;
    absolute: boolean;
    position: Vector;
    rotation: Quaternion;
}

export interface DynamicSpawn {
    dimension: number;
    position: Vector;
    rotation: Quaternion;
}

export interface Dynamic {
    id: number;
}

export interface DynamicTransform extends Dynamic {
    position: Vector;
    rotation: Quaternion;
    dimension: number;
}

export namespace DynamicTransform {
    export function create({ id, position, rotation, dimension }: { id: number, position?: Vector, rotation?: Quaternion, dimension?: number }): { id: number, position: Vector, rotation: Quaternion, dimension: number } {
        return {
            id,
            dimension: dimension === undefined ? 0 : dimension,
            position: position === undefined ? Vec.zero() : position,
            rotation: rotation === undefined ? Quat.identity() : rotation
        };
    }
    export async function parseSpawn(data: ByteStream): Promise<{ dimension: number, position: Vector, rotation: Quaternion }> {
        return {
            dimension: await BitHelper.readByte(data),
            position: await BitHelper.readVector(data),
            rotation: await BitHelper.readHalfQuaternion(data)
        };
    }
    export async function parse(data: ByteStream): Promise<{ dimension: number, absolute: boolean, position: Vector, rotation: Quaternion }> {
        const dimension = await BitHelper.readByte(data);
        const absolute = await BitHelper.readBool(data);
        return {
            dimension, absolute,
            position: absolute ? await BitHelper.readVector(data) : await BitHelper.readHalfVector(data),
            rotation: await BitHelper.readHalfQuaternion(data)
        };
    }
    export function lerp(dyn: DynamicTransform, data: { dimension: number; absolute: boolean; position: Vector; rotation: Quaternion; }, lerp: number): void {
        const { absolute, position, rotation, dimension } = data;
        const fpos = absolute ? position : Vec.add(dyn.position, position);
        dyn.position = Vec.lerp(dyn.position, fpos, lerp);
        dyn.rotation = Quat.slerp(dyn.rotation, rotation, lerp);
        dyn.dimension = dimension;
    }
}

export interface DynamicPosition extends Dynamic {
    position: Vector;
    dimension: number;
}

export namespace DynamicPosition {
    export async function parseSpawn(data: ByteStream): Promise<{ dimension: number, position: Vector }> {
        return {
            dimension: await BitHelper.readByte(data),
            position: await BitHelper.readVector(data)
        };
    }
    export async function parse(data: ByteStream): Promise<{ dimension: number, absolute: boolean, position: Vector }> {
        const dimension = await BitHelper.readByte(data);
        const absolute = await BitHelper.readBool(data);
        return {
            dimension, absolute,
            position: absolute ? await BitHelper.readVector(data) : await BitHelper.readHalfVector(data)
        };
    }
    export function lerp(dyn: DynamicPosition, data: { dimension: number; absolute: boolean; position: Vector; }, lerp: number): void {
        const { absolute, position, dimension } = data;
        const fpos = absolute ? position : Vec.add(dyn.position, position);
        dyn.position = Vec.lerp(dyn.position, fpos, lerp);
        dyn.dimension = dimension;
    }
}

export interface DynamicRotation extends Dynamic {
    rotation: Quaternion;
}

export namespace DynamicRotation {
    export async function parseSpawn(data: ByteStream): Promise<{ rotation: Quaternion }> {
        return {
            rotation: await BitHelper.readHalfQuaternion(data)
        };
    }
    export async function parse(data: ByteStream): Promise<{ rotation: Quaternion }> {
        return {
            rotation: await BitHelper.readHalfQuaternion(data)
        };
    }
    export function lerp(dyn: DynamicRotation, data: { rotation: Quaternion; }, lerp: number): void {
        const { rotation } = data;
        dyn.rotation = Quat.slerp(dyn.rotation, rotation, lerp);
    }
}

// --------------------------- RENDERING ---------------------------

declare module "../replay/moduleloader.js" {
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

class CameraControls {
    slot?: number;

    up: boolean;
    down: boolean;
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;

    speed: number;

    constructor(camera: Camera, canvas: HTMLCanvasElement) {
        this.speed = 20;
        const mouse = {
            x: 0,
            y: 0,
            left: false,
            right: false
        };
        const origin = { x: 0, y: 0 };
        const old = { x: 0, y: 0 };
        canvas.addEventListener("wheel", (e) => {
            if (this.slot !== undefined) return;

            e.preventDefault();
            this.speed -= e.deltaY * 0.1;
            this.speed = Math.clamp(this.speed, 1, 1000);
        });
        window.addEventListener("keydown", (e) => {
            switch (e.keyCode) {
            case 70:
                e.preventDefault();
                (window as any).player.pause = !(window as any).player.pause;
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
            }
        });
        window.addEventListener("keyup", (e) => {
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
            }
        });
        canvas.addEventListener("mousedown", (e) => {
            e.preventDefault();
            if (e.button === 0)
                mouse.left = true;
            else if (e.button === 2)
                mouse.right = true;

            old.x = mouse.x;
            old.y = mouse.y;
            origin.x = mouse.x;
            origin.y = mouse.y;
        });
        canvas.addEventListener("mousemove", (e) => {
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
        });
        canvas.addEventListener("mouseup", (e) => {
            e.preventDefault();
            if (e.button === 0)
                mouse.left = false;
            else if (e.button === 2)
                mouse.right = false;
        });
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
                    const model = models.get(first.id)!;
                    if (camera.parent !== model.group) {
                        camera.parent = model.group;
                    }

                    const fake = renderer.get("FakeCamera")!;
                    camera.position.copy(fake.position);
                    camera.translateY(1);
                    camera.quaternion.copy(fake.quaternion);
                }
            }
        } else {
            const speed = this.speed * dt;
            if (this.forward) {
                const fwd = new Vector3(0, 0, 1).multiplyScalar(speed);
                fwd.applyQuaternion(camera.quaternion);
                camera.position.sub(fwd);
            }
            if (this.backward) {
                const bwd = new Vector3(0, 0, -1).multiplyScalar(speed);
                bwd.applyQuaternion(camera.quaternion);
                camera.position.sub(bwd);
            }

            if (this.left) {
                const left = new Vector3(-1, 0, 0).multiplyScalar(speed);
                left.applyQuaternion(camera.quaternion);
                camera.position.add(left);
            }
            if (this.right) {
                const right = new Vector3(1, 0, 0).multiplyScalar(speed);
                right.applyQuaternion(camera.quaternion);
                camera.position.add(right);
            }

            if (this.up) {
                const up = new Vector3(0, 1, 0).multiplyScalar(speed);
                camera.position.add(up);
            }
            if (this.down) {
                const down = new Vector3(0, -1, 0).multiplyScalar(speed);
                camera.position.add(down);
            }
        }
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
            light.position.y = 100;
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

            const helper = new CameraHelper(light.shadow.camera);
            r.scene.add(helper);

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
            renderer.get("CameraControls")!.update(renderer, snapshot, dt);
        } 
    }, ...renderLoop]);
});