using API;
using ChainedPuzzles;
using HarmonyLib;
using LevelGeneration;
using Player;
using ReplayRecorder;

namespace Vanilla.Holopath.Patches {
    [HarmonyPatch]
    internal static class SpawnPatches {
        private static Dictionary<int, byte> splineDimensions = new Dictionary<int, byte>();
        private static void RegisterSplineDimension(int instance, byte dimension) {
            if (!splineDimensions.ContainsKey(instance)) {
                splineDimensions.Add(instance, dimension);
            }
        }

        [HarmonyPatch(typeof(CP_Hack_Core), nameof(CP_Hack_Core.Setup))]
        [HarmonyPostfix]
        private static void Postfix_CP_Hack_Core_Setup(CP_Hack_Core __instance, int puzzleIndex, iChainedPuzzleOwner owner, LG_Area sourceArea) {
            CP_Holopath_Spline? spline = __instance.m_spline.TryCast<CP_Holopath_Spline>();
            if (spline == null) return;
            byte dimension = (byte)sourceArea.m_courseNode.m_dimension.DimensionIndex;
            RegisterSplineDimension(spline.GetInstanceID(), dimension);
        }
        [HarmonyPatch(typeof(CP_Cluster_Core), nameof(CP_Cluster_Core.Setup))]
        [HarmonyPostfix]
        private static void Postfix_CP_Cluster_Core_Setup(CP_Cluster_Core __instance, int puzzleIndex, iChainedPuzzleOwner owner, LG_Area sourceArea) {
            CP_Holopath_Spline? spline = __instance.m_spline.TryCast<CP_Holopath_Spline>();
            if (spline == null) return;
            byte dimension = (byte)sourceArea.m_courseNode.m_dimension.DimensionIndex;
            RegisterSplineDimension(spline.GetInstanceID(), dimension);
        }

        [HarmonyPatch(typeof(CP_Bioscan_Core), nameof(CP_Bioscan_Core.Setup))]
        [HarmonyPostfix]
        private static void Postfix_CP_Bioscan_Core_Setup(CP_Bioscan_Core __instance, int puzzleIndex, iChainedPuzzleOwner owner, LG_Area sourceArea) {
            CP_Holopath_Spline? spline = __instance.m_spline.TryCast<CP_Holopath_Spline>();
            if (spline == null) return;
            byte dimension = (byte)sourceArea.m_courseNode.m_dimension.DimensionIndex;
            RegisterSplineDimension(spline.GetInstanceID(), dimension);
        }

        [HarmonyPatch(typeof(LG_BulkheadDoorController_Core), nameof(LG_BulkheadDoorController_Core.BuildBulkheadLogic))]
        [HarmonyPostfix]
        private static void Postfix_LG_BulkheadDoorController_Core(LG_BulkheadDoorController_Core __instance) {
            byte dimension = (byte)__instance.SpawnNode.m_dimension.DimensionIndex;
            foreach (iChainedPuzzleHolopathSpline s in __instance.m_bulkheadDoorSplines.Values) {
                CP_Holopath_Spline? spline = s.TryCast<CP_Holopath_Spline>();
                if (spline == null) return;
                RegisterSplineDimension(spline.GetInstanceID(), dimension);
            }
        }

        private static void SpawnHolopath(CP_Holopath_Spline holopath) {
            if (holopath.CurvySpline == null || holopath.CurvySpline.Length == 0) return;

            int id = holopath.GetInstanceID();
            if (Replay.Has<rHolopath>(id)) return;

            byte dimensionIndex;
            if (splineDimensions.ContainsKey(id)) {
                dimensionIndex = splineDimensions[id];
            } else {
                APILogger.Warn("Could not get holopath dimension, falling back to player dimension.");
                dimensionIndex = (byte)PlayerManager.GetLocalPlayerAgent().DimensionIndex;
            }

            Replay.Spawn(new rHolopath(holopath, dimensionIndex));
        }

        [HarmonyPatch(typeof(CP_Holopath_Spline), nameof(CP_Holopath_Spline.Reveal))]
        [HarmonyPostfix]
        private static void Postfix_CP_Holopath_Reveal(CP_Holopath_Spline __instance) {
            SpawnHolopath(__instance);
        }

        [HarmonyPatch(typeof(CP_Holopath_Spline), nameof(CP_Holopath_Spline.SetVisible))]
        [HarmonyPostfix]
        private static void Postfix_CP_Holopath_Visible(CP_Holopath_Spline __instance, bool vis) {
            int id = __instance.GetInstanceID();
            if (!vis && Replay.Has<rHolopath>(id)) {
                Replay.Despawn(Replay.Get<rHolopath>(id));
            } else {
                SpawnHolopath(__instance);
            }
        }
    }
}
