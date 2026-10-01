import { Material, Mesh, Object3D } from "@esm/three";

const owned = new WeakSet<Material>();

/** Share textures and geometry while keeping tint, opacity and animation per instance. */
export function ownModelMaterials(group: Object3D) {
    const copies = new Map<Material, Material>();
    const copy = (source: Material) => {
        if (!copies.has(source)) { const material = source.clone(); copies.set(source, material); owned.add(material); }
        return copies.get(source)!;
    };
    group.traverse(object => {
        const mesh = object as Mesh;
        if (mesh.isMesh) mesh.material = Array.isArray(mesh.material) ? mesh.material.map(copy) : copy(mesh.material);
    });
}

export function disposeModelMaterials(group: Object3D) {
    group.traverse(object => {
        const mesh = object as Mesh;
        if (!mesh.isMesh) return;
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material])
            if (owned.delete(material)) material.dispose();
    });
}
