import { Color, ColorRepresentation, Group, Material, Matrix4, Mesh, MeshStandardMaterial, Object3D, Skeleton, SkinnedMesh, Texture } from "@esm/three";
import { modelLoader as loader } from "@esm/@root/replay/model-loader.js";
import { clone } from "@esm/three/examples/jsm/utils/SkeletonUtils.js";
import { SoftTentacles, cloneModelMaterials } from "@esm/@root/replay/soft-tentacles.js";
import { ActorRig, actorJoint, type ActorJoint } from "@esm/@root/replay/actor-rig.js";
import { colorCharacterClothing } from "@esm/@root/replay/actor-colors.js";
import { SkinnedHeight } from "@esm/@root/replay/skinned-height.js";
import { actorCatalog, type ActorDescriptor, type ActorAsset } from "../../library/actorCatalog.js";

import { BasicModel, hasModelGeometry } from "./basicModel.js";
import { ModelGroup } from "../objectwrapper.js";

// ActorRig writes every native world matrix before rendering. Its scene must
// not walk those same hundreds of garment nodes again during scene submission.
class ActorScene extends ModelGroup {
    poseOwned = false;
    override updateMatrixWorld(force?: boolean) {
        if (!this.poseOwned) super.updateMatrixWorld(force);
    }
}

interface Entry { key: string; references: number; promise: Promise<Group>; source?: Group; failed?: boolean }
interface Lease { entry: Entry; released: boolean }
const entries = new Map<string, Entry>();

function releaseSource(root: Object3D) {
    const geometry = new Set<Mesh["geometry"]>(), materials = new Set<Material>(), textures = new Set<Texture>(), skeletons = new Set<Skeleton>();
    root.traverse(object => {
        const mesh = object as Mesh;
        if (!mesh.isMesh) return;
        geometry.add(mesh.geometry);
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
            materials.add(material);
            for (const value of Object.values(material)) if (value instanceof Texture) textures.add(value);
        }
        if ((mesh as SkinnedMesh).isSkinnedMesh) skeletons.add((mesh as SkinnedMesh).skeleton);
    });
    geometry.forEach(value => value.dispose()); materials.forEach(value => value.dispose());
    textures.forEach(value => { value.dispose(); value.source.data?.close?.(); });
    skeletons.forEach(value => value.dispose());
}

function retire(entry: Entry) {
    if (entry.references || !entry.source && !entry.failed) return;
    if (entries.get(entry.key) === entry) entries.delete(entry.key);
    if (entry.source) { releaseSource(entry.source); entry.source = undefined; }
}

function acquire(id: string, asset: ActorAsset): Lease {
    const key = `${id}:${asset.revision}`;
    let entry = entries.get(key);
    if (!entry) {
        entry = { key, references: 0, promise: loader.loadAsync(`../actors/${asset.file}?v=${asset.revision}`).then(gltf => {
            gltf.scene.animations = gltf.animations;
            return gltf.scene;
        }) };
        const owned = entry;
        entry.promise.then(source => { owned.source = source; retire(owned); }, () => { owned.failed = true; retire(owned); });
        entries.set(key, entry);
    }
    ++entry.references;
    return { entry, released: false };
}

function release(lease: Lease) {
    if (lease.released) return;
    lease.released = true;
    --lease.entry.references;
    // A request with no owners remains reusable until it finishes. Its late
    // completion then disposes its resources unless another actor acquired it.
    retire(lease.entry);
}

interface Appearance { head: boolean; tint?: ColorRepresentation; transparent: boolean; time: number; firstPerson: boolean }
interface Binding {
    scene: Group; lease: Lease; rig?: ActorRig; tentacles?: SoftTentacles;
    deltas: Map<ActorJoint, Matrix4>; skeletons: Set<Skeleton>;
    materials: { material: MeshStandardMaterial; color: Color; opacity: number; transparent: boolean }[];
    meshes: { mesh: Mesh; visible: boolean }[];
    feet: SkinnedHeight[];
}

/** Each instance owns its rig; Low geometry and textures are shared by identity. */
export class Actor {
    readonly descriptor: ActorDescriptor | Pick<ActorDescriptor, "id" | "radius">;
    get cullingRadius() { return this.descriptor.radius * 1.25; }
    private active?: Binding;
    get loaded() { return this.active !== undefined; }
    /** Native glove/finger clearance about the wrist, measured once at load. */
    private pending?: Lease;
    private disposed = false;
    private fallback?: BasicModel;
    private appearance: Appearance = { head: true, transparent: false, time: 0, firstPerson: false };
    private tintColor = new Color();
    private finishReady!: () => void;
    readonly ready = new Promise<void>(resolve => { this.finishReady = resolve; });

    constructor(identity: string | ActorDescriptor, private parent: Object3D, private driver?: { joints: Partial<Record<ActorJoint, Object3D>> & {hip: Object3D} }, private reference?: Map<ActorJoint, Matrix4>) {
        const id = typeof identity === 'string' ? identity : identity.id;
        const descriptor = typeof identity === 'string' ? actorCatalog.find(actor => actor.id === id) : identity;
        this.descriptor = descriptor ?? { id, radius: 1 };
        if (descriptor) this.load(descriptor);
        else this.useBasicShape(new Error(`No actor asset is registered for ${id}.`));
    }

    private load(descriptor: ActorDescriptor) {
        const lease = this.pending = acquire(descriptor.id, descriptor.model);
        lease.entry.promise.then(source => {
            if (this.disposed || this.pending !== lease) return;
            const next = this.createBinding(source, lease);
            // Apply the latest pose after loading, before the first visible frame.
            try {
                this.parent.add(next.scene);
                this.apply(next);
            } catch (error) { this.disposeBinding(next); throw error; }
            this.active = next; this.pending = undefined;
            this.finishReady();
        }).catch(error => {
            if (this.disposed || this.pending !== lease) return;
            this.pending = undefined; release(lease);
            this.useBasicShape(error);
        });
    }

    private useBasicShape(error: unknown) {
        if (this.disposed || this.fallback) return;
        const height = Math.max(1, this.descriptor.radius * 1.5);
        this.fallback = new BasicModel(`actor ${this.descriptor.id}`, error, [height * .4, height, height * .3]);
        this.parent.add(this.fallback);
        this.update(this.appearance.head, this.appearance.tint, this.appearance.transparent, this.appearance.time, this.appearance.firstPerson);
        this.finishReady();
    }

    private cancelPending() {
        if (this.pending) release(this.pending);
        this.pending = undefined;
    }

    private createBinding(source: Group, lease: Lease): Binding {
        if (!hasModelGeometry(source)) throw new Error("The actor model has no renderable geometry.");
        const cloned = clone(source) as Group;
        const scene = new ActorScene().copy(cloned, false);
        scene.add(...cloned.children);
        scene.updateMatrixWorld(true);
        const binding: Binding = { scene, lease, deltas: new Map(), skeletons: new Set(), materials: [], meshes: [], feet: [] };
        scene.traverse(object => {
            const mesh = object as Mesh;
            if (!mesh.isMesh) return;
            mesh.frustumCulled = false;

            binding.meshes.push({ mesh, visible: mesh.visible });
            if ((mesh as SkinnedMesh).isSkinnedMesh) binding.skeletons.add((mesh as SkinnedMesh).skeleton);
            if ((mesh as SkinnedMesh).isSkinnedMesh && this.driver) {
                const skin = mesh as SkinnedMesh;
                const supports = skin.skeleton.bones.map(bone => {
                    // Toe bones are not driven by the replay's simplified rig, but
                    // their heavily weighted shoe tips still belong to the foot.
                    for (let parent: Object3D | null = bone; parent; parent = parent.parent) {
                        const joint = actorJoint(parent.name);
                        if (joint === "leftFoot" || joint === "rightFoot" || joint === "leftLowerLeg" || joint === "rightLowerLeg") return true;
                    }
                    return false;
                });
                const indices = skin.geometry.getAttribute("skinIndex"), weights = skin.geometry.getAttribute("skinWeight");
                const vertices: number[] = [];
                for (let i = 0; i < indices.count; ++i) {
                    let weight = 0;
                    for (let j = 0; j < 4; ++j) {
                        if (supports[indices.getComponent(i, j)]) weight += weights.getComponent(i, j);
                    }
                    if (weight >= .5) vertices.push(i);
                }
                if (vertices.length) binding.feet.push(new SkinnedHeight(skin, vertices));
            }
        });
        try {
            if (this.driver && this.reference) {
                binding.rig = new ActorRig(scene);
                scene.poseOwned = true;
                // Skeletons are pose data, not render-list entries. Preserve
                // branches containing meshes, and prune bone-only branches from
                // Three's submission traversal without changing their transforms.
                const drawable = new Set<Object3D>();
                for (const {mesh} of binding.meshes)
                    for (let node: Object3D | null = mesh; node && node !== scene; node = node.parent) drawable.add(node);
                scene.traverse(node => { if (node !== scene && !drawable.has(node)) node.visible = false; });
                for (const { joint } of binding.rig.bones)
                    if (this.driver.joints[joint] && this.reference.has(joint)) binding.deltas.set(joint, new Matrix4());
            }
            const { materials } = cloneModelMaterials(scene);
            colorCharacterClothing(materials, this.descriptor.id);
            for (const owned of materials) {
                const material = owned as MeshStandardMaterial;
                binding.materials.push({ material, color: material.color.clone(), opacity: material.opacity, transparent: material.transparent });
            }
            binding.tentacles = new SoftTentacles(scene);
            return binding;
        } catch (error) { this.disposeBinding(binding); throw error; }
    }

    update(head = true, tint?: ColorRepresentation, transparent = false, time = 0, firstPerson = false) {
        this.appearance.head = head; this.appearance.tint = tint;
        this.appearance.transparent = transparent; this.appearance.time = time;
        this.appearance.firstPerson = firstPerson;
        if (this.disposed) return;
        if (this.fallback) {
            this.fallback.visible = !firstPerson;
            this.fallback.appearance(tint, transparent ? .35 : 1);
        }
        if (this.active) this.apply(this.active);
    }

    /** Actual posed shoe vertices, not an ankle-height guess or a whole-body bounds scan. */
    footHeight() {
        let height = Infinity;
        for (const support of this.active?.feet ?? []) height = Math.min(height, support.minimum());
        return height;
    }

    private apply(binding: Binding) {
        const { head, tint, transparent, time, firstPerson } = this.appearance;
        for (const part of binding.meshes) {
            part.mesh.visible = part.visible && !firstPerson;
        }
        binding.scene.visible = !firstPerson;
        // Eye view has a separate arm rig; the hidden full body needs no skin pose.
        if (firstPerson) return;
        binding.tentacles?.update(time / 1000);
        this.parent.updateWorldMatrix(true, false);
        // Only the driver is needed to derive deltas. Native garment skeletons
        // are updated by ActorRig below, so do not traverse them twice.
        this.driver?.joints.hip.updateWorldMatrix(true, true);
        for (const [joint, delta] of binding.deltas) {
            const source = this.driver!.joints[joint]!;
            // The hip traversal above already updated every driver joint.
            delta.multiplyMatrices(source.matrixWorld, this.reference!.get(joint)!);
        }
        binding.rig?.apply(joint => binding.deltas.get(joint), head);
        if (tint !== undefined) this.tintColor.set(tint);
        for (const { material, color, opacity, transparent: original } of binding.materials) {
            material.color.copy(tint === undefined ? color : this.tintColor);
            material.opacity = transparent ? opacity * .35 : opacity;
            const next = original || transparent;
            if (material.transparent !== next) { material.transparent = next; material.needsUpdate = true; }
        }
    }

    private disposeBinding(binding: Binding) {
        binding.scene.removeFromParent();
        binding.materials.forEach(({ material }) => material.dispose());
        binding.skeletons.forEach(skeleton => skeleton.dispose());
        release(binding.lease);
    }

    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this.cancelPending();
        if (this.active) this.disposeBinding(this.active);
        this.active = undefined;
        this.fallback?.dispose();
        this.fallback = undefined;
        this.finishReady();
    }
}
