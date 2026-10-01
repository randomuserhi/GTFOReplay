using API;
using HarmonyLib;
using Il2CppInterop.Runtime.InteropTypes.Arrays;
using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using System.Text.Json;
using UnityEngine;

namespace Vanilla.Map {
    [HarmonyPatch]
    internal static class NativeSurfaces {
        internal sealed record Asset(string Id, string Revision, string Mesh, int Vertices, string?[] Materials, bool IsFloor);
        internal sealed record Instance(Asset Asset, byte Dimension, bool Enabled, Matrix4x4 Matrix);
        private sealed record Captured(Asset Asset, bool Enabled);
        private static readonly Dictionary<int, Captured> captured = new();
        private static readonly Dictionary<int, Instance> merged = new();
        private static readonly Dictionary<int, bool> culledEnabled = new();
        private static readonly Dictionary<byte, LG_DimensionRoot> roots = new();
        private static readonly List<string> diagnostics = new();
        private static Dictionary<string, Asset[]>? catalog;
        private static readonly string[] UnitySuffixes = { " (Instance)", " (Clone)", "(Clone)" };
        private static int sourcePasses;
        private static int mergesWithoutDimension;
        private static bool finished = true;
        private static bool failed;

        [ReplayInit]
        private static void Init() {
            captured.Clear(); merged.Clear(); culledEnabled.Clear(); roots.Clear(); diagnostics.Clear();
            sourcePasses = mergesWithoutDimension = 0; finished = false; failed = false;
        }

        [ReplayOnExpeditionEnd]
        private static void Cleanup() { finished = true; captured.Clear(); merged.Clear(); culledEnabled.Clear(); roots.Clear(); }

        // GTFO merges repeated room meshes itself before Unity batching. Original
        // renderers can be removed, so retaining only their instance IDs is insufficient.
        [HarmonyPatch(typeof(LG_MergeStaticMeshes), nameof(LG_MergeStaticMeshes.Build))]
        [HarmonyPrefix]
        private static void BeforeRoomMerge(LG_MergeStaticMeshes __instance) {
            PreserveAreaSources(__instance.m_area);
        }

        [HarmonyPatch(typeof(LG_AreaInstancedRendering), nameof(LG_AreaInstancedRendering.Setup))]
        [HarmonyPrefix]
        private static void BeforeAreaInstancing(LG_AreaInstancedRendering __instance) => PreserveAreaSources(__instance.area);

        [HarmonyPatch(typeof(LG_MergeStaticIRFsJob), nameof(LG_MergeStaticIRFsJob.ProcessArea))]
        [HarmonyPrefix]
        private static void BeforeFeatureMerge(LG_Area __0) => PreserveAreaSources(__0);

        private static void PreserveAreaSources(LG_Area area) {
            if (finished || failed) return;
            try {
                ++sourcePasses;
                // Room builds can precede LG_DimensionRoot.Setup. The area's course
                // node already owns the dimension, even when roots is still empty.
                var dimension = area.m_courseNode?.m_dimension;
                if (dimension == null) { ++mergesWithoutDimension; return; }
                foreach (var renderer in area.GetComponentsInChildren<MeshRenderer>(true)) {
                    SaveEnabled(renderer);
                    var id = renderer.GetInstanceID();
                    if (!captured.TryGetValue(id, out var source) || merged.ContainsKey(id)) continue;
                    var active = area.gameObject.activeSelf;
                    for (var parent = renderer.transform; parent != null && parent != area.transform; parent = parent.parent)
                        active &= parent.gameObject.activeSelf;
                    merged[id] = new(source.Asset, (byte)dimension.DimensionIndex,
                        source.Enabled && active, renderer.transform.localToWorldMatrix);
                }
            } catch (Exception error) { Fail(error); }
        }

        [HarmonyPatch(typeof(LG_DimensionRoot), nameof(LG_DimensionRoot.Setup))]
        [HarmonyPostfix]
        private static void OnDimensionSetup(LG_DimensionRoot __instance) {
            if (!finished) roots[(byte)__instance.LinkedDimensionIndex] = __instance;
        }

        private static Dictionary<string, Asset[]> Catalog {
            get {
                if (catalog != null) return catalog;
                using var stream = typeof(NativeSurfaces).Assembly.GetManifestResourceStream("Vanilla.NativeSurfaces.json")
                    ?? throw new InvalidDataException("Embedded native floor catalog is missing.");
                using var doc = JsonDocument.Parse(stream);
                if (doc.RootElement.GetProperty("version").GetInt32() != 1) throw new InvalidDataException("Unsupported native floor catalog.");
                catalog = doc.RootElement.GetProperty("models").EnumerateArray().Select(row => {
                    var identity = row.GetProperty("capture");
                    return new Asset(row.GetProperty("id").GetString()!, row.GetProperty("sourceRevision").GetString()!,
                        identity.GetProperty("mesh").GetString()!, identity.GetProperty("vertices").GetInt32(),
                        identity.GetProperty("materials").EnumerateArray().Select(value => value.GetString()).ToArray(), row.GetProperty("kind").GetString() == "floor");
                }).GroupBy(asset => asset.Mesh).ToDictionary(group => group.Key, group => group.ToArray());
                return catalog;
            }
        }

        private static Asset? Match(MeshRenderer renderer) {
            var mesh = renderer.GetComponent<MeshFilter>()?.sharedMesh;
            return Match(mesh, renderer.sharedMaterials.ToArray());
        }

        private static Asset? Match(Mesh? mesh, Material?[] materials) {
            if (mesh == null || !Catalog.TryGetValue(NativeName(mesh.name), out var candidates)) return null;
            return candidates.SingleOrDefault(asset => asset.Vertices == mesh.vertexCount &&
                asset.Materials.Length == materials.Length && materials.Select((material, i) => material == null ? asset.Materials[i] == null : NativeName(material.name) == asset.Materials[i]).All(value => value));
        }

        // Unity clones keep their source identity; serial labels and arbitrary names do not.
        internal static string NativeName(string name) {
            foreach (var suffix in UnitySuffixes)
                if (name.EndsWith(suffix, StringComparison.Ordinal)) return name[..^suffix.Length];
            return name;
        }

        // Preserve source identities before batching changes a MeshFilter. The native
        // static-batch flag is not reliable evidence that the source mesh was replaced.
        [HarmonyPatch(typeof(InternalStaticBatchingUtility), nameof(InternalStaticBatchingUtility.CombineGameObjects))]
        [HarmonyPrefix]
        private static void BeforeStaticBatch(Il2CppReferenceArray<GameObject> __0) {
            if (finished || failed) return;
            try {
                foreach (var gameObject in __0) {
                    if (gameObject == null) continue;
                    var renderer = gameObject.GetComponent<MeshRenderer>();
                    SaveEnabled(renderer);
                }
            } catch (Exception error) { Fail(error); }
        }

        [HarmonyPatch(typeof(LG_PrefabSpawner), nameof(LG_PrefabSpawner.OnBuild))]
        [HarmonyPostfix]
        private static void OnPrefabBuilt(GameObject __result) {
            if (__result != null) SaveEnabled(__result);
        }

        // Game visibility culling and indirect draws disable Renderers without removing floors.
        [HarmonyPatch]
        private static class BucketCulling {
            private static IEnumerable<System.Reflection.MethodBase> TargetMethods() {
                yield return AccessTools.Method(typeof(CullingSystem.C_CullBucket), "Hide");
                yield return AccessTools.Method(typeof(CullingSystem.C_CullBucket), "HideSafe");
            }
            private static void Prefix(CullingSystem.C_CullBucket __instance) {
                if (finished || failed) return;
                try { foreach (var renderer in __instance.Renderers) SaveEnabled(renderer.TryCast<MeshRenderer>()); }
                catch (Exception error) { Fail(error); }
            }
        }

        [HarmonyPatch]
        private static class ClusterCulling {
            private static IEnumerable<System.Reflection.MethodBase> TargetMethods() {
                yield return AccessTools.Method(typeof(CullingSystem.C_CullingCluster), "Hide");
                yield return AccessTools.Method(typeof(CullingSystem.C_CullingCluster), "HideSafe");
            }
            private static void Prefix(CullingSystem.C_CullingCluster __instance) {
                if (finished || failed) return;
                try { foreach (var renderer in __instance.Renderers) SaveEnabled(renderer.TryCast<MeshRenderer>()); }
                catch (Exception error) { Fail(error); }
            }
        }

        [HarmonyPatch(typeof(IndirectBatcher), nameof(IndirectBatcher.CreateBatches))]
        [HarmonyPrefix]
        private static void BeforeIndirectBatch(IndirectBatcher __instance) => SaveEnabled(__instance.gameObject);

        private static void SaveEnabled(GameObject gameObject) {
            if (finished || failed) return;
            try {
                foreach (var renderer in gameObject.GetComponentsInChildren<MeshRenderer>(true)) {
                    SaveEnabled(renderer);
                }
            } catch (Exception error) { Fail(error); }
        }

        private static void SaveEnabled(MeshRenderer? renderer) {
            if (renderer == null) return;
            var id = renderer.GetInstanceID();
            if (captured.ContainsKey(id)) {
                if (!culledEnabled.ContainsKey(id)) culledEnabled[id] = renderer.enabled;
                return;
            }
            var asset = Match(renderer);
            if (asset == null) return;
            if (!culledEnabled.ContainsKey(id)) culledEnabled[id] = renderer.enabled;
            // Indirect batching can replace the source mesh as well as disable its renderer.
            captured[id] = new(asset, renderer.enabled);
        }

        private static bool LogicalEnabled(MeshRenderer renderer) => culledEnabled.TryGetValue(renderer.GetInstanceID(), out var enabled) ? enabled : renderer.enabled;

        // Area instancing draws its own mesh/material/matrix batches. Sources can
        // disappear from the MeshRenderer hierarchy, so read the committed draw
        // data as well as preserving the sources before Setup.
        private static (int Batches, int Instances) CaptureAreaBatches(LG_DimensionRoot root, List<Instance> instances) {
            var seen = instances.Where(instance => instance.Enabled)
                .Select(instance => (instance.Asset.Id, instance.Dimension, instance.Matrix)).ToHashSet();
            int batchCount = 0, instanceCount = 0;
            foreach (var rendering in root.GetComponentsInChildren<LG_AreaInstancedRendering>(true)) {
                var batches = rendering.m_batches;
                if (batches == null) continue;
                // Each submesh is a separate draw. Reassemble its complete
                // material signature for each original mesh placement.
                var placements = new Dictionary<(int Mesh, Matrix4x4 Matrix), (Mesh Mesh, Material?[] Materials)>();
                foreach (var batch in batches) {
                    ++batchCount;
                    var mesh = batch.mesh;
                    if (mesh == null || batch.transforms == null) continue;
                    if (batch.submesh < 0 || batch.submesh >= mesh.subMeshCount)
                        throw new InvalidDataException("Invalid native area batch submesh.");
                    foreach (var matrix in batch.transforms) {
                        var key = (mesh.GetInstanceID(), matrix);
                        if (!placements.TryGetValue(key, out var placement))
                            placements[key] = placement = (mesh, new Material?[mesh.subMeshCount]);
                        placement.Materials[batch.submesh] = batch.material;
                    }
                }
                foreach (var (key, placement) in placements) {
                    var asset = Match(placement.Mesh, placement.Materials);
                    if (asset == null) continue;
                    for (int i = 0; i < 16; ++i)
                        if (!float.IsFinite(key.Matrix[i])) throw new InvalidDataException("Non-finite native area batch matrix.");
                    var dimension = (byte)root.LinkedDimensionIndex;
                    if (!seen.Add((asset.Id, dimension, key.Matrix))) continue;
                    // Membership in the committed batch establishes logical
                    // visibility, independently of camera culling of the area.
                    instances.Add(new(asset, dimension, true, key.Matrix));
                    ++instanceCount;
                }
            }
            return (batchCount, instanceCount);
        }

        private static void Fail(Exception error) {
            failed = true;
            diagnostics.Add($"Native floor capture failed; this recording retains basic navigation geometry: {error.Message}");
            APILogger.Error($"{diagnostics.Last()} {error}");
        }

        [ReplayOnElevatorStop]
        private static void Capture() {
            if (finished) return;
            var instances = new List<Instance>();
            try {
                if (failed) return;
                instances.AddRange(merged.Values);
                var seen = new HashSet<int>(merged.Keys);
                int unresolvedBatches = 0;
                int areaBatches = 0, areaInstances = 0;
                var unmatched = new HashSet<string>();
                if (roots.Count == 0) throw new InvalidDataException("No generated dimension roots were captured.");
                foreach (var root in roots.Values) {
                    if (root == null) throw new InvalidDataException("A generated dimension root was destroyed before capture.");
                    foreach (var renderer in root.GetComponentsInChildren<MeshRenderer>(true)) {
                        if (!seen.Add(renderer.GetInstanceID())) continue;
                        Asset? asset;
                        bool enabled;
                        if (captured.TryGetValue(renderer.GetInstanceID(), out var original)) {
                            asset = original.Asset;
                            enabled = original.Enabled;
                        } else {
                            asset = Match(renderer);
                            if (asset == null) {
                                if (renderer.isPartOfStaticBatch) ++unresolvedBatches;
                                var mesh = renderer.GetComponent<MeshFilter>()?.sharedMesh;
                                if (unmatched.Count < 8 && mesh != null && Catalog.TryGetValue(NativeName(mesh.name), out var candidates)
                                    && candidates.Any(candidate => candidate.IsFloor && candidate.Vertices == mesh.vertexCount))
                                    unmatched.Add($"{mesh.name}; vertices={mesh.vertexCount}; materials={string.Join(",", renderer.sharedMaterials.Select(material => material == null ? "<null>" : material.name))}");
                                continue;
                            }
                            enabled = LogicalEnabled(renderer);
                        }
                        // Transform keeps the original object's placement through static
                        // batching; Renderer.localToWorldMatrix can address combined vertices.
                        var matrix = renderer.transform.localToWorldMatrix;
                        for (int i = 0; i < 16; ++i) if (!float.IsFinite(matrix[i])) throw new InvalidDataException("Non-finite native floor matrix.");
                        // A whole inactive dimension is hidden by the Viewer dimension switch.
                        // Preserve inactive objects inside it without baking camera/dimension culling.
                        var active = true;
                        for (var parent = renderer.transform; parent != null && parent != root.transform; parent = parent.parent) active &= parent.gameObject.activeSelf;
                        instances.Add(new(asset, (byte)root.LinkedDimensionIndex, enabled && active, matrix));
                    }
                    var areaCapture = CaptureAreaBatches(root, instances);
                    areaBatches += areaCapture.Batches;
                    areaInstances += areaCapture.Instances;
                }
                if (unresolvedBatches > 0) {
                    // Most are intentionally excluded walls/ceilings; do not label them missing floor assets.
                    APILogger.Debug($"Native floors: skipped {unresolvedBatches} out-of-catalog or unresolved batched level renderers.");
                }
                var floorCount = instances.Count(instance => instance.Asset.IsFloor && instance.Enabled);
                if (floorCount == 0) {
                    diagnostics.Add($"No exact native floor identities matched this level; retaining basic navigation geometry. Scanned={seen.Count}; capturedBeforeBatching={captured.Count}; unresolvedBatches={unresolvedBatches}.");
                }
                foreach (var identity in unmatched) diagnostics.Add($"Unmatched native floor identity: {identity}");
                APILogger.Warn($"Captured {instances.Count} native scene instances, including {floorCount} enabled floor instances, {merged.Count} sources preserved before area merging/instancing (sourcePasses={sourcePasses}, withoutDimension={mergesWithoutDimension}), and {areaInstances} additional instances from {areaBatches} native area batches.");
            } catch (Exception error) { instances.Clear(); Fail(error); }
            finally {
                try { Replay.Trigger(new rNativeSurfaces(instances, diagnostics.ToArray())); }
                finally { Cleanup(); }
            }
        }
    }

    [ReplayData("Vanilla.Map.NativeSurfaces", "0.0.1")]
    internal sealed class rNativeSurfaces : ReplayHeader {
        private readonly List<NativeSurfaces.Instance> instances;
        private readonly string[] diagnostics;
        internal rNativeSurfaces(List<NativeSurfaces.Instance> instances, string[] diagnostics) { this.instances = instances; this.diagnostics = diagnostics; }
        public override void Write(ByteBuffer buffer) {
            var assets = instances.Select(instance => instance.Asset).Distinct().ToArray();
            var indices = assets.Select((asset, index) => (asset.Id, Index: checked((ushort)index))).ToDictionary(value => value.Id, value => value.Index);
            BitHelper.WriteBytes(checked((ushort)diagnostics.Length), buffer);
            foreach (var diagnostic in diagnostics) BitHelper.WriteBytes(diagnostic, buffer);
            BitHelper.WriteBytes(checked((ushort)assets.Length), buffer);
            foreach (var asset in assets) { BitHelper.WriteBytes(asset.Id, buffer); BitHelper.WriteBytes(asset.Revision, buffer); }
            BitHelper.WriteBytes(checked((uint)instances.Count), buffer);
            foreach (var instance in instances) {
                BitHelper.WriteBytes(indices[instance.Asset.Id], buffer);
                BitHelper.WriteBytes(instance.Dimension, buffer);
                BitHelper.WriteBytes(instance.Enabled, buffer);
                // Unity's scalar indexer and Three.fromArray both use column-major storage.
                for (int i = 0; i < 16; ++i) BitHelper.WriteBytes(instance.Matrix[i], buffer);
            }
        }
    }
}
