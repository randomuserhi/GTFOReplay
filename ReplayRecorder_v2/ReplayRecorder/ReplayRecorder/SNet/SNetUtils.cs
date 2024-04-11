using API;
using HarmonyLib;
using Il2CppInterop.Runtime.InteropTypes.Arrays;
using SNetwork;

namespace ReplayRecorder.SNetUtils {
    public class SNetUtils {
        internal static ushort currentRepKey;
        internal static int currentPacketIndex;
        internal static SNet_Player? currentSender;

        public static bool TryGetSender(SNet_Packet packet, out SNet_Player player) {
            APILogger.Error($"TryGetSender: {currentSender != null} {packet.Replicator.Key}=={currentRepKey} {packet.Index}=={currentPacketIndex}");
            if (currentSender != null && packet.Replicator.Key == currentRepKey && packet.Index == currentPacketIndex) {
                player = currentSender;
                return true;
            }
            player = null!;
            APILogger.Error($"Player: {player != null}");
            return false;
        }
    }

    [HarmonyPatch]
    internal class Patches {
        [HarmonyPatch(typeof(SNet_Replication), nameof(SNet_Replication.RecieveBytes))]
        [HarmonyWrapSafe]
        [HarmonyPriority(Priority.VeryHigh)]
        [HarmonyPrefix]
        private static void Prefix_RecieveBytes(Il2CppStructArray<byte> bytes, uint size, ulong messagerID) {
            if (SNet.Replication.TryGetReplicator(bytes, out IReplicator replicator, out int packetIndex) && SNet.Core.TryGetPlayer(messagerID, out SNet_Player player)) {
                SNetUtils.currentSender = player;
                SNetUtils.currentRepKey = replicator.Key;
                SNetUtils.currentPacketIndex = packetIndex;
            }
        }
        [HarmonyPatch(typeof(SNet_Replication), nameof(SNet_Replication.RecieveBytes))]
        [HarmonyWrapSafe]
        [HarmonyPriority(Priority.VeryLow)]
        [HarmonyPostfix]
        private static void Postfix_RecieveBytes(Il2CppStructArray<byte> bytes, uint size, ulong messagerID) {
            SNetUtils.currentSender = null;
            SNetUtils.currentRepKey = 0;
            SNetUtils.currentPacketIndex = 0;
        }
    }
}
