import { ACESFilmicToneMapping, AmbientLight, Color, DirectionalLight, FogExp2, PCFSoftShadowMap, PerspectiveCamera, Vector3 } from "three";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import * as BitHelper from "../replay/bithelper.js";
import { ModuleLoader } from "../replay/moduleloader.js";
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

export interface Dynamic {
    id: number;
    position: Vector;
    rotation: Quaternion;
    dimension: number;
}

export namespace Dynamic {
    export function create({ id, position, rotation, dimension }: { id: number, position?: Vector, rotation?: Quaternion, dimension?: number }): { id: number, position: Vector, rotation: Quaternion, dimension: number } {
        return {
            id,
            dimension: dimension === undefined ? 0 : dimension,
            position: position === undefined ? Vec.zero() : position,
            rotation: rotation === undefined ? Quat.identity() : rotation
        };
    }
    export async function parseTransform(data: ByteStream): Promise<{ dimension: number, absolute: boolean, position: Vector, rotation: Quaternion }> {
        const dimension = await BitHelper.readByte(data);
        const absolute = await BitHelper.readByte(data) != 0;
        return {
            dimension, absolute,
            position: absolute ? await BitHelper.readVector(data) : await BitHelper.readHalfVector(data),
            rotation: await BitHelper.readHalfQuaternion(data)
        };
    }
    export async function parsePosition(data: ByteStream): Promise<{ dimension: number, absolute: boolean, position: Vector }> {
        const dimension = await BitHelper.readByte(data);
        const absolute = await BitHelper.readByte(data) != 0;
        return {
            dimension, absolute,
            position: absolute ? await BitHelper.readVector(data) : await BitHelper.readHalfVector(data)
        };
    }
    export async function parseRotation(data: ByteStream): Promise<{ rotation: Quaternion }> {
        return {
            rotation: await BitHelper.readHalfQuaternion(data)
        };
    }
    export function lerp(dyn: Dynamic, data: { dimension: number; absolute: boolean; position: Vector; rotation: Quaternion; }, lerp: number): void {
        const { absolute, position, rotation, dimension } = data;
        const fpos = absolute ? position : Vec.add(dyn.position, position);
        dyn.position = Vec.lerp(dyn.position, fpos, lerp);
        dyn.rotation = Quat.slerp(dyn.rotation, rotation, lerp);
        dyn.dimension = dimension;
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
            "MainLight": DirectionalLight;
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
            r.renderer.shadowMap.type = PCFSoftShadowMap;
            r.renderer.toneMapping = ACESFilmicToneMapping;

            r.composer.addPass(new RenderPass(r.scene, camera));

            r.scene.fog = new FogExp2(0x333333, 0.003);
            r.scene.add(new AmbientLight(0xFFFFFF, 0.1));

            // TODO(randomuserhi): Scale light based on map size -> also position properly
            const light = new DirectionalLight(0xFFFFFF, 1);
            light.position.y = 100;
            light.shadow.mapSize.x = 4096;
            light.shadow.mapSize.y = 4096;
            light.shadow.bias = -0.01;
            light.castShadow = true;

            light.shadow.camera.left = -250;
            light.shadow.camera.right = 250;
            light.shadow.camera.top = 250;
            light.shadow.camera.bottom = -250;
            light.shadow.camera.far = 200;
            light.shadow.camera.near = 0.1;
            light.target.translateX(0);
            light.target.translateY(-10);

            r.set("MainLight", light);
            r.scene.add(light);
            r.scene.add(light.target);

            // Setup camera controls -> TODO(randomuserhi): Make better
            const mouse = {
                x: 0,
                y: 0,
                left: false,
                right: false
            };
            const origin = { x: 0, y: 0 };
            const old = { x: 0, y: 0 };
            window.addEventListener("keydown", (e) => {
                const fwd = new Vector3(0, 0, -1);
                fwd.applyQuaternion(camera.quaternion);
                switch (e.keyCode) {
                case 68:
                    break;
                case 65:
                    break;
                case 87:
                    e.preventDefault();
                    camera.position.x += fwd.x;
                    camera.position.y += fwd.y;
                    camera.position.z += fwd.z;
                    break;
                case 83:
                    e.preventDefault();
                    camera.position.x -= fwd.x;
                    camera.position.y -= fwd.y;
                    camera.position.z -= fwd.z;
                    break;
                }
            });
            r.canvas.addEventListener("mousedown", (e) => {
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
            r.canvas.addEventListener("mousemove", (e) => {
                e.preventDefault();
                const rect = r.canvas.getBoundingClientRect();
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
                
                if (mouse.left) {
                    const deltaY = mouse.x - old.x;
                    const deltaX = mouse.y - old.y;
                    
                    camera.rotation.y += deltaY * 0.001;
                    camera.rotation.x += deltaX * 0.001;
                    
                    old.x = mouse.x;
                    old.y = mouse.y;
                }
            });
            r.canvas.addEventListener("mouseup", (e) => {
                e.preventDefault();
                if (e.button === 0)
                    mouse.left = false;
                else if (e.button === 2)
                    mouse.right = false;
            });

            // Setup resize event
            r.addEventListener("resize", ({ width, height }) => {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            });
        } 
    };
    api.setInitPasses([pass, ...init]);
});