using UnityEngine;
using LevelGeneration;
using API;
using UnityEngine.AI;

using ReplayRecorder.Map.Patches;

namespace ReplayRecorder.Map
{
    public static class Map
    {
        public static readonly Dictionary<eDimensionIndex, Mesh[]> surfaces = new Dictionary<eDimensionIndex, Mesh[]>();

        private static void GenerateMeshSurfaces(eDimensionIndex dimension)
        {
            surfaces.Clear();

            NavMeshTriangulation triangulation = NavMesh.CalculateTriangulation();

            APILogger.Debug($"Merging nearby vertices...");

            Vector3[] vertices = triangulation.vertices;
            int[] indices = triangulation.indices;
            (vertices, indices) = MeshUtils.Weld(vertices, indices, 0.05f, 1.3f);

            APILogger.Debug($"Splitting navmesh...");
            MeshUtils.Surface[] surfaceBuffer = MeshUtils.SplitNavmesh(vertices, indices);

            APILogger.Debug($"Generated {surfaceBuffer.Length} surfaces. Converting to meshes...");

            // Convert surfaces to meshes
            if (surfaces.ContainsKey(dimension))
            {
                APILogger.Error("Dimension already has been constructed, this should not happen");
                return;
            }

            Mesh[] meshes = new Mesh[surfaceBuffer.Length];
            surfaces.Add(dimension, meshes);
            for (int i = 0; i < surfaceBuffer.Length; ++i)
            {
                meshes[i] = surfaceBuffer[i].ToMesh();
            }
        }

        public static void OnAllNavMeshGenerated(Il2CppSystem.Collections.Generic.List<Dimension> dimensions)
        {
            Reset();

            APILogger.Debug($"Saving individual dimensions...");

            for (int i = 0; i < dimensions.Count; ++i)
            {
                // Clear navmesh
                NavMesh.RemoveAllNavMeshData();
                NavMesh.AddNavMeshData(dimensions[i].NavmeshData);
                GenerateMeshSurfaces(dimensions[i].DimensionIndex);
            }

            APILogger.Debug($"Re-constructing navmesh...");

            NavMesh.RemoveAllNavMeshData();
            for (int i = 0; i < dimensions.Count; ++i)
            {
                // Clear navmesh
                dimensions[i].NavmeshInstance = NavMesh.AddNavMeshData(dimensions[i].NavmeshData);
            }
        }

        public static void Reset()
        {
            APILogger.Debug("Resetting internal map data...");
            surfaces.Clear();
        }
    }
}
