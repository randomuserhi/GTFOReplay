import { BufferAttribute, BufferGeometry, DoubleSide, LineBasicMaterial, LineSegments, Mesh, MeshPhongMaterial } from "three";
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

function getEdge(i1: number, i2: number): [number, number] {
    // todo throw error
    if (i1 > 0b1111111111111111) console.log("bruh");
    if (i2 > 0b1111111111111111) console.log("bruh");

    const a = (i1 << 16) | i2;
    const b = (i2 << 16) | i1;
    return [a, b];
}

function checkEdge(edge: [number, number], set: Map<number, boolean>) {
    const [a, b] = edge;
    if (set.has(a)) {
        set.set(a, false);
    } else if (set.has(b)) {
        set.set(b, false);
    } else {
        set.set(a, true);
    }
}

function getBoundaryEdges(indices: number[]) {
    const triangles: (number[])[] = [];
    const all = new Map<number, boolean>();
    for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i];
        const b = indices[i + 1];
        const c = indices[i + 2];

        if (a === b) continue;
        if (a === c) continue;
        if (b === c) continue;

        const triangle = [a, b, c].sort();

        // duplicate triangle
        if (triangles.filter(t => t[0] == triangle[0] && t[1] == triangle[1] && t[2] == triangle[2]).length === 1) {
            console.log("duplicate?");
            continue;
        }

        checkEdge(getEdge(a, b), all);
        checkEdge(getEdge(a, c), all);
        checkEdge(getEdge(b, c), all);

        triangles.push(triangle);
    }
    const _edges = [...all.keys()].filter(k => all.get(k)!);
    const edges = [];
    const ind = new Set<number>();
    for (const edge of _edges) {
        const v1 = edge & 0b1111111111111111;
        const v2 = edge >> 16;
        ind.add(v1);
        ind.add(v2);
        edges.push(v1, v2);
    }
    return edges;
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
                    const vertices = new BufferAttribute(meshes[i].vertices, 3);
                    
                    const geometry = new BufferGeometry();
                    geometry.setIndex(meshes[i].indices);
                    geometry.setAttribute("position", vertices);
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

                        const edgeGeometry = new BufferGeometry();
                        edgeGeometry.setIndex(getBoundaryEdges(meshes[i].indices));
                        edgeGeometry.setAttribute("position", vertices);

                        const line = new LineSegments(edgeGeometry, new LineBasicMaterial({ color: 0x63ade6 })); 
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