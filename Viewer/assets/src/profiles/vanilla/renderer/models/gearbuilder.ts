import { Group, Mesh, MeshPhongMaterial, Object3D, Quaternion, QuaternionLike } from "@esm/three";
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
import { loadGLTF } from "../../library/modelloader.js";
import { Identifier } from "../../parser/identifier.js";
import { GearFoldAvatar } from "../animations/gearfold.js";
import { GearModel } from "./gear.js";
import { AlignType, ComponentType, componentTypes, GearComp, GearJSON } from "./gearjson.js";

export class GearBuilder extends GearModel {
    readonly json: string;
    schematic: GearJSON;

    readonly parts = new Group();

    aligns: Partial<Record<
    "sight" | "mag" | "flashlight" | "head" | "payload" | "screen" | "targeting" | "front" | "receiver", 
    { obj: Object3D, source: ComponentType }>> = {};

    foldObjects: Object3D[] = [];
    baseFoldRot: QuaternionLike = {
        x: 0, y: 0, z: 0, w: 1
    };
    foldOffset: QuaternionLike = {
        x: 0, y: 0, z: 0, w: 1
    };

    public material = new MeshPhongMaterial({ color: 0xffffff });

    private setMaterial = (obj: Object3D) => {
        const mesh = obj as Mesh;
        if (mesh.isMesh === true) {
            mesh.material = this.material;
        }
    };

    constructor(gearJSON: string, onBuild?: (gear: GearBuilder) => void) {
        super();

        this.root.add(this.parts);

        this.json = gearJSON;
        this.schematic = JSON.parse(this.json).Packet;
        this.build().then(() => {
            if (onBuild !== undefined) onBuild(this);
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
        }[]; },
        partAlignPriority?: {
            alignType: AlignType;
            partPrio: ComponentType[];
        }[]) {
        if (part.aligns === undefined) return;

        for (const align of part.aligns) {
            const object = this.findObjectByName(group, align.alignName);
            if (object === undefined) continue;

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
        if (path === undefined) throw new Error(`Could not find payload type of '${payloadType}'.`);

        const gltf = await loadGLTF(path);
        const model = gltf();
        this.setAlign(type, model, part, partAlignPriority);
        if (part.fold !== undefined) {
            const fold = this.findObjectByName(model, part.fold);
            if (fold !== undefined) this.foldObjects.push(fold);
        }
        model.traverse(this.setMaterial);
        return model;
    }

    private async loadPart(
        type: ComponentType, 
        part: GearPartDatablock, 
        partAlignPriority?: {
            alignType: AlignType;
            partPrio: ComponentType[];
        }[]) {
        const gltf = await loadGLTF(part.path);
        const model = gltf();
        this.setAlign(type, model, part, partAlignPriority);
        if (part.fold !== undefined) {
            const fold = this.findObjectByName(model, part.fold);
            if (fold !== undefined) this.foldObjects.push(fold);
        }
        model.traverse(this.setMaterial);
        return model;
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

    private build() {
        const key = Identifier.create("Gear", undefined, this.json);
        let datablock = GearDatablock.get(key);
        if (datablock === undefined) {
            // could be a reskin - attempt by matching category
            datablock = GearDatablock.matchCategory(key);
        }
        const partAlignPriority = datablock?.partAlignPriority;
        
        this.aligns = {};
        this.foldObjects = [];

        for (const child of this.parts.children) {
            child.removeFromParent();
        }

        const pending: Promise<void>[] = [];

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
                if (part === undefined) console.warn(`Could not find stock part '${component.v}'.`);
                else {
                    pending.push(this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.stock !== undefined) console.warn("Multiple stock parts found, the last to load will be used.");
                        this.stock = model;
                    }));
                }
            } break;
            case "FrontPart": {
                const part = GearPartFrontDatablock.get(component.v);
                if (part === undefined) console.warn(`Could not find front part '${component.v}'.`);
                else {
                    pending.push(this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.front !== undefined) console.warn("Multiple front parts found, the last to load will be used.");
                        this.front = model;
                    }));
                }
            } break;
            case "ReceiverPart": {
                const part = GearPartReceiverDatablock.get(component.v);
                if (part === undefined) console.warn(`Could not find receiver part '${component.v}'.`);
                else {
                    pending.push(this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.receiver !== undefined) console.warn("Multiple receiver parts found, the last to load will be used.");
                        this.receiver = model;
                    }));
                }
            } break;
            case "MagPart": {
                const part = GearPartMagDatablock.get(component.v);
                if (part === undefined) console.warn(`Could not find mag part '${component.v}'.`);
                else {
                    pending.push(this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.mag !== undefined) console.warn("Multiple mag parts found, the last to load will be used.");
                        this.mag = model;
                    }));
                }
            } break;
            case "SightPart": {
                const part = GearPartSightDatablock.get(component.v);
                if (part === undefined) console.warn(`Could not find sight part '${component.v}'.`);
                else {
                    pending.push(this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.sight !== undefined) console.warn("Multiple sight parts found, the last to load will be used.");
                        this.sight = model;
                    }));
                }
            } break;
            case "FlashlightPart": {
                const part = GearPartFlashlightDatablock.get(component.v);
                if (part === undefined) console.warn(`Could not find flashlight part '${component.v}'.`);
                else {
                    pending.push(this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.flashlight !== undefined) console.warn("Multiple flashlight parts found, the last to load will be used.");
                        this.flashlight = model;
                    }));
                }
            } break;
            case "MeleeHandlePart": {
                const part = GearPartHandleDatablock.get(component.v);
                if (part === undefined) console.warn(`Could not find melee handle part '${component.v}'.`);
                else {
                    pending.push(this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.handle !== undefined) console.warn("Multiple melee handle parts found, the last to load will be used.");
                        this.handle = model;
                    }));
                }
            } break;
            case "MeleeHeadPart": {
                const part = GearPartHeadDatablock.get(component.v);
                if (part === undefined) console.warn(`Could not find melee head part '${component.v}'.`);
                else {
                    pending.push(this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.head !== undefined) console.warn("Multiple melee head parts found, the last to load will be used.");
                        this.head = model;
                    }));
                }
            } break;
            case "MeleeNeckPart": {
                const part = GearPartNeckDatablock.get(component.v);
                if (part === undefined) console.warn(`Could not find melee neck part '${component.v}'.`);
                else {
                    pending.push(this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.neck !== undefined) console.warn("Multiple melee neck parts found, the last to load will be used.");
                        this.neck = model;
                    }));
                }
            } break;
            case "MeleePommelPart": {
                const part = GearPartPommelDatablock.get(component.v);
                if (part === undefined) console.warn(`Could not find melee pommel part '${component.v}'.`);
                else {
                    pending.push(this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.pommel !== undefined) console.warn("Multiple melee pommel parts found, the last to load will be used.");
                        this.pommel = model;
                    }));
                }
            } break;
            case "ToolDeliveryPart": {
                const part = GearPartDeliveryDatablock.get(component.v);
                if (part === undefined) console.warn(`Could not find tool delivery part '${component.v}'.`);
                else {
                    pending.push(this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.delivery !== undefined) console.warn("Multiple tool delivery parts found, the last to load will be used.");
                        this.delivery = model;
                    }));
                }
            } break;
            case "ToolGripPart": {
                const part = GearPartGripDatablock.get(component.v);
                if (part === undefined) console.warn(`Could not find tool grip part '${component.v}'.`);
                else {
                    pending.push(this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.grip !== undefined) console.warn("Multiple tool grip parts found, the last to load will be used.");
                        this.grip = model;
                    }));
                }
            } break;
            case "ToolMainPart": {
                const part = GearPartMainDatablock.get(component.v);
                if (part === undefined) console.warn(`Could not find tool main part '${component.v}'.`);
                else {
                    pending.push(this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.main !== undefined) console.warn("Multiple tool main parts found, the last to load will be used.");
                        this.main = model;
                    }));
                }
            } break;
            case "ToolPayloadPart": {
                const part = GearPartPayloadDatablock.get(component.v);
                if (part === undefined) console.warn(`Could not find tool payload part '${component.v}'.`);
                else {
                    pending.push(this.loadPayloadPart(type, this.payloadType, part, partAlignPriority).then((model) => {
                        if (this.payload !== undefined) console.warn("Multiple tool payload parts found, the last to load will be used.");
                        this.payload = model;
                    }));
                }
            } break;
            case "ToolScreenPart": {
                const part = GearPartScreenDatablock.get(component.v);
                if (part === undefined) console.warn(`Could not find tool screen part '${component.v}'.`);
                else {
                    pending.push(this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.screen !== undefined) console.warn("Multiple tool screen parts found, the last to load will be used.");
                        this.screen = model;
                    }));
                }
            } break;
            case "ToolTargetingPart": {
                const part = GearPartTargetingDatablock.get(component.v);
                if (part === undefined) console.warn(`Could not find tool targeting part '${component.v}'.`);
                else {
                    pending.push(this.loadPart(type, part, partAlignPriority).then((model) => {
                        if (this.targeting !== undefined) console.warn("Multiple tool targeting parts found, the last to load will be used.");
                        this.targeting = model;
                    }));
                }
            } break;
            }
        }

        return Promise.all(pending).then(() => {
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

    private static FUNC_animate = {
        temp: new Quaternion()
    } as const;
    public animate(gearfold: GearFoldAvatar): void {
        super.animate(gearfold);
        
        const { temp } = GearBuilder.FUNC_animate;
        for (const fold of this.foldObjects) {
            fold.quaternion.copy(gearfold.joints.fold).multiply(temp.copy(this.foldOffset));
        }
    }

    public reset(): void {
        super.reset();
        for (const fold of this.foldObjects) {
            fold.quaternion.copy(this.baseFoldRot);
        }
    }
}