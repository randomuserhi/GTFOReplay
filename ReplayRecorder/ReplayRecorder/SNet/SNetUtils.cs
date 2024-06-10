/// SNetUtils.cs
///
/// Provides helper functions for obtaining the player that sent a received packet.
/// Useful for obtaining the source of certain events such as noises.

using HarmonyLib;
using Il2CppInterop.Runtime.InteropTypes.Arrays;
using SNetwork;
using System.Diagnostics.CodeAnalysis;

namespace ReplayRecorder.SNetUtils {
    public class SNetUtils {
        internal static ushort currentRepKey;
        internal static int currentPacketIndex;
        internal static SNet_Player? currentSender;

        /// <summary>
        /// Tries to get the sender of a given SNet_Packet.
        /// </summary>
        /// <param name="packet">The packet received.</param>
        /// <param name="player">The player that sent the packet.</param>
        /// <returns>True if the sender was found, otherwise False.</returns>
        public static bool TryGetSender(SNet_Packet packet, [MaybeNullWhen(false)] out SNet_Player player) {
            if (currentSender != null && packet.Replicator.Key == currentRepKey && packet.Index == currentPacketIndex) {
                player = currentSender;
                return true;
            }
            player = null!;
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
