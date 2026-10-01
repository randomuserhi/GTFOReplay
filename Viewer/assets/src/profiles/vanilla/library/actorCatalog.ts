import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
export interface ActorAsset { file: string; revision: string; triangles: number; radius: number }
export interface ActorDescriptor {
    id: string; name: string; group: string; enemyIds?: number[]; radius: number;
    sourceRevision: string; model: ActorAsset;
}

// Identity metadata stays lightweight; missing render resources use basic shapes.
export const actorCatalog: ActorDescriptor[] = [];
try {
    const response = await fetch("../actors/manifest.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const catalog = await response.json() as ActorDescriptor[];
    if (!Array.isArray(catalog)) throw new Error("Expected an actor catalog array.");
    const ids = new Set<string>();
    for (const actor of catalog) {
        const model = actor.model;
        if (ids.has(actor.id) || !model || model.file !== `low/${actor.id}.glb` || !model.revision || !(model.triangles > 0)) {
            ModuleLoader.reportWarning(`Invalid Low actor resource '${actor.id}'; using a basic shape.`);
            continue;
        }
        ids.add(actor.id); actorCatalog.push(actor);
    }
} catch (error) {
    ModuleLoader.reportWarning(`Actor catalog unavailable; using basic shapes. ${error}`);
}
export const enemyNames = new Map(actorCatalog.flatMap(actor => (actor.enemyIds ?? []).map(id => [id, actor.name] as const)));
