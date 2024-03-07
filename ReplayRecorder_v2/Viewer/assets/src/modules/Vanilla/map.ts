import { BufferAttribute, BufferGeometry, DoubleSide, Mesh, MeshPhongMaterial } from "three";
import * as BitHelper from "../../replay/bithelper.js";
import { HeaderApi, ModuleLoader } from "../../replay/moduleloader.js";
import { Renderer } from "../../replay/renderer.js";
import { DuplicateHeaderData } from "../replayrecorder.js";

export interface MapGeometry {
    vertices: Float32Array;
    indices: number[];
}

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Map.Geometry": Map<number, MapGeometry[]>;
        }
    }
}

ModuleLoader.registerHeader("Vanilla.Map.Geometry", "0.0.1", {
    parse: async (data, header) => {
        const map = new Map<number, MapGeometry[]>();

        const nDimensions = await BitHelper.readByte(data);
        for (let i = 0; i < nDimensions; ++i) {
            const dimension = await BitHelper.readByte(data);
            const nSurfaces = await BitHelper.readUShort(data);
            const surfaces: MapGeometry[] = [];
            for (let j = 0; j < nSurfaces; ++j) {
                const nVertices = await BitHelper.readUShort(data);
                const nIndicies = await BitHelper.readUInt(data);
                const surface = {
                    vertices: await BitHelper.readVectorArrayAsFloat32(data, nVertices),
                    indices: await BitHelper.readUShortArray(data, nIndicies)
                };
                for (let k = 0; k < surface.vertices.length; k += 3) {
                    surface.vertices[k + 1] -= 0.05; // offset map a little in y-axis
                }
                surfaces.push(surface);
            }
            map.set(dimension, surfaces);
        }

        if (header.has("Vanilla.Map.Geometry")) throw new DuplicateHeaderData("Map Geometry was already written.");
        else header.set("Vanilla.Map.Geometry", map);
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