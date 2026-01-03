using API;
using System.Net;
using System.Runtime.CompilerServices;

namespace ReplayRecorder.Net {
    // Manages communication between GTFO Client and Viewer application
    internal static class ClientViewer {
        [MethodImpl(MethodImplOptions.NoInlining)]
        internal static void Init() { }

        public enum MessageType {
            StartGame,          // client -> viewer : signals that a game has started
            EndGame,            // client -> viewer : signals that a game has ended
            LiveBytes,          // client -> viewer : live snapshot bytes 
            Acknowledgement,    // viewer -> client : viewer has acknowledged the connection and wishes to connect to the given host
            Connected,          // client -> viewer : successfully connected to host
            FailedToConnect,    // client -> viewer : failed to connect to host
            InGameMessage,      // viewer <> client : chat message being sent or recieved between host and viewer
            AckInGameMessage,   // client -> viewer : host has acknowledged and recieved the sent chat message
        }

        public static TCPServer socket = new TCPServer();

        // Maps the viewer connection to its associated steam connection 
        public static Dictionary<EndPoint, HostClient.Connection> endPointToSteam = new Dictionary<EndPoint, HostClient.Connection>();

        static ClientViewer() {
            socket.onAccept += onAccept;
            socket.onReceive += onReceive;
            socket.onClose += onClose;
            socket.onDisconnect += onDisconnect;
            socket.Bind(new IPEndPoint(IPAddress.Any, 56759));
        }

        private static void onAccept(EndPoint endPoint) {
            APILogger.Warn($"[ClientViewer] {endPoint} connected.");
        }

        private static void onReceive(ArraySegment<byte> buffer, EndPoint endPoint) {
            // Receive message from viewer

            APILogger.Debug($"[ClientViewer] Received bytes '{buffer.Count}' from {endPoint}.");
            int index = 0;
            MessageType type = (MessageType)BitHelper.ReadUShort(buffer, ref index);
            APILogger.Debug($"[ClientViewer] Received message of type '{type}'.");
            switch (type) {
            case MessageType.Acknowledgement: {
                ulong id = BitHelper.ReadULong(buffer, ref index);
                APILogger.Debug($"[ClientViewer] Acknowledged: {endPoint}, connecting to {id}.");
                if (endPointToSteam.ContainsKey(endPoint)) {
                    endPointToSteam[endPoint].Dispose();
                    endPointToSteam.Remove(endPoint);
                }

                // Request HostClient connection
                endPointToSteam.Add(endPoint, new HostClient.Connection(id, endPoint));
                break;
            }
            case MessageType.InGameMessage: {
                if (endPointToSteam.ContainsKey(endPoint)) {
                    // Convert message type
                    BitHelper.WriteBytes((ushort)HostClient.MessageType.InGameMessage, buffer, 0);

                    // Forward in game messages via slave socket to avoid congestion with replay stream
                    endPointToSteam[endPoint].slave.Send(buffer);
                }
                break;
            }
            default: {
                APILogger.Error($"[ClientViewer] No behaviour defined for message of type '{type}'");
                break;
            }
            }
        }

        private static void onDisconnect(EndPoint endPoint) {
            APILogger.Warn($"[ClientViewer] {endPoint} disconnected.");
            if (endPointToSteam.ContainsKey(endPoint)) {
                endPointToSteam[endPoint].Dispose();
                endPointToSteam.Remove(endPoint);
            }
        }

        private static void onClose() {
            foreach (HostClient.Connection connection in endPointToSteam.Values) {
                connection.Dispose();
            }
            endPointToSteam.Clear();
        }
    }
}
