import { signal } from "@esm/@/rhu/signal.js";
import { ReplayApi } from "@esm/@root/replay/moduleloader.js";
import { PerspectiveCamera, Vector3, Vector3Like } from "@esm/three";
import { OrbitControls } from "@esm/three/examples/jsm/controls/OrbitControls.js";
import { Renderer } from "../../replay/renderer.js";
import { Factory } from "../library/factory.js";
import { ui } from "../ui/main.js";
import { Camera } from "./renderer.js";

// TODO(randomuserhi): Cleanup and rework

const move = new Vector3();
const tp_temp = new Vector3();
export class Controls {
    private readonly camera: Camera;
    private readonly renderer: Renderer;

    private readonly fakeCamera: PerspectiveCamera;
    private readonly orbitControls: OrbitControls;

    private readonly mount: () => void;
    private readonly wheel: (e: WheelEvent) => void;

    private readonly keydown: (e: KeyboardEvent) => void;
    private readonly keyup: (e: KeyboardEvent) => void;

    private readonly mousedown: (e: MouseEvent) => void;
    private readonly mousemove: (e: MouseEvent) => void;
    private readonly mouseup: (e: MouseEvent) => void;

    private focus: boolean;

    slot?: number;
    targetSlot = signal<number | undefined>(undefined);

    up: boolean;
    down: boolean;
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;

    speed: number;

    constructor(camera: Camera, renderer: Renderer) {
        this.camera = camera;
        this.renderer = renderer;
        const canvas = this.renderer.renderer.domElement;

        this.fakeCamera = this.camera.root.clone();
        this.orbitControls = new OrbitControls(this.fakeCamera, this.renderer.renderer.domElement);
        this.orbitControls.enablePan = false;

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
            this.speed *= Math.sign(e.deltaY) < 0 ? 10/9 : 9/10;
        };

        // NOTE(randomuserhi): Chromium fails to add the wheel event to the canvas if it is unmounted, thus wait for mount before adding the event 
        this.mount = () => {
            canvas.addEventListener("wheel", this.wheel);
        };
        canvas.addEventListener("mount", this.mount);
        
        this.focus = false;
        canvas.addEventListener("focusin", () => {
            this.focus = true;
        });
        canvas.addEventListener("blur", () => {
            this.focus = false;
            this.up = false;
            this.down = false;
            this.left = false;
            this.right = false;
            this.forward = false;
            this.backward = false;
        });

        this.keyup = (e) => {
            if (!this.focus) return;

            const display = ui().display;

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
                if (this.focus) display.scoreboard.wrapper.style.display = "none";
                break;
            }
        };
        this.keydown = (e: KeyboardEvent) => {
            if (!this.focus) return;

            const display = ui().display;
            const view = display.view();
            if (view === undefined) return;

            switch (e.keyCode) {
            case 70:
                e.preventDefault();
                display.pause(!display.pause());
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
                this.targetSlot(0);
                break;
            case 50:
                e.preventDefault();
                this.targetSlot(1);
                break;
            case 51:
                e.preventDefault();
                this.targetSlot(2);
                break;
            case 52:
                e.preventDefault();
                this.targetSlot(3);
                break;
    
            case 38:
                e.preventDefault();
                view.time(view.time() + 10000);
                break;
            case 40:
                e.preventDefault();
                view.time(view.time() - 10000);
                break;
            case 37:
                e.preventDefault();
                view.time(view.time() - 5000);
                break;
            case 39:
                e.preventDefault();
                view.time(view.time() + 5000);
                break;
    
            case 9:
                e.preventDefault();
                display.scoreboard.wrapper.style.display = "block";
                break;
            }
        };
        window.addEventListener("keydown", this.keydown);
        window.addEventListener("keyup", this.keyup);
        this.mousedown = (e: MouseEvent) => {
            this.focus = true;
            
            //e.preventDefault();
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
                
                this.camera.root.rotation.y -= deltaY * 0.002;
                this.camera.root.rotation.x -= deltaX * 0.002;
                
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

    public update(snapshot: ReplayApi, dt: number) {
        const renderer = this.renderer;
        const camera = this.camera;

        const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
        const slots = new Map([...players.values()].map(p => [p.slot, p]));
        const targetSlot = this.targetSlot();
        if (targetSlot !== undefined) {
            const followTarget = slots.get(targetSlot);
            if (followTarget !== undefined) {
                this.slot = targetSlot;
            }
        } else {
            this.slot = undefined;

            const worldPos = new Vector3();
            camera.root.getWorldPosition(worldPos);
            camera.root.parent = renderer.scene;
            camera.root.position.copy(worldPos);
        }

        if (this.slot !== undefined) {
            if (this.forward || this.backward || this.left || this.right || this.up || this.down) {
                this.targetSlot(undefined);
            } else {
                const models = renderer.getOrDefault("Players", Factory("Map"));
                const first = slots.get(this.slot);
                if (first !== undefined) {
                    renderer.set("Dimension", first.dimension);
                    
                    const model = models.get(first.id)!;
                    if (model !== undefined) {
                        if (camera.root.parent !== model.root) {
                            camera.root.parent = model.root;
                        }

                        camera.root.position.copy(this.fakeCamera.position);
                        camera.root.translateY(1);
                        camera.root.quaternion.copy(this.fakeCamera.quaternion);
                    }
                }
            }
        } else {
            const speed = this.speed * dt;
            if (this.forward) {
                const fwd = move.set(0, 0, 1).multiplyScalar(speed);
                fwd.applyQuaternion(camera.root.quaternion);
                camera.root.position.sub(fwd);
            }
            if (this.backward) {
                const bwd = move.set(0, 0, -1).multiplyScalar(speed);
                bwd.applyQuaternion(camera.root.quaternion);
                camera.root.position.sub(bwd);
            }

            if (this.left) {
                const left = move.set(-1, 0, 0).multiplyScalar(speed);
                left.applyQuaternion(camera.root.quaternion);
                camera.root.position.add(left);
            }
            if (this.right) {
                const right = move.set(1, 0, 0).multiplyScalar(speed);
                right.applyQuaternion(camera.root.quaternion);
                camera.root.position.add(right);
            }

            if (this.up) {
                const up = move.set(0, 1, 0).multiplyScalar(speed);
                camera.root.position.add(up);
            }
            if (this.down) {
                const down = move.set(0, -1, 0).multiplyScalar(speed);
                camera.root.position.add(down);
            }
        }
    }

    public tp(position: Vector3Like, dimension: number) {
        const camera = this.renderer.get("Camera")!;
        this.renderer.set("Dimension", dimension);

        this.targetSlot(undefined);
        
        camera.root.parent = this.renderer.scene;
        tp_temp.copy(position).sub(camera.root.position).normalize().multiplyScalar(3);
        camera.root.position.copy(position).sub(tp_temp);
        camera.root.lookAt(tp_temp.copy(position));
    }

    public dispose() {
        const canvas = this.renderer.canvas;
        
        window.removeEventListener("keyup", this.keyup);
        window.removeEventListener("keydown", this.keydown);
        canvas.removeEventListener("mount", this.mount);
        canvas.removeEventListener("wheel", this.wheel);
        canvas.removeEventListener("mousedown", this.mousedown);
        canvas.removeEventListener("mouseup", this.mouseup);
        canvas.removeEventListener("mousemove", this.mousemove);
    }
}