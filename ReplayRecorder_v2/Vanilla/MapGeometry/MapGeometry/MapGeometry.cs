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
        public Mesh? mesh;

        public Surface(Mesh mesh) {
            this.mesh = mesh;
        }
    }

    public static class MapBounds {
        public static Dictionary<byte, float> lowestPoint { get; internal set; } = new Dictionary<byte, float>();
    }

    internal static class MapGeometryReplayManager {
        [ReplayInit]
        private static void Init() {
            processed.Clear();
            MapGeometryPatches.dimensions = null;
            MapBounds.lowestPoint.Clear();
        }

        // private collection that maintains which dimensions have been processed
        private static HashSet<eDimensionIndex> processed = new HashSet<eDimensionIndex>();

        private static int GetNewVertex(Dictionary<uint, int> newVectices, List<Vector3> vertices, int i1, int i2) {
            if (i1 > ushort.MaxValue) throw new Exception("Only supports 16 bit indices.");
            if (i2 > ushort.MaxValue) throw new Exception("Only supports 16 bit indices.");

            // We have to test both directions since the edge
            // could be reversed in another triangle
            uint t1 = ((uint)i1 << 16) | (uint)i2;
            uint t2 = ((uint)i2 << 16) | (uint)i1;
            if (newVectices.ContainsKey(t2))
                return newVectices[t2];
            if (newVectices.ContainsKey(t1))
                return newVectices[t1];
            // generate vertex:
            int newIndex = vertices.Count;
            newVectices.Add(t1, newIndex);

            // calculate new vertex
            Vector3 pos = (vertices[i1] + vertices[i2]) * 0.5f;
            if (NavMesh.Raycast(pos + Vector3.up, pos + Vector3.down, out var hit, 1)) {
                pos = hit.position;
            } else if (NavMesh.SamplePosition(pos, out var hit2, 5, 1)) {
                pos = hit2.position;
            }
            vertices.Add(pos);

            return newIndex;
        }

        private static (Vector3[], int[]) Subdivide(Mesh mesh) {
            Dictionary<uint, int> newVectices = new Dictionary<uint, int>();

            List<Vector3> vertices = new List<Vector3>(mesh.vertices);
            List<int> indices = new List<int>();

            for (int i = 0; i < mesh.triangles.Length; i += 3) {
                int i1 = mesh.triangles[i + 0];
                int i2 = mesh.triangles[i + 1];
                int i3 = mesh.triangles[i + 2];

                int a = GetNewVertex(newVectices, vertices, i1, i2);
                int b = GetNewVertex(newVectices, vertices, i2, i3);
                int c = GetNewVertex(newVectices, vertices, i3, i1);
                indices.Add(i1);
                indices.Add(a);
                indices.Add(c);
                indices.Add(i2);
                indices.Add(b);
                indices.Add(a);
                indices.Add(i3);
                indices.Add(c);
                indices.Add(b);
                indices.Add(a);
                indices.Add(b);
                indices.Add(c); // center triangle
            }

            return (vertices.ToArray(), indices.ToArray());
        }

        private static Vector3 ClosestVertex(Vector3 position, Mesh mesh) {
            Vector3 closest = mesh.vertices[0];
            float dist = (position - closest).sqrMagnitude;
            for (int i = 1; i < mesh.vertices.Length; ++i) {
                float d = (position - mesh.vertices[i]).sqrMagnitude;
                if (d < dist) {
                    closest = mesh.vertices[i];
                    dist = d;
                }
            }
            return closest;
        }

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
            (vertices, indices) = MeshUtils.Weld(vertices, indices, 0.25f, 2f);

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
            meshes = meshes.Where(s => MeshUtils.GetSurfaceArea(s) > 50).ToArray(); // Cull meshes that are too small

            /// This works since each dimension has Layer information containing:
            /// - spawn locations
            /// - door locations (referred to as "gates")
            /// - warp locations
            /// which can all be used to discern which surfaces are important.
            /// - doors
            ///     - the 2 nearest surfaces (aka the surfaces the door connects) are probably relevant to the level
            /// - spawn / warp locations
            ///     - the nearest surface is most likely relevant to the level if enemies and players can spawn there

            // TODO(randomuserhi): Get surfaces based on ladder

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
                                foreach (Mesh mesh in meshes.Where(m => gateLocation.y >= (m.bounds.center.y - m.bounds.extents.y - 0.1) && gateLocation.y <= (m.bounds.center.y + m.bounds.extents.y + 0.1)).OrderBy(m => (gateLocation - m.bounds.ClosestPoint(gateLocation)).sqrMagnitude)) {
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
                surfaces = relevantSurfaces.Values.ToArray();
                APILogger.Debug($"Found {surfaces.Length} relevant surfaces in {(end - start) / 1000f} seconds.");
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

            if (!MapBounds.lowestPoint.ContainsKey((byte)dimension.DimensionIndex)) {
                MapBounds.lowestPoint.Add((byte)dimension.DimensionIndex, float.PositiveInfinity);
            }

            // subdivide mesh and fix poor positions
            for (int i = 0; i < surfaces.Length; ++i) {
                Surface surface = surfaces[i];
                (vertices, indices) = Subdivide(surface.mesh!);
                surface.mesh!.Clear();
                surface.mesh.vertices = vertices;
                surface.mesh.triangles = indices;

                surface.mesh.RecalculateBounds();
                float low = surface.mesh!.bounds.center.y - surface.mesh!.bounds.extents.y;
                if (low < MapBounds.lowestPoint[(byte)dimension.DimensionIndex]) {
                    MapBounds.lowestPoint[(byte)dimension.DimensionIndex] = low;
                }

                Replay.Trigger(new rMapGeometry((byte)dimension.DimensionIndex, surface));
                surfaces[i].mesh = null;
                GC.Collect();
            }
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
    internal class rMapGeometry : ReplayHeader {
        private byte dimension;
        private Surface surface;

        public rMapGeometry(byte dimension, Surface surface) {
            this.dimension = dimension;
            this.surface = surface;
        }

        public override void Write(ByteBuffer buffer) {
            if (surface.mesh == null) throw new NullReferenceException("Mesh was null.");

            BitHelper.WriteBytes(dimension, buffer);

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

    [ReplayData("Vanilla.Map.Geometry.EOH", "0.0.1")]
    internal class rMapGeometryEOH : ReplayHeader {
        public override void Write(ByteBuffer buffer) {
        }
    }
}
