using API;
using LevelGeneration;
using ReplayRecorder.Map.Patches;
using UnityEngine;
using UnityEngine.AI;

namespace ReplayRecorder.Map {
    /// <summary>
    /// Contains all information about the map and static locations on the map
    /// - Doors
    /// - Zones
    /// - Crates
    /// </summary>
    internal static partial class Map {
        public class rMap : ISerializable {
            public struct Location {
                public bool valid = false;
                public char area;
                public int zone;

                public Location(int zone, char area) {
                    this.area = area;
                    this.zone = zone;
                    valid = true;
                }
                public Location() {
                    valid = false;
                    area = 'Z';
                    zone = 0;
                }
            }

            public class Surface {
                public Mesh mesh;

                public Surface(Mesh mesh) {
                    this.mesh = mesh;
                }
            }

            public eDimensionIndex dimension;
            public Surface[] surfaces;

            public rMap(eDimensionIndex dimension, Surface[] surfaces) {
                this.dimension = dimension;
                this.surfaces = surfaces;
            }

            private static byte[] buffer = new byte[1 + sizeof(ushort)];
            public void Serialize(FileStream fs) {
                /// Format:
                /// byte => dimension index
                /// ushort => number of surfaces
                /// [
                ///     ushort => number of vertices
                ///     uint => number of indices
                ///     [ half => x, y, z vertices ]
                ///     [ ushort => indicies ]
                /// ](repeated for each surface)

                int index = 0;
                int size = 1 + sizeof(ushort);
                if (buffer.Length < size) buffer = new byte[size];

                if (surfaces.Length > ushort.MaxValue) {
                    APILogger.Error($"There were more than {ushort.MaxValue} surfaces");
                    return;
                }

                BitHelper.WriteBytes((byte)dimension, buffer, ref index);
                BitHelper.WriteBytes((ushort)surfaces.Length, buffer, ref index);
                for (int i = 0; i < surfaces.Length; ++i) {
                    Surface surface = surfaces[i];
                    Vector3[] vertices = surface.mesh.vertices;
                    int[] indices = surface.mesh.triangles;

                    if (vertices.Length > ushort.MaxValue) {
                        APILogger.Error($"There were more than {ushort.MaxValue} vertices");
                        return;
                    }

                    size += sizeof(ushort) + sizeof(uint) + BitHelper.SizeOfVector3 * vertices.Length + sizeof(ushort) * indices.Length;
                    if (buffer.Length < size) {
                        byte[] temp = new byte[size];
                        Array.Copy(buffer, temp, buffer.Length);
                        buffer = temp;
                    }

                    BitHelper.WriteBytes((ushort)vertices.Length, buffer, ref index);
                    BitHelper.WriteBytes((uint)indices.Length, buffer, ref index);
                    for (int j = 0; j < vertices.Length; ++j) BitHelper.WriteBytes(vertices[j], buffer, ref index);
                    for (int j = 0; j < indices.Length; ++j) BitHelper.WriteBytes((ushort)indices[j], buffer, ref index);
                }

                fs.Write(buffer, 0, size);
            }
        }
        // Maps dimension to the surface map of that dimension
        public static Dictionary<eDimensionIndex, rMap> map = new Dictionary<eDimensionIndex, rMap>();

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

            rMap.Surface[] surfaces;
            if (meshes.Length > 1) // Check we actually need to filter surfaces
            {
                APILogger.Debug("Getting relevant surfaces.");
                long start = Raudy.Now;

                Dictionary<Mesh, rMap.Surface> relevantSurfaces = new Dictionary<Mesh, rMap.Surface>();

                // Buffers for later use
                Mesh[] closest = new Mesh[2];
                float[] distances = new float[2];

                for (int d = 0; d < dimension.Layers.Count; ++d) {
                    LG_Layer layer = dimension.Layers[d];
                    for (int z = 0; z < layer.m_zones.Count; ++z) {
                        LG_Zone zone = layer.m_zones[z];
                        for (int a = 0; a < zone.m_areas.Count; ++a) {
                            LG_Area area = zone.m_areas[a];

                            // For each gate (door) get the 2 closest surfaces and add them to relevant list
                            for (int g = 0; g < area.m_gates.Count; ++g) {
                                LG_Gate gate = area.m_gates[g];
                                Vector3 gateLocation = gate.transform.position;
                                closest[0] = meshes[0];
                                distances[0] = (gateLocation - meshes[0].bounds.ClosestPoint(gateLocation)).sqrMagnitude;
                                closest[1] = meshes[1];
                                distances[1] = (gateLocation - meshes[1].bounds.ClosestPoint(gateLocation)).sqrMagnitude;
                                for (int i = 2; i < meshes.Length; ++i) {
                                    Mesh mesh = meshes[i];
                                    float sqrdist = (gateLocation - mesh.bounds.ClosestPoint(gateLocation)).sqrMagnitude;
                                    if (sqrdist < distances[0]) {
                                        distances[1] = distances[0];
                                        closest[1] = closest[0];

                                        distances[0] = sqrdist;
                                        closest[0] = mesh;
                                    } else if (sqrdist < distances[1]) {
                                        distances[1] = sqrdist;
                                        closest[1] = mesh;
                                    }
                                }

                                Vector3 forward = gate.transform.rotation * Vector3.forwardVector;
                                for (int i = 0; i < closest.Length; ++i) {
                                    if (!relevantSurfaces.ContainsKey(closest[i]))
                                        relevantSurfaces.Add(closest[i], new rMap.Surface(closest[i]));
                                }
                            }

                            // Add surface closest to position of area => should handle locations without doors
                            // NOTE(randomuserhi): Not sure if this will catch all surfaces tho
                            //                     needs testing on maps like R6A1
                            {
                                Mesh _closest = meshes[0];
                                float _distance = (area.Position - meshes[0].bounds.ClosestPoint(area.Position)).sqrMagnitude;
                                for (int i = 1; i < meshes.Length; ++i) {
                                    Mesh mesh = meshes[i];
                                    float sqrdist = (area.Position - mesh.bounds.ClosestPoint(area.Position)).sqrMagnitude;
                                    if (sqrdist < _distance) {
                                        _closest = mesh;
                                        _distance = sqrdist;
                                    }
                                }
                                if (!relevantSurfaces.ContainsKey(_closest))
                                    relevantSurfaces.Add(_closest, new rMap.Surface(_closest));
                            }
                        }
                    }
                }

                long end = Raudy.Now;
                APILogger.Debug($"Found {relevantSurfaces.Count} relevant surfaces in {(end - start) / 1000f} seconds.");
                surfaces = relevantSurfaces.Values.ToArray();
            } else {
                surfaces = new rMap.Surface[meshes.Length];
                for (int i = 0; i < meshes.Length; ++i) {
                    surfaces[i] = new rMap.Surface(meshes[i]);
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
            map.Add(dimension.DimensionIndex, new rMap(dimension.DimensionIndex, surfaces));
        }

        public static void GenerateMapInfo(Il2CppSystem.Collections.Generic.List<Dimension> dimensions) {
            APILogger.Debug($"Saving individual dimensions...");

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

            APILogger.Debug($"Fetching door linkage data...");
            for (int i = 0; i < dimensions.Count; ++i) {
                if (!doors.ContainsKey(dimensions[i].DimensionIndex)) continue;
                for (int j = 0; j < doors[dimensions[i].DimensionIndex].Count; ++j) {
                    rDoor door = doors[dimensions[i].DimensionIndex][j];
                    LG_Gate gate = door.gate;
                    if (gate.m_linksTo.m_zone != null && gate.m_linksTo.m_navInfo != null)
                        door.to = new rMap.Location(gate.m_linksTo.m_zone.Alias, gate.m_linksTo.m_navInfo.Suffix[0]);
                    else
                        door.to = new rMap.Location();

                    if (gate.m_linksFrom.m_zone != null && gate.m_linksFrom.m_navInfo != null)
                        door.from = new rMap.Location(gate.m_linksFrom.m_zone.Alias, gate.m_linksFrom.m_navInfo.Suffix[0]);
                    else
                        door.from = new rMap.Location();

                    /*APILogger.Debug($"door: {door.size} {door.type}");
                    APILogger.Debug($"{door.position.x} {door.position.y} {door.position.z}");
                    APILogger.Debug($"{door.rotation.eulerAngles.x} {door.rotation.eulerAngles.y} {door.rotation.eulerAngles.z}");
                    APILogger.Debug($"to: zone {door.to.zone} area {door.to.area}");
                    APILogger.Debug($"from: zone {door.from.zone} area {door.from.area}");*/
                }
            }

            InitAndSaveMap();
        }

        // Open filestream and Save the map to replay file
        public static void InitAndSaveMap() {
            if (SnapshotManager.fs != null) {
                SnapshotManager.Dispose();
                APILogger.Error("Filestream was still open, this should not happen.");
            }

            // Start snapshot manager
            SnapshotManager.Init();

            if (SnapshotManager.fs == null) {
                APILogger.Error("Filestream was not started yet, this should not happen.");
                return;
            }

            // Write map info...
            byte[] buffer = new byte[100];
            SnapshotManager.fs.WriteByte((byte)map.Count); // Write number of dimensions
            foreach (rMap m in map.Values) {
                // Serialize map
                m.Serialize(SnapshotManager.fs);

                // Serialize doors for the given map
                int index = 0;
                if (!doors.ContainsKey(m.dimension)) {
                    BitHelper.WriteBytes((ushort)0, buffer, ref index);
                    SnapshotManager.fs.Write(buffer, 0, sizeof(ushort)); // Write 0 doors present
                    continue;
                }
                BitHelper.WriteBytes((ushort)doors[m.dimension].Count, buffer, ref index);
                SnapshotManager.fs.Write(buffer, 0, sizeof(ushort)); // Write number of doors
                foreach (rDoor d in doors[m.dimension]) {
                    d.Serialize(SnapshotManager.fs);
                }

                // Serialize -- for the given map
                index = 0;
                //...
            }

            // Flush to ensure map gets written to file
            SnapshotManager.fs.Flush();
        }

        public static void Reset() {
            APILogger.Debug("Resetting internal map data...");

            processed.Clear();

            map.Clear();
            MapPatches.dimensions = null;

            doors.Clear();
            rDoor._id = 0; // reset ids
            MapDoorPatches.doors.Clear();
        }
    }
}
