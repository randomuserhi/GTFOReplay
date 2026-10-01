import { signal } from "@esm/@/rhu/signal.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Group, Vector3 } from "@esm/three";
import { Text } from "@esm/troika-three-text";
import { ItemDatablock } from "../../datablocks/items/item.js";
import { Factory } from "../../library/factory.js";
import { Identifier } from "../../parser/identifier.js";
import { ResourceContainer, ResourceContainerState } from "../../parser/map/resourcecontainer.js";
import { Camera } from "../renderer.js";
import { EnvironmentLock, EnvironmentModel, environmentAssetForPrefab } from "./environment.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses { "Vanilla.ResourceContainers": void; }
        interface RenderData { "ResourceContainers": Map<number, ResourceContainerModel>; }
    }
}

export class ResourceContainerModel extends EnvironmentModel {
    static transparent = signal(false);
    static debug = signal(false);
    private content = new Group();
    private lock: EnvironmentLock;
    private tmp: Text;
    private disposedContainer = false;

    constructor(readonly container: ResourceContainer) {
        const expected = container.isLocker ? "resource-locker" : "resource-box";
        const asset = environmentAssetForPrefab(container.modelName);
        super(asset === expected ? asset : `unregistered-container:${container.modelName}`, container, container.isLocker ? [1, 2, .6] : [1, .7, .7]);
        this.root.add(this.content);
        this.lock = new EnvironmentLock("resource", container.lockTransform);
        this.ready.then(() => {
            if (!this.model) return;
            this.content.add(this.model);
            if (container.lockTransform) {
                // Captured lock transforms are world-space. Keep the lock independent
                // of lid/door animation, as in the native resource-container core.
                this.content.updateWorldMatrix(true, false);
                this.content.attach(this.lock.root);
            } else if (container.assignedLock !== "None") {
                const align = this.node("WeakLock_align");
                if (!align) { this.useBasicShape(new Error(`Missing source lock attachment in ${this.assetId}.`)); return; }
                align.add(this.lock.root);
            }
        });
        this.tmp = new Text();
        this.tmp.font = "./fonts/oxanium/Oxanium-SemiBold.ttf";
        this.tmp.fontSize = 0.2;
        this.tmp.position.y = 2;
        this.tmp.textAlign = "center";
        this.tmp.anchorX = "center";
        this.tmp.anchorY = "bottom";
        this.tmp.color = 0xffffff;
        this.tmp.visible = false;
        this.root.add(this.tmp);
        this.updateStateless();
    }

    override dispose() {
        if (this.disposedContainer) return;
        this.disposedContainer = true;
        this.lock.melee.dispose(); this.lock.hack.dispose();
        this.tmp.dispose();
        super.dispose();
    }

    private static FUNC_updateStateless = {
        camPos: new Vector3(),
        tmpPos: new Vector3()
    } as const;
    public updateStateless(camera?: Camera, state?: ResourceContainerState) {
        this.content.visible = this.container.registered || ResourceContainerModel.debug();
        this.setBasicVisible(this.content.visible);

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

            this.tmp.text = `lock: ${this.container.assignedLock}
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

    public update(time: number, state?: ResourceContainerState) {
        this.setOpacity(!this.container.registered ? 0.1 : ResourceContainerModel.transparent() ? 0.5 : 1);
        const closed = state?.closed ?? true;
        const openTime = closed ? 0 : (time - state!.lastCloseTime) / 1000;
        this.sampleAnimation(this.container.isLocker ? "SupplyLocker_open" : "SupplyBoxOpen", openTime);
        this.lock.update(closed ? state?.lockType ?? "None" : "None");
    }
}

ModuleLoader.registerRender("Vanilla.ResourceContainers", (name, api) => {
    api.setRenderLoop([...api.getRenderLoop(), {
        name, pass: (renderer, snapshot) => {
            const time = snapshot.time();
            const containers = snapshot.header.getOrDefault("Vanilla.Map.ResourceContainers", Factory("Map"));
            const states = snapshot.getOrDefault("Vanilla.Map.ResourceContainers.State", Factory("Map"));
            const models = renderer.getOrDefault("ResourceContainers", Factory("Map"));
            const camera = renderer.get("Camera")!;
            for (const [id, container] of containers) {
                if (!models.has(id)) {
                    const model = new ResourceContainerModel(container);
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }
                const model = models.get(id)!;
                const visible = container.dimension === renderer.get("Dimension") && model.inView(camera);
                model.setVisible(visible);
                if (visible) {
                    const state = states.get(id);
                    model.updateStateless(camera, state);
                    model.update(time, state);
                }
            }
        }
    }]);
});
