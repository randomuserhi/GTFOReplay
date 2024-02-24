using API;
using HarmonyLib;
using ReplayRecorder.Snapshot;

namespace ReplayRecorder {
    [HarmonyPatch]
    internal class GameEventManager {
        [HarmonyPatch(typeof(ElevatorRide), nameof(ElevatorRide.StartElevatorRide))]
        [HarmonyPostfix]
        private static void StartElevatorRide() {
            APILogger.Debug($"Entered elevator!");
            Replay.OnExpeditionStart?.Invoke();
        }

        [HarmonyPatch(typeof(RundownManager), nameof(RundownManager.EndGameSession))]
        [HarmonyPrefix]
        private static void EndGameSession() {
            APILogger.Debug($"Level ended!");
            SnapshotManager.OnExpeditionEnd();
            Replay.OnExpeditionEnd?.Invoke();
        }
    }
}
