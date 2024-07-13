import { signal } from "@esm/@/rhu/signal.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Color, Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { black, white } from "../../library/constants.js";
import { Factory } from "../../library/factory.js";
import { loadGLTF } from "../../library/modelloader.js";
import { ResourceContainer, ResourceContainerState } from "../../parser/map/resourcecontainer.js";
import { ObjectWrapper } from "../objectwrapper.js";

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
    color: 0xc57000
});
materialOrange.transparent = true;

const materialGrey = new MeshPhongMaterial({
    color: 0x777777
});
materialGrey.transparent = true;

export class ResourceContainerModel extends ObjectWrapper<Group> {
    static transparent = signal(false);

    anchor: Group;

    hacklock: Group;
    padlock: Group;

    lockColor: Color;
    lockMaterial: MeshPhongMaterial;

    constructor(container: ResourceContainer) {
        super();
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
        loadGLTF("../js3party/models/hacklock.glb", false).then((model) => this.hacklock.add(new Mesh(model, this.lockMaterial)));
        loadGLTF("../js3party/models/padlock.glb", false).then((model) => this.padlock.add(new Mesh(model, this.lockMaterial)));

        this.hacklock.add(this.padlock);
        this.anchor.add(this.hacklock);

        this.padlock.scale.set(0.2, 0.2, 0.2);
        this.padlock.position.set(0, -0.5, 0.1);

        this.hacklock.visible = false;
        this.padlock.visible = false;
    }

    public update(time: number, container: ResourceContainerState) {
        if (container.closed) {
            this.hacklock.visible = container.lockType === "Hackable" || container.lockType === "Melee";
            this.padlock.visible = container.lockType === "Melee";

            if (container.lockType === "Melee") {
                this.lockMaterial.specular = white;
            } else {
                this.lockMaterial.specular = black;
            }

            if (container.lockType === "Hackable") {
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

        loadGLTF("../js3party/models/StorageContainers/locker back.glb", false).then((model) => this.back.add(new Mesh(model, materialGrey)));
        loadGLTF("../js3party/models/StorageContainers/locker front.glb", false).then((model) => this.left.add(new Mesh(model, materialOrange)));
        loadGLTF("../js3party/models/StorageContainers/locker front.glb", false).then((model) => this.right.add(new Mesh(model, materialOrange)));
        
        this.hacklock.position.set(0, 0.575, 0.6);
        
        this.anchor.rotateX(Math.PI / 2);
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

        loadGLTF("../js3party/models/StorageContainers/box bottom.glb", false).then((model) => this.bottom.add(new Mesh(model, materialGrey)));
        loadGLTF("../js3party/models/StorageContainers/box top.glb", false).then((model) => this.top.add(new Mesh(model, materialOrange)));
        
        this.hacklock.position.set(0, 0.4, 1);
        this.hacklock.scale.set(1.72, 1.72, 1.72);

        this.anchor.rotateX(Math.PI / 2);
    }

    public update(time: number, container: ResourceContainerState): void {
        super.update(time, container);

        if (container.closed) {
            this.pivot.rotation.set(0, 0, 0);
            return;
        }

        this.hacklock.visible = false;
        this.padlock.visible = false;

        const animDuration = 400;
        this.pivot.rotation.set(-90 * Math.deg2rad * Math.clamp01((time - container.lastCloseTime) / animDuration), 0, 0);
    }
}

console.log("load");
console.dir(ResourceContainerModel.transparent);

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
                    if (state === undefined) continue;

                    model.update(time, state);
                }
            }
        } 
    }]);
});