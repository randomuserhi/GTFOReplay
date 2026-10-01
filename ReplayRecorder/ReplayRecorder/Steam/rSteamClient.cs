using API;
using ReplayRecorder.IO;
using Steamworks;

namespace ReplayRecorder.Steam {
    internal class rSteamClient : IDisposable {
        public delegate void OnAccept(rSteamClient connection);
        public delegate void OnReceive(ArraySegment<byte> buffer, rSteamClient connection);
        public delegate void OnFail(rSteamClient connection);
        public OnAccept? onAccept;
        public OnReceive? onReceive;
        public OnFail? onFail;
        internal static readonly ConcurrentHashSet<HSteamNetConnection> localClients = new();
        private readonly HSteamNetConnection connection;
        private readonly Callback<SteamNetConnectionStatusChangedCallback_t> callback;
        private readonly PacketSendQueue outgoing;
        private readonly string debugName;
        private int disposed;
        private bool connected;

        public rSteamClient(ulong steamid, int virtualPort, SteamNetworkingConfigValue_t[]? options = null, string debugName = "Client") {
            this.debugName = debugName;
            SteamNetworkingIdentity identity = default;
            identity.SetSteamID(new CSteamID(steamid));
            connection = SteamNetworkingSockets.ConnectP2P(ref identity, virtualPort, options?.Length ?? 0, options);
            localClients.Add(connection);
            outgoing = new PacketSendQueue(data => SteamPacketIO.Send(connection, data));
            callback = Callback<SteamNetConnectionStatusChangedCallback_t>.Create(OnConnectionStatusChanged);
        }
        public bool Send(ArraySegment<byte> data) {
            try { return outgoing.Send(data); }
            catch (Exception error) {
                SteamPacketIO.Report($"{debugName}/send", error);
                Dispose();
                return false;
            }
        }
        private async Task ReceiveMessages() {
            var pointers = new IntPtr[50];
            try {
                while (Volatile.Read(ref disposed) == 0) {
                    SteamPacketIO.Receive(connection, pointers, data => onReceive?.Invoke(data, this));
                    outgoing.Flush();
                    await Task.Delay(16);
                }
            } catch (Exception error) {
                SteamPacketIO.Report($"{debugName}/receive", error);
                Dispose();
            }
        }
        private void OnConnectionStatusChanged(SteamNetConnectionStatusChangedCallback_t data) {
            if (data.m_hConn != connection || Volatile.Read(ref disposed) != 0) return;
            try {
                switch (data.m_info.m_eState) {
                case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_Connected:
                    if (connected) return;
                    connected = true;
                    onAccept?.Invoke(this);
                    _ = ReceiveMessages();
                    break;
                case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_ClosedByPeer:
                case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_ProblemDetectedLocally:
                    APILogger.Warn($"[{debugName}] Connection closed: {data.m_info.m_szEndDebug}");
                    if (!connected) SteamPacketIO.Guard($"{debugName}/failed", () => onFail?.Invoke(this));
                    Dispose();
                    break;
                }
            } catch (Exception error) {
                SteamPacketIO.Report($"{debugName}/connection-status", error);
                Dispose();
            }
        }
        public void Dispose() {
            if (Interlocked.Exchange(ref disposed, 1) != 0) return;
            outgoing.Dispose();
            localClients.Remove(connection);
            SteamPacketIO.Guard($"{debugName}/native-close", () => SteamNetworkingSockets.CloseConnection(connection, 0, "Disconnect", false));
            SteamPacketIO.Guard($"{debugName}/callback-dispose", callback.Dispose);
            // Never Wait() on a task whose continuation can need Unity's main thread.
        }
    }
}
