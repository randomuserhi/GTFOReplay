import { signal } from "@esm/@/rhu/signal.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Color, Group, Mesh, MeshPhongMaterial, Vector3 } from "@esm/three";
import { Text } from "@esm/troika-three-text";
import { ItemDatablock } from "../../datablocks/items/item.js";
import { black, white } from "../../library/constants.js";
import { Factory } from "../../library/factory.js";
import { loadGLTFGeometry } from "../../library/modelloader.js";
import { Identifier } from "../../parser/identifier.js";
import { ResourceContainer, ResourceContainerState } from "../../parser/map/resourcecontainer.js";
import { ObjectWrapper } from "../objectwrapper.js";
import { Camera } from "../renderer.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.ResourceContainers": void;
        }

        interface RenderData {
            "ResourceContainers": Map<number, ResourceContainerModel>;
        }
    }
}

const materialOrange = new MeshPhongMaterial({
    color: 0xc57000,
    transparent: true
});

const materialGrey = new MeshPhongMaterial({
    color: 0x777777,
    transparent: true
});

const materialGreyUnregistered = new MeshPhongMaterial({
    color: 0x777777,
    transparent: true,
    opacity: 0.1
});
const materialOrangeUnregistered = new MeshPhongMaterial({
    color: 0xc57000,
    transparent: true,
    opacity: 0.1
});

export class ResourceContainerModel extends ObjectWrapper<Group> {
    static transparent = signal(false);
    static debug = signal(false);

    anchor: Group;

    hacklock: Group;
    padlock: Group;

    lockColor: Color;
    lockMaterial: MeshPhongMaterial;

    container: ResourceContainer;

    private tmp?: Text;
    tmpAnchor: Group = new Group();

    constructor(container: ResourceContainer) {
        super();
        this.container = container;

        this.root = new Group();
        this.anchor = new Group();
        this.root.add(this.anchor);

        this.root.position.copy(container.position);
        this.root.quaternion.copy(container.rotation);
    
        this.hacklock = new Group();
        this.padlock = new Group();

        this.lockColor = new Color(0xffffff);
        this.lockMaterial = new MeshPhongMaterial();
        this.lockMaterial.color = this.lockColor;
        this.lockMaterial.specular = black;
        loadGLTFGeometry("../js3party/models/hacklock.glb", false).then((model) => this.hacklock.add(new Mesh(model, this.lockMaterial)));
        loadGLTFGeometry("../js3party/models/padlock.glb", false).then((model) => this.padlock.add(new Mesh(model, this.lockMaterial)));

        this.hacklock.add(this.padlock);
        this.anchor.add(this.hacklock);

        this.padlock.scale.set(0.2, 0.2, 0.2);
        this.padlock.position.set(0, -0.5, 0.1);

        this.hacklock.visible = false;
        this.padlock.visible = false;

        this.anchor.visible = this.container.registered || ResourceContainerModel.debug();

        // Setup tmp
        this.tmp = new Text();
        this.tmp.font = "./fonts/oxanium/Oxanium-SemiBold.ttf";
        this.tmp.fontSize = 0.2;
        this.tmp.position.y = 2;
        this.tmp.textAlign = "center";
        this.tmp.anchorX = "center";
        this.tmp.anchorY = "bottom";
        this.tmp.color = 0xffffff;
        this.tmp.visible = false;
        this.tmpAnchor.add(this.tmp);
        this.root.add(this.tmpAnchor);

        this.updateStateless();
    }

    private static FUNC_updateStateless = {
        camPos: new Vector3(),
        tmpPos: new Vector3()
    } as const;
    public updateStateless(camera?: Camera, state?: ResourceContainerState) {
        this.anchor.visible = this.container.registered || ResourceContainerModel.debug();

        if (this.tmp !== undefined) {
            this.tmp.visible = ResourceContainerModel.debug();

            const item = ItemDatablock.get(this.container.consumableType);
            let name = "Unknown";
            if (item !== undefined) {
                if (item.name !== undefined) {
                    name = item.name;
                } else if (Identifier.isKnown(this.container.consumableType)) {
                    name = this.container.consumableType.hash;
                }
            }

            this.tmp.text = `lock: ${this.container.assignedLock === undefined ? "Unknown" : this.container.assignedLock} 
type: ${name}`;

            if (this.tmp.visible && camera !== undefined) {
                const { camPos, tmpPos } = ResourceContainerModel.FUNC_updateStateless;

                this.tmp.getWorldPosition(tmpPos);
                camera.root.getWorldPosition(camPos);
                
                const lerp = Math.clamp01(camPos.distanceTo(tmpPos) / 30);
                this.tmp.fontSize = Math.clamp(lerp * 0.3 + 0.05, 0.05, 0.2);
                this.tmp.lookAt(camPos);
            }
        }
    }

    public update(time: number, state: ResourceContainerState) {
        if (state.closed) {
            this.hacklock.visible = state.lockType === "Hackable" || state.lockType === "Melee";
            this.padlock.visible = state.lockType === "Melee";

            if (state.lockType === "Melee") {
                this.lockMaterial.specular = white;
            } else {
                this.lockMaterial.specular = black;
            }

            if (state.lockType === "Hackable") {
                this.lockColor.set(0x6666ff);
            } else {
                this.lockColor.set(0x666666);
            }
        }
    }
}

class Locker extends ResourceContainerModel {
    back: Group;
    left: Group;
    right: Group;
    pivot: Group;

    constructor(container: ResourceContainer) {
        super(container);

        this.back = new Group();
        this.left = new Group();
        this.right = new Group();
        this.pivot = new Group();
        this.left.add(this.right);
        this.pivot.add(this.left);
        this.anchor.add(this.back, this.pivot);

        this.anchor.scale.set(0.43, 0.43, 0.43);
        this.anchor.position.set(0.5, -0.225, 1);
        
        this.left.scale.set(-1, 1, 1);
        this.left.position.set(1.1, 0, -0.55 + 0.045);

        this.right.scale.set(-1, 1, 1);
        this.right.position.set(0, 0, 0);

        this.pivot.position.set(-1.1, 0, 0.55);

        loadGLTFGeometry("../js3party/models/StorageContainers/locker back.glb", false).then((model) => this.back.add(new Mesh(model, container.registered ? materialGrey : materialGreyUnregistered)));
        loadGLTFGeometry("../js3party/models/StorageContainers/locker front.glb", false).then((model) => this.left.add(new Mesh(model, container.registered ? materialOrange : materialOrangeUnregistered)));
        loadGLTFGeometry("../js3party/models/StorageContainers/locker front.glb", false).then((model) => this.right.add(new Mesh(model, container.registered ? materialOrange : materialOrangeUnregistered)));
        
        this.hacklock.position.set(0, 0.575, 0.6);
        
        this.anchor.rotateX(Math.PI / 2);
        this.tmpAnchor.position.copy(this.anchor.position);
        this.tmpAnchor.rotation.copy(this.anchor.rotation);
    }

    public update(time: number, container: ResourceContainerState): void {
        super.update(time, container);
        
        if (container.closed) {
            this.pivot.rotation.set(0, 0, 0);
            this.right.position.set(0, 0, 0);
            return;
        }

        this.hacklock.visible = false;
        this.padlock.visible = false;

        const animDuration = 700;
        const lerp = Math.clamp01((time - container.lastCloseTime) / animDuration);
        this.pivot.rotation.set(0, -70 * Math.deg2rad * lerp, 0);
        this.right.position.set(0.8 * lerp, 0, -0.05);
    }
}

class Box extends ResourceContainerModel {
    bottom: Group;
    top: Group;
    pivot: Group;

    constructor(container: ResourceContainer) {
        super(container);

        this.bottom = new Group();
        this.top = new Group();
        this.pivot = new Group();
        this.pivot.add(this.top);
        this.anchor.add(this.bottom, this.pivot);
        
        this.top.position.set(0, 0.4, 1);
        this.pivot.position.set(0, 0.42, -1);
        
        this.anchor.scale.set(0.25, 0.25, 0.25);
        this.anchor.position.set(0, 0, 0.1);

        loadGLTFGeometry("../js3party/models/StorageContainers/box bottom.glb", false).then((model) => this.bottom.add(new Mesh(model, container.registered ? materialGrey : materialGreyUnregistered)));
        loadGLTFGeometry("../js3party/models/StorageContainers/box top.glb", false).then((model) => this.top.add(new Mesh(model, container.registered ? materialOrange : materialOrangeUnregistered)));
        
        this.hacklock.position.set(0, 0.4, 1);
        this.hacklock.scale.set(1.72, 1.72, 1.72);

        this.anchor.rotateX(Math.PI / 2);
        this.tmpAnchor.position.copy(this.anchor.position);
        this.tmpAnchor.rotation.copy(this.anchor.rotation);
    }

    public update(time: number, state: ResourceContainerState): void {
        super.update(time, state);

        if (state.closed) {
            this.pivot.rotation.set(0, 0, 0);
            return;
        }

        this.hacklock.visible = false;
        this.padlock.visible = false;

        const animDuration = 400;
        this.pivot.rotation.set(-90 * Math.deg2rad * Math.clamp01((time - state.lastCloseTime) / animDuration), 0, 0);
    }
}

ModuleLoader.registerRender("Vanilla.ResourceContainers", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            if (ResourceContainerModel.transparent()) {
                materialOrange.opacity = 0.5;
                materialOrange.depthWrite = false;

                materialGrey.opacity = 0.5;
                materialGrey.depthWrite = false;
            } else {
                materialOrange.opacity = 1;
                materialOrange.depthWrite = true;

                materialGrey.opacity = 1;
                materialGrey.depthWrite = true;
            }

            const time = snapshot.time();
            const containers = snapshot.header.getOrDefault("Vanilla.Map.ResourceContainers", Factory("Map"));
            const states = snapshot.getOrDefault("Vanilla.Map.ResourceContainers.State", Factory("Map"));
            const models = renderer.getOrDefault("ResourceContainers", Factory("Map"));
            const camera = renderer.get("Camera")!;
            for (const [id, container] of containers.entries()) {
                if (!models.has(id)) {
                    const model = container.isLocker ? new Locker(container) : new Box(container);
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                const visible = container.dimension === renderer.get("Dimension");
                model.setVisible(visible);

                if (visible) {
                    const state = states.get(id);
                    model.updateStateless(camera, state);
                    
                    if (state === undefined) continue;
                    model.update(time, state);
                }
            }
        } 
    }]);
});