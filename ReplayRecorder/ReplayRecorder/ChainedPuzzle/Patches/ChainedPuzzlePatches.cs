using ChainedPuzzles;
using HarmonyLib;
using LevelGeneration;
using Player;

namespace ReplayRecorder.ChainedPuzzle.Patches {
    [HarmonyPatch]
    class ChainedPuzzlePatches {
        [HarmonyPatch(typeof(CP_Hack_Core), nameof(CP_Hack_Core.Setup))]
        [HarmonyPostfix]
        private static void Postfix_CP_Hack_Core_Setup(CP_Hack_Core __instance, int puzzleIndex, iChainedPuzzleOwner owner, LG_Area sourceArea) {
            CP_Holopath_Spline? spline = __instance.m_spline.TryCast<CP_Holopath_Spline>();
            if (spline == null) return;
            byte dimension = (byte)sourceArea.m_courseNode.m_dimension.DimensionIndex;
            ChainedPuzzle.RegisterSplineDimension(spline.GetInstanceID(), dimension);
        }
        [HarmonyPatch(typeof(CP_Cluster_Core), nameof(CP_Cluster_Core.Setup))]
        [HarmonyPostfix]
        private static void Postfix_CP_Cluster_Core_Setup(CP_Cluster_Core __instance, int puzzleIndex, iChainedPuzzleOwner owner, LG_Area sourceArea) {
            CP_Holopath_Spline? spline = __instance.m_spline.TryCast<CP_Holopath_Spline>();
            if (spline == null) return;
            byte dimension = (byte)sourceArea.m_courseNode.m_dimension.DimensionIndex;
            ChainedPuzzle.RegisterSplineDimension(spline.GetInstanceID(), dimension);
        }

        [HarmonyPatch(typeof(CP_Bioscan_Core), nameof(CP_Bioscan_Core.Setup))]
        [HarmonyPostfix]
        private static void Postfix_CP_Bioscan_Core_Setup(CP_Bioscan_Core __instance, int puzzleIndex, iChainedPuzzleOwner owner, LG_Area sourceArea) {
            CP_Holopath_Spline? spline = __instance.m_spline.TryCast<CP_Holopath_Spline>();
            if (spline == null) return;
            byte dimension = (byte)sourceArea.m_courseNode.m_dimension.DimensionIndex;
            ChainedPuzzle.RegisterSplineDimension(spline.GetInstanceID(), dimension);
        }

        [HarmonyPatch(typeof(LG_BulkheadDoorController_Core), nameof(LG_BulkheadDoorController_Core.BuildBulkheadLogic))]
        [HarmonyPostfix]
        private static void Postfix_LG_BulkheadDoorController_Core(LG_BulkheadDoorController_Core __instance) {
            byte dimension = (byte)__instance.SpawnNode.m_dimension.DimensionIndex;
            foreach (iChainedPuzzleHolopathSpline s in __instance.m_bulkheadDoorSplines.Values) {
                CP_Holopath_Spline? spline = s.TryCast<CP_Holopath_Spline>();
                if (spline == null) return;
                ChainedPuzzle.RegisterSplineDimension(spline.GetInstanceID(), dimension);
            }
        }

        [HarmonyPatch(typeof(CP_Bioscan_Core), nameof(CP_Bioscan_Core.OnSyncStateChange))]
        [HarmonyPostfix]
        private static void Postfix_Bioscan_SetState(CP_Bioscan_Core __instance, eBioscanStatus status, float progress, List<PlayerAgent> playersInScan, int playersMax, bool[] reqItemStatus, bool isDropinState) {
            int instance = __instance.GetInstanceID();
            switch (status) {
            case eBioscanStatus.Waiting:
            case eBioscanStatus.Scanning:
                ChainedPuzzle.SpawnScanCircle(__instance);
                break;
            case eBioscanStatus.SplineReveal:
            case eBioscanStatus.TimedOut:
            case eBioscanStatus.Disabled:
            case eBioscanStatus.Finished:
                ChainedPuzzle.DespawnScanCircle(instance);
                break;
            }
        }
    }
}
