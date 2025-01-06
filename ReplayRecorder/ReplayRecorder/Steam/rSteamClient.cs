extern alias GTFO;

using API;
using Steamworks;
using System.Net;
using System.Runtime.InteropServices;
using UnityEngine;

namespace ReplayRecorder.Steam {
    internal class rSteamClient : IDisposable {
        public SteamNet.clientOnAccept? onAccept = null;
        public SteamNet.clientOnReceive? onReceive = null;
        public SteamNet.clientOnClose? onClose = null;
        public SteamNet.clientOnFail? onFail = null;

        internal static HashSet<HSteamNetConnection> localClients = new();

        private HSteamNetConnection connection;
        private SteamNetworkingIdentity identity;

        private Callback<SteamNetConnectionStatusChangedCallback_t> cb_OnConnectionStatusChanged;

        public readonly EndPoint associatedEndPoint;
        private bool connected = false;

        public rSteamClient(ulong steamid, EndPoint associatedEndPoint) {
            this.associatedEndPoint = associatedEndPoint;

            identity = default;
            identity.SetSteamID(new CSteamID(steamid));
            connection = SteamNetworkingSockets.ConnectP2P(ref identity, 0, 0, new SteamNetworkingConfigValue_t[] { });

            cb_OnConnectionStatusChanged = Callback<SteamNetConnectionStatusChangedCallback_t>.Create(OnConnectionStatusChanged);
        }

        private async Task ReceiveMessages() {
            int numMessages = 0;

            IntPtr[] messageBuffer = new IntPtr[10];

            do {
                numMessages = SteamNetworkingSockets.ReceiveMessagesOnConnection(connection, messageBuffer, messageBuffer.Length);
                for (int i = 0; i < numMessages; ++i) {
                    SteamNetworkingMessage_t message = SteamNetworkingMessage_t.FromIntPtr(messageBuffer[i]);

                    byte[] data = new byte[message.m_cbSize];
                    Marshal.Copy(message.m_pData, data, 0, data.Length);

                    onReceive?.Invoke(data, this);

                    SteamNetworkingMessage_t.Release(messageBuffer[i]);
                }

                await Task.Delay(16);
            } while (numMessages >= 0);
        }

        public void Send(ArraySegment<byte> data) {
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
            if (this.connection != connection) return;

            SteamNetConnectionInfo_t connectionInfo = callbackData.m_info;

            localClients.Add(connection);

            switch (connectionInfo.m_eState) {
            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_Connecting:
                APILogger.Debug($"[Client {connection.m_HSteamNetConnection}] Connecting to: {connectionInfo.m_szConnectionDescription}");
                connected = false;
                break;

            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_Connected:
                APILogger.Debug($"[Client {connection.m_HSteamNetConnection}] Connection established: {connectionInfo.m_szConnectionDescription}");
                onAccept?.Invoke(this);
                connected = true;
                _ = ReceiveMessages();
                break;

            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_ClosedByPeer:
            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_ProblemDetectedLocally:
                APILogger.Debug($"[Client {connection.m_HSteamNetConnection}] Connection closed: {connectionInfo.m_szEndDebug}, established: {connected}");
                if (connected == false) onFail?.Invoke(this);
                Dispose();
                break;
            }
        }

        public void Dispose() {
            onClose?.Invoke(this);
            localClients.Remove(connection);
            SteamNetworkingSockets.CloseConnection(connection, 0, "Disconnect", false);
        }
    }
}
