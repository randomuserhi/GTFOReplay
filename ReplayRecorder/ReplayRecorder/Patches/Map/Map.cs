using API;
using HarmonyLib;
using Il2CppSystem.Text;

using LevelGeneration;

using UnityEngine.AI;
using UnityEngine;
using Player;

namespace ReplayRecorder.Patches.Map
{
    [HarmonyPatch]
    public class Map
    {
        private static (Vector3[], int[]) AutoWeld(Vector3[] vertices, int[] indices, float threshold, float bucketStep)
        {
            threshold *= threshold;

            List<Vector3> newVertices = new List<Vector3>();
            int[] indexMap = new int[vertices.Length];
            Dictionary<Vector3, int> vertexToIndex = new Dictionary<Vector3, int>();
            int[] newIndices = new int[indices.Length];

            // Find AABB
            Vector3 min = new Vector3(float.MaxValue, float.MaxValue, float.MaxValue);
            Vector3 max = new Vector3(float.MinValue, float.MinValue, float.MinValue);
            for (int i = 0; i < vertices.Length; i++)
            {
                if (vertices[i].x < min.x) min.x = vertices[i].x;
                if (vertices[i].y < min.y) min.y = vertices[i].y;
                if (vertices[i].z < min.z) min.z = vertices[i].z;
                if (vertices[i].x > max.x) max.x = vertices[i].x;
                if (vertices[i].y > max.y) max.y = vertices[i].y;
                if (vertices[i].z > max.z) max.z = vertices[i].z;
            }

            // Make cubic buckets, each with dimensions "bucketStep"
            int bucketSizeX = Mathf.FloorToInt((max.x - min.x) / bucketStep) + 1;
            int bucketSizeY = Mathf.FloorToInt((max.y - min.y) / bucketStep) + 1;
            int bucketSizeZ = Mathf.FloorToInt((max.z - min.z) / bucketStep) + 1;
            List<int>[,,] buckets = new List<int>[bucketSizeX, bucketSizeY, bucketSizeZ];

            // Make new vertices
            for (int i = 0; i < vertices.Length; ++i)
            {
                // Determine which bucket it belongs to
                int x = Mathf.FloorToInt((vertices[i].x - min.x) / bucketStep);
                int y = Mathf.FloorToInt((vertices[i].y - min.y) / bucketStep);
                int z = Mathf.FloorToInt((vertices[i].z - min.z) / bucketStep);

                // Check to see if it's already been added
                if (buckets[x, y, z] == null)
                    buckets[x, y, z] = new List<int>(); // Make buckets lazily

                for (int j = 0; j < buckets[x, y, z].Count; ++j)
                {
                    Vector3 to = newVertices[buckets[x, y, z][j]] - vertices[i];
                    if (to.sqrMagnitude < threshold)
                    {
                        indexMap[i] = buckets[x, y, z][j];
                        goto skip; // continue since we have seen this vertex before
                    }
                }

                indexMap[i] = newVertices.Count;
                buckets[x, y, z].Add(newVertices.Count);
                newVertices.Add(vertices[i]);

            skip:;
            }

            for (int i = 0; i < indices.Length; ++i)
            {
                newIndices[i] = indexMap[indices[i]];
            }

            return (newVertices.ToArray(), newIndices);
        }

        public class DisJointSet
        {
            int[] parents;
            int[] ranks;
            public DisJointSet(int size)
            {
                ranks = new int[size];
                parents = new int[size];
                for (int i = 0; i < size; ++i)
                {
                    parents[i] = i;
                }
            }

            public int Root(int i)
            {
                while (i != parents[i]) // If i is not root of tree we set i to his parent until we reach root (parent of all parents)
                    i = parents[i];
                return i;
            }

            public void Union(int a, int b)
            {
                int A = Root(a);
                int B = Root(b);
                if (A == B) return;

                if (ranks[A] > ranks[B])
                {
                    parents[B] = A;
                }
                else
                {
                    parents[A] = B;
                    if (ranks[A] == ranks[B])
                    {
                        ranks[B]++;
                    }
                }
            }
        }

        // https://stackoverflow.com/questions/24571624/separating-mesh
        // https://stackoverflow.com/questions/46383172/disjoint-set-implementation-in-c-sharp
        private static Surface[] SplitNavmesh(Vector3[] vertices, int[] indices)
        {
            DisJointSet set = new DisJointSet(vertices.Length);
            for (int i = 0; i < indices.Length;)
            {
                // Get triangle
                int i1 = indices[i++];
                int i2 = indices[i++];
                int i3 = indices[i++];

                set.Union(i1, i2);
                set.Union(i1, i3);
            }

            Dictionary<int, int> indexMap = new Dictionary<int, int>();
            Dictionary<int, Surface> surfaces = new Dictionary<int, Surface>();

            for (int i = 0; i < vertices.Length; ++i)
            {
                int root = set.Root(i);
                if (!surfaces.ContainsKey(root))
                    surfaces.Add(root, new Surface());
                Surface surface = surfaces[root];
                indexMap.Add(i, surface.vertices.Count);
                surface.vertices.Add(vertices[i]);
            }

            for (int i = 0; i < indices.Length; ++i)
            {
                int root = set.Root(indices[i]);
                Surface surface = surfaces[root];
                surface.indices.Add(indexMap[indices[i]]);
            }

            return surfaces.Values.ToArray();
        }

        private class Surface
        {
            public List<Vector3> vertices = new List<Vector3>();
            public List<int> indices = new List<int>();
        }

        private static Mesh[] surfaces = new Mesh[0];
        private static HashSet<int> contacts = new HashSet<int>();

        [HarmonyPatch(typeof(PlayerAgent), nameof(PlayerAgent.Update))]
        [HarmonyPostfix]
        private static void PlayerUpdate(PlayerAgent __instance)
        {
            if (surfaces.Length == 0) return;

            Vector3 pos = __instance.transform.position;

            // find closest surface below agent (TODO: Make more efficient with a lookup spatial partition or something)
            // => only record navmeshes once player has exited elevator to prevent dodgy surfaces from elevator being made
            int closest = 0;
            Mesh surface = surfaces[0];
            float distance = (pos - surfaces[0].bounds.ClosestPoint(pos)).sqrMagnitude;
            for (int i = 1; i < surfaces.Length; ++i)
            {
                //if (pos.y <= surfaces[i].bounds.max.y || (pos.y >= surfaces[i].bounds.min.y && pos.y <= surfaces[i].bounds.max.y)) continue;
                float dist = (pos - surfaces[i].bounds.ClosestPoint(pos)).sqrMagnitude;
                if (dist < distance)
                {
                    closest = i;
                    distance = dist;
                    surface = surfaces[i];
                }
            }
            //if (pos.y <= surface.bounds.max.y || (pos.y >= surface.bounds.min.y && pos.y <= surface.bounds.max.y)) return;
            contacts.Add(closest);
        }

        [HarmonyPatch(typeof(RundownManager), nameof(RundownManager.EndGameSession))]
        [HarmonyPrefix]
        private static void EndGameSession()
        {
            StringBuilder data = new StringBuilder();

            data.Append("[");
            string seperator = string.Empty;
            foreach (int contact in contacts)
            {
                data.Append($"{seperator}{contact}");
                seperator = ",";
            }
            data.Append("]");

            File.WriteAllText($"contacts.json", data.ToString());
        }

        private static void SaveNavMeshToDisk()
        {
            NavMeshTriangulation triangulation = NavMesh.CalculateTriangulation();

            APILogger.Debug($"Merging nearby vertices...");

            Vector3[] vertices = triangulation.vertices;
            int[] indices = triangulation.indices;
            (vertices, indices) = AutoWeld(vertices, indices, 0.05f, 1.3f);

            APILogger.Debug($"Splitting navmesh...");
            Surface[] surfaceBuffer = SplitNavmesh(vertices, indices);

            APILogger.Debug($"Generated {surfaceBuffer.Length} surfaces. Converting to meshes...");
            // Convert surfaces to meshes
            surfaces = new Mesh[surfaceBuffer.Length];
            for (int i = 0; i < surfaceBuffer.Length; ++i)
            {
                surfaces[i] = new Mesh();
                surfaces[i].vertices = surfaceBuffer[i].vertices.ToArray();
                surfaces[i].triangles = surfaceBuffer[i].indices.ToArray();
                //surfaces[i].Optimize(); // Causes bepinex to crash?
            }

            APILogger.Debug($"Save surfaces to disk");

            StringBuilder data = new StringBuilder();

            data.Append("[");
            string seperator = string.Empty;
            for (int i = 0; i < surfaceBuffer.Length; ++i)
            {
                Surface s = surfaceBuffer[i];
                data.Append($"{seperator}{{\"vertices\":[");
                string _seperator = string.Empty;
                for (int j = 0; j < s.vertices.Count; ++j)
                {
                    data.Append($"{_seperator}{s.vertices[j].x},{s.vertices[j].y},{s.vertices[j].z}");
                    _seperator = ",";
                }
                data.Append("],\"indices\":[");
                _seperator = string.Empty;
                for (int j = 0; j < s.indices.Count; ++j)
                {
                    data.Append($"{_seperator}{s.indices[j]}");
                    _seperator = ",";
                }
                data.Append("]}");
                seperator = ",";
            }
            data.Append("]");

            File.WriteAllText($"Reality.json", data.ToString());
        }

        // Called when a dimension navmesh is finished
        [HarmonyPatch(typeof(MapDetails), nameof(MapDetails.OnNavMeshGenerationDone))]
        [HarmonyPostfix]
        private static void OnNavmeshDone(MapDetails __instance)
        {
            SaveNavMeshToDisk();
        }

        [HarmonyPatch(typeof(GS_InLevel), nameof(GS_InLevel.Enter))]
        [HarmonyPrefix]
        private static void InLevelEnter(GS_InLevel __instance)
        {
            APILogger.Debug($"Entered Level!");
        }
    }
}
