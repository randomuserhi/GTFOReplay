import { BoxGeometry, ColorRepresentation, Mesh, MeshStandardMaterial, Object3D } from "@esm/three";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";

/** An explicit, instance-owned failure marker; it has no native animation. */
export class BasicModel extends Mesh<BoxGeometry, MeshStandardMaterial> {
    private disposed = false;

    constructor(identity: string, error: unknown, size: readonly number[] = [1, 1, 1]) {
        super(new BoxGeometry(size[0], size[1], size[2]), new MeshStandardMaterial({ color: 0xb28b50, roughness: 1 }));
        this.name = "Basic model fallback";
        this.userData.modelFallback = { identity, reason: String(error), animated: false };
        this.position.y = size[1] / 2;
        ModuleLoader.reportWarning(`Using a basic shape for ${identity}: ${String(error)}`);
    }

    appearance(tint?: ColorRepresentation, opacity = 1) {
        this.material.color.set(tint ?? 0xb28b50);
        this.material.opacity = opacity;
        this.material.transparent = opacity < 1;
        this.material.depthWrite = opacity === 1;
    }

    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this.removeFromParent();
        this.geometry.dispose();
        this.material.dispose();
    }
}

export function hasModelGeometry(root: Object3D): boolean {
    let found = false;
    root.traverse(object => {
        const mesh = object as Mesh;
        if (mesh.isMesh && mesh.geometry.getAttribute("position")?.count > 0) found = true;
    });
    return found;
}
