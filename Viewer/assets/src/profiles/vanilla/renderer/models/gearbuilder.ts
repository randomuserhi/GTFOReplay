import { Group, Mesh, MeshPhongMaterial, Object3D, Quaternion, QuaternionLike } from "@esm/three";
import { GearDatablock } from "../../datablocks/gear/models.js";
import { GearPartFrontDatablock } from "../../datablocks/gear/parts/front.js";
import { GearPartDatablock } from "../../datablocks/gear/parts/lib.js";
import { GearPartMagDatablock } from "../../datablocks/gear/parts/mag.js";
import { GearPartReceiverDatablock } from "../../datablocks/gear/parts/receiver.js";
import { GearPartSightDatablock } from "../../datablocks/gear/parts/sight.js";
import { GearPartStockDatablock } from "../../datablocks/gear/parts/stock.js";
import { loadGLTF } from "../../library/modelloader.js";
import { Identifier } from "../../parser/identifier.js";
import { GearFoldAvatar } from "../animations/gearfold.js";
import { GearModel } from "./gear.js";
import { AlignType, ComponentType, componentTypes, GearComp, GearJSON } from "./gearjson.js";

const defaultMaterial = new MeshPhongMaterial({ color: 0xffffff });

const setMaterial = (obj: Object3D) => {
    const mesh = obj as Mesh;
    if (mesh.isMesh === true) {
        mesh.material = defaultMaterial;
    }
};

export class GearBuilder extends GearModel {
    readonly json: string;
    schematic: GearJSON;

    readonly parts = new Group();

    aligns: Partial<Record<
    "sight" | "mag", 
    { obj: Object3D, source: ComponentType }>> = {};
    
    mag?: Group;
    receiver?: Group;
    front?: Group;
    stock?: Group;
    sight?: Group;

    foldObjects: Object3D[] = [];
    baseFoldRot: QuaternionLike = {
        x: 0, y: 0, z: 0, w: 1
    };
    foldOffset: QuaternionLike = {
        x: 0, y: 0, z: 0, w: 1
    };

    constructor(gearJSON: string) {
        super();

        this.root.add(this.parts);

        this.json = gearJSON;
        this.schematic = JSON.parse(this.json).Packet;
        this.build();
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
        part: GearPartDatablock,
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
            }
            }
        }
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
        model.traverse(setMaterial);
        return model;
    }

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
                        this.stock = model;
                    }));
                }
            } break;
            case "FrontPart": {
                const part = GearPartFrontDatablock.get(component.v);
                if (part === undefined) console.warn(`Could not find front part '${component.v}'.`);
                else {
                    pending.push(this.loadPart(type, part, partAlignPriority).then((model) => {
                        this.front = model;
                    }));
                }
            } break;
            case "ReceiverPart": {
                const part = GearPartReceiverDatablock.get(component.v);
                if (part === undefined) console.warn(`Could not find receiver part '${component.v}'.`);
                else {
                    pending.push(this.loadPart(type, part, partAlignPriority).then((model) => {
                        this.receiver = model;
                    }));
                }
            } break;
            case "MagPart": {
                const part = GearPartMagDatablock.get(component.v);
                if (part === undefined) console.warn(`Could not find mag part '${component.v}'.`);
                else {
                    pending.push(this.loadPart(type, part, partAlignPriority).then((model) => {
                        this.mag = model;
                    }));
                }
            } break;
            case "SightPart": {
                const part = GearPartSightDatablock.get(component.v);
                if (part === undefined) console.warn(`Could not find sight part '${component.v}'.`);
                else {
                    pending.push(this.loadPart(type, part, partAlignPriority).then((model) => {
                        this.sight = model;
                    }));
                }
            } break;
            }
        }

        Promise.all(pending).then(() => {
            if (this.receiver !== undefined) this.parts.add(this.receiver);
            if (this.stock !== undefined) this.parts.add(this.stock);
            if (this.front !== undefined) this.parts.add(this.front);
            if (this.mag !== undefined && this.aligns.mag !== undefined) {
                this.attach(this.mag, this.aligns.mag.obj);
            }
            if (this.sight !== undefined && this.aligns.sight !== undefined) {
                this.attach(this.sight, this.aligns.sight.obj);
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
        this.parts.attach(obj);
        obj.rotateX(Math.deg2rad * -90);
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