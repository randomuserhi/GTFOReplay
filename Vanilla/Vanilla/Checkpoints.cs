using HarmonyLib;

namespace Vanilla {
    [HarmonyPatch]
    internal class Checkpoints {
        /*[HarmonyPatch(typeof(CheckpointManager), nameof(CheckpointManager.OnStateChange))]
        [HarmonyPrefix]
        private static void Prefix_CheckpointStateChange(pCheckpointState oldState, pCheckpointState newState, bool isRecall) {
            if (oldState.isReloadingCheckpoint && isRecall && !SNet.MasterManagement.IsMigrating) {
                
            }
        }*/
    }
}
