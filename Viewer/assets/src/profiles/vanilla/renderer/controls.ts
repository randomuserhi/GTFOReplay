import { Enemy } from "@asl/vanilla/parser/enemy/enemy.js";
import { signal } from "@esm/@/rhu/signal.js";
import { DataStore } from "@esm/@root/replay/datastore.js";
import { ReplayApi } from "@esm/@root/replay/moduleloader.js";
import type { Renderer } from "@esm/@root/replay/renderer.js";
import { PerspectiveCamera, Quaternion, Raycaster, Sphere, Vector2, Vector3, Vector3Like } from "@esm/three";
import { OrbitControls } from "@esm/three/examples/jsm/controls/OrbitControls.js";
import { Factory } from "../library/factory.js";
import { dispose, ui } from "../ui/main.js";
import { Camera } from "./renderer.js";
import { continuityFocus, EventDirector, resolveEventFocus, type EventFocus } from "../library/eventCamera.js";

const cameraProbeOffsets = [[0,0,0],[.2,0,0],[-.2,0,0],[0,.2,0],[0,0,.2],[0,0,-.2]];
const automaticShots: [number, number, number][] = [[3.4,1.4,-3.4],[-3.6,2.1,-2.8],[3.2,1.7,3.5],[-2.8,2.4,3.1]];

declare module "@esm/@root/replay/datastore.js" {
    interface DataStoreTypes {
        "ControlState": {
            position: Vector3;
            rotation: Quaternion;
            fposition: Vector3;
            frotation: Quaternion;
            targetSlot?: number;
            relativeRot: boolean;
            autoCamera: boolean;
            firstPerson: boolean;
            subject?: EventFocus;
        }
    }
}

const move = new Vector3();
const worldUp = new Vector3(0, 1, 0);

export class Controls {
    readonly camera: Camera;
    readonly renderer: Renderer;

    private readonly fakeCamera: PerspectiveCamera;
    private readonly orbitControls: OrbitControls;

    private readonly mount: () => void;
    private readonly wheel: (e: WheelEvent) => void;

    private readonly keydown: (e: KeyboardEvent) => void;
    private readonly keyup: (e: KeyboardEvent) => void;
    private readonly blur: () => void;

    private readonly mousedown: (e: MouseEvent) => void;
    private readonly mousemove: (e: MouseEvent) => void;
    private readonly mouseup: (e: MouseEvent) => void;

    private focus: boolean;

    slot?: number;
    targetSlot = signal<number | undefined>(undefined);
    relativeRot = signal(false);
    autoCamera = signal(true);
    firstPerson = signal(false);
    public get firstPersonPlayer() {
        return this.firstPerson() && this.slot !== undefined && this.subject?.type === 'player' ? this.subject.id : undefined;
    }
    targetName = signal<string | undefined>(undefined);
    revision = 0;
    private readonly director = new EventDirector();
    private subject?: EventFocus;
    private pendingFocus?: { target: EventFocus; time: number };
    private transition?: { position: Vector3; rotation: Quaternion; elapsed: number };
    private readonly desiredPosition = new Vector3();
    private readonly desiredRotation = new Quaternion();
    private readonly subjectRotation = new Quaternion();
    private readonly cameraAnchor = new Vector3();
    private readonly cameraDirection = new Vector3();
    private readonly cameraProbe = new Vector3();
    private readonly cameraRay = new Raycaster();
    private automaticShot = 0;
    private shotSubject?: string;

    private cameraClearance(position: Vector3, dimension: number) {
        const length = this.cameraDirection.copy(position).sub(this.cameraAnchor).length();
        if (length < .001) return 0;
        this.cameraDirection.divideScalar(length);
        let clear = length;
        // Parallel probes reserve space around the lens, not just its centre.
        for (const [x,y,z] of cameraProbeOffsets) {
            this.cameraProbe.set(x,y,z).add(this.cameraAnchor);
            this.cameraRay.set(this.cameraProbe,this.cameraDirection);
            this.cameraRay.near=0; this.cameraRay.far=length+.25;
            let distance=this.renderer.get('NativeSurfaces')?.cameraDistance(this.cameraRay,dimension) ?? this.cameraRay.far;
            for (const door of this.renderer.get('Doors')?.values() ?? []) {
                if (door.door.dimension !== dimension || this.cameraAnchor.distanceToSquared(door.root.position)>225) continue;
                door.native.root.updateWorldMatrix(true,true);
                const hit=this.cameraRay.intersectObject(door.native.root,true)[0];
                if(hit) distance=Math.min(distance,hit.distance);
            }
            clear=Math.min(clear,Math.max(0,distance-.25));
        }
        return clear;
    }

    private keepCameraVisible(position: Vector3, dimension: number) {
        position.sub(this.cameraAnchor).clampLength(0,5).add(this.cameraAnchor);
        const clear=this.cameraClearance(position,dimension);
        position.sub(this.cameraAnchor).setLength(clear).add(this.cameraAnchor);
    }

    public cancelEventFocus() { ++this.revision; this.pendingFocus = undefined; this.director.reset(); }

    public followPlayer(slot?: number) {
        this.cancelEventFocus(); this.autoCamera(false);
        this.orbitControls.maxDistance = 30;
        if (slot === undefined) this.firstPerson(false);
        this.subject = undefined; this.targetName(undefined); this.targetSlot(slot);
        this.transition = undefined;
    }

    public setFirstPerson(enabled: boolean) {
        if (enabled && this.targetSlot() === undefined) return;
        this.cancelEventFocus(); this.autoCamera(false);
        this.orbitControls.maxDistance = 30;
        this.firstPerson(enabled); this.transition = undefined;
        this.orbitControls.enabled = !enabled && !!this.subject && this.subject.type !== 'point';
    }

    public enableAutoCamera() {
        this.cancelEventFocus(); this.firstPerson(false); this.autoCamera(true); this.targetSlot(undefined);
        this.orbitControls.maxDistance = 5;
        this.shotSubject = undefined;
        if (this.fakeCamera.position.lengthSq()<1) this.fakeCamera.position.set(0,2,-4);
        this.up = this.down = this.forward = this.backward = this.left = this.right = false;
    }

    public focusEvent(target: EventFocus, time: number) {
        this.cancelEventFocus();
        this.firstPerson(false);
        this.pendingFocus = { target, time };
    }

    private frameSubject(target: EventFocus) {
        if (this.subject?.key !== target.key) {
            this.transition = { position: this.camera.root.position.clone(), rotation: this.camera.root.quaternion.clone(), elapsed: 0 };
        }
        if (this.autoCamera() && this.shotSubject !== target.key) {
            this.shotSubject = target.key;
            this.fakeCamera.position.set(...automaticShots[this.automaticShot++ % automaticShots.length]);
        }
        this.subject = target;
        this.targetSlot(!this.autoCamera() && target.type === 'player' ? target.slot : undefined);
        this.targetName(target.name);
        this.moveTime = 0;
    }

    up: boolean = false;
    down: boolean = false;
    forward: boolean = false;
    backward: boolean = false;
    left: boolean = false;
    right: boolean = false;
    shift: boolean = false;

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
    private moveTime = 0;

    public static hooks = new Set<(self: Controls, snapshot: ReplayApi, dt: number) => void>();
    public static keydownhooks = new Set<(self: Controls, e: KeyboardEvent) => boolean>();
    public static keyuphooks = new Set<(self: Controls, e: KeyboardEvent) => boolean>();

    public saveState() {
        DataStore.set("ControlState", {
            position: this.camera.root.position.clone(),
            rotation: this.camera.root.quaternion.clone(),
            fposition: this.fakeCamera.position.clone(),
            frotation: this.fakeCamera.quaternion.clone(),
            targetSlot: this.targetSlot(),
            relativeRot: this.relativeRot(),
            autoCamera: this.autoCamera(),
            firstPerson: this.firstPerson(),
            subject: this.subject,
        });
    }

    public loadState() {
        const state = DataStore.get("ControlState");
        if (state === undefined) return;

        const { position, fposition, rotation, frotation, targetSlot, relativeRot, autoCamera, firstPerson, subject } = state;

        this.camera.root.position.copy(position);
        this.camera.root.quaternion.copy(rotation);
        this.fakeCamera.position.copy(fposition);
        this.fakeCamera.quaternion.copy(frotation);
        this.targetSlot(targetSlot);
        this.relativeRot(relativeRot);
        this.autoCamera(autoCamera);
        this.orbitControls.maxDistance = autoCamera ? 5 : 30;
        this.firstPerson(firstPerson);
        this.subject = subject; this.targetName(subject?.name);
    }

    constructor(camera: Camera, renderer: Renderer) {
        this.camera = camera;
        this.renderer = renderer;
        const canvas = this.renderer.renderer.domElement;

        this.fakeCamera = this.camera.root.clone();
        this.orbitControls = new OrbitControls(this.fakeCamera, this.renderer.renderer.domElement);
        this.orbitControls.enablePan = false;
        this.orbitControls.enabled = false;
        this.orbitControls.minDistance = 2;
        this.orbitControls.maxDistance = 5;

        this.speed = 20;
        const mouse = {
            x: 0,
            y: 0,
            left: false,
            right: false
        };
        const old = { x: 0, y: 0 };
        this.wheel = (e: WheelEvent) => {
            if (!this.autoCamera()) this.cancelEventFocus();
            if (this.subject || this.slot !== undefined) return;
            
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
        this.blur = () => {
            this.focus = false;
            this.up = false;
            this.down = false;
            this.left = false;
            this.right = false;
            this.forward = false;
            this.backward = false;
            this.shift = false;
            this.moveTime = 0;
        };
        canvas.addEventListener("blur", this.blur, { signal: dispose.signal });
        window.addEventListener("blur", this.blur, { signal: dispose.signal });

        this.keyup = (e) => {
            if (!this.focus) return;

            const display = ui().display;

            for (const keyuphook of Controls.keyuphooks) {
                if (!keyuphook(this, e)) return;
            }

            switch (e.keyCode) {
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
    
            case 16: // shift key
                e.preventDefault();
                this.shift = false;
                this.up = false;
                break;

            case 9:
                e.preventDefault();
                if (this.focus) display.scoreboard.wrapper.style.display = "none";
                break;
            }
            if (!this.forward && !this.backward && !this.left && !this.right) this.moveTime = 0;
        };
        this.keydown = (e: KeyboardEvent) => {
            if (!this.focus) return;
            if (e.repeat) return;

            const display = ui().display;
            const view = display.view();
            if (view === undefined) return;

            for (const keydownhook of Controls.keydownhooks) {
                if (!keydownhook(this, e)) return;
            }

            if ([16, 17, 65, 68, 83, 87].includes(e.keyCode)) this.followPlayer();
            switch (e.keyCode) {
            case 70:
                e.preventDefault();
                view.pause(!view.pause());
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

            case 38:
                e.preventDefault();
                view.time(view.time() + 10000);
                break;
            case 40:
                e.preventDefault();
                view.time(view.time() - 10000);
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

            case 16: // shift key
                e.preventDefault();
                this.shift = true;
                this.up = true;
                break;

            case 49:
                e.preventDefault();
                this.followPlayer(0);
                break;
            case 50:
                e.preventDefault();
                this.followPlayer(1);
                break;
            case 51:
                e.preventDefault();
                this.followPlayer(2);
                break;
            case 52:
                e.preventDefault();
                this.followPlayer(3);
                break;
            }
        };
        window.addEventListener("keydown", this.keydown, { signal: dispose.signal });
        window.addEventListener("keyup", this.keyup, { signal: dispose.signal });
        this.mousedown = (e: MouseEvent) => {
            canvas.focus({ preventScroll: true });
            this.focus = true;

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

            old.x = mouse.x;
            old.y = mouse.y;
            const rect = canvas.getBoundingClientRect();
            mouse.x = old.x = e.clientX - rect.left;
            mouse.y = old.y = e.clientY - rect.top;
        };
        canvas.addEventListener("mousedown", this.mousedown, { signal: dispose.signal });
        this.mousemove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;

            this.mousePos.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);

            if (mouse.left && !this.subject && this.slot === undefined) {
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
        window.addEventListener("mouseup", this.mouseup, { signal: dispose.signal });
    }

    public raycaster = new Raycaster();
    private clicked2 = false;

    public static selected = signal<number[] | undefined>(undefined);
    private clickSphere: Sphere = new Sphere(undefined, 1);
    public enableMindControl = false;

    public update(snapshot: ReplayApi, dt: number) {
        const renderer = this.renderer;
        const camera = this.camera;

        const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
        const slots = new Map([...players.values()].map(p => [p.slot, p]));
        const view = ui().display.view();
        const pending = this.pendingFocus;
        if (pending && view?.time() !== pending.time) this.pendingFocus = undefined;
        else if (pending && Math.abs(snapshot.time() - pending.time) < 1) {
            this.pendingFocus = undefined; this.frameSubject(pending.target);
        }
        const replay = view?.replay();
        if (this.autoCamera() && replay) {
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", Factory("Map"));
            const animations = snapshot.getOrDefault("Vanilla.Enemy.Animation", Factory("Map"));
            const alive = (id: number) => {
                const enemy = enemies.get(id);
                return !!enemy && enemy.health > 0 && !animations.get(id)?.state.startsWith('Dead');
            };
            const next = this.director.update(replay.events, snapshot.time(), dt, view!.timescale(), !view!.pause() && !replay.loading,
                event => {
                    // Combat coverage follows the participating player, rather than cutting to every victim.
                    const focus = resolveEventFocus(event.kind === 'Vanilla.StatTracker.Damage'
                        ? { ...event, participants: event.participants?.filter(person => person.type === 'player') }
                        : event, players, enemies);
                    return focus?.type === 'enemy' && !alive(focus.id!) ? undefined : focus;
                }, {
                    current: this.subject,
                    valid: focus => focus.type === 'enemy' ? alive(focus.id!) : focus.type === 'player' ? players.has(focus.id!) : true,
                    continuation: recent => continuityFocus(players, enemies, this.subject ?? { position: camera.root.position, dimension: renderer.get("Dimension") ?? 0 }, recent)
                });
            if (next) this.frameSubject(next);
            else if (next === null) {
                this.subject = undefined; this.targetSlot(undefined); this.targetName(undefined); this.transition = undefined;
            }
        }
        const targetSlot = this.targetSlot();
        if (!this.subject && targetSlot !== undefined) {
            const player = slots.get(targetSlot);
            if (player) this.frameSubject({ ...player, key: `player:${player.id}`, type: 'player', name: player.nickname });
        }
        this.slot = this.subject?.type === 'player' ? players.get(this.subject.id!)?.slot : undefined;
        this.targetSlot(this.autoCamera() ? undefined : this.slot);
        this.orbitControls.enabled = !this.firstPerson() && !!this.subject && (this.autoCamera() || this.subject.type !== 'point');

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

        // todo: clean up
        if (this.doSelect) {
            this.doSelect = false;
            const selectedEnemies: number[] = [];
            const minX = Math.min(this.selectStart.x, this.selectEnd.x);
            const minY = Math.min(this.selectStart.y, this.selectEnd.y);
            const maxX = Math.max(this.selectStart.x, this.selectEnd.x);
            const maxY = Math.max(this.selectStart.y, this.selectEnd.y);

            const dir = new Vector3();

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
        
        for (const hook of Controls.hooks) {
            hook(this, snapshot, dt);
        }

        if (this.subject) {
            this.moveTime = 0;
            if (this.forward || this.backward || this.left || this.right || this.up || this.down) {
                this.followPlayer();
            } else {
                const target = this.subject;
                const entity = target.type === 'player' ? players.get(target.id!) : target.type === 'enemy' ? snapshot.getOrDefault("Vanilla.Enemy", Factory("Map")).get(target.id!) : undefined;
                // Manual event inspection retains its last frame; the director retires invalid subjects above.
                if (entity) { target.position = entity.position; target.dimension = entity.dimension; }
                if (this.firstPerson() && target.type === 'player') {
                    const anim = snapshot.getOrDefault("Vanilla.Player.Animation", Factory("Map")).get(target.id!);
                    this.transition = undefined;
                    // Camera transforms are not recorded. Reconstruct a stable eye height from stance.
                    // Keep the last view when the tracked player or their animation is absent.
                    if (entity && anim) {
                        const height = anim.state === 'downed' ? .55 : 1.65 - .55 * Math.max(0, Math.min(1, anim.crouch));
                        camera.root.position.copy(entity.position).y += height;
                        const direction = this.desiredPosition.copy(anim.targetLookDir);
                        if (direction.lengthSq() > 0) camera.root.lookAt(direction.add(camera.root.position));
                        renderer.set("Dimension", entity.dimension);
                    }
                    return;
                }
                const offset = this.desiredPosition.copy(this.fakeCamera.position);
                if (this.autoCamera() && offset.lengthSq()<1) offset.set(0,2,-4);
                if (this.autoCamera()) offset.clampLength(2,5);
                offset.y += 1;
                this.desiredRotation.copy(this.fakeCamera.quaternion);
                if (this.relativeRot() && entity) {
                    this.subjectRotation.copy(entity.rotation);
                    offset.applyQuaternion(this.subjectRotation);
                    this.desiredRotation.premultiply(this.subjectRotation);
                }
                offset.add(target.position);
                const dimensionChanged = renderer.get("Dimension") !== target.dimension;
                renderer.set("Dimension", target.dimension);
                if (this.autoCamera()) {
                    this.cameraAnchor.copy(target.position).y += 1.2;
                    this.keepCameraVisible(offset,target.dimension);
                }
                const transition = this.transition;
                // Long map jumps and dimension changes use a clean cut, not a flight through walls.
                if (transition && !dimensionChanged && transition.position.distanceToSquared(offset) < 35 * 35 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    transition.elapsed += Math.max(0, dt);
                    const t = Math.min(1, transition.elapsed / .65), eased = t * t * (3 - 2 * t);
                    camera.root.position.lerpVectors(transition.position, offset, eased);
                    camera.root.quaternion.slerpQuaternions(transition.rotation, this.desiredRotation, eased);
                    if (t === 1) this.transition = undefined;
                } else {
                    camera.root.position.copy(offset); camera.root.quaternion.copy(this.desiredRotation); this.transition = undefined;
                }
                if (this.autoCamera()) {
                    this.keepCameraVisible(camera.root.position,target.dimension);
                    camera.root.lookAt(this.cameraAnchor);
                }
            }
        } else {
            const speed = this.speed * dt;
            move.set(Number(this.right) - Number(this.left), 0, Number(this.backward) - Number(this.forward));
            if (move.lengthSq() > 0) {
                // Ramp from 1x to 4x over three seconds; pitch never changes height or speed.
                const previousTime = this.moveTime;
                this.moveTime = Math.min(3, this.moveTime + dt);
                move.normalize().applyAxisAngle(worldUp, camera.root.rotation.y);
                camera.root.position.addScaledVector(move, speed * (1 + (previousTime + this.moveTime) / 2));
            } else {
                this.moveTime = 0;
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
        this.followPlayer();
        this.renderer.set("Dimension", dimension);
        this.camera.root.position.copy(position).add(new Vector3(0, 3, -6));
        this.camera.root.lookAt(position.x, position.y, position.z);
    }

    public dispose() {
        this.orbitControls.dispose();
        const canvas = this.renderer.canvas;
        
        window.removeEventListener("keyup", this.keyup);
        window.removeEventListener("keydown", this.keydown);
        window.removeEventListener("blur", this.blur);
        canvas.removeEventListener("blur", this.blur);
        canvas.removeEventListener("mount", this.mount);
        canvas.removeEventListener("wheel", this.wheel);
        canvas.removeEventListener("mousedown", this.mousedown);
        window.removeEventListener("mouseup", this.mouseup);
        window.removeEventListener("mousemove", this.mousemove);
    }
}
