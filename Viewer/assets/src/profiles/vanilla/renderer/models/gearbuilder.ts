import * as Pod from "@esm/@root/replay/pod.js";
import { Group, Matrix4, Object3D, Quaternion, Vector3, Vector3Like } from "@esm/three";
import { GearDatablock } from "../../datablocks/gear/models.js";
import { GearPartDeliveryDatablock } from "../../datablocks/gear/parts/delivery.js";
import { GearPartFlashlightDatablock } from "../../datablocks/gear/parts/flashlight.js";
import { GearPartFrontDatablock } from "../../datablocks/gear/parts/front.js";
import { GearPartGripDatablock } from "../../datablocks/gear/parts/grip.js";
import { GearPartHandleDatablock } from "../../datablocks/gear/parts/handle.js";
import { GearPartHeadDatablock } from "../../datablocks/gear/parts/head.js";
import { GearPartDatablock } from "../../datablocks/gear/parts/lib.js";
import { GearPartMagDatablock } from "../../datablocks/gear/parts/mag.js";
import { GearPartMainDatablock } from "../../datablocks/gear/parts/main.js";
import { GearPartNeckDatablock } from "../../datablocks/gear/parts/neck.js";
import { GearPartPayloadDatablock, payloadType, PayloadType } from "../../datablocks/gear/parts/payload.js";
import { GearPartPommelDatablock } from "../../datablocks/gear/parts/pommel.js";
import { GearPartReceiverDatablock } from "../../datablocks/gear/parts/receiver.js";
import { GearPartScreenDatablock } from "../../datablocks/gear/parts/screen.js";
import { GearPartSightDatablock } from "../../datablocks/gear/parts/sight.js";
import { GearPartStockDatablock } from "../../datablocks/gear/parts/stock.js";
import { GearPartTargetingDatablock } from "../../datablocks/gear/parts/targeting.js";
import { ItemDatablock } from "../../datablocks/items/item.js";
import { Joint } from "../../library/animations/lib.js";
import { loadGLTF } from "../../library/modelloader.js";
import { disposeModelMaterials } from "../../library/modelMaterials.js";
import { Identifier } from "../../parser/identifier.js";
import { GearFoldAnimation } from "../animations/gearfold.js";
import { GearModel } from "./gear.js";
import { AlignType, ComponentType, componentTypes, GearComp, GearJSON } from "./gearjson.js";

import { BasicModel, hasModelGeometry } from "./basicModel.js";
import { WeaponView, type WeaponViewData } from "@esm/@root/replay/native-weapon-view.js";

const viewResponse=await fetch(new URL("../player-animations/weapon-view.json",module.baseURI));
if (!viewResponse.ok) throw Error(`Could not load native weapon poses: ${viewResponse.status}`);
const viewData:WeaponViewData=await viewResponse.json();
if(viewData.version!==1) throw Error("Unsupported native weapon pose package");

export class GearBuilder extends GearModel {
    private disposed = false;
    private fallback?: BasicModel;
    private loadedParts = new Set<Group>();
    readonly ready: Promise<void>;
    readonly json: string;
    schematic!: GearJSON;

    readonly parts = new Group();
    override get nativeScale() { return 1 / this.parts.scale.x; }

    aligns: Partial<Record<
    "sight" | "mag" | "flashlight" | "head" | "payload" | "screen" | "targeting" | "front" | "receiver" | "lefthand" | "righthand", 
    { obj: Object3D, source: ComponentType }>> = {};

    foldObjects: { obj: Object3D, offset: Quaternion, anim?: GearFoldAnimation }[] = [];

    constructor(gearJSON: string, onBuild?: (gear: GearBuilder) => void) {
        super();

        this.root.add(this.parts);

        this.parts.scale.set(0.8, 0.8, 0.8);

        this.json = gearJSON;
        this.ready = (async () => {
            this.schematic = JSON.parse(this.json).Packet;
            await this.build();
            if (this.disposed) return;
            if (!hasModelGeometry(this.parts)) throw new Error("The gear has no renderable parts.");
            if (onBuild !== undefined) onBuild(this);
            if (this.reloadAnimation && this.rightHandGrip) {
                this.view=new WeaponView(viewData,Object.values(this.schematic.Comps).filter((v):v is GearComp=>typeof v==='object'));
                this.reset();this.view.measure(this.root,this.nativeScale);
            }
        })().catch(error => {
            if (this.disposed) return;
            this.clearParts();
            this.root.add(this.parts);
            this.parts.position.set(0, 0, 0);
            this.parts.quaternion.identity();
            this.parts.scale.setScalar(.8);
            this.fallback = new BasicModel(`gear ${this.json}`, error, [.15, .2, .65]);
            this.parts.add(this.fallback);
        });
    }

    // NOTE(randomuserhi): Supports blender renaming dupes with "name.001".
    public findObjectByName(object: Object3D, name: string): Object3D | undefined {
        const objName: string | undefined = object.userData.name;
        if (objName !== undefined) {
            if (objName === name) return object; // regular match
            
            // blender rename match
            if (objName.startsWith(name)) {
                const parts = objName.split(name);
                if (parts.length === 2 && /\.[0-9]+/.test(parts[1])) {
                    return object;
                }
            } 
        }
        for (const child of object.children) {
            const result = this.findObjectByName(child, name);
            if (result !== undefined) return result;
        }
        return undefined;
    }

    private higherPriority(
        source: ComponentType,
        component: ComponentType, 
        alignType: AlignType, 
        partAlignPriority?: {
            alignType: AlignType;
            partPrio: ComponentType[];
        }[]): boolean {
        if (partAlignPriority === undefined) return true;

        const aligns = partAlignPriority.filter((p) => p.alignType === alignType);
        const prio = [];
        for (const align of aligns) {
            prio.push(...align.partPrio);
        }

        const sourceIndex = prio.indexOf(source);
        if (sourceIndex === -1) return true;
        const newIndex = prio.indexOf(component);
        if (newIndex === -1) return false;

        return newIndex < sourceIndex;
    }

    private setAlign(
        component: ComponentType,
        group: Group,
        part: { aligns?: {
            alignType: AlignType;
            alignName: string;
        }[]; foldAnim?: GearFoldAnimation; },
        partAlignPriority?: {
            alignType: AlignType;
            partPrio: ComponentType[];
        }[]) {
        if (part.aligns === undefined) return;

        for (const align of part.aligns) {
            const object = this.findObjectByName(group, align.alignName);
            if (object === undefined) continue;

            if (part.foldAnim != undefined) {
                if (this.gunFoldAnim === undefined || this.higherPriority(this.gunFoldAnim.source, component, align.alignType, partAlignPriority)) {
                    this.gunFoldAnim = { anim: part.foldAnim, source: component };
                }
            }

            switch (align.alignType) {
            case "Sight": {
                if (this.aligns.sight === undefined || this.higherPriority(this.aligns.sight.source, component, align.alignType, partAlignPriority)) {
                    this.aligns.sight = { obj: object, source: component };
                }
            } break;
            case "Magazine": {
                if (this.aligns.mag === undefined || this.higherPriority(this.aligns.mag.source, component, align.alignType, partAlignPriority)) {
                    this.aligns.mag = { obj: object, source: component };
                }
            } break;
            case "Flashlight": {
                if (this.aligns.flashlight === undefined || this.higherPriority(this.aligns.flashlight.source, component, align.alignType, partAlignPriority)) {
                    this.aligns.flashlight = { obj: object, source: component };
                }
            } break;
            case "MeleeHead": {
                if (this.aligns.head === undefined || this.higherPriority(this.aligns.head.source, component, align.alignType, partAlignPriority)) {
                    this.aligns.head = { obj: object, source: component };
                }
            } break;
            case "ToolPayload": {
                if (this.aligns.payload === undefined || this.higherPriority(this.aligns.payload.source, component, align.alignType, partAlignPriority)) {
                    this.aligns.payload = { obj: object, source: component };
                }
            } break;
            case "ToolScreen": {
                if (this.aligns.screen === undefined || this.higherPriority(this.aligns.screen.source, component, align.alignType, partAlignPriority)) {
                    this.aligns.screen = { obj: object, source: component };
                }
            } break;
            case "ToolTargeting": {
                if (this.aligns.targeting === undefined || this.higherPriority(this.aligns.targeting.source, component, align.alignType, partAlignPriority)) {
                    this.aligns.targeting = { obj: object, source: component };
                }
            } break;
            case "Front": {
                if (this.aligns.front === undefined || this.higherPriority(this.aligns.front.source, component, align.alignType, partAlignPriority)) {
                    this.aligns.front = { obj: object, source: component };
                }
            } break;
            case "Receiver": {
                if (this.aligns.receiver === undefined || this.higherPriority(this.aligns.receiver.source, component, align.alignType, partAlignPriority)) {
                    this.aligns.receiver = { obj: object, source: component };
                }
            } break;
            case "LeftHand": {
                if (this.aligns.lefthand === undefined || this.higherPriority(this.aligns.lefthand.source, component, align.alignType, partAlignPriority)) {
                    // Gear exports preserve Blender's node basis. Native Unity
                    // wrist rotations differ by -90 degrees about local X.
                    object.rotateX(-Math.PI / 2);
                    this.aligns.lefthand = { obj: object, source: component };
                }
            } break;
            case "RightHand": {
                if (this.aligns.righthand === undefined || this.higherPriority(this.aligns.righthand.source, component, align.alignType, partAlignPriority)) {
                    object.rotateX(-Math.PI / 2);
                    this.aligns.righthand = { obj: object, source: component };
                }
            } break;
            }
        }
    }

    private async loadPayloadPart(
        type: ComponentType, 
        payloadType: PayloadType,
        part: GearPartPayloadDatablock, 
        partAlignPriority?: {
            alignType: AlignType;
            partPrio: ComponentType[];
        }[]) {
        const path = part.paths[payloadType];
        try {
            if (path === undefined) throw new Error(`Could not find payload type of '${payloadType}'.`);

            const gltf = typeof(path) === "string" ? await loadGLTF(path) : path;
            if (this.disposed) throw new Error("Gear instance was disposed while loading.");
            const model = gltf();
            this.loadedParts.add(model);
            if (part.offsetPos !== undefined) {
                model.position.copy(part.offsetPos);
            }
            if (part.offsetRot !== undefined) {
                if (part.unit === undefined || part.unit === "rad") {
                    model.rotation.set(part.offsetRot.x, part.offsetRot.y, part.offsetRot.z, "YXZ");
                } else if (part.unit === "deg") {
                    model.rotation.set(part.offsetRot.x * Math.deg2rad, part.offsetRot.y * Math.deg2rad, part.offsetRot.z * Math.deg2rad, "YXZ");
                } else {
                    throw new Error(`Invalid unit: ${part.unit}`);
                }
            }
            if (part.offsetScale !== undefined) {
                model.scale.copy(part.offsetScale);
            }
            const root = new Group();
            root.add(model);
            this.setAlign(type, root, part, partAlignPriority);
            if (part.fold !== undefined) {
                const fold = this.findObjectByName(model, part.fold);
                if (fold !== undefined) {
                    const f = {
                        obj: fold,
                        offset: new Quaternion(),
                        anim: part.foldAnim
                    };
                    if (part.foldOffsetRot !== undefined) f.offset.copy(part.foldOffsetRot);
                    this.foldObjects.push(f);
                }
            }
            return root;
        }  catch (err) {
            throw module.error(err, `Failed to load payload part '${payloadType}' - '${path}'`);
        }
    }

    private async loadPart(
        type: ComponentType, 
        part: GearPartDatablock, 
        partAlignPriority?: {
            alignType: AlignType;
            partPrio: ComponentType[];
        }[]) {
        try {
            const gltf = typeof(part.path) === "string" ? await loadGLTF(part.path) : part.path;
            if (this.disposed) throw new Error("Gear instance was disposed while loading.");
            const model = gltf();
            this.loadedParts.add(model);
            if (part.offsetPos !== undefined) {
                model.position.copy(part.offsetPos);
            }
            if (part.offsetRot !== undefined) {
                if (part.unit === undefined || part.unit === "rad") {
                    model.rotation.set(part.offsetRot.x, part.offsetRot.y, part.offsetRot.z, "YXZ");
                } else if (part.unit === "deg") {
                    model.rotation.set(part.offsetRot.x * Math.deg2rad, part.offsetRot.y * Math.deg2rad, part.offsetRot.z * Math.deg2rad, "YXZ");
                } else {
                    throw new Error(`Invalid unit: ${part.unit}`);
                }
            }
            if (part.offsetScale !== undefined) {
                model.scale.copy(part.offsetScale);
            }
            const root = new Group();
            root.add(model);
            this.setAlign(type, root, part, partAlignPriority);
            if (part.fold !== undefined) {
                const fold = this.findObjectByName(model, part.fold);
                if (fold !== undefined) {
                    const f = {
                        obj: fold,
                        offset: new Quaternion(),
                        anim: part.foldAnim
                    };
                    if (part.foldOffsetRot !== undefined) f.offset.copy(part.foldOffsetRot);
                    this.foldObjects.push(f);
                }
            }
            return root;
        }  catch (err) {
            throw module.error(err, `Failed to load part '${part.path}'`);
        }
    }
    
    mag?: Group;
    receiver?: Group;
    front?: Group;
    stock?: Group;
    sight?: Group;
    flashlight?: Group;

    handle?: Group;
    head?: Group;
    neck?: Group;
    pommel?: Group;

    delivery?: Group;
    grip?: Group;
    main?: Group;
    payload?: Group;
    payloadType: PayloadType = payloadType[0];
    screen?: Group;
    targeting?: Group;

    datablock?: GearDatablock;
    baseItem?: ItemDatablock;

    gunFoldAnim?: { anim?: GearFoldAnimation, source: ComponentType };

    partTransformations: Map<"mag" | "receiver" | "front" | "stock" | "sight" | "flashlight" | "handle" | "head" | "neck" | "pommel" | "delivery" | "grip" | "main" | "payload" | "screen" | "targeting", {
        position?: Vector3Like,
        scale?: Vector3Like,
        rotation?: Vector3Like,
        unit: "deg" | "rad"
    }> = new Map();

    private static FUNC_transformPart = {
        temp: new Object3D(),
        root: new Object3D()
    } as const;
    public transformPart(
        part: "mag" | "receiver" | "front" | "stock" | "sight" | "flashlight" | "handle" | "head" | "neck" | "pommel" | "delivery" | "grip" | "main" | "payload" | "screen" | "targeting",
        transformation: Partial<{
            position: Vector3Like,
            scale: Vector3Like,
            rotation: Vector3Like
        }>, unit: "deg" | "rad" = "rad") {

        const obj: Group | undefined = this[part] as Group | undefined;
        if (obj === undefined) return;
        
        this.partTransformations.set(part, { ...transformation, unit });

        const { temp, root } = GearBuilder.FUNC_transformPart;
            
        // Set root to origin (makes transforms relative to gun when we detach parts)
        const rootParent = this.parts.parent;
        root.position.copy(this.parts.position);
        root.quaternion.copy(this.parts.quaternion);
        root.scale.copy(this.parts.scale);
        this.parts.removeFromParent();
        this.parts.position.set(0, 0, 0);
        this.parts.scale.set(1, 1, 1);
        this.parts.quaternion.set(0, 0, 0, 1);

        // Detach part from parent to apply transforms in world space 
        // (ignore scale issues etc... due to blender models being scaled 0.01 and rotated 90 deg on X axis)
        const parent = obj.parent;
        obj.getWorldPosition(temp.position);
        obj.getWorldQuaternion(temp.quaternion);
        obj.getWorldScale(temp.scale);
        obj.removeFromParent();
        obj.position.copy(temp.position);
        obj.quaternion.copy(temp.quaternion);
        obj.scale.copy(temp.scale);
        
        if (transformation.position !== undefined) obj.position.add(transformation.position);
        if (transformation.scale !== undefined) obj.scale.multiply(transformation.scale);
        if (transformation.rotation !== undefined) {
            if (unit === "deg") {
                obj.rotateY(transformation.rotation.y * Math.deg2rad);
                obj.rotateX(transformation.rotation.x * Math.deg2rad);
                obj.rotateZ(transformation.rotation.z * Math.deg2rad);
            } else if (unit === "rad") {
                obj.rotateY(transformation.rotation.y);
                obj.rotateX(transformation.rotation.x);
                obj.rotateZ(transformation.rotation.z);
            } else {
                throw new Error(`Unknown units '${unit}'. Only 'deg' or 'rad' are supported.`);
            }
        }

        // Re-attach part to parent
        if (parent !== undefined && parent !== null) {
            parent.attach(obj);
        }

        // Re-attach root to parent
        if (rootParent !== undefined && rootParent !== null) {
            rootParent.add(this.parts);
            this.parts.position.copy(root.position);
            this.parts.quaternion.copy(root.quaternion);
            this.parts.scale.copy(root.scale);
        }
    }

    private static FUNC_build = {
        worldPos: new Vector3(),
        grip: new Matrix4(),
        gripRotation: new Quaternion(),
        gripScale: new Vector3(),
        root: new Object3D()
    } as const;
    private build() {
        const key = Identifier.create("Gear", undefined, this.json);
        this.datablock = GearDatablock.get(key);
        if (this.datablock === undefined) {
            // could be a reskin - attempt by matching category
            this.datablock = GearDatablock.matchCategory(key);
            if (this.datablock !== undefined) console.warn(`Gear '${key.stringKey}' does not exist, but we found a matching category. Gear will be built as if it was a reskin of the matched category.`);
        }
        const partAlignPriority = this.datablock?.partAlignPriority;
        
        if (this.datablock !== undefined && this.datablock.baseItem !== undefined) {
            this.baseItem = ItemDatablock.get(this.datablock.baseItem);
            if (this.baseItem === undefined) {
                console.warn(`Gear '${key.stringKey}' has the baseItem ${this.datablock.baseItem} but was unable to find it in ItemDatablock.`);
            }
        }

        this.aligns = {};
        this.foldObjects = [];

        for (const child of this.parts.children) {
            child.removeFromParent();
        }

        let pending: Promise<void> = Promise.resolve();

        this.mag = undefined;
        this.receiver = undefined;
        this.front = undefined;
        this.stock = undefined;
        this.sight = undefined;
        this.flashlight = undefined;

        this.handle = undefined;
        this.head = undefined;
        this.neck = undefined;
        this.pommel = undefined;

        this.delivery = undefined;
        this.grip = undefined;
        this.main = undefined;
        this.payload = undefined;
        this.payloadType = payloadType[0]; // Default type
        this.targeting = undefined;

        this.gunFoldAnim = undefined; // Default animation

        this.partTransformations.clear();

        // Extract types for some models
        for (const key in this.schematic.Comps) {
            if (key === "Length") continue;
            const component = this.schematic.Comps[key as keyof GearJSON["Comps"]] as GearComp;

            const type = componentTypes[component.c];
            switch (type) {
            case "ToolPayloadType": {
                this.payloadType = payloadType[component.v];
            } break;
            }
        }

        // Load models
        for (const key in this.schematic.Comps) {
            if (key === "Length") continue;
            const component = this.schematic.Comps[key as keyof GearJSON["Comps"]] as GearComp;
            
            const type = componentTypes[component.c];
            switch (type) {
            case "StockPart": {
                const part = GearPartStockDatablock.get(component.v);
                if (part === undefined) { if (component.v !== 0) pending = pending.then(() => { throw new Error(`Could not find stock part '${component.v}'.`); }); }
                else {
                    pending = pending.then(async () => await this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.stock !== undefined) console.warn("Multiple stock parts found, the last to load will be used.");
                        this.stock = model;
                    }));
                }
            } break;
            case "FrontPart": {
                const part = GearPartFrontDatablock.get(component.v);
                if (part === undefined) { if (component.v !== 0) pending = pending.then(() => { throw new Error(`Could not find front part '${component.v}'.`); }); }
                else {
                    pending = pending.then(async () => await this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.front !== undefined) console.warn("Multiple front parts found, the last to load will be used.");
                        this.front = model;
                    }));
                }
            } break;
            case "ReceiverPart": {
                const part = GearPartReceiverDatablock.get(component.v);
                if (part === undefined) { if (component.v !== 0) pending = pending.then(() => { throw new Error(`Could not find receiver part '${component.v}'.`); }); }
                else {
                    pending = pending.then(async () => await this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.receiver !== undefined) console.warn("Multiple receiver parts found, the last to load will be used.");
                        this.receiver = model;
                    }));
                }
            } break;
            case "MagPart": {
                const part = GearPartMagDatablock.get(component.v);
                if (part === undefined) { if (component.v !== 0) pending = pending.then(() => { throw new Error(`Could not find mag part '${component.v}'.`); }); }
                else {
                    pending = pending.then(async () => await this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.mag !== undefined) console.warn("Multiple mag parts found, the last to load will be used.");
                        this.mag = model;
                    }));
                }
            } break;
            case "SightPart": {
                const part = GearPartSightDatablock.get(component.v);
                if (part === undefined) { if (component.v !== 0) pending = pending.then(() => { throw new Error(`Could not find sight part '${component.v}'.`); }); }
                else {
                    pending = pending.then(async () => await this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.sight !== undefined) console.warn("Multiple sight parts found, the last to load will be used.");
                        this.sight = model;
                    }));
                }
            } break;
            case "FlashlightPart": {
                const part = GearPartFlashlightDatablock.get(component.v);
                if (part === undefined) { if (component.v !== 0) pending = pending.then(() => { throw new Error(`Could not find flashlight part '${component.v}'.`); }); }
                else {
                    pending = pending.then(async () => await this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.flashlight !== undefined) console.warn("Multiple flashlight parts found, the last to load will be used.");
                        this.flashlight = model;
                    }));
                }
            } break;
            case "MeleeHandlePart": {
                const part = GearPartHandleDatablock.get(component.v);
                if (part === undefined) { if (component.v !== 0) pending = pending.then(() => { throw new Error(`Could not find melee handle part '${component.v}'.`); }); }
                else {
                    pending = pending.then(async () => await this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.handle !== undefined) console.warn("Multiple melee handle parts found, the last to load will be used.");
                        this.handle = model;
                    }));
                }
            } break;
            case "MeleeHeadPart": {
                const part = GearPartHeadDatablock.get(component.v);
                if (part === undefined) { if (component.v !== 0) pending = pending.then(() => { throw new Error(`Could not find melee head part '${component.v}'.`); }); }
                else {
                    pending = pending.then(async () => await this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.head !== undefined) console.warn("Multiple melee head parts found, the last to load will be used.");
                        this.head = model;
                    }));
                }
            } break;
            case "MeleeNeckPart": {
                const part = GearPartNeckDatablock.get(component.v);
                if (part === undefined) { if (component.v !== 0) pending = pending.then(() => { throw new Error(`Could not find melee neck part '${component.v}'.`); }); }
                else {
                    pending = pending.then(async () => await this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.neck !== undefined) console.warn("Multiple melee neck parts found, the last to load will be used.");
                        this.neck = model;
                    }));
                }
            } break;
            case "MeleePommelPart": {
                const part = GearPartPommelDatablock.get(component.v);
                if (part === undefined) { if (component.v !== 0) pending = pending.then(() => { throw new Error(`Could not find melee pommel part '${component.v}'.`); }); }
                else {
                    pending = pending.then(async () => await this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.pommel !== undefined) console.warn("Multiple melee pommel parts found, the last to load will be used.");
                        this.pommel = model;
                    }));
                }
            } break;
            case "ToolDeliveryPart": {
                const part = GearPartDeliveryDatablock.get(component.v);
                if (part === undefined) { if (component.v !== 0) pending = pending.then(() => { throw new Error(`Could not find tool delivery part '${component.v}'.`); }); }
                else {
                    pending = pending.then(async () => await this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.delivery !== undefined) console.warn("Multiple tool delivery parts found, the last to load will be used.");
                        this.delivery = model;
                    }));
                }
            } break;
            case "ToolGripPart": {
                const part = GearPartGripDatablock.get(component.v);
                if (part === undefined) { if (component.v !== 0) pending = pending.then(() => { throw new Error(`Could not find tool grip part '${component.v}'.`); }); }
                else {
                    pending = pending.then(async () => await this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.grip !== undefined) console.warn("Multiple tool grip parts found, the last to load will be used.");
                        this.grip = model;
                    }));
                }
            } break;
            case "ToolMainPart": {
                const part = GearPartMainDatablock.get(component.v);
                if (part === undefined) { if (component.v !== 0) pending = pending.then(() => { throw new Error(`Could not find tool main part '${component.v}'.`); }); }
                else {
                    pending = pending.then(async () => await this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.main !== undefined) console.warn("Multiple tool main parts found, the last to load will be used.");
                        this.main = model;
                    }));
                }
            } break;
            case "ToolPayloadPart": {
                const part = GearPartPayloadDatablock.get(component.v);
                if (part === undefined) { if (component.v !== 0) pending = pending.then(() => { throw new Error(`Could not find tool payload part '${component.v}'.`); }); }
                else {
                    pending = pending.then(async () => await this.loadPayloadPart(type, this.payloadType, part, partAlignPriority).then((model) => {
                        if (this.payload !== undefined) console.warn("Multiple tool payload parts found, the last to load will be used.");
                        this.payload = model;
                    }));
                }
            } break;
            case "ToolScreenPart": {
                const part = GearPartScreenDatablock.get(component.v);
                if (part === undefined) { if (component.v !== 0) pending = pending.then(() => { throw new Error(`Could not find tool screen part '${component.v}'.`); }); }
                else {
                    pending = pending.then(async () => await this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.screen !== undefined) console.warn("Multiple tool screen parts found, the last to load will be used.");
                        this.screen = model;
                    }));
                }
            } break;
            case "ToolTargetingPart": {
                const part = GearPartTargetingDatablock.get(component.v);
                if (part === undefined) { if (component.v !== 0) pending = pending.then(() => { throw new Error(`Could not find tool targeting part '${component.v}'.`); }); }
                else {
                    pending = pending.then(async () => await this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.targeting !== undefined) console.warn("Multiple tool targeting parts found, the last to load will be used.");
                        this.targeting = model;
                    }));
                }
            } break;
            }
        }

        return pending.then(() => {
            if (this.disposed) return;
            const { worldPos, root } = GearBuilder.FUNC_build;

            // Set root to origin (makes transforms relative to gun when we detach parts)
            const rootParent = this.parts.parent;
            root.position.copy(this.parts.position);
            root.quaternion.copy(this.parts.quaternion);
            root.scale.copy(this.parts.scale);
            this.parts.removeFromParent();
            this.parts.position.set(0, 0, 0);
            this.parts.scale.set(1, 1, 1);
            this.parts.quaternion.set(0, 0, 0, 1);

            if (this.receiver !== undefined) {
                if (this.aligns.receiver !== undefined) this.attach(this.receiver, this.aligns.receiver.obj);
                else this.parts.add(this.receiver);
            }
            if (this.stock !== undefined) this.parts.add(this.stock);
            if (this.front !== undefined) {
                if (this.aligns.front !== undefined) this.attach(this.front, this.aligns.front.obj);
                else this.parts.add(this.front);
            }
            if (this.mag !== undefined) {
                if (this.aligns.mag !== undefined) this.attach(this.mag, this.aligns.mag.obj);
                else this.parts.add(this.mag);
            }
            if (this.sight !== undefined) {
                if (this.aligns.sight !== undefined) this.attach(this.sight, this.aligns.sight.obj);
                else this.parts.add(this.sight);
            }
            if (this.flashlight !== undefined) {
                if (this.aligns.flashlight !== undefined) this.attach(this.flashlight, this.aligns.flashlight.obj);
                else this.parts.add(this.flashlight);
            }

            if (this.handle !== undefined) this.parts.add(this.handle);
            if (this.head !== undefined) {
                if (this.aligns.head !== undefined) this.attach(this.head, this.aligns.head.obj);
                else this.parts.add(this.head);
            }
            if (this.neck !== undefined) this.parts.add(this.neck);
            if (this.pommel !== undefined) this.parts.add(this.pommel);

            if (this.delivery !== undefined) this.parts.add(this.delivery);
            if (this.grip !== undefined) this.parts.add(this.grip);
            if (this.main !== undefined) this.parts.add(this.main);
            if (this.payload !== undefined) {
                if (this.aligns.payload !== undefined) this.attach(this.payload, this.aligns.payload.obj);
                else this.parts.add(this.payload);
            }
            if (this.screen !== undefined) {
                if (this.aligns.screen !== undefined) this.attach(this.screen, this.aligns.screen.obj);
                else this.parts.add(this.screen);
            }
            if (this.targeting !== undefined) {
                if (this.aligns.targeting !== undefined) this.attach(this.targeting, this.aligns.targeting.obj);
                else this.parts.add(this.targeting);
            }

            if ((this.datablock?.type === "pistol" || this.datablock?.type === "rifle") && this.gunFoldAnim === undefined && this.datablock?.gunArchetype?.gunFoldAnim === undefined) {
                console.warn(`No reload animation was found for '${this.json}'`);
            }

            // Re-attach root to parent
            if (rootParent !== undefined && rootParent !== null) {
                rootParent.add(this.parts);
                this.parts.position.copy(root.position);
                this.parts.quaternion.copy(root.quaternion);
                this.parts.scale.copy(root.scale);
            }

            // Wrist targets are complete transforms in the item root, including
            // the assembled parts' scale. The Blender node scale is not hand size.
            this.root.updateWorldMatrix(true, true);
            const { grip, gripRotation, gripScale } = GearBuilder.FUNC_build;
            const readGrip = (object: Object3D) => {
                grip.copy(this.root.matrixWorld).invert().multiply(object.matrixWorld);
                grip.decompose(worldPos, gripRotation, gripScale);
                return { pos: worldPos.clone(), rot: gripRotation.clone() };
            };
            const baseItemModel = this.baseItem?.model?.();
            if (this.aligns.lefthand !== undefined) {
                const target = readGrip(this.aligns.lefthand.obj);
                this.leftHandGrip = target.pos;
                this.leftHandGripRotation = target.rot;
            } else if (baseItemModel !== undefined) {
                this.leftHandGrip = baseItemModel.leftHandGrip;
                this.leftHandGripRotation = baseItemModel.leftHandGripRotation;
                if (baseItemModel.leftHand === undefined) this.leftHand = undefined;
            } else {
                this.leftHand = undefined;
            }
            if (this.aligns.righthand !== undefined) {
                this.rightHandGrip = readGrip(this.aligns.righthand.obj);
            } else if (baseItemModel !== undefined) {
                this.rightHandGrip = baseItemModel.rightHandGrip;
                this.equipOffsetPos = baseItemModel.equipOffsetPos;
                this.equipOffsetRot = baseItemModel.equipOffsetRot;
            }
        }).catch((e) => {
            throw module.error(e);
        });
    }

    // NOTE(randomuserhi): Due to how I exported models from blender, objects have a parent rotation of 90degrees and are scaled to 0.01
    //                     thus attaching one model to another requires taking that into account
    private static FUNC_attach = {
        temp: new Object3D()
    } as const;
    private attach(obj: Object3D, target: Object3D) {
        const { temp } = GearBuilder.FUNC_attach;

        target.getWorldPosition(temp.position);
        target.getWorldQuaternion(temp.quaternion);
        obj.position.copy(temp.position);
        obj.quaternion.copy(temp.quaternion);
        obj.rotateX(Math.deg2rad * -90);
        target.attach(obj);
    }

    private static FUNC_animatePart = {
        parent: new Matrix4(), pose: new Matrix4(), local: new Matrix4(),
        position: new Vector3(), rotation: new Quaternion(), scale: new Vector3(),
        rootRotation: new Quaternion(),
    } as const;
    private animatePart(obj: Object3D, ref: Object3D, frame: Joint) {
        const {parent, pose, local, position, rotation, scale, rootRotation} = GearBuilder.FUNC_animatePart;
        // The clip is expressed in the parts container's unscaled coordinates.
        // Resolve that basis directly; animating a magazine must not detach the
        // entire weapon and repeatedly walk the player's world hierarchy.
        parent.identity();
        for (let node = ref.parent; node && node !== this.parts; node = node.parent) {
            node.updateMatrix();
            parent.premultiply(node.matrix);
        }
        ref.updateMatrix();
        pose.multiplyMatrices(parent, ref.matrix).decompose(position, rotation, scale);
        if (frame.pos !== undefined) position.copy(frame.pos);
        if (frame.rot !== undefined) rotation.copy(frame.rot);
        pose.compose(position, rotation, scale);
        local.copy(parent).invert().multiply(pose).decompose(ref.position, ref.quaternion, ref.scale);
        if (obj === this.leftHand) {
            this.parts.updateWorldMatrix(true, false);
            local.multiplyMatrices(this.parts.matrixWorld, pose).decompose(position, rotation, scale);
            position.applyMatrix4(local.copy(obj.parent!.matrixWorld).invert());
            obj.position.copy(position);
            obj.parent!.matrixWorld.decompose(position, rootRotation, scale);
            obj.quaternion.copy(rootRotation.invert()).multiply(rotation);
        } else {
            obj.position.setFromMatrixPosition(pose);
        }
    }

    private static FUNC_animate = {
        temp: new Quaternion(),
        tempObj: new Object3D(),
    } as const;
    get reloadAnimation() { return this.datablock?.gunArchetype?.gunFoldAnim ?? this.gunFoldAnim?.anim; }

    public animate(t: number): void {
        if (this.disposed || this.fallback) return;
        const { temp, tempObj } = GearBuilder.FUNC_animate;

        if (this.datablock !== undefined) {
            const gunAnim = this.reloadAnimation;
            if (gunAnim !== undefined) {

                const frame = gunAnim.sample(t * gunAnim.duration);
                const leftHand = frame.joints.leftHand;
                const mag = frame.joints.mag;

                // Apply runtime transformations
                if (this.partTransformations.has("mag")) {
                    const transformation = this.partTransformations.get("mag")!;
                    
                    if (leftHand.pos !== undefined && transformation.position !== undefined) {
                        Pod.Vec.add(leftHand.pos, leftHand.pos, transformation.position);
                    }
                    
                    if (mag.pos !== undefined && transformation.position !== undefined) {
                        Pod.Vec.add(mag.pos, mag.pos, transformation.position);
                    }

                    if (mag.rot !== undefined && transformation.rotation !== undefined) {
                        tempObj.quaternion.copy(mag.rot);
                        if (transformation.unit === "deg") {
                            tempObj.rotateY(transformation.rotation.y * Math.deg2rad);
                            tempObj.rotateX(transformation.rotation.x * Math.deg2rad);
                            tempObj.rotateZ(transformation.rotation.z * Math.deg2rad);
                        } else if (transformation.unit === "rad") {
                            tempObj.rotateY(transformation.rotation.y);
                            tempObj.rotateX(transformation.rotation.x);
                            tempObj.rotateZ(transformation.rotation.z);
                        } else {
                            throw new Error(`Unknown units '${transformation.unit}'. Only 'deg' or 'rad' are supported.`);
                        }

                        Pod.Quat.copy(mag.rot, tempObj.quaternion);
                    }
                }

                if (this.aligns.lefthand !== undefined && this.leftHand !== undefined) {
                    this.animatePart(this.leftHand, this.aligns.lefthand.obj, leftHand);
                }
                if (this.mag !== undefined && this.aligns.mag !== undefined) {
                    this.animatePart(this.mag, this.aligns.mag.obj, mag);
                }
            }
        }

        for (const fold of this.foldObjects) {
            if (fold.anim === undefined) continue;
            const frame = fold.anim.sample(t * fold.anim.duration);
            if (frame.joints.fold.rot !== undefined) {
                fold.obj.quaternion.copy(frame.joints.fold.rot).multiply(temp.copy(fold.offset));
            }
        }
    }

    public reset(): void {
        super.reset();
        this.animate(0);
    }

    private clearParts() {
        for (const model of this.loadedParts) { disposeModelMaterials(model); model.removeFromParent(); }
        this.loadedParts.clear();
        this.parts.clear();
        this.aligns = {};
        this.foldObjects.length = 0;
        this.gunFoldAnim = undefined;
    }

    public dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        this.fallback?.dispose();
        this.fallback = undefined;
        this.clearParts();
    }
}
