using HarmonyLib;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using SNetwork;

namespace Vanilla.Events {
    [ReplayData("Vanilla.Checkpoint", "0.0.1")]
    [HarmonyPatch]
    public class rCheckpoint : ReplayEvent {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(CheckpointManager), nameof(CheckpointManager.OnStateChange))]
            [HarmonyPrefix]
            private static void Prefix_CheckpointStateChange(pCheckpointState oldState, pCheckpointState newState, bool isRecall) {
                if (oldState.isReloadingCheckpoint && isRecall && !SNet.MasterManagement.IsMigrating) {
                    Replay.Trigger(new rCheckpoint());
                }
            }
        }
    }
}
