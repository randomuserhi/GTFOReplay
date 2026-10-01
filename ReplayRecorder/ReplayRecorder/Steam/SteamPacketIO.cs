using API;
using ReplayRecorder.IO;
using Steamworks;
using System.Runtime.InteropServices;

namespace ReplayRecorder.Steam {
    internal static class SteamPacketIO {
        internal static void Report(string operation, Exception error) {
            APILogger.Error($"Spectator network failure in {operation}; UTC={DateTimeOffset.UtcNow:O}, Session={Snapshot.SnapshotManager.instance?.SessionId ?? "none"}; local replay capture is independent: {error}");
        }
        internal static void Guard(string operation, Action action) => CallbackGuard.Run(operation, action, Report);
        internal static bool Send(HSteamNetConnection connection, ArraySegment<byte> data) {
            IntPtr pointer = SteamGameServerNetworkingUtils.AllocateMessage(data.Count);
            if (pointer == IntPtr.Zero) throw new IOException("Steam could not allocate a spectator packet.");
            bool transferred = false;
            try {
                var packet = SteamNetworkingMessage_t.FromIntPtr(pointer);
                packet.m_conn = connection;
                packet.m_nFlags = Constants.k_nSteamNetworkingSend_ReliableNoNagle;
                Marshal.Copy(data.Array!, data.Offset, packet.m_pData, data.Count);
                Marshal.StructureToPtr(packet, pointer, false);
                var results = new long[1];
                SteamNetworkingSockets.SendMessages(1, new[] { pointer }, results);
                transferred = true; // Steam owns and releases the message, including rejected sends.
                if (results[0] >= 0) return true;
                if (-results[0] == (long)EResult.k_EResultLimitExceeded) return false;
                throw new IOException($"Steam send failed with error {results[0]}.");
            } finally { if (!transferred) SteamNetworkingMessage_t.Release(pointer); }
        }
        internal static void Receive(HSteamNetConnection connection, IntPtr[] pointers, Action<ArraySegment<byte>> receive) {
            int count = SteamNetworkingSockets.ReceiveMessagesOnConnection(connection, pointers, pointers.Length);
            if (count < 0) throw new IOException("Steam receive failed: connection is no longer usable.");
            try {
                for (int i = 0; i < count; ++i) {
                    var message = SteamNetworkingMessage_t.FromIntPtr(pointers[i]);
                    if (message.m_cbSize <= 0 || message.m_cbSize > rSteamServer.maxPacketSize) throw new InvalidDataException($"Invalid spectator message size: {message.m_cbSize}.");
                    var data = new byte[message.m_cbSize];
                    Marshal.Copy(message.m_pData, data, 0, data.Length);
                    receive(data);
                }
            } finally {
                // A failed callback must still release every message returned by the native batch.
                for (int i = 0; i < count; ++i) SteamNetworkingMessage_t.Release(pointers[i]);
            }
        }
    }
}
