using API;
using HarmonyLib;
using ReplayRecorder.Snapshot;
using SNetwork;

namespace ReplayRecorder {
    [HarmonyPatch]
    internal class GameEventManager {
        [HarmonyPatch(typeof(ElevatorRide), nameof(ElevatorRide.StartElevatorRide))]
        [HarmonyPostfix]
        private static void StartElevatorRide() {
            APILogger.Debug($"Entered elevator!");
            SnapshotManager.OnElevatorStart();
            Replay.OnExpeditionStart?.Invoke();
        }

        [HarmonyPatch(typeof(RundownManager), nameof(RundownManager.EndGameSession))]
        [HarmonyPrefix]
        private static void EndGameSession() {
            APILogger.Debug($"Level ended!");
            SnapshotManager.OnExpeditionEnd();
        }

        [HarmonyPatch(typeof(SNet_SessionHub), nameof(SNet_SessionHub.LeaveHub))]
        [HarmonyPrefix]
        private static void LeaveHub() {
            APILogger.Debug($"Level ended!");
            SnapshotManager.OnExpeditionEnd();
        }
    }
}
