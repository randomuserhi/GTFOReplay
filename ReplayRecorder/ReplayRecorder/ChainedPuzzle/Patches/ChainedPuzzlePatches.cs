using ChainedPuzzles;
using HarmonyLib;
using Player;

namespace ReplayRecorder.ChainedPuzzle.Patches {
    [HarmonyPatch]
    class ChainedPuzzlePatches {
        // NOTE(randomuserhi): The following is called on elevator drop
        /*[HarmonyPatch(typeof(ChainedPuzzleManager), nameof(ChainedPuzzleManager.CreatePuzzleInstance), new Type[] {
            typeof(ChainedPuzzleDataBlock),
            typeof(LG_Area),
            typeof(LG_Area),
            typeof(Vector3),
            typeof(Transform),
            typeof(bool)
        })]
        [HarmonyPostfix]
        private static void Postfic_CreatePuzzleInstance(ChainedPuzzleInstance __result) {
            APILogger.Debug("Created chained puzzle instance.");
        }*/

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
