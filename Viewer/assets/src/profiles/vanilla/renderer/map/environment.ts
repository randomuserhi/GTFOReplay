import * as Pod from "@esm/@root/replay/pod.js";
import { AnimationAction, AnimationMixer, Box3, Group, Material, Mesh, MeshStandardMaterial, Object3D, SkinnedMesh, Vector3 } from "@esm/three";
import { loadGLTF } from "../../library/modelloader.js";
import { ModelGroup, ObjectWrapper } from "../objectwrapper.js";
import { isCulled } from "../../library/models/lib.js";
import type { Camera } from "../renderer.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { disposeModelMaterials } from "../../library/modelMaterials.js";
import { BasicModel, hasModelGeometry } from "../models/basicModel.js";
import { LockType } from "../../parser/map/door.js";

type RecordedTransform = { position: Pod.Vector; rotation: Pod.Quaternion; scale?: Pod.Vector };

interface EnvironmentRecord {
    id: string;
    file: string; revision: string;
    defaultScale: [number, number, number];
    animations: string[];
    source: string;
}

const catalogue = new Map<string, EnvironmentRecord>();
try {
    const response = await fetch("../environment/manifest.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const manifest = await response.json() as { version: number; models: EnvironmentRecord[] };
    if (manifest.version !== 1 || !Array.isArray(manifest.models)) throw new Error("Unsupported environment model manifest.");
    for (const model of manifest.models) {
        if (!model || typeof model.id !== "string" || model.file !== `low/${model.id}.glb` ||
            typeof model.revision !== "string" || !model.revision || typeof model.source !== "string" || !model.source ||
            !Array.isArray(model.defaultScale) || model.defaultScale.length !== 3 || !model.defaultScale.every(Number.isFinite)) {
            ModuleLoader.reportWarning(`Invalid Low environment model record: ${model?.id}`);
            continue;
        }
        catalogue.set(model.id, model);
    }
} catch (error) { ModuleLoader.reportWarning(`Environment model catalogue is unavailable: ${String(error)}`); }
const instances = new Set<EnvironmentModel>();
ModuleLoader.registerDispose(() => { for (const instance of instances) instance.dispose(); });

export function environmentAssetForPrefab(name: string): string | undefined {
    // Setup adds instance IDs, terminal keys and serial numbers after the prefab.
    let prefab = name.split(/\(Clone\)|_GO_UID:|_TERMINAL_\d+|_terminalKey:|_code:|DOOR_/)[0];
    const variants: Record<string, string> = {
        gate_4x4_weak_door_tech: "gate_4x4_weak_door",
        gate_8x4_weak_door_tech: "gate_8x4_weak_door",
        gate_4x4_weak_door_service: "gate_4x4_weak_door",
        gate_8x4_weak_door_service: "gate_8x4_weak_door"
    };
    prefab = variants[prefab] ?? prefab;
    return [...catalogue.values()].find(model => model.source === prefab)?.id;
}

export class EnvironmentModel extends ObjectWrapper<Group> {
    readonly root = new ModelGroup();
    cullingRadius = Infinity;
    readonly ready: Promise<void>;
    model?: Group;
    private mixer?: AnimationMixer;
    private action?: AnimationAction;
    private opacity = 1;
    private disposed = false;
    private fallback?: BasicModel;
    private basicVisible = true;
    get failed() { return this.fallback !== undefined; }
    private materials: { material: Material; opacity: number; transparent: boolean; depthWrite: boolean }[] = [];

    constructor(readonly assetId: string, transform?: RecordedTransform, private readonly basicSize: readonly number[] = [1, 1, 1]) {
        super();
        const record = catalogue.get(assetId);
        instances.add(this);
        if (record) this.root.scale.fromArray(record.defaultScale);
        if (transform) {
            this.root.position.copy(transform.position);
            this.root.quaternion.copy(transform.rotation);
            if (transform.scale) this.root.scale.copy(transform.scale);
        }
        this.ready = Promise.resolve().then(async () => {
            if (this.disposed) return;
            if (!record) throw new Error(`No extracted environment model for '${assetId}'.`);
            const factory = await loadGLTF(`../environment/${record.file}?v=${record.revision}`);
            if (this.disposed || this.fallback) return;
            const model = factory();
            this.model = model;
            if (!hasModelGeometry(model)) throw new Error("The environment model has no renderable geometry.");
            // The model loader already gives each instance owned materials.
            const seen = new Set<Material>();
            model.traverse(object => {
                const mesh = object as Mesh;
                if (!mesh.isMesh) return;
                for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
                    if (seen.has(material)) continue;
                    seen.add(material);
                    this.materials.push({ material, opacity: material.opacity, transparent: material.transparent, depthWrite: material.depthWrite });
                }
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            });
            this.mixer = new AnimationMixer(model);
            const bounds = new Box3().setFromObject(model);
            this.cullingRadius = bounds.getSize(new Vector3()).length() / 2 + bounds.getCenter(new Vector3()).length();
            this.root.add(model);
            this.setOpacity(this.opacity);
        }).catch(error => this.useBasicShape(error));
    }

    useBasicShape(error: unknown) {
        if (this.disposed || this.fallback) return;
        this.releaseModel();
        this.fallback = new BasicModel(`environment ${this.assetId}`, error, this.basicSize);
        this.cullingRadius = Math.hypot(...this.basicSize);
        this.root.add(this.fallback);
        this.fallback.visible = this.basicVisible;
        this.setOpacity(this.opacity);
    }

    setBasicVisible(visible: boolean) { this.basicVisible = visible; if (this.fallback) this.fallback.visible = visible; }

    inView(camera: Camera) {
        const scale = this.root.scale;
        return !isCulled(this.root.position, this.cullingRadius * Math.max(Math.abs(scale.x), Math.abs(scale.y), Math.abs(scale.z)), camera);
    }

    private releaseModel() {
        this.mixer?.stopAllAction();
        if (this.model) {
            this.mixer?.uncacheRoot(this.model);
            disposeModelMaterials(this.model);
            const skeletons = new Set<SkinnedMesh["skeleton"]>();
            this.model.traverse(object => { if ((object as SkinnedMesh).isSkinnedMesh) skeletons.add((object as SkinnedMesh).skeleton); });
            for (const skeleton of skeletons) skeleton.dispose();
            this.model.removeFromParent();
        }
        this.model = undefined;
        this.mixer = undefined;
        this.action = undefined;
        this.materials = [];
    }

    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        instances.delete(this);
        this.releaseModel();
        this.fallback?.dispose();
        this.fallback = undefined;
        this.root.removeFromParent();
    }

    node(name: string): Object3D | undefined {
        return this.model?.getObjectByName(name);
    }

    sampleAnimation(name: string | readonly string[], seconds: number) {
        if (!this.model || !this.mixer) return;
        // Sample the sequence directly from replay time, including seeks past its end.
        const names = typeof name === "string" ? [name] : name;
        let clip;
        for (const part of names) {
            clip = this.model.animations.find(clip => clip.name === part);
            if (!clip) { this.useBasicShape(new Error(`Missing native animation '${part}'.`)); return; }
            if (seconds <= clip.duration || part === names[names.length - 1]) break;
            seconds -= clip.duration;
        }
        if (!clip) return;
        const action = this.mixer.clipAction(clip);
        const time = Math.max(0, Math.min(seconds, clip.duration));
        if (action === this.action && action.time === time) return;
        if (action !== this.action) {
            this.mixer.stopAllAction();
            action.reset().play();
            this.action = action;
        }
        action.paused = true;
        action.time = time;
        this.mixer.update(0);
    }

    resetPose() {
        this.mixer?.stopAllAction();
        this.action = undefined;
    }

    setOpacity(opacity: number) {
        this.opacity = opacity;
        this.fallback?.appearance(undefined, opacity);
        for (const state of this.materials) {
            state.material.opacity = state.opacity * opacity;
            state.material.transparent = state.transparent || opacity < 1;
            state.material.depthWrite = state.depthWrite && opacity === 1;
        }
    }

    setEmissionStrength(strength: number) {
        for (const { material } of this.materials) {
            const standard = material as MeshStandardMaterial;
            if (standard.isMeshStandardMaterial) standard.emissiveIntensity = strength;
        }
    }
}

/** Source assemblies have different clamps and local offsets for doors and storage. */
export class EnvironmentLock {
    readonly root = new ModelGroup();
    readonly melee: EnvironmentModel;
    readonly hack: EnvironmentModel;

    constructor(kind: "resource" | "door", transform?: RecordedTransform) {
        this.melee = new EnvironmentModel(`${kind}-lock`, transform);
        this.hack = new EnvironmentModel(`${kind}-hack-lock`, transform);
        this.root.add(this.melee.root, this.hack.root);
        this.update("None");
    }

    update(type: LockType) {
        this.melee.setVisible(type === "Melee");
        this.hack.setVisible(type === "Hackable");
        if (type === "Melee") this.melee.sampleAnimation("WeakLockIdle", 0);
    }
}
