using API;
using ReplayRecorder.BepInEx;
using ReplayRecorder.IO;
using Steamworks;
using System.Collections.Concurrent;

namespace ReplayRecorder.Steam {
    internal class rSteamServer : IDisposable {
        public delegate void OnAccept(HSteamNetConnection connection);
        public delegate void OnReceive(ArraySegment<byte> buffer, HSteamNetConnection connection);
        public delegate void OnDisconnect(HSteamNetConnection connection);
        public delegate void OnClose();
        public const int maxPacketSize = 81920;
        public OnAccept? onAccept;
        public OnReceive? onReceive;
        public OnDisconnect? onDisconnect;
        public OnClose? onClose;
        private readonly HSteamListenSocket server;
        private readonly Callback<SteamNetConnectionStatusChangedCallback_t> callback;
        private readonly string debugName;
        private int disposed;

        public rSteamServer(int virtualPort, SteamNetworkingConfigValue_t[]? options = null, string debugName = "Server") {
            this.debugName = debugName;
            server = SteamNetworkingSockets.CreateListenSocketP2P(virtualPort, options?.Length ?? 0, options);
            callback = Callback<SteamNetConnectionStatusChangedCallback_t>.Create(OnConnectionStatusChanged);
        }

        public class Connection {
            public readonly HSteamNetConnection connection;
            private readonly rSteamServer server;
            internal readonly PacketSendQueue outgoing;
            private int stopped;
            public string name = "Unknown";
            public readonly ulong steamID;
            internal bool Running => Volatile.Read(ref stopped) == 0;
            public Connection(rSteamServer server, HSteamNetConnection connection, ulong steamID) {
                this.connection = connection;
                this.server = server;
                this.steamID = steamID;
                outgoing = new PacketSendQueue(data => SteamPacketIO.Send(connection, data));
            }
            internal bool Stop() {
                if (Interlocked.Exchange(ref stopped, 1) != 0) return false;
                outgoing.Dispose();
                return true;
            }
            internal async Task ReceiveMessages() {
                var pointers = new IntPtr[50];
                try {
                    while (Running) {
                        SteamPacketIO.Receive(connection, pointers, data => server.onReceive?.Invoke(data, connection));
                        outgoing.Flush();
                        await Task.Delay(16);
                    }
                } catch (Exception error) {
                    SteamPacketIO.Report($"{server.debugName}/receive/{steamID}", error);
                    server.Close(this);
                }
            }
        }

        public readonly ConcurrentDictionary<HSteamNetConnection, Connection> currentConnections = new();
        public void Send(ArraySegment<byte> data) {
            foreach (var connection in currentConnections.Keys) SendTo(connection, data);
        }
        public bool SendTo(HSteamNetConnection connection, ArraySegment<byte> data) {
            if (!currentConnections.TryGetValue(connection, out var conn)) return false;
            try { return conn.outgoing.Send(data); }
            catch (Exception error) {
                SteamPacketIO.Report($"{debugName}/send/{conn.steamID}", error);
                Close(conn);
                return false;
            }
        }
        private void Close(Connection conn) {
            if (!conn.Stop()) return;
            // Notification still has access to the connection metadata for spectator cleanup.
            SteamPacketIO.Guard($"{debugName}/disconnect", () => onDisconnect?.Invoke(conn.connection));
            currentConnections.TryRemove(conn.connection, out _);
            SteamPacketIO.Guard($"{debugName}/close", () => SteamNetworkingSockets.CloseConnection(conn.connection, 0, "Disconnect", false));
        }
        private void OnConnectionStatusChanged(SteamNetConnectionStatusChangedCallback_t data) {
            try { ConnectionStatusChanged(data); }
            catch (Exception error) {
                SteamPacketIO.Report($"{debugName}/connection-status", error);
                if (currentConnections.TryGetValue(data.m_hConn, out var conn)) Close(conn);
                else SteamPacketIO.Guard($"{debugName}/reject", () => SteamNetworkingSockets.CloseConnection(data.m_hConn, 0, "Connection failure", false));
            }
        }
        private void ConnectionStatusChanged(SteamNetConnectionStatusChangedCallback_t data) {
            var connection = data.m_hConn;
            var info = data.m_info;
            if (Volatile.Read(ref disposed) != 0 || info.m_hListenSocket != server || rSteamClient.localClients.Contains(connection)) return;
            ulong steamID = info.m_identityRemote.GetSteamID64();
            switch (info.m_eState) {
            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_Connecting:
                bool allowed = steamID == SteamUser.GetSteamID().m_SteamID || ConfigManager.allowAnySpectator ||
                    (ConfigManager.WhiteListFriends && SteamFriends.GetFriendRelationship(new CSteamID(steamID)) == EFriendRelationship.k_EFriendRelationshipFriend) ||
                    ConfigManager.steamIDWhitelist.Contains(steamID);
                if (!allowed) {
                    APILogger.Warn($"[{debugName}] Rejected {steamID} from spectating your lobby.");
                    SteamNetworkingSockets.CloseConnection(connection, 0, "Not allowed", false);
                } else {
                    var result = SteamNetworkingSockets.AcceptConnection(connection);
                    if (result != EResult.k_EResultOK) throw new IOException($"Steam accept failed: {result}.");
                    APILogger.Warn($"[{debugName}] Allowed {steamID} to spectate your lobby.");
                }
                break;
            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_Connected:
                var conn = new Connection(this, connection, steamID);
                if (!currentConnections.TryAdd(connection, conn)) { conn.Stop(); return; }
                onAccept?.Invoke(connection);
                _ = conn.ReceiveMessages();
                break;
            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_ClosedByPeer:
            case ESteamNetworkingConnectionState.k_ESteamNetworkingConnectionState_ProblemDetectedLocally:
                APILogger.Warn($"[{debugName}] Connection closed: {info.m_szEndDebug}");
                if (currentConnections.TryGetValue(connection, out var existing)) Close(existing);
                break;
            }
        }
        public void Dispose() {
            if (Interlocked.Exchange(ref disposed, 1) != 0) return;
            foreach (var conn in currentConnections.Values) Close(conn);
            SteamPacketIO.Guard($"{debugName}/callback-dispose", callback.Dispose);
            SteamPacketIO.Guard($"{debugName}/listen-close", () => SteamNetworkingSockets.CloseListenSocket(server));
            SteamPacketIO.Guard($"{debugName}/closed", () => onClose?.Invoke());
        }
    }
}
