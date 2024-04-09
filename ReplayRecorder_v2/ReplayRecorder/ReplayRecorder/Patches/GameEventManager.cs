using API;
using HarmonyLib;
using ReplayRecorder.Snapshot;
using SNetwork;
using UnityEngine;

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

        [HarmonyPatch(typeof(GS_ReadyToStopElevatorRide), nameof(GS_ReadyToStopElevatorRide.Enter))]
        [HarmonyPostfix]
        private static void StopElevatorRide() {
            APILogger.Debug($"Stop elevator!");
            Replay.OnElevatorStop?.Invoke();
        }

        [HarmonyPatch(typeof(PUI_LocalPlayerStatus), nameof(PUI_LocalPlayerStatus.UpdateBPM))]
        [HarmonyWrapSafe]
        [HarmonyPostfix]
        public static void Initialize_Postfix(PUI_LocalPlayerStatus __instance) {
            __instance.m_pulseText.text += $" | ({SnapshotManager.GetInstance().pool.Size}) {Mathf.RoundToInt(SnapshotManager.GetInstance().tickTime)}ms";
        }
    }
}
