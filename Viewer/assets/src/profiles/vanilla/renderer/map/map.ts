import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { BufferAttribute, BufferGeometry, DoubleSide, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "@esm/three";
import { Factory } from "../../library/factory.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses { "Vanilla.Map": void; }
        interface RenderData {
            "Maps": Map<number, Mesh[]>;
            "NavigationFallback": Map<number, Mesh[]>;
            "Dimension": number;
        }
    }
}

ModuleLoader.registerRender("Vanilla.Map", (name, api) => {
    api.setInitPasses([...api.getInitPasses(), {name, pass: (renderer, header) => {
        const maps = new Map<number, Mesh[]>();
        const fallback = new Map<number, Mesh[]>();
        for (const [dimension, meshes] of header.getOrDefault("Vanilla.Map.Geometry", Factory("Map"))) {
            maps.set(dimension, meshes.map(source => {
                const geometry = new BufferGeometry();
                geometry.setIndex(source.indices);
                geometry.setAttribute("position", new BufferAttribute(source.vertices, 3));
                // Navigation supports picking/line-of-sight only. Its voxelized
                // surface is not the game floor and must never enter the scene.
                const mesh = new Mesh(geometry, new MeshBasicMaterial({side: DoubleSide}));
                mesh.visible = false;
                return mesh;
            }));
            fallback.set(dimension, maps.get(dimension)!.map((mesh, index) => {
                const surface = new Mesh(mesh.geometry.clone(), new MeshStandardMaterial({color:0x404a4e,roughness:.9,side:DoubleSide}));
                const heights = meshes[index].supportHeights;
                if (heights) {
                    const positions = surface.geometry.getAttribute("position");
                    for (let i = 0; i < heights.length; ++i) positions.setY(i, heights[i]);
                }
                surface.visible = false;
                renderer.scene.add(surface);
                return surface;
            }));
        }
        renderer.set("Maps", maps);
        renderer.set("NavigationFallback", fallback);
        renderer.set("Dimension", 0);
    }}]);
    api.setRenderLoop([...api.getRenderLoop(), {name, pass: renderer => {
        const ready = renderer.get("NativeSurfaces")?.navigationReady ?? false;
        for (const [dimension, meshes] of renderer.get("NavigationFallback") ?? [])
            for (const mesh of meshes) mesh.visible = ready && dimension === (renderer.get("Dimension") ?? 0);
    }}]);
});

ModuleLoader.registerDispose(renderer => {
    for (const meshes of renderer.get("Maps")?.values() ?? []) for (const mesh of meshes) {
        mesh.geometry.dispose();
        (mesh.material as MeshBasicMaterial).dispose();
    }
    for (const meshes of renderer.get("NavigationFallback")?.values() ?? []) for (const mesh of meshes) {
        mesh.geometry.dispose();
        (mesh.material as MeshStandardMaterial).dispose();
        mesh.removeFromParent();
    }
});
