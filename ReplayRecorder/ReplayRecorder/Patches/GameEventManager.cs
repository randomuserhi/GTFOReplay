using API;
using HarmonyLib;
using ReplayRecorder.BepInEx;
using ReplayRecorder.Snapshot;
using ReplayRecorder.IO;
using SNetwork;
using UnityEngine;

namespace ReplayRecorder {
    [HarmonyPatch]
    internal class GameEventManager {
        private static bool initialized = false;
        private static bool scenePublished;
        [HarmonyPatch(typeof(SteamManager), nameof(SteamManager.PostSetup))]
        [HarmonyPrefix]
        private static void SteamSetup() {
            if (initialized) return;

            initialized = true;
            SnapshotManager.Invoke("Plugin load", Replay.OnPluginLoad);
        }

        [HarmonyPatch(typeof(ElevatorRide), nameof(ElevatorRide.StartElevatorRide))]
        [HarmonyPostfix]
        private static void StartElevatorRide() {
            BeginRecording();
        }

        // Late join generates a local copy of the level but can skip the elevator.
        // Start before building so Setup/spawn hooks and pre-batch mesh identities
        // belong to this session, rather than trying to reconstruct them afterwards.
        [HarmonyPatch(typeof(GS_Generating), nameof(GS_Generating.StartBuilding))]
        [HarmonyPrefix]
        private static void BeforeLevelBuild() => BeginRecording();

        private static void BeginRecording() {
            if (SnapshotManager.instance != null) return;
            scenePublished = false;
            SnapshotManager.Guard("Start recording", SnapshotManager.OnElevatorStart);
            if (SnapshotManager.Active) SnapshotManager.Invoke("Expedition start", Replay.OnExpeditionStart);
        }

        [HarmonyPatch(typeof(RundownManager), nameof(RundownManager.EndGameSession))]
        [HarmonyPrefix]
        private static void EndGameSession() {
            APILogger.Debug($"Level ended!");
            SnapshotManager.OnExpeditionEnd();
            scenePublished = false;
        }

        [HarmonyPatch(typeof(SNet_SessionHub), nameof(SNet_SessionHub.LeaveHub))]
        [HarmonyPrefix]
        private static void LeaveHub() {
            APILogger.Debug($"Level ended!");
            SnapshotManager.OnExpeditionEnd();
            scenePublished = false;
        }

        [HarmonyPatch(typeof(GS_ReadyToStopElevatorRide), nameof(GS_ReadyToStopElevatorRide.Enter))]
        [HarmonyPostfix]
        private static void StopElevatorRide() {
            PublishScene();
        }

        [HarmonyPatch(typeof(GS_InLevel), nameof(GS_InLevel.Enter))]
        [HarmonyPrefix]
        private static void EnterLevel() => PublishScene();

        private static void PublishScene() {
            if (!SnapshotManager.Active || scenePublished) return;
            scenePublished = true;
            SnapshotManager.Invoke("Elevator stop", Replay.OnElevatorStop);
        }

        [HarmonyPatch(typeof(PUI_LocalPlayerStatus), nameof(PUI_LocalPlayerStatus.UpdateBPM))]
        [HarmonyWrapSafe]
        [HarmonyPostfix]
        public static void Initialize_Postfix(PUI_LocalPlayerStatus __instance) {
            if (ConfigManager.ShowRecordingStatus && RecordingStatus.Current is { } status) {
                string color = status.Phase == RecordingPhase.Failed ? "#ff6b6b" : "#a6d6b2";
                __instance.m_pulseText.text += $" | <color={color}>{status.Caption}</color>";
            }
            if (!ConfigManager.PerformanceDebug) return;

            SnapshotInstance? instance = SnapshotManager.instance;
            if (instance == null) return;
            __instance.m_pulseText.text += $" | ({instance.pool.InUse}/{instance.pool.Size}) {Mathf.RoundToInt(instance.tickTime)}ms {instance.queuedBytes / 1024}KB queued";
        }
    }
}
