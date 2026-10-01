import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import type { QuaternionLike, Vector3Like } from "@esm/three";

export interface NativeGrip { pos: Vector3Like; rot: QuaternionLike }
export interface NativeItemDescriptor {
    id: string;
    name: string;
    itemIds: number[];
    file: string; heldFile: string | null; triangles: number; revision: string;
    rightHandGrip: NativeGrip | null;
    leftHandGrip: NativeGrip | null;
}

// Grip metadata is available before model download. Failed assets use basic shapes.
export const nativeItems: NativeItemDescriptor[] = [];
export const nativeItemCatalog = new Map<number, NativeItemDescriptor>();
try {
    const response = await fetch("../items/manifest.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const catalog = await response.json() as NativeItemDescriptor[];
    if (!Array.isArray(catalog)) throw new Error("Expected an item catalog array.");
    for (const entry of catalog) {
        if (!entry.file?.startsWith("low/") || !Array.isArray(entry.itemIds) || entry.itemIds.some(id => nativeItemCatalog.has(id))) {
            ModuleLoader.reportWarning(`Invalid Low item resource '${entry.id}'; using a basic shape.`);
            continue;
        }
        nativeItems.push(entry);
        for (const id of entry.itemIds) nativeItemCatalog.set(id, entry);
    }
} catch (error) {
    ModuleLoader.reportWarning(`Item catalog unavailable; using basic shapes. ${error}`);
}
