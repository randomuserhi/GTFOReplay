using UnityEngine;
using UnityEngine.AI;

using Il2CppSystem.Text;

using API;
using LevelGeneration;
using static Il2CppSystem.Globalization.CultureInfo;
using static ReplayRecorder.Map.MeshUtils;

namespace ReplayRecorder.Map
{
    /// <summary>
    /// Contains all information about the map and static locations on the map
    /// - Doors
    /// - Zones
    /// - Crates
    /// </summary>
    public static class Map
    {
        private static HashSet<eDimensionIndex> processed = new HashSet<eDimensionIndex>();

        private static void GenerateMeshSurfaces(Dimension dimension)
        {
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

            if (processed.Contains(dimension.DimensionIndex))
            {
                APILogger.Error("Dimension already has been constructed, this should not happen");
                return;
            }


            // Convert surfaces to meshes
            Mesh[] meshes = new Mesh[surfaceBuffer.Length];
            for (int i = 0; i < surfaceBuffer.Length; ++i)
            {
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

            if (meshes.Length > 1) // Check we actually need to filter surfaces
            {
                APILogger.Debug("Getting relevant surfaces.");

                HashSet<Mesh> relevantSurfaces = new HashSet<Mesh>();

                // Buffers for later use
                Mesh[] closest = new Mesh[2];
                float[] distances = new float[2];

                for (int d = 0; d < dimension.Layers.Count; ++d)
                {
                    LG_Layer layer = dimension.Layers[d];
                    for (int z = 0; z < layer.m_zones.Count; ++z)
                    {
                        LG_Zone zone = layer.m_zones[z];
                        for (int a = 0; a < zone.m_areas.Count; ++a)
                        {
                            LG_Area area = zone.m_areas[a];

                            // Add surface closest to position of area
                            {
                                Mesh _closest = meshes[0];
                                float _distance = (area.Position - meshes[0].bounds.ClosestPoint(area.Position)).sqrMagnitude;
                                for (int i = 1; i < meshes.Length; ++i)
                                {
                                    Mesh mesh = meshes[i];
                                    float sqrdist = (area.Position - mesh.bounds.ClosestPoint(area.Position)).sqrMagnitude;
                                    if (sqrdist < _distance)
                                    {
                                        _closest = mesh;
                                        _distance = sqrdist;
                                    }
                                }
                                relevantSurfaces.Add(_closest);
                            }

                            // For each gate (door) get the 2 closest surfaces and add them to relevant list
                            for (int g = 0; g < area.m_gates.Count; ++g)
                            {
                                LG_Gate gate = area.m_gates[g];
                                Vector3 gateLocation = gate.transform.position;
                                closest[0] = meshes[0];
                                distances[0] = (gateLocation - meshes[0].bounds.ClosestPoint(gateLocation)).sqrMagnitude;
                                closest[1] = meshes[1];
                                distances[1] = (gateLocation - meshes[1].bounds.ClosestPoint(gateLocation)).sqrMagnitude;
                                for (int i = 2; i < meshes.Length; ++i)
                                {
                                    Mesh mesh = meshes[i];
                                    float sqrdist = (gateLocation - mesh.bounds.ClosestPoint(gateLocation)).sqrMagnitude;
                                    if (sqrdist < distances[0])
                                    {
                                        distances[1] = distances[0];
                                        closest[1] = closest[0];

                                        distances[0] = sqrdist;
                                        closest[0] = mesh;
                                    }
                                    else if (sqrdist < distances[1])
                                    {
                                        distances[1] = sqrdist;
                                        closest[1] = mesh;
                                    }
                                }
                                relevantSurfaces.Add(closest[0]);
                                relevantSurfaces.Add(closest[1]);
                            }
                        }
                    }
                }

                APILogger.Debug($"Found {relevantSurfaces.Count} relevant surfaces.");
                meshes = relevantSurfaces.ToArray();
            }

            // TODO(randomuserhi): Check what dimensions actually exist on this level and only include those
            //                     Not the biggest deal, since I keep track of which dimensions are visited
            //                     but would be nice to reduce file size.
            if (meshes.Length == 0)
            {
                APILogger.Warn($"No relevent surfaces found");
                return;
            }

            // Write meshes to disk
            StringBuilder json = new StringBuilder();
            json.Append($"[");
            string seperator = string.Empty;
            for (int i = 0; i < meshes.Length; ++i)
            {
                Mesh mesh = meshes[i];
                json.Append($"{seperator}{{\"vertices\":[");
                string _seperator = string.Empty;
                for (int j = 0; j < mesh.vertices.Count; ++j)
                {
                    json.Append($"{_seperator}{mesh.vertices[j].x},{mesh.vertices[j].y},{mesh.vertices[j].z}");
                    _seperator = ",";
                }
                json.Append("],\"indices\":[");
                _seperator = string.Empty;
                for (int j = 0; j < mesh.triangles.Count; ++j)
                {
                    json.Append($"{_seperator}{mesh.triangles[j]}");
                    _seperator = ",";
                }
                json.Append("]}");
                seperator = ",";
            }
            json.Append("]");

            File.WriteAllText($"Map_{dimension.DimensionIndex}.json", json.ToString());
        }

        public static void GenerateMapInfo(Il2CppSystem.Collections.Generic.List<Dimension> dimensions)
        {
            Reset();

            APILogger.Debug($"Saving individual dimensions...");

            for (int i = 0; i < dimensions.Count; ++i)
            {
                // Clear navmesh
                NavMesh.RemoveAllNavMeshData();
                NavMesh.AddNavMeshData(dimensions[i].NavmeshData);
                GenerateMeshSurfaces(dimensions[i]);
            }

            APILogger.Debug($"Re-constructing navmesh...");

            NavMesh.RemoveAllNavMeshData();
            for (int i = 0; i < dimensions.Count; ++i)
            {
                // Clear navmesh
                dimensions[i].NavmeshInstance = NavMesh.AddNavMeshData(dimensions[i].NavmeshData);
            }

            // TODO(randomuserhi): obtian static information like doors, zones etc...
        }

        public static void Reset()
        {
            APILogger.Debug("Resetting internal map data...");
            processed.Clear();
        }
    }
}
