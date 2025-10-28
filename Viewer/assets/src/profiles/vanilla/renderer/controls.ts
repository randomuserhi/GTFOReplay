import { Enemy } from "@asl/vanilla/parser/enemy/enemy.js";
import { signal } from "@esm/@/rhu/signal.js";
import { DataStore } from "@esm/@root/replay/datastore.js";
import { ReplayApi } from "@esm/@root/replay/moduleloader.js";
import type { Renderer } from "@esm/@root/replay/renderer.js";
import { PerspectiveCamera, Quaternion, Raycaster, Sphere, Vector2, Vector3, Vector3Like } from "@esm/three";
import { OrbitControls } from "@esm/three/examples/jsm/controls/OrbitControls.js";
import { Factory } from "../library/factory.js";
import { Player } from "../parser/player/player.js";
import { dispose, ui } from "../ui/main.js";
import { Camera } from "./renderer.js";

// TODO(randomuserhi): Cleanup and rework

declare module "@esm/@root/replay/datastore.js" {
    interface DataStoreTypes {
        "ControlState": {
            position: Vector3;
            rotation: Quaternion;
            fposition: Vector3;
            frotation: Quaternion;
            targetSlot?: number;
            relativeRot: boolean;
        }
    }
}

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
    relativeRot = signal(false);

    up: boolean;
    down: boolean;
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;

    mouseRight: boolean = false;
    mouseLeft: boolean = false;
    mouseMiddle: boolean = false;
    mousePos: Vector2 = new Vector2();
    
    isSelecting = signal<boolean>(false);
    doSelect: boolean = false;
    selectStart = new Vector2();
    selectStartScreen = new Vector2();
    selectEnd = new Vector2();

    speed: number;

    public saveState() {
        DataStore.set("ControlState", {
            position: this.camera.root.position.clone(),
            rotation: this.camera.root.quaternion.clone(),
            fposition: this.fakeCamera.position.clone(),
            frotation: this.fakeCamera.quaternion.clone(),
            targetSlot: this.targetSlot(),
            relativeRot: this.relativeRot(),
        });
    }

    public loadState() {
        const state = DataStore.get("ControlState");
        if (state === undefined) return;

        const { position, fposition, rotation, frotation, targetSlot, relativeRot } = state;

        this.camera.root.position.copy(position);
        this.camera.root.quaternion.copy(rotation);
        this.fakeCamera.position.copy(fposition);
        this.fakeCamera.quaternion.copy(frotation);
        this.targetSlot(targetSlot);
        this.relativeRot(relativeRot);
    }

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
            canvas.addEventListener("wheel", this.wheel, { signal: dispose.signal });
        };
        canvas.addEventListener("mount", this.mount, { signal: dispose.signal });
        
        this.focus = false;
        canvas.addEventListener("focusin", () => {
            this.focus = true;
        }, { signal: dispose.signal });
        canvas.addEventListener("blur", () => {
            this.focus = false;
            this.up = false;
            this.down = false;
            this.left = false;
            this.right = false;
            this.forward = false;
            this.backward = false;
        }, { signal: dispose.signal });

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

            case 81: // q key
                {
                    const rect = canvas.getBoundingClientRect();
                    this.selectEnd.set((mouse.x / rect.width) * 2 - 1, -(mouse.y / rect.height) * 2 + 1);
                    this.isSelecting(false);
                    this.doSelect = true;
                }
                break;
    
            case 9:
                e.preventDefault();
                if (this.focus) display.scoreboard.wrapper.style.display = "none";
                break;
            }
        };
        this.keydown = (e: KeyboardEvent) => {
            if (!this.focus) return;
            if (e.repeat) return;

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

            case 81: // q key
                {
                    this.isSelecting(true);
                    const rect = canvas.getBoundingClientRect();
                    this.selectStart.set((mouse.x / rect.width) * 2 - 1, -(mouse.y / rect.height) * 2 + 1);
                    this.selectStartScreen.set(mouse.x + rect.left, mouse.y + rect.top);
                }
                break;

            case 67: // c key
                // to be removed
                if (this.enableMindControl && Controls.selected() !== undefined) {
                    window.api.invoke("mindControlClear", Controls.selected());
                }
                break;
            }
        };
        window.addEventListener("keydown", this.keydown, { signal: dispose.signal });
        window.addEventListener("keyup", this.keyup, { signal: dispose.signal });
        this.mousedown = (e: MouseEvent) => {
            this.focus = true;
            
            //e.preventDefault();

            if (e.button === 0) {
                mouse.left = true;
                this.mouseLeft = true;
            } else if (e.button === 2) {
                mouse.right = true;
                this.mouseRight = true;
            } else if (e.button === 1) {
                this.mouseMiddle = true;
                e.preventDefault();
            }

            const rect = canvas.getBoundingClientRect();
            this.mousePos.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);

            old.x = mouse.x;
            old.y = mouse.y;
            origin.x = mouse.x;
            origin.y = mouse.y;
        };
        canvas.addEventListener("mousedown", this.mousedown, { signal: dispose.signal });
        this.mousemove = (e) => {
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
        window.addEventListener("mousemove", this.mousemove, { signal: dispose.signal });
        this.mouseup = (e) => {
            e.preventDefault();
            if (e.button === 0) {
                mouse.left = false;
                this.mouseLeft = false;
            } else if (e.button === 2) {
                mouse.right = false;
                this.mouseRight = false;
            } else if (e.button === 1) {
                this.mouseMiddle = false;
                e.preventDefault();
            }
        };
        canvas.addEventListener("mouseup", this.mouseup, { signal: dispose.signal });
    }

    // to be removed... testing clicking stuff
    private raycaster = new Raycaster();
    private clicked1 = false;
    private clicked2 = false;

    public static selected = signal<number[] | undefined>(undefined);
    private clickSphere: Sphere = new Sphere(undefined, 1);
    public enableMindControl = false;

    private static FUNC_update = {
        dir: new Vector3()
    } as const;
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

        this.raycaster.setFromCamera(this.mousePos, camera.root);

        if (this.mouseMiddle && !this.clicked2) {
            this.clicked2 = true;

            let enemy: Enemy | undefined = undefined;
            let dist: number | undefined = undefined;

            const enemies = snapshot.getOrDefault("Vanilla.Enemy", Factory("Map"));
            for (const e of enemies.values()) {
                if (e.dimension !== renderer.get("Dimension")) continue;

                this.clickSphere.center.copy(e.position);
                this.clickSphere.center.setY(this.clickSphere.center.y + 1);
                if (this.raycaster.ray.intersectsSphere(this.clickSphere)) {
                    const p = e.position;
                    const d = camera.root.position.distanceToSquared(p);
                    if (enemy === undefined || dist === undefined || d < dist) {
                        dist = d;
                        enemy = e;
                    }
                }
            }

            if (enemy !== undefined) {
                Controls.selected([enemy.id]);
                console.log(`Selected: ${Controls.selected()}`);
            } else {
                Controls.selected(undefined);
            }
        } else if (!this.mouseMiddle) {
            this.clicked2 = false;
        }

        // to be removed
        if (this.doSelect) {
            this.doSelect = false;
            const selectedEnemies: number[] = [];
            const minX = Math.min(this.selectStart.x, this.selectEnd.x);
            const minY = Math.min(this.selectStart.y, this.selectEnd.y);
            const maxX = Math.max(this.selectStart.x, this.selectEnd.x);
            const maxY = Math.max(this.selectStart.y, this.selectEnd.y);

            const { dir } = Controls.FUNC_update;

            const enemies = snapshot.getOrDefault("Vanilla.Enemy", Factory("Map"));
            for (const e of enemies.values()) {
                if (e.dimension !== renderer.get("Dimension")) continue;

                dir.copy(e.position);
                dir.setY(e.position.y + 1);
                dir.project(camera.root);
                if (dir.x > minX && dir.x < maxX && dir.y > minY && dir.y < maxY) {
                    dir.copy(e.position);
                    dir.setY(e.position.y + 1);
                    const dist = dir.distanceToSquared(camera.root.position);
                    let skip = false;

                    // check line of sight
                    this.raycaster.set(camera.root.position, dir.sub(camera.root.position));
                    const geometryGroups = renderer.getOrDefault("Maps", Factory("Map"));
                    const group = geometryGroups.get(renderer.get("Dimension")!);
                    if (group !== undefined) {
                        for (const geom of group) {
                            const intersects = this.raycaster.intersectObject(geom, false);
                            if (intersects.length > 0) {
                                for (let i = 0; i < intersects.length; ++i) {
                                    const p = intersects[i].point;
                                    const d = camera.root.position.distanceToSquared(p);
                                    if (d < dist) {
                                        skip = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    if (!skip) selectedEnemies.push(e.id);
                }
            }

            if (selectedEnemies.length > 0) {
                Controls.selected(selectedEnemies);
                console.log(`Selected: ${Controls.selected()}`);
            } else {
                Controls.selected(undefined);
            }
        } 
        
        if (this.enableMindControl) {
            if (this.mouseRight && !this.clicked1) {
                this.clicked1 = true;

                let player: Player | undefined = undefined;
                let point: Vector3 | undefined = undefined;
                let dist: number | undefined = undefined;

                // Click geometry
                const geometryGroups = renderer.getOrDefault("Maps", Factory("Map"));
                const group = geometryGroups.get(renderer.get("Dimension")!);
                if (group !== undefined) {
                    for (const geom of group) {
                        const intersects = this.raycaster.intersectObject(geom, false);
                        if (intersects.length > 0) {
                            for (let i = 0; i < intersects.length; ++i) {
                                const p = intersects[i].point;
                                const d = camera.root.position.distanceToSquared(p);
                                if (point === undefined || dist === undefined || d < dist) {
                                    dist = d;
                                    point = p;
                                }
                            }
                        }
                    }
                }

                // Click player
                const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
                for (const p of players.values()) {
                    this.clickSphere.center.copy(p.position);
                    this.clickSphere.center.setY(this.clickSphere.center.y + 1);
                    if (this.raycaster.ray.intersectsSphere(this.clickSphere)) {
                        const d = camera.root.position.distanceToSquared(p.position);
                        if (player === undefined || dist === undefined || d < dist) {
                            dist = d;
                            player = p;
                        }
                    }
                }

                if (Controls.selected !== undefined) {
                    if (player !== undefined) {
                        console.log('Clicked on player: ', player.slot);
                        window.api.invoke("mindControlAttack", Controls.selected(), player.slot);
                    } else if (point !== undefined) {
                        console.log('Clicked point on mesh:', point);
                        window.api.invoke("mindControlPosition", Controls.selected(), -point.x, point.y, point.z);
                    }
                }
            } else if (!this.mouseRight) {
                this.clicked1 = false;
            }
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
                        const relativeRot = this.relativeRot();
                        if (relativeRot === true) {
                            if (camera.root.parent !== model.anchor) {
                                camera.root.parent = model.anchor;
                            }
                        } else {
                            if (camera.root.parent !== model.root) {
                                camera.root.parent = model.root;
                            }
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
        window.removeEventListener("mousemove", this.mousemove);
    }
}