using API;
using ChainedPuzzles;
using HarmonyLib;
using Player;
using ReplayRecorder;

namespace Vanilla.Bioscan.Patches {
    [HarmonyPatch]
    internal static class SpawnPatches {
        [HarmonyPatch(typeof(CP_Bioscan_Core), nameof(CP_Bioscan_Core.OnSyncStateChange))]
        [HarmonyPostfix]
        private static void Postfix_Bioscan_SetState(CP_Bioscan_Core __instance, eBioscanStatus status, float progress, List<PlayerAgent> playersInScan, int playersMax, bool[] reqItemStatus, bool isDropinState) {
            CP_PlayerScanner? pscanner = __instance.m_playerScanner.TryCast<CP_PlayerScanner>();
            if (pscanner == null) {
                APILogger.Error("Unable to find pscanner component for bioscan.");
                return;
            }

            int id = __instance.GetInstanceID();
            switch (status) {
            case eBioscanStatus.Waiting:
            case eBioscanStatus.Scanning:
                if (!Replay.Has<rBioscan>(id)) Replay.Spawn(new rBioscan(__instance, pscanner.m_scanRadius));
                if (!Replay.Has<rBioscanStatus>(id)) Replay.Spawn(new rBioscanStatus(__instance));
                break;
            case eBioscanStatus.SplineReveal:
            case eBioscanStatus.TimedOut:
            case eBioscanStatus.Disabled:
            case eBioscanStatus.Finished:
                if (Replay.Has<rBioscan>(id)) Replay.Despawn(Replay.Get<rBioscan>(id));
                if (Replay.Has<rBioscanStatus>(id)) Replay.Despawn(Replay.Get<rBioscanStatus>(id));
                break;
            }
        }
    }
}
