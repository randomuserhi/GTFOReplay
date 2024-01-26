using HarmonyLib;
using SNetwork;

namespace ReplayRecorder.Checkpoints.Patches {
    [HarmonyPatch]
    class CheckpointPatches {
        [HarmonyPatch(typeof(CheckpointManager), nameof(CheckpointManager.OnStateChange))]
        [HarmonyPrefix]
        private static void Prefix_CheckpointStateChange(pCheckpointState oldState, pCheckpointState newState, bool isRecall) {
            if (oldState.isReloadingCheckpoint && isRecall && !SNet.MasterManagement.IsMigrating) {
                Checkpoint.Triggered();
            }
        }
    }
}
