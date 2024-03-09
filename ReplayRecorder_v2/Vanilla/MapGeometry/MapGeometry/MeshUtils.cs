using UnityEngine;

namespace Vanilla.Map {
    internal static class MeshUtils {
        // light class to describe a mesh
        public class Surface {
            public List<Vector3> vertices = new List<Vector3>();
            public List<int> indices = new List<int>();

            public Surface() { }

            public Mesh ToMesh() {
                Mesh m = new Mesh();
                m.vertices = vertices.ToArray();
                m.triangles = indices.ToArray();
                return m;
            }
        }

        // Union-Find data structure for seperating mesh surfaces
        // https://stackoverflow.com/questions/46383172/disjoint-set-implementation-in-c-sharp
        private class DisJointSet {
            int[] parents;
            int[] ranks;
            public DisJointSet(int size) {
                ranks = new int[size];
                parents = new int[size];
                for (int i = 0; i < size; ++i) {
                    parents[i] = i;
                }
            }

            public int Root(int i) {
                while (i != parents[i]) // If i is not root of tree we set i to its parent until we reach root (parent of all parents)
                    i = parents[i];
                return i;
            }

            public void Union(int a, int b) {
                int A = Root(a);
                int B = Root(b);
                if (A == B) return;

                if (ranks[A] > ranks[B]) {
                    parents[B] = A;
                } else {
                    parents[A] = B;
                    if (ranks[A] == ranks[B]) {
                        ranks[B]++;
                    }
                }
            }
        }

        // https://gamedev.stackexchange.com/questions/165643/how-to-calculate-the-surface-area-of-a-mesh
        public static float GetSurfaceArea(Mesh mesh) {
            var triangles = mesh.triangles;
            var vertices = mesh.vertices;

            double sum = 0.0;

            for (int i = 0; i < triangles.Length; i += 3) {
                Vector3 corner = vertices[triangles[i]];
                Vector3 a = vertices[triangles[i + 1]] - corner;
                Vector3 b = vertices[triangles[i + 2]] - corner;

                sum += Vector3.Cross(a, b).magnitude;
            }

            return (float)(sum / 2.0);
        }

        // https://stackoverflow.com/questions/24571624/separating-mesh
        // Seperates a navmesh into different surfaces
        public static Surface[] SplitNavmesh(Vector3[] vertices, int[] indices) {
            DisJointSet set = new DisJointSet(vertices.Length);
            for (int i = 0; i < indices.Length;) {
                // Get triangle
                int i1 = indices[i++];
                int i2 = indices[i++];
                int i3 = indices[i++];

                set.Union(i1, i2);
                set.Union(i1, i3);
            }

            Dictionary<int, int> indexMap = new Dictionary<int, int>();
            Dictionary<int, Surface> surfaces = new Dictionary<int, Surface>();

            for (int i = 0; i < vertices.Length; ++i) {
                int root = set.Root(i);
                if (!surfaces.ContainsKey(root))
                    surfaces.Add(root, new Surface());
                Surface surface = surfaces[root];
                indexMap.Add(i, surface.vertices.Count);
                surface.vertices.Add(vertices[i]);
            }

            for (int i = 0; i < indices.Length; ++i) {
                int root = set.Root(indices[i]);
                Surface surface = surfaces[root];
                surface.indices.Add(indexMap[indices[i]]);
            }

            return surfaces.Values.ToArray();
        }

        private static Vector3 ClosestPoint(Vector3 point, Vector3 line1, Vector3 line2) {
            Vector3 dir = (line2 - line1);
            Vector3 v = point - line1;
            float t = Vector3.Dot(v, dir) / Vector3.Dot(dir, dir);
            if (t < 0) return line1;
            else if (t > 1) return line2;
            return line1 + dir * t;
        }
        private static Vector3 EstimateClosestPoint(Vector3 point, Vector3 tri1, Vector3 tri2, Vector3 tri3) {
            Vector3 planeNormal = Vector3.Cross(tri2 - tri1, tri3 - tri1);
            point = point - Vector3.Dot(planeNormal, point - tri1) * planeNormal;

            Vector3 c1 = ClosestPoint(point, tri1, tri2);
            Vector3 c2 = ClosestPoint(point, tri2, tri3);
            Vector3 c3 = ClosestPoint(point, tri3, tri1);

            float mag1 = (point - c1).sqrMagnitude;
            float mag2 = (point - c2).sqrMagnitude;
            float mag3 = (point - c3).sqrMagnitude;

            float min = Mathf.Min(mag1, mag2);
            min = Mathf.Min(min, mag3);

            if (min == mag1) {
                return c1;
            } else if (min == mag2) {
                return c2;
            }
            return c3;
        }

        public static Mesh[] GetNearbyMeshes(Vector3 point, float radius, Mesh[] meshes) {
            List<Mesh> nearbyMeshes = new List<Mesh>();
            for (int i = 0; i < meshes.Length; ++i) {
                Mesh mesh = meshes[i];
                Vector3 C1 = mesh.bounds.min;
                Vector3 C2 = mesh.bounds.max;
                float radiusSqr = radius * radius;
                if (point.x < C1.x) radiusSqr -= (point.x - C1.x) * (point.x - C1.x);
                else if (point.x > C2.x) radiusSqr -= (point.x - C2.x) * (point.x - C2.x);
                if (point.y < C1.y) radiusSqr -= (point.y - C1.y) * (point.y - C1.y);
                else if (point.y > C2.y) radiusSqr -= (point.y - C2.y) * (point.y - C2.y);
                if (point.z < C1.z) radiusSqr -= (point.z - C1.z) * (point.z - C1.z);
                else if (point.z > C2.z) radiusSqr -= (point.z - C2.z) * (point.z - C2.z);
                if (radiusSqr > 0) nearbyMeshes.Add(mesh);
            }
            return nearbyMeshes.ToArray();
        }

        // TODO(randomuserhi): Optimize using spatial partition / oct tree
        public static Vector3 EstimateClosestPoint(Vector3 point, Mesh mesh) {
            Vector3 closest = Vector3.zero;
            float distance = float.MaxValue;
            for (int i = 0; i < mesh.triangles.Length;) {
                Vector3 tri1 = mesh.vertices[mesh.triangles[i++]];
                Vector3 tri2 = mesh.vertices[mesh.triangles[i++]];
                Vector3 tri3 = mesh.vertices[mesh.triangles[i++]];

                Vector3 p = EstimateClosestPoint(point, tri1, tri2, tri3);
                float dist = (p - point).sqrMagnitude;
                if (dist < distance) {
                    distance = dist;
                    closest = p;
                }
            }
            return closest;
        }

        // Merge vertices that are within a threshhold of each other
        // Utilizes Spatial partitioning for performance (size of partition is based on bucketStep)
        // TODO(randomuserhi): Use a better algorithm -> the current one creates poor mesh topology
        public static (Vector3[], int[]) Weld(Vector3[] vertices, int[] indices, float threshold, float bucketStep = 1.3f) {
            threshold *= threshold;

            List<Vector3> newVertices = new List<Vector3>();
            int[] indexMap = new int[vertices.Length];

            // Find AABB
            Vector3 min = new Vector3(float.MaxValue, float.MaxValue, float.MaxValue);
            Vector3 max = new Vector3(float.MinValue, float.MinValue, float.MinValue);
            for (int i = 0; i < vertices.Length; i++) {
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
            for (int i = 0; i < vertices.Length; ++i) {
                // Determine which bucket it belongs to
                int x = Mathf.FloorToInt((vertices[i].x - min.x) / bucketStep);
                int y = Mathf.FloorToInt((vertices[i].y - min.y) / bucketStep);
                int z = Mathf.FloorToInt((vertices[i].z - min.z) / bucketStep);

                // Check to see if it's already been added
                if (buckets[x, y, z] == null)
                    buckets[x, y, z] = new List<int>(); // Make buckets lazily

                for (int j = 0; j < buckets[x, y, z].Count; ++j) {
                    Vector3 to = newVertices[buckets[x, y, z][j]] - vertices[i];
                    if (to.sqrMagnitude < threshold) {
                        indexMap[i] = buckets[x, y, z][j];
                        goto skip; // continue since we have seen this vertex before
                    }
                }

                indexMap[i] = newVertices.Count;
                buckets[x, y, z].Add(newVertices.Count);
                newVertices.Add(vertices[i]);

            skip:;
            }

            List<int> newIndices = new List<int>();
            for (int i = 0; i < indices.Length; i += 3) {
                int a = indexMap[indices[i]];
                int b = indexMap[indices[i + 1]];
                int c = indexMap[indices[i + 2]];
                if (a == b) continue;
                if (a == c) continue;
                if (b == c) continue;
                newIndices.Add(a);
                newIndices.Add(b);
                newIndices.Add(c);
            }

            return (newVertices.ToArray(), newIndices.ToArray());
        }
    }
}
