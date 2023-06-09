using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;

namespace ReplayRecorder.Map
{
    public static class MeshUtils
    {
        // light structure to describe a mesh
        public struct Surface
        {
            public List<Vector3> vertices = new List<Vector3>();
            public List<int> indices = new List<int>();

            public Surface() { }

            public Mesh ToMesh()
            {
                Mesh m = new Mesh();
                m.vertices = vertices.ToArray();
                m.triangles = indices.ToArray();
                return m;
            }
        }

        // Union-Find data structure for seperating mesh surfaces
        // https://stackoverflow.com/questions/46383172/disjoint-set-implementation-in-c-sharp
        private class DisJointSet
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
                while (i != parents[i]) // If i is not root of tree we set i to its parent until we reach root (parent of all parents)
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
        // Seperates a navmesh into different surfaces
        public static Surface[] SplitNavmesh(Vector3[] vertices, int[] indices)
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

        // Merge vertices that are within a threshhold of each other
        // Utilizes Spatial partitioning for performance (size of partition is based on bucketStep)
        public static (Vector3[], int[]) Weld(Vector3[] vertices, int[] indices, float threshold, float bucketStep = 1.3f)
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
    }
}
