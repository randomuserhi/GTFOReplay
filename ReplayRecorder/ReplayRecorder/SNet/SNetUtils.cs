/// SNetUtils.cs
///
/// Provides helper functions for obtaining the player that sent a received packet.
/// Useful for obtaining the source of certain events such as noises.

using Agents;
using API;
using HarmonyLib;
using Il2CppInterop.Runtime.InteropTypes.Arrays;
using Player;
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

        public static void SendHitIndicator(Agent target, byte limbID, PlayerAgent player, bool hitWeakspot, bool willDie, Vector3 position, bool hitArmor = false) {
            // client cannot send hit indicators
            if (!SNet.IsMaster) return;
            // player cannot send hit indicators to self
            if (player == PlayerManager.GetLocalPlayerAgent()) return;
            // check player is not a bot
            if (player.Owner.IsBot) return;

            SNet_ChannelType channelType = SNet_ChannelType.SessionOrderCritical;
            SNet.GetSendSettings(ref channelType, out _, out SNet_SendQuality quality, out int channel);
            Il2CppSystem.Collections.Generic.List<SNet_Player> il2cppList = new(1);
            il2cppList.Add(player.Owner);

            const int sizeOfHeader = sizeof(ushort) + sizeof(uint) + 1 + sizeof(int);
            const int sizeOfContent = sizeof(ushort) + 3 + BitHelper.SizeOfHalfVector3 + 1;

            int index = 0;
            byte[] packet = new byte[sizeOfHeader + sizeOfContent];
            BitHelper.WriteBytes(repKey, packet, ref index);
            BitHelper.WriteBytes(magickey, packet, ref index);
            BitHelper.WriteBytes(msgtype, packet, ref index);
            BitHelper.WriteBytes(sizeOfContent, packet, ref index);

            BitHelper.WriteBytes((ushort)(target.m_replicator.Key + 1), packet, ref index);
            BitHelper.WriteBytes(limbID, packet, ref index);
            BitHelper.WriteBytes(hitWeakspot, packet, ref index);
            BitHelper.WriteBytes(willDie, packet, ref index);
            BitHelper.WriteHalf(position, packet, ref index);
            BitHelper.WriteBytes(hitArmor, packet, ref index);
            SNet.Core.SendBytes(packet, quality, channel, il2cppList);
            APILogger.Debug($"Sent hit marker to {player.PlayerName}");
        }

        private static byte msgtype = 127;
        private static uint magickey = 15202362;
        private static ushort repKey = 0xFFFA; // make sure doesnt clash with GTFO-API

        // https://github.com/Kasuromi/GTFO-API/blob/main/GTFO-API/Patches/SNet_Replication_Patches.cs#L56
        [HarmonyPatch(typeof(SNet_Replication), nameof(SNet_Replication.RecieveBytes))]
        [HarmonyWrapSafe]
        [HarmonyPrefix]
        private static bool RecieveBytes_Prefix(Il2CppStructArray<byte> bytes, uint size, ulong messagerID) {
            if (size < 12) return true;

            // The implicit constructor duplicates the memory, so copying it once and using that is best
            byte[] _bytesCpy = bytes;

            ushort replicatorKey = BitConverter.ToUInt16(_bytesCpy, 0);
            if (repKey == replicatorKey) {
                uint receivedMagicKey = BitConverter.ToUInt32(bytes, sizeof(ushort));
                if (receivedMagicKey != magickey) {
                    APILogger.Debug($"[Networking] Magic key is incorrect.");
                    return true;
                }

                byte receivedMsgtype = bytes[sizeof(ushort) + sizeof(uint)];
                if (receivedMsgtype != msgtype) {
                    APILogger.Debug($"[Networking] msg type is incorrect. {receivedMsgtype} {msgtype}");
                    return true;
                }


                int msgsize = BitConverter.ToInt32(bytes, sizeof(ushort) + sizeof(int) + 1);
                byte[] message = new byte[msgsize];
                Array.Copy(bytes, sizeof(ushort) + sizeof(uint) + 1 + sizeof(int), message, 0, msgsize);

                // Handle packet received ...

                return false;
            }
            return true;
        }
    }
}
