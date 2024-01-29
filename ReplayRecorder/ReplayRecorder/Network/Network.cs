using API;
using HarmonyLib;
using Il2CppInterop.Runtime.InteropTypes.Arrays;
using Player;
using SNetwork;

namespace ReplayRecorder {
    [HarmonyPatch]
    internal class Network {
        // TODO(randomuserhi): Rewrite this whole thing
        public static void SendReplay(byte[] replay) {
            // client cannot send replay
            if (!SNet.IsMaster) return;

            SNet_ChannelType channelType = SNet_ChannelType.SessionOrderCritical;
            SNet.GetSendSettings(ref channelType, out _, out SNet_SendQuality quality, out int channel);
            Il2CppSystem.Collections.Generic.List<SNet_Player> il2cppList = new(PlayerManager.PlayerAgentsInLevel.Count);
            for (int i = 0; i < PlayerManager.PlayerAgentsInLevel.Count; i++) {
                if (!PlayerManager.PlayerAgentsInLevel[i].IsLocallyOwned && !PlayerManager.PlayerAgentsInLevel[i].Owner.IsBot) {
                    il2cppList.Add(PlayerManager.PlayerAgentsInLevel[i].Owner);
                    APILogger.Debug($"[Networking] Sending report to {PlayerManager.PlayerAgentsInLevel[i].PlayerName}");
                }
            }

            APILogger.Debug($"[Networking] Replay is {replay.Length} bytes large.");

            byte[] header = new byte[sizeof(ushort) + sizeof(uint) + 1 + sizeof(int)];
            Array.Copy(BitConverter.GetBytes(repKey), 0, header, 0, sizeof(ushort));
            Array.Copy(BitConverter.GetBytes(magickey), 0, header, sizeof(ushort), sizeof(uint));
            header[sizeof(ushort) + sizeof(uint)] = msgtype;
            Array.Copy(BitConverter.GetBytes(replay.Length), 0, header, sizeof(ushort) + sizeof(uint) + 1, sizeof(int));

            byte[] full = new byte[header.Length + replay.Length];
            Array.Copy(header, 0, full, 0, header.Length);
            Array.Copy(replay, 0, full, header.Length, replay.Length);

            SNet.Core.SendBytes(full, quality, channel, il2cppList);
        }

        private static byte msgtype = 172;
        private static uint magickey = 10992881;
        private static ushort repKey = 0xFFFB; // make sure doesnt clash with GTFO-API

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
                    if (msgtype == 173) return true; // Temporary ignore for kill indicator fix until I make my own networking api
                    APILogger.Debug($"[Networking] msg type is incorrect. {receivedMsgtype} {msgtype}");
                    return true;
                }


                int msgsize = BitConverter.ToInt32(bytes, sizeof(ushort) + sizeof(int) + 1);
                byte[] replay = new byte[msgsize];
                Array.Copy(bytes, sizeof(ushort) + sizeof(uint) + 1 + sizeof(int), replay, 0, msgsize);

                if (SnapshotManager.active == true) {
                    APILogger.Debug("Snapshot manager was still running, assuming end of run and closing...");
                    SnapshotManager.Dispose();
                }

                APILogger.Debug($"[Networking] Report received: {msgsize} bytes");
                File.WriteAllBytes(SnapshotManager.fullpath, replay); // TODO(randomuserhi): report location

                return false;
            }
            return true;
        }
    }
}
