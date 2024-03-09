import { BufferAttribute, BufferGeometry, DoubleSide, EdgesGeometry, LineBasicMaterial, LineSegments, Mesh, MeshPhongMaterial } from "three";
import * as BitHelper from "../../replay/bithelper.js";
import { HeaderApi, ModuleLoader } from "../../replay/moduleloader.js";
import { Renderer } from "../../replay/renderer.js";

export interface MapGeometry {
    vertices: Float32Array;
    indices: number[];
}

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Map.Geometry": Map<number, MapGeometry[]>;
            "Vanilla.Map.Geometry.EOH": void;
        }
    }
}

ModuleLoader.registerHeader("Vanilla.Map.Geometry", "0.0.1", {
    parse: async (data, header) => {
        const dimension = await BitHelper.readByte(data);
        const nVertices = await BitHelper.readUShort(data);
        const nIndicies = await BitHelper.readUInt(data);
        const surface = {
            vertices: await BitHelper.readVectorArrayAsFloat32(data, nVertices),
            indices: await BitHelper.readUShortArray(data, nIndicies)
        };

        // offset surface a little to deal with bad navmesh
        for (let i = 0; i < surface.vertices.length; i += 3) {
            surface.vertices[i + 1] -= 0.1;
        }

        const map = header.getOrDefault("Vanilla.Map.Geometry", () => new Map());
        if (!map.has(dimension)) map.set(dimension, []);
        map.get(dimension)!.push(surface);
    }
});

ModuleLoader.registerHeader("Vanilla.Map.Geometry.EOH", "0.0.1", {
    parse: async () => {
    }
});

// --------------------------- RENDERING ---------------------------

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.Map": void;
        }

        interface RenderData {
            "Maps": Map<number, Mesh[]>;
            "Dimension": number;
            "MapDimension": number;
        }
    }
}

ModuleLoader.registerRender("Vanilla.Map", (name, api) => {
    const init = api.getInitPasses();
    api.setInitPasses([{ 
        name, pass: (renderer: Renderer, header: HeaderApi) => {
            const geometry = header.getOrDefault("Vanilla.Map.Geometry", () => new Map());
            
            const maps = new Map<number, Mesh[]>();
            for (const [dimension, meshes] of geometry) {
                const surfaces: Mesh[] = [];
                for (let i = 0; i < meshes.length; ++i) {
                    const geometry = new BufferGeometry();
                            
                    geometry.setIndex(meshes[i].indices);
                    
                    geometry.setAttribute("position", new BufferAttribute(meshes[i].vertices, 3));
                    geometry.computeVertexNormals();

                    {
                        const material = new MeshPhongMaterial({
                            color: 0x296fa3,
                            side: DoubleSide,
                        });
                            
                        const surface = new Mesh(geometry, material);
                        surface.castShadow = true;
                        surface.receiveShadow = true;
                        surface.visible = false;
                        surfaces.push(surface);

                        const edges = new EdgesGeometry( geometry ); 
                        const line = new LineSegments(edges, new LineBasicMaterial({ color: 0x3572a1 })); 
                        surface.add(line);

                        renderer.scene.add(surface);
                    }
                }
                maps.set(dimension, surfaces);
            }
            renderer.set("Maps", maps);
            renderer.set("Dimension", 0);
            renderer.set("MapDimension", -1);
        } 
    }, ...init]);

    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([{ 
        name, pass: (renderer) => {
            const maps = renderer.get("Maps")!;
            const currentDimension = renderer.getOrDefault("Dimension", () => 0);
            const mapDimension = renderer.getOrDefault("MapDimension", () => -1);
            if (mapDimension !== currentDimension) {
                for (const [dimension, meshes] of maps) {
                    for (const mesh of meshes) {
                        mesh.visible = dimension === currentDimension;
                    }
                }
                renderer.set("MapDimension", currentDimension);
            }
        } 
    }, ...renderLoop]);
});