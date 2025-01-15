extern alias GTFO;

using API;
using ReplayRecorder.BepInEx;
using Steamworks;
using System.Collections.Concurrent;
using System.Runtime.InteropServices;
using UnityEngine;

namespace ReplayRecorder.Steam {
    internal static class SteamNet {
        public delegate void onConnect(HSteamNetConnection connection);
        public delegate void onAccept(HSteamNetConnection connection);
        public delegate void clientOnAccept(rSteamClient connection);
        public delegate void onReceive(ArraySegment<byte> buffer, HSteamNetConnection connection);
        public delegate void clientOnReceive(ArraySegment<byte> buffer, rSteamClient connection);
        public delegate void onDisconnect(HSteamNetConnection connection);
        public delegate void onClose();
        public delegate void clientOnClose(rSteamClient connection);
        public delegate void clientOnFail(rSteamClient connection);
    }

    internal class SteamServer : IDisposable {
        public SteamNet.onAccept? onAccept = null;
        public SteamNet.onReceive? onReceive = null;
        public SteamNet.onDisconnect? onDisconnect = null;
        public SteamNet.onClose? onClose = null;

        private HSteamListenSocket server;
        private bool running = true;
        private Task? receiveTask = null;
        private Callback<SteamNetConnectionStatusChangedCallback_t> cb_OnConnectionStatusChanged;

        public SteamServer() {
            server = SteamNetworkingSockets.CreateListenSocketP2P(0, 0, new SteamNetworkingConfigValue_t[] { });

            cb_OnConnectionStatusChanged = Callback<SteamNetConnectionStatusChangedCallback_t>.Create(OnConnectionStatusChanged);

        }

        public class Connection {
            public bool queuePackets = false;
            public ConcurrentQueue<ArraySegment<byte>> queue = new ConcurrentQueue<ArraySegment<byte>>();
        }

        public ConcurrentDictionary<HSteamNetConnection, Connection> currentConnections = new ConcurrentDictionary<HSteamNetConnection, Connection>();

        private ConcurrentQueue<ArraySegment<byte>> resendQueue = new ConcurrentQueue<ArraySegment<byte>>();
        private List<ArraySegment<byte>> resendQueueBuffer = new List<ArraySegment<byte>>();

        private async Task ReceiveMessages(HSteamNetConnection connection) {
            int numMessages = 0;

            IntPtr[] messageBuffer = new IntPtr[10];

            Connection conn = currentConnections[connection];

            do {
                numMessages = SteamNetworkingSockets.ReceiveMessagesOnConnection(connection, messageBuffer, messageBuffer.Length);
                for (int i = 0; i < numMessages; ++i) {
                    SteamNetworkingMessage_t message = SteamNetworkingMessage_t.FromIntPtr(messageBuffer[i]);

                    byte[] data = new byte[message.m_cbSize];
                    Marshal.Copy(message.m_pData, data, 0, data.Length);

                    onReceive?.Invoke(data, connection);

                    SteamNetworkingMessage_t.Release(messageBuffer[i]);
                }

                // NOTE(randomuserhi): Manage packets that did not send due to overwhelmed socket
                if (!resendQueue.IsEmpty) {
                    // NOTE(randomuserhi): Get status to not overwhelm network
                    SteamNetConnectionRealTimeStatus_t status = default;
                    SteamNetConnectionRealTimeLaneStatus_t pLanes = default;
                    if (SteamNetworkingSockets.GetConnectionRealTimeStatus(connection, ref status, 0, ref pLanes) == EResult.k_EResultOK) {
                        if (status.m_cbPendingReliable + status.m_cbSentUnackedReliable == 0) {
                            while (resendQueue.TryDequeue(out var packet)) {
                                resendQueueBuffer.Add(packet);
                            }
                            int j = 0;
                            while (j < resendQueueBuffer.Count) {
                                if (!SendTo(connection, resendQueueBuffer[j], dequeue: true)) break;
                                ++j;
                            }
                            for (; j < resendQueueBuffer.Count; ++j) {
                                resendQueue.Enqueue(resendQueueBuffer[j]);
                            }
                            resendQueueBuffer.Clear();
                        }
                    }
                }

                // Queue packets
                if (!conn.queuePackets) {
                    while (conn.queue.TryDequeue(out var packet)) {
                        SendTo(connection, packet);
                    }
                }

                await Task.Delay(16);
            } while (numMessages >= 0 && running);
        }

        public void Send(ArraySegment<byte> data) {
            foreach (HSteamNetConnection connection in currentConnections.Keys) {
                SendTo(connection, data);
            }
        }

        public bool SendTo(HSteamNetConnection connection, ArraySegment<byte> data, bool force = false, bool dequeue = false) {
            Connection conn = currentConnections[connection];

            if (conn.queuePackets && !force) {
                // APILogger.Debug("conn.queued data.");
                conn.queue.Enqueue(data);
                return true;
            }

            if (!dequeue && !resendQueue.IsEmpty) {
                // APILogger.Debug("queued data.");
                resendQueue.Enqueue(data);
                return true;
            }

            const int packetSize = Constants.k_cbMaxSteamNetworkingSocketsMessageSizeSend;

            int numMessages = Mathf.CeilToInt(data.Count / (float)packetSize);
            IntPtr[] messages = new IntPtr[numMessages];
            ArraySegment<byte>[] buffers = new ArraySegment<byte>[numMessages];
            long[] results = new long[numMessages];

            int bytesWritten = 0;
            int index = 0;
            while (bytesWritten < data.Count) {
                int bytesToWrite = Mathf.Min(data.Count - bytesWritten, packetSize);
                IntPtr packetPtr = SteamGameServerNetworkingUtils.AllocateMessage(bytesToWrite);

                // Copy to managed
                SteamNetworkingMessage_t packet = SteamNetworkingMessage_t.FromIntPtr(packetPtr);

                packet.m_conn = connection;
                packet.m_nFlags = Constants.k_nSteamNetworkingSend_ReliableNoNagle;

                Marshal.Copy(data.Array!, data.Offset + bytesWritten, packet.m_pData, bytesToWrite);
                buffers[index] = new ArraySegment<byte>(data.Array!, data.Offset + bytesWritten, bytesToWrite);

                bytesWritten += bytesToWrite;
                messages[index] = packetPtr;
                ++index;

                // Copy back to unmanaged
                Marshal.StructureToPtr(packet, packetPtr, true);

                // APILogger.Debug($"Sent packet({dequeue}): {bytesWritten}/{data.Count}");
            }

            SteamNetworkingSockets.SendMessages(numMessages, messages, results);

            bool success = true;

            for (int i = 0; i < results.Length; ++i) {
                if (results[i] < 0) {
                    // APILogger.Debug($"Failed to send packet '{i}', Error Code: {results[i]}, queuing for future send...");
                    resendQueue.Enqueue(buffers[i]);
                    success = false;
                }
            }

            return success;
        }

        private void OnConnectionStatusChanged(SteamNetConnectionStatusChangedCallback_t callbackData) {
            HSteamNetConnection connection = callbackData.m_hConn;
            SteamNetConnectionInfo_t connectionInfo = callbackData.m_info;

            if (connectionInfo.m_hListenSocket != server) return;
            if (rSteamClient.localClients.Contains(connection)) return;

            switch (connectionInfo.m_eState) {
            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_Connecting:
                APILogger.Debug($"[Server] Incoming connection from: {connectionInfo.m_szConnectionDescription}");

                ulong steamID = connectionInfo.m_identityRemote.GetSteamID64();

                if (steamID == SteamUser.GetSteamID().m_SteamID ||
                    ConfigManager.allowAnySpectator ||
                    ConfigManager.steamIDWhitelist.Contains(steamID)) {
                    // Accept the connection
                    EResult acceptResult = SteamNetworkingSockets.AcceptConnection(connection);
                    if (acceptResult != EResult.k_EResultOK) {
                        APILogger.Debug($"[Server] Failed to accept connection: {acceptResult}");
                        SteamNetworkingSockets.CloseConnection(connection, 0, "Failed to accept", false);
                    } else {
                        APILogger.Warn($"[Server] Allowed {steamID} to spectate your lobby.");
                    }
                } else {
                    APILogger.Warn($"[Server] Rejected {steamID} from spectating your lobby.");
                }
                break;

            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_Connected:
                APILogger.Debug($"[Server] Connection established: {connectionInfo.m_szConnectionDescription}");
                Connection conn = new Connection();
                currentConnections.AddOrUpdate(connection, conn, (key, old) => { return conn; });
                onAccept?.Invoke(connection);
                receiveTask = ReceiveMessages(connection);
                break;

            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_ClosedByPeer:
            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_ProblemDetectedLocally:
                APILogger.Debug($"[Server] Connection closed: {connectionInfo.m_szEndDebug}");
                currentConnections.Remove(connection, out _);
                onDisconnect?.Invoke(connection);
                SteamNetworkingSockets.CloseConnection(connection, 0, "Closed", false);
                break;
            }
        }

        public void Dispose() {
            running = false;
            receiveTask?.Wait();
            receiveTask?.Dispose();
            receiveTask = null;
            cb_OnConnectionStatusChanged.Dispose();
            SteamNetworkingSockets.CloseListenSocket(server);
            onClose?.Invoke();

            APILogger.Debug("[Server] Listen server closed.");
        }
    }
}
