extern alias GTFO;

using API;
using Steamworks;
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

        private Callback<SteamNetConnectionStatusChangedCallback_t> cb_OnConnectionStatusChanged;

        public SteamServer() {
            server = SteamNetworkingSockets.CreateListenSocketP2P(0, 0, new SteamNetworkingConfigValue_t[] { });

            cb_OnConnectionStatusChanged = Callback<SteamNetConnectionStatusChangedCallback_t>.Create(OnConnectionStatusChanged);

        }

        public HashSet<HSteamNetConnection> currentConnections = new HashSet<HSteamNetConnection>();

        private async Task ReceiveMessages(HSteamNetConnection connection) {
            int numMessages = 0;

            IntPtr[] messageBuffer = new IntPtr[10];

            do {
                numMessages = SteamNetworkingSockets.ReceiveMessagesOnConnection(connection, messageBuffer, messageBuffer.Length);
                for (int i = 0; i < numMessages; ++i) {
                    SteamNetworkingMessage_t message = SteamNetworkingMessage_t.FromIntPtr(messageBuffer[i]);

                    byte[] data = new byte[message.m_cbSize];
                    Marshal.Copy(message.m_pData, data, 0, data.Length);

                    onReceive?.Invoke(data, connection);

                    SteamNetworkingMessage_t.Release(messageBuffer[i]);
                }

                await Task.Delay(16);
            } while (numMessages >= 0);
        }

        public void Send(ArraySegment<byte> data) {
            foreach (HSteamNetConnection connection in currentConnections) {
                SendTo(connection, data);
            }
        }

        public void SendTo(HSteamNetConnection connection, ArraySegment<byte> data) {
            const int packetSize = Constants.k_cbMaxSteamNetworkingSocketsMessageSizeSend;

            int numMessages = Mathf.CeilToInt(data.Count / (float)packetSize);
            IntPtr[] messages = new IntPtr[numMessages];
            long[] results = new long[numMessages];

            int bytesWritten = 0;
            int index = 0;
            while (bytesWritten < data.Count) {
                int bytesToWrite = Mathf.Min(data.Count - bytesWritten, packetSize);
                IntPtr packetPtr = SteamGameServerNetworkingUtils.AllocateMessage(bytesToWrite);

                // Copy to managed
                SteamNetworkingMessage_t packet = SteamNetworkingMessage_t.FromIntPtr(packetPtr);

                packet.m_conn = connection;
                packet.m_nFlags = Constants.k_nSteamNetworkingSend_Reliable;

                Marshal.Copy(data.Array!, data.Offset + bytesWritten, packet.m_pData, bytesToWrite);

                bytesWritten += bytesToWrite;
                messages[index] = packetPtr;
                ++index;

                // Copy back to unmanaged
                Marshal.StructureToPtr(packet, packetPtr, true);
            }

            SteamNetworkingSockets.SendMessages(numMessages, messages, results);
        }

        private void OnConnectionStatusChanged(SteamNetConnectionStatusChangedCallback_t callbackData) {
            HSteamNetConnection connection = callbackData.m_hConn;
            SteamNetConnectionInfo_t connectionInfo = callbackData.m_info;

            if (connectionInfo.m_hListenSocket != server) return;
            if (rSteamClient.localClients.Contains(connection)) return;

            switch (connectionInfo.m_eState) {
            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_Connecting:
                APILogger.Debug($"[Server] Incoming connection from: {connectionInfo.m_szConnectionDescription}");

                // Accept the connection
                EResult acceptResult = SteamNetworkingSockets.AcceptConnection(connection);
                if (acceptResult != EResult.k_EResultOK) {
                    APILogger.Debug($"[Server] Failed to accept connection: {acceptResult}");
                    SteamNetworkingSockets.CloseConnection(connection, 0, "Failed to accept", false);
                } else {
                    APILogger.Debug("[Server] Connection accepted!");
                }
                break;

            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_Connected:
                APILogger.Debug($"[Server] Connection established: {connectionInfo.m_szConnectionDescription}");
                currentConnections.Add(connection);
                onAccept?.Invoke(connection);
                _ = ReceiveMessages(connection);
                break;

            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_ClosedByPeer:
            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_ProblemDetectedLocally:
                APILogger.Debug($"[Server] Connection closed: {connectionInfo.m_szEndDebug}");
                currentConnections.Remove(connection);
                onDisconnect?.Invoke(connection);
                SteamNetworkingSockets.CloseConnection(connection, 0, "Closed", false);
                break;
            }
        }

        public void Dispose() {
            cb_OnConnectionStatusChanged.Dispose();
            SteamNetworkingSockets.CloseListenSocket(server);
            onClose?.Invoke();
        }
    }
}
