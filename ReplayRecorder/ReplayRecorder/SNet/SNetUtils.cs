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

        internal static uint magickey = 15202362;
        internal static ushort repKey = 0xFFFA; // make sure doesnt clash with GTFO-API
        internal const int sizeOfHeader = sizeof(ushort) + sizeof(uint) + sizeof(int);

        // Preallocated buffer to be used with SendBytes, just clear the list and set the players as necessary for your SendBytes call.
        public static Il2CppSystem.Collections.Generic.List<SNet_Player> _playerBuff = new Il2CppSystem.Collections.Generic.List<SNet_Player>();

        // recievedPacket, messengerId
        public static Action<ArraySegment<byte>, ulong>? OnReceive;

        /// <summary>
        /// Send bytes across games internal network
        /// </summary>
        /// <param name="packet">Bytes to send.</param>
        /// <param name="toPlayers">Players to send to.</param>
        public static void SendBytes(ArraySegment<byte> packet, Il2CppSystem.Collections.Generic.List<SNet_Player> toPlayers) {
            if (toPlayers.Count == 0) return;

            int index = 0;
            byte[] bytes = new byte[sizeOfHeader + packet.Count];
            BitHelper.WriteBytes(repKey, bytes, ref index);
            BitHelper.WriteBytes(magickey, bytes, ref index);
            BitHelper.WriteBytes(packet, bytes, ref index);

            SNet_ChannelType channelType = SNet_ChannelType.SessionOrderCritical;
            SNet.GetSendSettings(ref channelType, out _, out SNet_SendQuality quality, out int channel);

            SNet.Core.SendBytes(bytes, quality, channel, toPlayers);
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

        // https://github.com/Kasuromi/GTFO-API/blob/main/GTFO-API/Patches/SNet_Replication_Patches.cs#L56
        [HarmonyPatch(typeof(SNet_Replication), nameof(SNet_Replication.RecieveBytes))]
        [HarmonyWrapSafe]
        [HarmonyPrefix]
        private static bool RecieveBytes_Prefix(Il2CppStructArray<byte> bytes, uint size, ulong messagerID) {
            if (size < SNetUtils.sizeOfHeader) return true;

            // The implicit constructor duplicates the memory, so copying it once and using that is best
            byte[] _bytesCpy = bytes;

            ushort replicatorKey = BitConverter.ToUInt16(_bytesCpy, 0);
            if (SNetUtils.repKey == replicatorKey) {
                uint receivedMagicKey = BitConverter.ToUInt32(_bytesCpy, sizeof(ushort));
                if (receivedMagicKey != SNetUtils.magickey) {
                    return true;
                }

                int msgsize = BitConverter.ToInt32(_bytesCpy, sizeof(ushort) + sizeof(int));

                byte[] message = new byte[msgsize];
                Array.Copy(_bytesCpy, SNetUtils.sizeOfHeader, message, 0, msgsize);

                SNetUtils.OnReceive?.Invoke(message, messagerID);

                return false;
            }
            return true;
        }
    }
}
