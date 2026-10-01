import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { BufferGeometry, DoubleSide, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, Raycaster, Sphere, type Intersection } from "@esm/three";
import { loadGLTF } from "../../library/modelloader.js";
import { disposeModelMaterials } from "../../library/modelMaterials.js";
import { NativeSurface } from "../../parser/map/native-surfaces.js";
import "./map.js";
import { buildNavigationFallback } from "./navigation-fallback.js";
import { isCulled } from "../../library/models/lib.js";
import type { Camera } from "../renderer.js";

interface Asset { id: string; kind: "floor" | "prop"; file: string; revision: string; sourceRevision: string; }
interface Cell { dimension: number; negative: boolean; matrices: Matrix4[]; }
const reflection = new Matrix4().makeScale(-1, 1, 1);

/** The exported GLB and Viewer world both reflect X: S * UnityMatrix * S. */
export function nativeSurfaceMatrix(values: number[]) {
    return new Matrix4().fromArray(values).premultiply(reflection).multiply(reflection);
}

function mirroredGeometry(source: BufferGeometry) {
    const geometry = source.clone().scale(-1, 1, 1);
    const count = geometry.index?.count ?? geometry.getAttribute("position").count;
    const indices = geometry.index ? Array.from(geometry.index.array) : Array.from({length: count}, (_, i) => i);
    for (let i = 0; i < indices.length; i += 3) [indices[i + 1], indices[i + 2]] = [indices[i + 2], indices[i + 1]];
    geometry.setIndex(indices);
    const tangent = geometry.getAttribute("tangent");
    if (tangent) for (let i = 0; i < tangent.count; ++i) tangent.setW(i, -tangent.getW(i));
    return geometry;
}

// Cull 32m cells, but submit all visible cells of the same primitive in one
// instance draw. Immutable source matrices also serve navigation classification.
export class NativeSurfaceModels {
    readonly root = new Group();
    readonly ready: Promise<void>;
    private readonly templates: Group[] = [];
    private readonly mirrored = new Set<BufferGeometry>();
    private readonly batches: {mesh: InstancedMesh; dimension: number; matrices: Float32Array;
        cells: {bounds: Sphere; start: number; count: number; visible: boolean}[]}[] = [];
    private dimension = 0;
    private disposed = false;
    navigationReady = false;
    navigationTriangles = {before:0,after:0};
    private readonly cameraMesh = new Mesh(undefined, new MeshBasicMaterial({side:DoubleSide}));
    private readonly cameraSphere = new Sphere();
    private readonly cameraHits: Intersection[] = [];

    // Camera collision must see the immutable instances, including cells hidden
    // by the previous camera. Render-buffer compaction is not collision data.
    cameraDistance(ray: Raycaster, dimension: number) {
        let distance = ray.far;
        for (const batch of this.batches) {
            if (batch.dimension !== dimension) continue;
            this.cameraMesh.geometry = batch.mesh.geometry;
            for (const cell of batch.cells) {
                if (ray.ray.origin.distanceTo(cell.bounds.center) > distance + cell.bounds.radius || !ray.ray.intersectsSphere(cell.bounds)) continue;
                for (let i=cell.start; i<cell.start+cell.count; i++) {
                    this.cameraMesh.matrixWorld.fromArray(batch.matrices,i*16);
                    this.cameraSphere.copy(batch.mesh.geometry.boundingSphere!).applyMatrix4(this.cameraMesh.matrixWorld);
                    if (ray.ray.origin.distanceTo(this.cameraSphere.center) > distance + this.cameraSphere.radius || !ray.ray.intersectsSphere(this.cameraSphere)) continue;
                    this.cameraHits.length=0;
                    this.cameraMesh.raycast(ray,this.cameraHits);
                    for (const hit of this.cameraHits) distance=Math.min(distance,hit.distance);
                }
            }
        }
        return distance;
    }

    constructor(surfaces: NativeSurface[], fallback: Map<number,Mesh[]> = new Map()) {
        this.root.visible = false;
        this.ready = this.load(surfaces).catch(error => {
            if (!this.disposed) { ModuleLoader.reportWarning(`Native surfaces unavailable: ${error}`); this.dispose(); }
        }).then(async () => {
            if (!this.disposed) this.navigationTriangles = await buildNavigationFallback(
                this.batches.filter(batch=>batch.mesh.userData.kind === "floor").map(batch=>({geometry:batch.mesh.geometry, dimension:batch.dimension, matrices:batch.matrices})), fallback, ()=>this.disposed);
            this.navigationReady = true;
        });
    }

    private async load(surfaces: NativeSurface[]) {
        if (!surfaces.length) return;
        const response = await fetch("../environment/architecture/manifest.json");
        if (!response.ok) throw new Error(`Native floor manifest: HTTP ${response.status}`);
        const manifest = await response.json() as {version: number; coordinateSystem: string; models: Asset[]; excluded: string[]};
        if (manifest.version !== 1 || manifest.coordinateSystem !== "mesh-local-reflected-x" || !Array.isArray(manifest.models)) throw new Error("Unsupported native floor catalog.");
        const assets = new Map(manifest.models.map(asset => [asset.id, asset]));
        const excluded = new Set(manifest.excluded);
        const used = new Map<string, NativeSurface[]>();
        const missing = new Set<string>();
        for (const surface of surfaces) {
            if (excluded.has(surface.asset)) continue;
            const asset = assets.get(surface.asset);
            if (!asset || asset.sourceRevision !== surface.revision || !/^low\/architecture-[a-f0-9]{16}\.glb$/.test(asset.file) || !/^[a-f0-9]{64}$/.test(asset.revision)) {
                if (!missing.has(surface.asset)) ModuleLoader.reportWarning(`Missing or changed native floor ${surface.asset}; retaining navigation floor.`);
                missing.add(surface.asset);
                continue;
            }
            if (!surface.enabled) continue;
            if (!used.has(asset.id)) used.set(asset.id, []);
            used.get(asset.id)!.push(surface);
        }
        await Promise.all([...used].map(async ([id, instances]) => {
            const asset = assets.get(id)!;
            const factory = await loadGLTF(`../environment/architecture/${asset.file}?v=${asset.revision}`);
            if (this.disposed) return;
            const template = factory();
            this.templates.push(template);
            const cells = new Map<string, Cell>();
            for (const instance of instances) {
                const matrix = nativeSurfaceMatrix(instance.matrix);
                const determinant = matrix.determinant();
                if (determinant === 0) throw new Error(`Degenerate native floor matrix for ${id}.`);
                const negative = determinant < 0;
                const e = matrix.elements;
                const key = `${instance.dimension}/${Math.floor(e[12] / 32)}/${Math.floor(e[13] / 32)}/${Math.floor(e[14] / 32)}/${negative}`;
                if (!cells.has(key)) cells.set(key, {dimension: instance.dimension, negative, matrices: []});
                // Three does not support negative instance matrices. Reflect the shared
                // geometry once and keep the equivalent instance matrix positive.
                if (negative) matrix.multiply(reflection);
                cells.get(key)!.matrices.push(matrix);
            }
            const groups = new Map<string, Cell[]>();
            for (const cell of cells.values()) {
                const key = `${cell.dimension}/${cell.negative}`;
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key)!.push(cell);
            }
            let primitives = 0;
            template.traverse(object => {
                const primitive = object as Mesh;
                if (!primitive.isMesh) return;
                ++primitives;
                let mirrored: BufferGeometry | undefined;
                for (const group of groups.values()) {
                    const first = group[0];
                    if (first.negative && !mirrored) { mirrored = mirroredGeometry(primitive.geometry); this.mirrored.add(mirrored); }
                    const geometry = first.negative ? mirrored! : primitive.geometry;
                    geometry.computeBoundingSphere();
                    const count = group.reduce((n, cell) => n + cell.matrices.length, 0);
                    const mesh = new InstancedMesh(geometry, primitive.material, count);
                    const ranges = []; let index = 0;
                    const instanceBounds = new Sphere();
                    for (const cell of group) {
                        const bounds = new Sphere().makeEmpty(), start = index;
                        for (const matrix of cell.matrices) {
                            mesh.setMatrixAt(index++, matrix);
                            bounds.union(instanceBounds.copy(geometry.boundingSphere!).applyMatrix4(matrix));
                        }
                        ranges.push({bounds, start, count: index - start, visible: true});
                    }
                    mesh.name = `Native ${asset.kind} ${id}`;
                    mesh.userData.dimension = first.dimension;
                    mesh.userData.kind = asset.kind;
                    mesh.castShadow = mesh.receiveShadow = true;
                    mesh.matrixAutoUpdate = mesh.matrixWorldAutoUpdate = false;
                    // Cell tests own visibility; whole-batch bounds would include
                    // distant cells which are absent from the submitted buffer.
                    mesh.frustumCulled = false;
                    mesh.instanceMatrix.needsUpdate = true;
                    mesh.computeBoundingBox(); mesh.computeBoundingSphere();
                    mesh.visible = first.dimension === this.dimension;
                    this.batches.push({mesh, dimension: first.dimension,
                        matrices: (mesh.instanceMatrix.array as Float32Array).slice(), cells: ranges});
                    this.root.add(mesh);
                }
            });
            if (!primitives) throw new Error(`Native floor ${id} has no drawable geometry.`);
        }).map(promise => promise.catch(error => { if (!this.disposed) ModuleLoader.reportWarning(`Native floor resource failed; retaining navigation floor: ${error}`); })));
        if (this.disposed) return;
        this.root.visible = true;
    }

    update(dimension: number, camera: Camera) {
        if (this.disposed) return;
        this.dimension = dimension;
        for (const batch of this.batches) {
            let changed = false, count = 0;
            for (const cell of batch.cells) {
                const visible = batch.dimension === dimension && !isCulled(cell.bounds.center, cell.bounds.radius, camera);
                changed ||= visible !== cell.visible;
                cell.visible = visible;
                if (visible) count += cell.count;
            }
            batch.mesh.visible = count > 0;
            if (!changed) continue;
            let offset = 0;
            for (const cell of batch.cells) if (cell.visible) {
                batch.mesh.instanceMatrix.array.set(batch.matrices.subarray(cell.start * 16, (cell.start + cell.count) * 16), offset * 16);
                offset += cell.count;
            }
            batch.mesh.count = count;
            batch.mesh.instanceMatrix.needsUpdate = true;
        }
    }

    dispose() {
        this.disposed = true;
        this.cameraMesh.material.dispose();
        for (const batch of this.batches) batch.mesh.dispose();
        for (const geometry of this.mirrored) geometry.dispose();
        for (const template of this.templates) disposeModelMaterials(template);
        this.batches.length = 0; this.templates.length = 0; this.mirrored.clear();
        this.root.clear(); this.root.removeFromParent();
    }
}

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses { "Vanilla.Map.NativeSurfaces": void; }
        interface RenderData { "NativeSurfaces": NativeSurfaceModels; }
    }
}

ModuleLoader.registerRender("Vanilla.Map.NativeSurfaces", (name, api) => {
    api.setInitPasses([...api.getInitPasses(), {name, pass: (renderer, header) => {
        const surfaces = header.get("Vanilla.Map.NativeSurfaces");
        if (!surfaces) throw new Error("This Viewer requires a current recording with native surface identity data.");
        for (const diagnostic of header.get("Vanilla.Map.NativeSurfaceDiagnostics") ?? []) {
            // Source identity samples are developer diagnostics, not playback failures.
            // Older recordings also misclassified generic prop names as missing floors.
            if (diagnostic.startsWith("Unmatched native floor identity:")) console.warn(diagnostic);
            else ModuleLoader.reportWarning(diagnostic);
        }
        const models = new NativeSurfaceModels(surfaces, renderer.get("NavigationFallback"));
        renderer.set("NativeSurfaces", models); renderer.scene.add(models.root);
    }}]);
    api.setRenderLoop([...api.getRenderLoop(), {name, pass: renderer => {
        renderer.get("NativeSurfaces")?.update(renderer.get("Dimension") ?? 0, renderer.get("Camera")!);
    }}]);
});
ModuleLoader.registerDispose(renderer => renderer.get("NativeSurfaces")?.dispose());
