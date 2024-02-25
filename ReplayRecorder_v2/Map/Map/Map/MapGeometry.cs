using API;
using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;
using UnityEngine.AI;
using Vanilla.Map.Patches;

namespace Vanilla.Map {
    internal class Surface {
        public Mesh mesh;

        public Surface(Mesh mesh) {
            this.mesh = mesh;
        }
    }

    internal class Map {
        public eDimensionIndex dimension;
        public Surface[] surfaces;

        public Map(eDimensionIndex dimension, Surface[] surfaces) {
            this.dimension = dimension;
            this.surfaces = surfaces;
        }

        public void Write(ByteBuffer buffer) {
            if (surfaces.Length > ushort.MaxValue) {
                APILogger.Error($"There were more than {ushort.MaxValue} surfaces.");
                return;
            }

            BitHelper.WriteBytes((byte)dimension, buffer);
            BitHelper.WriteBytes((ushort)surfaces.Length, buffer);
            for (int i = 0; i < surfaces.Length; ++i) {
                Surface surface = surfaces[i];
                Vector3[] vertices = surface.mesh.vertices;
                int[] indices = surface.mesh.triangles;

                if (vertices.Length > ushort.MaxValue) {
                    APILogger.Error($"There were more than {ushort.MaxValue} vertices");
                    return;
                }

                BitHelper.WriteBytes((ushort)vertices.Length, buffer);
                BitHelper.WriteBytes((uint)indices.Length, buffer);
                for (int j = 0; j < vertices.Length; ++j) BitHelper.WriteBytes(vertices[j], buffer);
                for (int j = 0; j < indices.Length; ++j) BitHelper.WriteBytes((ushort)indices[j], buffer);
            }
        }
    }

    internal static class MapGeometryManager {
        [ReplayReset]
        private static void Reset() {
            map = new Dictionary<eDimensionIndex, Map>();
            processed.Clear();
            MapGeometryPatches.dimensions = null;
        }

        // Maps dimension to the surface map of that dimension
        public static Dictionary<eDimensionIndex, Map> map = new Dictionary<eDimensionIndex, Map>();

        // private collection that maintains which dimensions have been processed
        private static HashSet<eDimensionIndex> processed = new HashSet<eDimensionIndex>();

        private static void GenerateMeshSurfaces(Dimension dimension) {
            NavMeshTriangulation triangulation = NavMesh.CalculateTriangulation();

            /// The navmesh of each dimension is very crude with a ton of unnecessary geomtry as well as the geometry being
            /// poorly constructed
            /// 
            /// To handle this, weld nearby vertices to generate continuous surfaces and then seperate the surfaces
            /// into individual meshes so that we can remove unnecessary geometry

            APILogger.Debug($"Merging nearby vertices...");

            Vector3[] vertices = triangulation.vertices;
            int[] indices = triangulation.indices;
            (vertices, indices) = MeshUtils.Weld(vertices, indices, 0.05f, 1.3f);

            APILogger.Debug($"Splitting navmesh...");
            MeshUtils.Surface[] surfaceBuffer = MeshUtils.SplitNavmesh(vertices, indices);

            APILogger.Debug($"Generated {surfaceBuffer.Length} surfaces. Converting to meshes...");

            if (processed.Contains(dimension.DimensionIndex)) {
                APILogger.Error("Dimension already has been constructed, this should not happen");
                return;
            }
            processed.Add(dimension.DimensionIndex);

            // Convert surfaces to meshes
            Mesh[] meshes = new Mesh[surfaceBuffer.Length];
            for (int i = 0; i < surfaceBuffer.Length; ++i) {
                meshes[i] = surfaceBuffer[i].ToMesh();
            }

            /// This works since each dimension has Layer information containing:
            /// - spawn locations
            /// - door locations (referred to as "gates")
            /// - warp locations
            /// which can all be used to discern which surfaces are important.
            /// - doors
            ///     - the 2 nearest surfaces (aka the surfaces the door connects) are probably relevant to the level
            /// - spawn / warp locations
            ///     - the nearest surface is most likely relevant to the level if enemies and players can spawn there

            Surface[] surfaces;
            if (meshes.Length > 1) { // Check we actually need to filter surfaces
                APILogger.Debug("Getting relevant surfaces.");
                long start = Raudy.Now;

                Dictionary<Mesh, Surface> relevantSurfaces = new Dictionary<Mesh, Surface>();

                for (int d = 0; d < dimension.Layers.Count; ++d) {
                    LG_Layer layer = dimension.Layers[d];
                    for (int z = 0; z < layer.m_zones.Count; ++z) {
                        LG_Zone zone = layer.m_zones[z];
                        for (int a = 0; a < zone.m_areas.Count; ++a) {
                            LG_Area area = zone.m_areas[a];

                            // For each gate (door) get the 3 closest surfaces and add them to relevant list
                            for (int g = 0; g < area.m_gates.Count; ++g) {
                                LG_Gate gate = area.m_gates[g];
                                Vector3 gateLocation = gate.transform.position;

                                int count = 0;
                                foreach (Mesh mesh in meshes.OrderBy(m => (gateLocation - m.bounds.ClosestPoint(gateLocation)).sqrMagnitude)) {
                                    if (++count > 3) break;
                                    if (!relevantSurfaces.ContainsKey(mesh)) {
                                        relevantSurfaces.Add(mesh, new Surface(mesh));
                                    }
                                }
                            }

                            // Add surface closest to position of area => should handle locations without doors
                            // NOTE(randomuserhi): Not sure if this will catch all surfaces tho
                            //                     needs testing on maps like R6A1
                            {
                                int count = 0;
                                foreach (Mesh mesh in meshes.OrderBy(m => (area.Position - m.bounds.ClosestPoint(area.Position)).sqrMagnitude)) {
                                    if (++count > 1) break;
                                    if (!relevantSurfaces.ContainsKey(mesh)) {
                                        relevantSurfaces.Add(mesh, new Surface(mesh));
                                    }
                                }
                            }
                        }
                    }
                }

                long end = Raudy.Now;
                APILogger.Debug($"Found {relevantSurfaces.Count} relevant surfaces in {(end - start) / 1000f} seconds.");
                surfaces = relevantSurfaces.Values.ToArray();
            } else {
                surfaces = new Surface[meshes.Length];
                for (int i = 0; i < meshes.Length; ++i) {
                    surfaces[i] = new Surface(meshes[i]);
                }
            }

            // TODO(randomuserhi): Check what dimensions actually exist on this level and only include those
            //                     Not the biggest deal, since I keep track of which dimensions are visited
            //                     but would be nice to reduce file size.
            if (surfaces.Length == 0) {
                APILogger.Warn($"No relevent surfaces found");
                return;
            }

            // Add surfaces to map data
            map.Add(dimension.DimensionIndex, new Map(dimension.DimensionIndex, surfaces));
        }

        public static void GenerateMapInfo(Il2CppSystem.Collections.Generic.List<Dimension> dimensions) {
            APILogger.Debug($"Generating map navmesh...");

            for (int i = 0; i < dimensions.Count; ++i) {
                // Clear navmesh
                NavMesh.RemoveAllNavMeshData();
                NavMesh.AddNavMeshData(dimensions[i].NavmeshData);
                GenerateMeshSurfaces(dimensions[i]);
            }

            APILogger.Debug($"Re-constructing navmesh...");

            NavMesh.RemoveAllNavMeshData();
            for (int i = 0; i < dimensions.Count; ++i) {
                // Clear navmesh
                dimensions[i].NavmeshInstance = NavMesh.AddNavMeshData(dimensions[i].NavmeshData);
            }
        }
    }

    [ReplayData("Vanilla.Map.Geometry", "0.0.1")]
    internal class MapGeometry : ReplayHeader {
        private Dictionary<eDimensionIndex, Map> map;

        public override string? Debug => $"{map.Count} dimensions.";

        public MapGeometry(Dictionary<eDimensionIndex, Map> map) {
            this.map = map;
        }

        public override void Write(ByteBuffer buffer) {
            // Write map info...
            APILogger.Debug("Writing map data...");
            BitHelper.WriteBytes((byte)map.Count, buffer); // Write number of dimensions
            foreach (Map m in map.Values) {
                m.Write(buffer);
            }
        }
    }
}
