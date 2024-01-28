using ChainedPuzzles;
using HarmonyLib;
using LevelGeneration;

namespace ReplayRecorder.ChainedPuzzle.Patches {
    [HarmonyPatch]
    class HolopathPatches {
        private static byte dimensionIndex = 0;

        [HarmonyPatch(typeof(CP_Hack_Core), nameof(CP_Hack_Core.OnSyncStateChange))]
        [HarmonyPrefix]
        private static void Prefix_CP_Hack_Core(CP_Hack_Core __instance) {
            dimensionIndex = (byte)ChainedPuzzleManager.Current.m_instances[__instance.m_puzzleIndex].m_sourceArea.m_courseNode.m_dimension.DimensionIndex;
        }
        [HarmonyPatch(typeof(CP_Hack_Core), nameof(CP_Hack_Core.OnSyncStateChange))]
        [HarmonyPostfix]
        private static void Postfix_CP_Hack_Core(CP_Hack_Core __instance) {
            dimensionIndex = 0;
        }

        [HarmonyPatch(typeof(CP_Cluster_Core), nameof(CP_Cluster_Core.OnSyncStateChange))]
        [HarmonyPrefix]
        private static void Prefix_CP_Cluster_Core(CP_Cluster_Core __instance) {
            dimensionIndex = (byte)ChainedPuzzleManager.Current.m_instances[__instance.m_puzzleIndex].m_sourceArea.m_courseNode.m_dimension.DimensionIndex;
        }
        [HarmonyPatch(typeof(CP_Cluster_Core), nameof(CP_Cluster_Core.OnSyncStateChange))]
        [HarmonyPostfix]
        private static void Postfix_CP_Cluster_Core(CP_Cluster_Core __instance) {
            dimensionIndex = 0;
        }

        [HarmonyPatch(typeof(CP_Bioscan_Core), nameof(CP_Bioscan_Core.OnSyncStateChange))]
        [HarmonyPrefix]
        private static void Prefix_CP_Bioscan_Core(CP_Bioscan_Core __instance) {
            dimensionIndex = (byte)ChainedPuzzleManager.Current.m_instances[__instance.m_puzzleIndex].m_sourceArea.m_courseNode.m_dimension.DimensionIndex;
        }
        [HarmonyPatch(typeof(CP_Bioscan_Core), nameof(CP_Bioscan_Core.OnSyncStateChange))]
        [HarmonyPostfix]
        private static void Postfix_CP_Bioscan_Core(CP_Bioscan_Core __instance) {
            dimensionIndex = 0;
        }

        [HarmonyPatch(typeof(LG_BulkheadDoorController_Core), nameof(LG_BulkheadDoorController_Core.SyncStatusChanged))]
        [HarmonyPrefix]
        private static void Prefix_LG_BulkheadDoorController_Core(LG_BulkheadDoorController_Core __instance) {
            dimensionIndex = (byte)__instance.SpawnNode.m_dimension.DimensionIndex;
        }
        [HarmonyPatch(typeof(LG_BulkheadDoorController_Core), nameof(LG_BulkheadDoorController_Core.SyncStatusChanged))]
        [HarmonyPostfix]
        private static void Postfix_LG_BulkheadDoorController_Core(LG_BulkheadDoorController_Core __instance) {
            dimensionIndex = 0;
        }

        [HarmonyPatch(typeof(CP_Holopath_Spline), nameof(CP_Holopath_Spline.Reveal))]
        [HarmonyPostfix]
        private static void Postfix_CP_Holopath_Reveal(CP_Holopath_Spline __instance) {
            ChainedPuzzle.SpawnHolopath(__instance, dimensionIndex);
        }

        [HarmonyPatch(typeof(CP_Holopath_Spline), nameof(CP_Holopath_Spline.SetVisible))]
        [HarmonyPostfix]
        private static void Postfix_CP_Holopath_Visible(CP_Holopath_Spline __instance, bool vis) {
            int instance = __instance.GetInstanceID();
            if (!vis) {
                ChainedPuzzle.DespawnHolopath(instance);
            } else {
                ChainedPuzzle.SpawnHolopath(__instance, dimensionIndex);
            }
        }
    }
}
