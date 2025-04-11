extern alias GTFO;

using API;
using ReplayRecorder.BepInEx;
using Steamworks;
using System.Collections.Concurrent;
using System.Runtime.InteropServices;
using UnityEngine;

namespace ReplayRecorder.Steam {
    internal class rSteamServer : IDisposable {
        public delegate void OnAccept(HSteamNetConnection connection);
        public delegate void OnReceive(ArraySegment<byte> buffer, HSteamNetConnection connection);
        public delegate void OnDisconnect(HSteamNetConnection connection);
        public delegate void OnClose();

        public const int maxPacketSize = 81920;

        public OnAccept? onAccept = null;
        public OnReceive? onReceive = null;
        public OnDisconnect? onDisconnect = null;
        public OnClose? onClose = null;

        private HSteamListenSocket server;
        private Task? receiveTask = null;
        private Callback<SteamNetConnectionStatusChangedCallback_t> cb_OnConnectionStatusChanged;

        private readonly string debugName;

        public rSteamServer(int virtualPort, SteamNetworkingConfigValue_t[]? options = null, string debugName = "Server") {
            this.debugName = debugName;

            server = SteamNetworkingSockets.CreateListenSocketP2P(virtualPort, options == null ? 0 : options.Length, options);

            cb_OnConnectionStatusChanged = Callback<SteamNetConnectionStatusChangedCallback_t>.Create(OnConnectionStatusChanged);
        }

        public struct ResendRequest {
            public ArraySegment<byte> bytes;
        }

        public class Connection {
            public ConcurrentQueue<ResendRequest> resendQueue = new ConcurrentQueue<ResendRequest>();
            public List<ResendRequest> resendQueueBuffer = new List<ResendRequest>();

            public readonly HSteamNetConnection connection;
            private rSteamServer server;
            public bool running = true;

            public string name = "Unknown";

            public Connection(rSteamServer server, HSteamNetConnection connection) {
                this.connection = connection;
                this.server = server;

                _ = ReceiveMessages();
            }

            public void Dispose() {
                running = false;
            }

            public async Task ReceiveMessages() {
                int numMessages = 0;

                IntPtr[] messageBuffer = new IntPtr[50];

                do {
                    while ((numMessages = SteamNetworkingSockets.ReceiveMessagesOnConnection(connection, messageBuffer, messageBuffer.Length)) > 0) {
                        for (int i = 0; i < numMessages; ++i) {
                            SteamNetworkingMessage_t message = SteamNetworkingMessage_t.FromIntPtr(messageBuffer[i]);

                            byte[] data = new byte[message.m_cbSize];
                            Marshal.Copy(message.m_pData, data, 0, data.Length);

                            server.onReceive?.Invoke(data, connection);

                            SteamNetworkingMessage_t.Release(messageBuffer[i]);
                        }
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
                                    if (!server.SendTo(connection, resendQueueBuffer[j].bytes, dequeue: true)) break;
                                    ++j;
                                }
                                for (; j < resendQueueBuffer.Count; ++j) {
                                    resendQueue.Enqueue(resendQueueBuffer[j]);
                                }
                                resendQueueBuffer.Clear();
                            }
                        }
                    }

                    await Task.Delay(16);
                } while (numMessages >= 0 && running);
            }
        }

        public ConcurrentDictionary<HSteamNetConnection, Connection> currentConnections = new ConcurrentDictionary<HSteamNetConnection, Connection>();

        public void Send(ArraySegment<byte> data) {
            foreach (HSteamNetConnection connection in currentConnections.Keys) {
                SendTo(connection, data);
            }
        }

        // NOTE(randomuserhi): Takes ownership of `data` byte array passed in. This means that if a packet fails to send,
        //                     and the packet is queued for use in the future, if you make changes to the byte buffer it will
        //                     corrupt the packet on resend.
        //
        //                     Avoid changing the bytes in the passed `data` array once sent to this function.
        public bool SendTo(HSteamNetConnection connection, ArraySegment<byte> data, bool dequeue = false) {
            Connection conn = currentConnections[connection];

            if (!dequeue && !conn.resendQueue.IsEmpty) {
                // APILogger.Debug("queued data.");
                conn.resendQueue.Enqueue(new ResendRequest() { bytes = data });
                return true;
            }

            if (data.Count > maxPacketSize) {
                APILogger.Error("Failed to send packet, packet was larger than maximum message send size.");
                throw new Exception("Failed to send packet, packet was larger than maximum message send size.");
            }

            // NOTE(randomuserhi): Used to support splitting packets - but removed the protocol, the below code is a remnant of that

            //int numMessages = Mathf.CeilToInt(data.Count / (float)maxPacketSize);
            const int numMessages = 1;
            IntPtr[] messages = new IntPtr[numMessages];
            ArraySegment<byte>[] buffers = new ArraySegment<byte>[numMessages];
            long[] results = new long[numMessages];

            int bytesWritten = 0;
            int index = 0;
            while (bytesWritten < data.Count) {
                int bytesToWrite = Mathf.Min(data.Count - bytesWritten, maxPacketSize);
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
                    APILogger.Debug($"Failed to send packet, Error Code: {results[i]}");
                    if (-results[i] == (long)EResult.k_EResultLimitExceeded) {
                        conn.resendQueue.Enqueue(new ResendRequest { bytes = buffers[i] });
                        APILogger.Debug($"Requeued packet.");
                        success = false;
                    }
                }
            }

            // APILogger.Debug($"Sent[{success}] {data.Count} bytes.");

            return success;
        }

        private void OnConnectionStatusChanged(SteamNetConnectionStatusChangedCallback_t callbackData) {
            HSteamNetConnection connection = callbackData.m_hConn;
            SteamNetConnectionInfo_t connectionInfo = callbackData.m_info;

            if (connectionInfo.m_hListenSocket != server) return;
            if (rSteamClient.localClients.Contains(connection)) return;

            ulong steamID = connectionInfo.m_identityRemote.GetSteamID64();

            switch (connectionInfo.m_eState) {
            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_Connecting:
                APILogger.Debug($"[{debugName}] Incoming connection from: {connectionInfo.m_szConnectionDescription}");

                if (steamID == SteamUser.GetSteamID().m_SteamID ||
                    ConfigManager.allowAnySpectator ||
                    (ConfigManager.WhiteListFriends && SteamFriends.GetFriendRelationship(new CSteamID(steamID)) == EFriendRelationship.k_EFriendRelationshipFriend) ||
                    ConfigManager.steamIDWhitelist.Contains(steamID)) {
                    // Accept the connection
                    EResult acceptResult = SteamNetworkingSockets.AcceptConnection(connection);
                    if (acceptResult != EResult.k_EResultOK) {
                        APILogger.Debug($"[{debugName}] Failed to accept connection: {acceptResult}");
                        SteamNetworkingSockets.CloseConnection(connection, 0, "Failed to accept", false);
                    } else {
                        APILogger.Warn($"[{debugName}] Allowed {steamID} to spectate your lobby.");
                    }
                } else {
                    APILogger.Warn($"[{debugName}] Rejected {steamID} from spectating your lobby.");
                }

                break;

            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_Connected: {
                APILogger.Warn($"[{debugName}] Connection established: {connectionInfo.m_szConnectionDescription}");
                Connection conn = new Connection(this, connection);
                currentConnections.AddOrUpdate(connection, conn, (key, old) => { return conn; });
                onAccept?.Invoke(connection);
                break;
            }

            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_ClosedByPeer:
            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_ProblemDetectedLocally: {
                APILogger.Warn($"[{debugName}] Connection closed: {connectionInfo.m_szConnectionDescription} {connectionInfo.m_szEndDebug}");
                onDisconnect?.Invoke(connection);
                currentConnections.Remove(connection, out Connection? conn);
                conn?.Dispose();
                SteamNetworkingSockets.CloseConnection(connection, 0, "Closed", false);
                break;
            }
            }
        }

        public void Dispose() {
            receiveTask?.Wait();
            receiveTask?.Dispose();
            receiveTask = null;
            cb_OnConnectionStatusChanged.Dispose();
            SteamNetworkingSockets.CloseListenSocket(server);
            onClose?.Invoke();

            APILogger.Debug("[{debugName}] Listen server closed.");
        }
    }
}
