import { BoxGeometry, Group, Mesh, MeshPhongMaterial, Scene } from "three";
import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";

export interface ResourceContainer {
    id: number;
    dimension: number;
    position: Pod.Vector;
    rotation: Pod.Quaternion;
    isLocker: boolean;
}

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Map.ResourceContainers": Map<number, ResourceContainer>;
        }
    }
}

ModuleLoader.registerHeader("Vanilla.Map.ResourceContainers", "0.0.1", {
    parse: async (data, header) => {
        const containers = header.getOrDefault("Vanilla.Map.ResourceContainers", () => new Map());
        const count = await BitHelper.readUShort(data);
        for (let i = 0; i < count; ++i) {
            const id = await BitHelper.readInt(data);
            containers.set(id, {
                id,
                dimension: await BitHelper.readByte(data),
                position: await BitHelper.readVector(data),
                rotation: await BitHelper.readHalfQuaternion(data),
                isLocker: await BitHelper.readBool(data)
            });
        }
    }
});

// --------------------------- RENDERING ---------------------------

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

const box = new BoxGeometry(1, 1, 1);
const material = new MeshPhongMaterial({
    color: 0xc57000
});

class ContainerModel {
    group: Group;

    constructor(container: ResourceContainer) {
        this.group = new Group();

        const gun = new Group();

        if (container.isLocker) {
            const obj0 = new Mesh(box, material);
            gun.add(obj0);
            obj0.scale.set(0.8465645, 1.593796, 0.05114028);
            obj0.position.set(0, 0, -0.2077);

            const obj1 = new Mesh(box, material);
            gun.add(obj1);
            obj1.scale.set(0.05782036, 1.593796, 0.4666084);
            obj1.position.set(-0.3944, 0, 0);

            const obj2 = new Mesh(box, material);
            gun.add(obj2);
            obj2.scale.set(0.05782036, 1.593796, 0.4666084);
            obj2.position.set(0.3944, 0, 0);
        } else {
            const obj0 = new Mesh(box, material);
            gun.add(obj0);
            obj0.scale.set(0.5453805, 0.0970403, 0.31977);
            obj0.position.set(0, -0.0452, 0);

            const obj1 = new Mesh(box, material);
            gun.add(obj1);
            obj1.scale.set(0.5453805, 0.0970403, 0.31977);
            obj1.position.set(0, 0.0574, 0);
        }
        
        this.group.add(gun);
        
        if (container.isLocker) {
            gun.position.set(0, 0, 1.593796 / 2);
        } else {
            gun.position.set(0, 0, 0.0970403 / 2);
        }
        gun.rotateX(Math.PI / 2);

        this.group.position.copy(container.position);
        this.group.quaternion.copy(container.rotation);
    }

    public addToScene(scene: Scene) {
        scene.add(this.group);
    }

    public setVisible(visible: boolean) {
        this.group.visible = visible;
    }
}

ModuleLoader.registerRender("Vanilla.ResourceContainers", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const containers = snapshot.header.getOrDefault("Vanilla.Map.ResourceContainers", () => new Map());
            const models = renderer.getOrDefault("Terminals", () => new Map());
            for (const [id, container] of containers.entries()) {
                if (!models.has(id)) {
                    const model = new ContainerModel(container);
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.setVisible(container.dimension === renderer.get("Dimension"));
            }
        } 
    }]);
});