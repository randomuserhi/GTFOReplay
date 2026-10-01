import { AnimationMixer, Group } from "@esm/three";
import { loadGLTF } from "../../../library/modelloader.js";
import { disposeModelMaterials } from "../../../library/modelMaterials.js";
import { nativeItemCatalog, NativeItemDescriptor } from "../../../library/nativeItemCatalog.js";
import { ItemModel } from "../items.js";

import { BasicModel, hasModelGeometry } from "../basicModel.js";

export class NativeItemModel extends ItemModel {
    readonly descriptor?: NativeItemDescriptor;
    readonly visual = new Group();
    ready: Promise<void>;
    private mode: "pickup" | "held" = "held";
    private generation = 0;
    private disposed = false;
    private mixer?: AnimationMixer;
    private time = 0;
    private fallback?: BasicModel;

    constructor(private readonly itemId: number) {
        super();
        const descriptor = nativeItemCatalog.get(itemId);
        this.descriptor = descriptor;
        this.root.add(this.visual);
        this.rightHandGrip = descriptor?.rightHandGrip ?? undefined;
        if (descriptor?.leftHandGrip) {
            this.leftHandGrip = descriptor.leftHandGrip.pos;
            this.leftHandGripRotation = descriptor.leftHandGrip.rot;
        } else {
            this.leftHand?.removeFromParent();
            this.leftHand = undefined;
        }
        this.reset();
        // Map items call inLevel immediately after construction. Defer the
        // request one microtask so only the requested representation is loaded.
        const generation = this.generation;
        this.ready = Promise.resolve().then(() => this.load(generation));
    }

    private async load(generation: number) {
        if (this.disposed || generation !== this.generation) return;
        if (this.fallback) return;
        try {
            if (!this.descriptor) throw new Error(`No native model is registered for item ${this.itemId}.`);
            const file = this.mode === "pickup" ? this.descriptor.file : this.descriptor.heldFile;
            if (file === null) return; // Native static pickups have no equippable representation.
            if (!file) throw new Error(`Missing ${this.mode} resource path.`);
            const factory = await loadGLTF(`../items/${file}`);
            if (this.disposed || generation !== this.generation) return;
            const source = factory();
            this.visual.add(source);
            if (!hasModelGeometry(source)) throw new Error("The item model has no renderable geometry.");
            if (source.animations.length) {
                this.mixer = new AnimationMixer(source);
                for (const clip of source.animations) this.mixer.clipAction(clip).play();
                this.mixer.setTime(this.time / 1000);
            }
        } catch (error) {
            if (this.disposed || generation !== this.generation) return;
            this.mixer?.stopAllAction();
            this.mixer = undefined;
            disposeModelMaterials(this.visual);
            this.visual.clear();
            this.fallback = new BasicModel(`item ${this.itemId} (${this.mode})`, error, [.25, .25, .4]);
            this.visual.add(this.fallback);
        }
    }

    private use(mode: "pickup" | "held") {
        if (this.disposed || this.mode === mode || this.fallback) return;
        this.mode = mode;
        ++this.generation;
        this.mixer?.stopAllAction();
        this.mixer = undefined;
        disposeModelMaterials(this.visual);
        this.visual.clear();
        this.ready = this.load(this.generation);
    }

    public inLevel() { this.use("pickup"); }
    public inHand() { this.use("held"); }

    public render(_dt: number, time: number) {
        this.time = time;
        this.mixer?.setTime(time / 1000);
    }

    public dispose() {
        this.disposed = true;
        ++this.generation;
        this.mixer?.stopAllAction();
        this.mixer = undefined;
        this.fallback?.dispose();
        this.fallback = undefined;
        // Geometry and textures are cached; materials belong to this instance.
        disposeModelMaterials(this.visual);
        this.visual.clear();
    }
}
