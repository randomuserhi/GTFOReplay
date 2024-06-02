import { Group, Mesh, MeshPhongMaterial, Scene } from "three";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import { ResourceContainer, ResourceContainerState } from "../../parser/map/resourcecontainer.js";
import { loadGLTF } from "../modeloader.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.ResourceContainers": void;
        }

        interface RenderData {
            "ResourceContainers": Map<number, ContainerModel>;
        }
    }
}

const material = new MeshPhongMaterial({
    color: 0xc57000
});

class ContainerModel {
    group: Group;

    constructor(container: ResourceContainer) {
        this.group = new Group();

        this.group.position.copy(container.position);
        this.group.quaternion.copy(container.rotation);
    }

    public addToScene(scene: Scene) {
        scene.add(this.group);
    }

    public setVisible(visible: boolean) {
        this.group.visible = visible;
    }

    public update(time: number, container: ResourceContainerState) {

    }
}

class Locker extends ContainerModel {
    back: Group;
    left: Group;
    right: Group;
    pivot: Group;

    constructor(container: ResourceContainer) {
        super(container);

        const anchor = new Group();

        this.back = new Group();
        this.left = new Group();
        this.right = new Group();
        this.pivot = new Group();
        this.left.add(this.right);
        this.pivot.add(this.left);
        anchor.add(this.back, this.pivot);

        anchor.scale.set(0.43, 0.43, 0.43);
        anchor.position.set(0.5, -0.225, 1);
        
        this.left.scale.set(-1, 1, 1);
        this.left.position.set(1.1, 0, -0.55 + 0.045);

        this.right.scale.set(-1, 1, 1);
        this.right.position.set(0, 0, 0);

        this.pivot.position.set(-1.1, 0, 0.55);

        loadGLTF("../js3party/models/StorageContainers/locker back.glb").then((model) => this.back.add(new Mesh(model, material)));
        loadGLTF("../js3party/models/StorageContainers/locker front.glb").then((model) => this.left.add(new Mesh(model, material)));
        loadGLTF("../js3party/models/StorageContainers/locker front.glb").then((model) => this.right.add(new Mesh(model, material)));
        
        this.group.add(anchor);
        
        anchor.rotateX(Math.PI / 2);
    }

    public update(time: number, container: ResourceContainerState): void {
        if (container.closed) {
            this.pivot.rotation.set(0, 0, 0);
            this.right.position.set(0, 0, 0);
            return;
        }

        const animDuration = 500;
        const lerp = Math.clamp01((time - container.lastCloseTime) / animDuration);
        this.pivot.rotation.set(0, -60 * Math.deg2rad * lerp, 0);
        this.right.position.set(0.7 * lerp, 0, 0);
    }
}

class Box extends ContainerModel {
    bottom: Group;
    top: Group;
    pivot: Group;
    
    constructor(container: ResourceContainer) {
        super(container);

        const anchor = new Group();

        this.bottom = new Group();
        this.top = new Group();
        this.pivot = new Group();
        this.pivot.add(this.top);
        anchor.add(this.bottom, this.pivot);
        
        this.top.position.set(0, 0.4, 1);
        this.pivot.position.set(0, 0.4, -1);
        

        anchor.scale.set(0.25, 0.25, 0.25);
        anchor.position.set(0, 0, 0.15);

        loadGLTF("../js3party/models/StorageContainers/box bottom.glb").then((model) => this.bottom.add(new Mesh(model, material)));
        loadGLTF("../js3party/models/StorageContainers/box top.glb").then((model) => this.top.add(new Mesh(model, material)));
        
        this.group.add(anchor);
        
        anchor.rotateX(Math.PI / 2);
    }

    public update(time: number, container: ResourceContainerState): void {
        if (container.closed) {
            this.pivot.rotation.set(0, 0, 0);
            return;
        }

        const animDuration = 500;
        this.pivot.rotation.set(-90 * Math.deg2rad * Math.clamp01((time - container.lastCloseTime) / animDuration), 0, 0);
    }
}

ModuleLoader.registerRender("Vanilla.ResourceContainers", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const time = snapshot.time();
            const containers = snapshot.header.getOrDefault("Vanilla.Map.ResourceContainers", () => new Map());
            const states = snapshot.getOrDefault("Vanilla.Map.ResourceContainers.State", () => new Map());
            const models = renderer.getOrDefault("ResourceContainers", () => new Map());
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