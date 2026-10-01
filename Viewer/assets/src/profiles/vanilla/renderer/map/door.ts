import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { ui } from "@esm/@root/main/i18n.js";
import { Group } from "@esm/three";
import { Text } from "@esm/troika-three-text";
import { Factory } from "../../library/factory.js";
import { Door, DoorState, WeakDoor } from "../../parser/map/door.js";
import { ModelGroup, ObjectWrapper } from "../objectwrapper.js";
import { isCulled } from "../../library/models/lib.js";
import { EnvironmentLock, EnvironmentModel, environmentAssetForPrefab } from "./environment.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses { "Vanilla.Doors": void; }
        interface RenderData { "Doors": Map<number, DoorModel>; "DoorDimension": number; }
    }
}

export function doorAsset(door: Door): string | undefined {
    return door.modelName ? environmentAssetForPrefab(door.modelName) : undefined;
}

export class DoorModel extends ObjectWrapper<Group> {
    readonly root = new ModelGroup();
    readonly native: EnvironmentModel;
    private disposed = false;
    private locks: EnvironmentLock[] = [];
    private statusLabel = new Text();

    constructor(readonly door: Door) {
        super();
        const asset = doorAsset(door);
        this.root.position.copy(door.position);
        this.root.quaternion.copy(door.rotation);
        this.root.scale.copy(door.scale);
        this.statusLabel.font = "./fonts/oxanium/Oxanium-SemiBold.ttf";
        this.statusLabel.fontSize = 0.2;
        this.statusLabel.anchorX = "center";
        this.statusLabel.color = 0xffcc66;
        this.statusLabel.position.y = 2;
        this.root.add(this.statusLabel);
        const width = door.size === "Small" ? 4 : 8;
        const height = door.size === "Large" ? 8 : 4;
        this.native = new EnvironmentModel(asset ?? `unregistered-door:${door.modelName}`, undefined, [width, height, .2]);
        // A recorded lossyScale already contains the prefab scale.
        this.native.root.scale.set(1, 1, 1);
        this.root.add(this.native.root);
        if (door.type === "WeakDoor") {
            this.locks = [new EnvironmentLock("door"), new EnvironmentLock("door")];
            this.native.ready.then(() => {
                if (this.disposed || this.native.failed) return;
                const lockPanels = this.native.assetId.endsWith("8x4")
                    ? ["panel_align_A01_1", "panel_align_B01_1"]
                    : ["button_align_B01", "button_align_A01"];
                for (let i = 0; i < this.locks.length; i++) {
                    const align = this.native.node(lockPanels[i]);
                    if (!align) { this.native.useBasicShape(new Error(`Missing source lock attachment in ${asset}.`)); return; }
                    align.add(this.locks[i].root);
                }
            });
        }
        this.statusLabel.visible = false;
    }

    update(time: number, state: DoorState, weak?: WeakDoor) {
        if (this.disposed) return;
        const destroyed = state.status === "Destroyed";
        const open = state.status === "Open";
        const elapsed = state.change === undefined ? Infinity : Math.max(0, (time - state.change) / 1000);
        const type = this.door.type;
        const clips = type === "WeakDoor" ? ["WeakDoor_Idle", "WeakDoor_Open"]
            : this.native.assetId.startsWith("bulkhead-door-") ? ["door_closed_idle", ["lock_open", "door_open"]]
            : this.native.assetId.startsWith("bulkhead-main-door-") ? ["ClosedIdle", ["PullHandle",
                this.native.assetId === "bulkhead-main-door-4x4" ? "OpenClamps" : "ReleaseClamps", "OpenDoor1", "OpenDoor2"]]
            : this.native.assetId.startsWith("apex-door-") ? ["ApexDoorClosed_idle", "ApexDoorOpen2"]
            : ["ClosedIdle", "OpenDoorQuick"];
        this.native.sampleAnimation(clips[open ? 1 : 0], open ? elapsed : 0);
        this.native.setBasicVisible(!open && !destroyed);
        // The recorded destruction event removes the actual blade hierarchy.
        // Rigid-body fragments and damaged skinned deformation are not recorded.
        const blade = this.native.node(this.native.assetId.endsWith("8x4") ? "DoorBlade001" : "DoorBlade");
        if (blade) blade.visible = !destroyed;
        for (let i = 0; i < this.locks.length; i++) {
            this.locks[i].update(!destroyed && !open && weak ? (i === 0 ? weak.lock0 : weak.lock1) : "None");
        }
        this.statusLabel.text = ui("Glued");
        this.statusLabel.visible = state.status === "Glued";
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this.native.dispose();
        for (const lock of this.locks) { lock.melee.dispose(); lock.hack.dispose(); }
        this.statusLabel.dispose();
        this.root.removeFromParent();
    }
}

ModuleLoader.registerDispose(renderer => { for (const model of renderer.get("Doors")?.values() ?? []) model.dispose(); });
ModuleLoader.registerRender("Vanilla.Doors", (name, api) => {
    api.setInitPasses([{
        name, pass: (renderer, header) => {
            const doors = header.getOrDefault("Vanilla.Map.Doors", Factory("Map"));
            const models = renderer.getOrDefault("Doors", Factory("Map"));
            for (const [id, door] of doors) {
                const model = new DoorModel(door);
                models.set(id, model);
                model.addToScene(renderer.scene);
                model.setVisible(false);
            }
        }
    }, ...api.getInitPasses()]);
    api.setRenderLoop([...api.getRenderLoop(), {
        name, pass: (renderer, snapshot) => {
            const doors = snapshot.header.getOrDefault("Vanilla.Map.Doors", Factory("Map"));
            const weakdoors = snapshot.getOrDefault("Vanilla.Map.WeakDoor", Factory("Map"));
            const states = snapshot.getOrDefault("Vanilla.Map.DoorState", Factory("Map"));
            const models = renderer.getOrDefault("Doors", Factory("Map"));
            for (const [id, door] of doors) {
                const model = models.get(id)!;
                const radius = Math.max(model.native.cullingRadius, door.size === "Small" ? 8 : 16) * Math.max(Math.abs(door.scale.x), Math.abs(door.scale.y), Math.abs(door.scale.z));
                const visible = door.dimension === renderer.get("Dimension") && !isCulled(door.position, radius, renderer.get("Camera")!);
                model.setVisible(visible);
                if (visible) model.update(snapshot.time(), states.get(id) ?? { id, status: "Closed" }, weakdoors.get(id));
            }
        }
    }]);
});
