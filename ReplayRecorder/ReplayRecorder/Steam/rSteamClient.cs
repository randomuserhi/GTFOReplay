extern alias GTFO;

using API;
using Steamworks;
using System.Net;
using System.Runtime.InteropServices;

namespace ReplayRecorder.Steam {
    internal class rSteamClient : IDisposable {
        public SteamNet.clientOnAccept? onAccept = null;
        public SteamNet.clientOnReceive? onReceive = null;
        public SteamNet.clientOnClose? onClose = null;
        public SteamNet.clientOnFail? onFail = null;

        internal static HashSet<HSteamNetConnection> localClients = new();

        private bool running = true;
        private Task? receiveTask = null;

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
            } while (numMessages >= 0 && running);
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
                receiveTask = ReceiveMessages();
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
