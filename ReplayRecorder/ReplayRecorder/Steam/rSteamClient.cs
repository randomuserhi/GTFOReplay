extern alias GTFO;

using API;
using Steamworks;
using System.Collections.Concurrent;
using System.Runtime.InteropServices;
using UnityEngine;
using static ReplayRecorder.Steam.rSteamServer;

namespace ReplayRecorder.Steam {
    internal class rSteamClient : IDisposable {
        public delegate void OnAccept(rSteamClient connection);
        public delegate void OnReceive(ArraySegment<byte> buffer, rSteamClient connection);
        public delegate void OnClose(rSteamClient connection);
        public delegate void OnFail(rSteamClient connection);

        public OnAccept? onAccept = null;
        public OnReceive? onReceive = null;
        public OnClose? onClose = null;
        public OnFail? onFail = null;

        internal static HashSet<HSteamNetConnection> localClients = new();

        private bool running = true;
        private Task? receiveTask = null;

        private HSteamNetConnection connection;
        private SteamNetworkingIdentity identity;

        private Callback<SteamNetConnectionStatusChangedCallback_t> cb_OnConnectionStatusChanged;

        private bool connected = false;

        private readonly string debugName;

        public rSteamClient(ulong steamid, int virtualPort, SteamNetworkingConfigValue_t[]? options = null, string debugName = "Client") {
            this.debugName = debugName;

            identity = default;
            identity.SetSteamID(new CSteamID(steamid));

            connection = SteamNetworkingSockets.ConnectP2P(ref identity, virtualPort, options == null ? 0 : options.Length, options);
            localClients.Add(connection);

            cb_OnConnectionStatusChanged = Callback<SteamNetConnectionStatusChangedCallback_t>.Create(OnConnectionStatusChanged);
        }

        private ConcurrentQueue<ResendRequest> resendQueue = new ConcurrentQueue<ResendRequest>();
        private List<ResendRequest> resendQueueBuffer = new List<ResendRequest>();

        // NOTE(randomuserhi): Takes ownership of `data` byte array passed in. This means that if a packet fails to send,
        //                     and the packet is queued for use in the future, if you make changes to the byte buffer it will
        //                     corrupt the packet on resend.
        //
        //                     Avoid changing the bytes in the passed `data` array once sent to this function.
        public bool Send(ArraySegment<byte> data, bool dequeue = false) {

            if (!dequeue && !resendQueue.IsEmpty) {
                // APILogger.Debug("queued data.");
                resendQueue.Enqueue(new ResendRequest() { bytes = data });
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

                APILogger.Debug($"[{debugName}] Sent packet({dequeue}): {bytesWritten}/{data.Count}");
            }

            SteamNetworkingSockets.SendMessages(numMessages, messages, results);

            bool success = true;

            for (int i = 0; i < results.Length; ++i) {
                if (results[i] < 0) {
                    APILogger.Debug($"[{debugName}] Failed to send packet, Error Code: {results[i]}");
                    if (-results[i] == (long)EResult.k_EResultLimitExceeded) {
                        resendQueue.Enqueue(new ResendRequest { bytes = buffers[i] });
                        APILogger.Debug($"[{debugName}] Requeued packet.");
                        success = false;
                    }
                }
            }

            // APILogger.Debug($"Sent[{success}] {data.Count} bytes.");

            return success;
        }

        private async Task ReceiveMessages() {
            int numMessages = 0;

            IntPtr[] messageBuffer = new IntPtr[50];

            do {
                while ((numMessages = SteamNetworkingSockets.ReceiveMessagesOnConnection(connection, messageBuffer, messageBuffer.Length)) > 0) {
                    for (int i = 0; i < numMessages; ++i) {
                        SteamNetworkingMessage_t message = SteamNetworkingMessage_t.FromIntPtr(messageBuffer[i]);

                        byte[] data = new byte[message.m_cbSize];
                        Marshal.Copy(message.m_pData, data, 0, data.Length);

                        onReceive?.Invoke(data, this);

                        SteamNetworkingMessage_t.Release(messageBuffer[i]);
                    }
                }

                // NOTE(randomuserhi): Manage packets that did not send due to overwhelmed socket
                if (!resendQueue.IsEmpty) {
                    while (resendQueue.TryDequeue(out var packet)) {
                        resendQueueBuffer.Add(packet);
                    }
                    int j = 0;
                    while (j < resendQueueBuffer.Count) {
                        if (!Send(resendQueueBuffer[j].bytes, dequeue: true)) break;
                        ++j;
                    }
                    for (; j < resendQueueBuffer.Count; ++j) {
                        resendQueue.Enqueue(resendQueueBuffer[j]);
                    }
                    resendQueueBuffer.Clear();
                }

                await Task.Delay(16);
            } while (numMessages >= 0 && running);
        }

        private void OnConnectionStatusChanged(SteamNetConnectionStatusChangedCallback_t callbackData) {
            HSteamNetConnection connection = callbackData.m_hConn;
            if (this.connection != connection) return;

            SteamNetConnectionInfo_t connectionInfo = callbackData.m_info;

            switch (connectionInfo.m_eState) {
            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_Connecting:
                APILogger.Warn($"[{debugName}] {connection.m_HSteamNetConnection} Connecting to: {connectionInfo.m_szConnectionDescription}");
                connected = false;
                break;

            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_Connected:
                APILogger.Warn($"[{debugName}] {connection.m_HSteamNetConnection} Connection established: {connectionInfo.m_szConnectionDescription}");
                onAccept?.Invoke(this);
                connected = true;
                receiveTask = ReceiveMessages();
                break;

            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_ClosedByPeer:
            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_ProblemDetectedLocally:
                APILogger.Warn($"[{debugName}] {connection.m_HSteamNetConnection} Connection closed: {connectionInfo.m_szEndDebug}, established: {connected}");
                if (connected == false) onFail?.Invoke(this);
                Dispose();
                break;
            }
        }

        public void Dispose() {
            running = false;
            receiveTask?.Wait();
            receiveTask?.Dispose();
            receiveTask = null;
            onClose?.Invoke(this);
            localClients.Remove(connection);
            SteamNetworkingSockets.CloseConnection(connection, 0, "Disconnect", false);
            cb_OnConnectionStatusChanged.Dispose();
        }
    }
}
