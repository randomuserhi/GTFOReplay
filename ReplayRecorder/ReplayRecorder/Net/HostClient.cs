using API;
using HarmonyLib;
using Player;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.BepInEx;
using ReplayRecorder.Snapshot;
using ReplayRecorder.Steam;
using SNetwork;
using Steamworks;
using System.Net;
using System.Runtime.CompilerServices;
using UnityEngine;

namespace ReplayRecorder.Net {
    // Manages communication between GTFO Client and GTFO Host (Client spectating Host)
    [HarmonyPatch]
    internal static class HostClient {
        [MethodImpl(MethodImplOptions.NoInlining)]
        internal static void Init() { }

        // Connection consists of 2 sockets, one used for main replay data transfer and another slave socket used for commands etc...
        public class Connection : IDisposable {
            public rSteamClient main;
            public rSteamClient slave;
            public readonly EndPoint associatedEndPoint;

            public Connection(ulong host, EndPoint associatedEndPoint) {
                this.associatedEndPoint = associatedEndPoint;

                main = new rSteamClient(host, mainVPort, new SteamNetworkingConfigValue_t[] {
                    new SteamNetworkingConfigValue_t {
                        m_eValue = ESteamNetworkingConfigValue.k_ESteamNetworkingConfig_RecvBufferSize,
                        m_eDataType = ESteamNetworkingConfigDataType.k_ESteamNetworkingConfig_Int32,
                        m_val = new SteamNetworkingConfigValue_t.OptionValue() {
                            m_int32 = 10 * 1024 * 1024 // Increase recieve buffer to 10MB
                        }
                    }
                }, "MainClient");
                slave = new rSteamClient(host, slaveVPort, null, "SlaveClient");

                main.onAccept += main_onAccept;
                main.onFail += main_onFail;
                main.onReceive += onReceive;

                slave.onAccept += slave_onAccept;
                slave.onReceive += onReceive;
            }

            private void onReceive(ArraySegment<byte> buffer, rSteamClient client) {
                // Receive message from host

                int index = 0;
                MessageType type = (MessageType)BitHelper.ReadUShort(buffer, ref index);
                APILogger.Debug($"[HostClient.Connection] Received message of type '{type}'.");
                switch (type) {
                case MessageType.ForwardMessage: {
                    APILogger.Debug($"[HostClient.Connection] Forwarded {buffer.Count - index} bytes.");
                    _ = ClientViewer.socket.RawSendTo(new ArraySegment<byte>(buffer.Array!, buffer.Offset + index, buffer.Count - index), associatedEndPoint);
                    break;
                }
                default: {
                    APILogger.Error($"[HostClient.Connection] No behaviour defined for message of type '{type}'");
                    break;
                }
                }
            }

            private void main_onFail(rSteamClient client) {
                ByteBuffer cpacket = new ByteBuffer();
                // client -> viewer
                BitHelper.WriteBytes(sizeof(ushort), cpacket); // message size in bytes
                BitHelper.WriteBytes((ushort)ClientViewer.MessageType.FailedToConnect, cpacket);

                _ = ClientViewer.socket.RawSendTo(cpacket.Array, associatedEndPoint);
            }

            private void slave_onAccept(rSteamClient client) {
                ByteBuffer cpacket = new ByteBuffer();
                // client -> host
                BitHelper.WriteBytes((ushort)MessageType.Connected, cpacket);
                BitHelper.WriteBytes(SNet.LocalPlayer.NickName, cpacket);

                client.Send(cpacket.Array);
            }

            private void main_onAccept(rSteamClient client) {
                slave_onAccept(client);

                ByteBuffer cpacket = new ByteBuffer();
                // client -> viewer
                BitHelper.WriteBytes(sizeof(ushort), cpacket); // message size in bytes
                BitHelper.WriteBytes((ushort)ClientViewer.MessageType.Connected, cpacket);

                _ = ClientViewer.socket.RawSendTo(cpacket.Array, associatedEndPoint);
            }

            public void Dispose() {
                main.Dispose();
                slave.Dispose();
            }
        }

        internal static class Main {
            internal static void Init() {
                if (socket != null) return;

                socket = new rSteamServer(mainVPort, new SteamNetworkingConfigValue_t[] {
                    new SteamNetworkingConfigValue_t {
                        m_eValue = ESteamNetworkingConfigValue.k_ESteamNetworkingConfig_SendBufferSize,
                        m_eDataType = ESteamNetworkingConfigDataType.k_ESteamNetworkingConfig_Int32,
                        m_val = new SteamNetworkingConfigValue_t.OptionValue() {
                            m_int32 = 10 * 1024 * 1024 // Increase send buffer to 10MB
                        }
                    }
                }, "MainServer");

                socket.onAccept += onAccept;
                socket.onDisconnect += onDisconnect;
                socket.onClose += onClose;
                socket.onReceive += onReceive;

                APILogger.Warn("Started Main Server");
            }

            public static rSteamServer? socket;

            // Set of socket connections that are ready to recieve replay data
            public static ConcurrentHashSet<HSteamNetConnection> readyConnections = new ConcurrentHashSet<HSteamNetConnection>();

            private static void onAccept(HSteamNetConnection connection) {
                if (socket == null) return;

                ByteBuffer packet = new ByteBuffer();
                // host -> client : Forward message from host to viewer
                BitHelper.WriteBytes((ushort)MessageType.ForwardMessage, packet);

                // Message to forward
                BitHelper.WriteBytes(sizeof(ushort), packet); // message size in bytes
                BitHelper.WriteBytes((ushort)ClientViewer.MessageType.Connected, packet);

                socket.SendTo(connection, packet.Array);
            }

            // NOTE(randomuserhi): just an incrementing count for spectators with invalid names
            private static ushort anonymous = 0;
            private static void onReceive(ArraySegment<byte> buffer, HSteamNetConnection connection) {
                // Receive message from client

                if (socket == null) return;

                int index = 0;
                MessageType type = (MessageType)BitHelper.ReadUShort(buffer, ref index);
                APILogger.Debug($"[MainServer] Received message of type '{type}'.");
                switch (type) {
                case MessageType.Connected: {
                    string name = Utils.RemoveHTMLTags(BitHelper.ReadString(buffer, ref index)).Trim();
                    if (name.Length == 0) name = $"Spectator_{anonymous++}";
                    if (name.Length > 25) name = name.Substring(0, 25);
                    APILogger.Warn($"[MainServer] {name} is spectating.");
                    socket.currentConnections[connection].name = name;

                    if (SnapshotManager.instance != null) {
                        SnapshotInstance instance = SnapshotManager.instance;
                        if (instance.Active) {
                            // Trigger start if already in level
                            // TODO(randomuserhi): Make sure this happens AFTER the client recieves the Net.MessageType.Connected message

                            APILogger.Debug("[MainServer] Already in match, sending start signal");

                            ByteBuffer spacket = new ByteBuffer();
                            // host -> client : Forward message to viewer
                            BitHelper.WriteBytes((ushort)MessageType.ForwardMessage, spacket);

                            // Message to foward
                            BitHelper.WriteBytes(sizeof(ushort) + 1, spacket); // message size in bytes
                            BitHelper.WriteBytes((ushort)ClientViewer.MessageType.StartGame, spacket);
                            BitHelper.WriteBytes(instance.replayInstanceId, spacket);

                            socket.SendTo(connection, spacket.Array);

                            APILogger.Debug("[MainServer] Already in match, sending initial bytes:");

                            // Send file:
                            Task.Run(async () => {
                                if (socket == null) return;

                                byte[] buffer;

                                int currentOffset = instance.byteOffset;

                                do {

                                    instance.Flush();

                                    using (var fs = new FileStream(instance.fullpath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) {
                                        using (var ms = new MemoryStream()) {
                                            fs.CopyTo(ms);
                                            buffer = ms.ToArray();
                                        }
                                    }

                                } while (buffer.Length < currentOffset);

                                try {
                                    int bytesSent = 0;
                                    while (bytesSent < buffer.Length) {
                                        const int sizeOfHeader = sizeof(ushort) + 1 + sizeof(int) + sizeof(int);

                                        int bytesToSend = Mathf.Min(buffer.Length - bytesSent, rSteamServer.maxPacketSize - sizeof(ushort) - sizeOfHeader - sizeof(int));

                                        ByteBuffer packet = new ByteBuffer(new byte[sizeOfHeader + bytesToSend + sizeof(int)]);
                                        // host -> client : Forward message
                                        BitHelper.WriteBytes((ushort)MessageType.ForwardMessage, packet);

                                        // Message to forward to viewer
                                        BitHelper.WriteBytes(sizeOfHeader + bytesToSend, packet); // message size in bytes
                                        BitHelper.WriteBytes((ushort)ClientViewer.MessageType.LiveBytes, packet); // message type
                                        BitHelper.WriteBytes(instance.replayInstanceId, packet); // replay instance id
                                        BitHelper.WriteBytes(bytesSent, packet); // offset
                                        BitHelper.WriteBytes(bytesToSend, packet); // number of bytes to read
                                        BitHelper.WriteBytes(new ArraySegment<byte>(buffer, bytesSent, bytesToSend), packet, false); // file-bytes

                                        socket.SendTo(connection, packet.Array);

                                        bytesSent += bytesToSend;

                                        APILogger.Debug($"[MainServer] Sending init {bytesSent}/{buffer.Length} ...");

                                        if (bytesSent < buffer.Length) await Task.Delay(16); // NOTE(randomuserhi): Avoid straining the network
                                    }
                                } catch (Exception e) {
                                    APILogger.Error($"[MainServer] Unable to send initial bytes: {e}");
                                }
                            });
                        }
                    }

                    readyConnections.Add(connection);
                    break;
                }
                default: {
                    APILogger.Error($"[MainServer] No behaviour defined for message of type '{type}'");
                    break;
                }
                }
            }

            private static void onDisconnect(HSteamNetConnection connection) {
                readyConnections.Remove(connection);

                if (socket != null && socket.currentConnections.ContainsKey(connection)) {
                    APILogger.Warn($"[MainServer] {socket.currentConnections[connection].name} is no longer spectating");

                    // Remove spectator from log list in current snapshot instance
                    if (SnapshotManager.instance != null) {
                        SnapshotManager.instance.spectators.Remove(connection);

                        const int maxLen = 50;
                        string message = $"[{socket.currentConnections[connection].name}] is no longer spectating.";
                        if (!ConfigManager.DisableLeaveJoinMessages) {
                            while (message.Length > maxLen) {
                                PlayerChatManager.WantToSentTextMessage(PlayerManager.GetLocalPlayerAgent(), message.Substring(0, maxLen).Trim());
                                message = message.Substring(maxLen).Trim();
                            }
                            PlayerChatManager.WantToSentTextMessage(PlayerManager.GetLocalPlayerAgent(), message);
                        }
                    }
                }
            }

            private static void onClose() {
                readyConnections.Clear();
            }

            public static void Dispose() {
                socket?.Dispose();
                socket = null;
            }

            // Hooks to trigger start and end game messages

            [ReplayInit]
            private static void TriggerGameStart() {
                // Send game start packet to clients

                if (Main.socket == null) return;

                SnapshotInstance? instance = SnapshotManager.instance;
                if (instance == null) {
                    APILogger.Error("Snapshot instance was not running, but tried to trigger network game start.");
                    return;
                }

                ByteBuffer packet = new ByteBuffer();
                // host -> client : Forward message to viewer
                BitHelper.WriteBytes((ushort)MessageType.ForwardMessage, packet);

                // Message to forward to viewer
                BitHelper.WriteBytes(sizeof(ushort) + 1, packet); // message size in bytes
                BitHelper.WriteBytes((ushort)ClientViewer.MessageType.StartGame, packet);
                BitHelper.WriteBytes(instance.replayInstanceId, packet);

                Main.socket.Send(packet.Array);
            }

            [ReplayOnExpeditionEnd]
            private static void TriggerGameEnd() {
                // Send end game packet to clients

                if (Main.socket == null) return;

                ByteBuffer packet = new ByteBuffer();
                // host -> client : Forward message to viewer
                BitHelper.WriteBytes((ushort)MessageType.ForwardMessage, packet);

                // Message to forward to viewer
                BitHelper.WriteBytes(sizeof(ushort), packet); // message size in bytes
                BitHelper.WriteBytes((ushort)ClientViewer.MessageType.EndGame, packet);

                Main.socket.Send(packet.Array);
            }
        }

        [HarmonyPatch]
        internal static class Slave {
            internal static void Init() {
                if (socket != null) return;

                socket = new rSteamServer(slaveVPort, null, "SlaveServer");
                socket.onReceive += onReceive;
            }

            public static rSteamServer? socket;

            // NOTE(randomuserhi): just an incrementing count for spectators with invalid names
            private static ushort anonymous = 0;
            private static void onReceive(ArraySegment<byte> buffer, HSteamNetConnection connection) {
                // Receive message from client

                if (socket == null) return;

                int index = 0;
                MessageType type = (MessageType)BitHelper.ReadUShort(buffer, ref index);
                APILogger.Debug($"[SlaveServer] Received message of type '{type}'.");
                switch (type) {
                case MessageType.Connected: {
                    string name = Utils.RemoveHTMLTags(BitHelper.ReadString(buffer, ref index)).Trim();
                    if (name.Length == 0) name = $"Spectator_{anonymous++}";
                    if (name.Length > 25) name = name.Substring(0, 25);
                    APILogger.Warn($"[SlaveServer] Setup socket for {name}.");
                    socket.currentConnections[connection].name = name;
                    break;
                }
                case MessageType.InGameMessage: {
                    if (socket.currentConnections.TryGetValue(connection, out rSteamServer.Connection? conn) && conn != null) {
                        ushort messageId = BitHelper.ReadUShort(buffer, ref index); // Used to acknowledge sent messages

                        int length = BitHelper.ReadUShort(buffer, ref index);
                        if (length > 150) return; // Ignore messages longer than 150 bytes

                        string message = Utils.RemoveHTMLTags(BitHelper.ReadString(buffer, length, ref index).Trim());
                        APILogger.Warn($"[SlaveServer] Spectator Message > > {conn.name}: {message}");
                        if (message.Length == 0) return; // Ignore messages of 0 length;

                        if (ConfigManager.MuteChat) return;

                        MainThread.Run(() => {
                            if (!SNet.LocalPlayer.IsInLobby) return;

                            spectatorMessageSender = conn;

                            const int maxLen = 49 - 2;
                            message = $"[{conn.name}] " + message;
                            while (message.Length > maxLen) {
                                PlayerChatManager.WantToSentTextMessage(PlayerManager.GetLocalPlayerAgent(), $"> {message.Substring(0, maxLen).Trim()}");
                                message = message.Substring(maxLen).Trim();
                            }
                            PlayerChatManager.WantToSentTextMessage(PlayerManager.GetLocalPlayerAgent(), $"> {message}");

                            spectatorMessageSender = null;

                            ByteBuffer packet = new ByteBuffer();
                            // host -> client : Forward message to viewer
                            BitHelper.WriteBytes((ushort)MessageType.ForwardMessage, packet);

                            // Message to viewer
                            BitHelper.WriteBytes(sizeof(ushort) + sizeof(ushort), packet);
                            BitHelper.WriteBytes((ushort)ClientViewer.MessageType.AckInGameMessage, packet);
                            BitHelper.WriteBytes(messageId, packet);

                            socket.SendTo(conn.connection, packet.Array);
                        });
                    }
                    break;
                }
                default: {
                    APILogger.Error($"[SlaveServer] No behaviour defined for message of type '{type}'");
                    break;
                }
                }
            }

            public static void Dispose() {
                socket?.Dispose();
                socket = null;
            }

            // Hooks to send in game messages across network

            private static rSteamServer.Connection? spectatorMessageSender = null;
            [HarmonyPatch(typeof(PlayerChatManager), nameof(PlayerChatManager.WantToSentTextMessage))]
            [HarmonyPrefix]
            private static void OnWantToSendMessage(PlayerAgent fromPlayer, string message, PlayerAgent toPlayer) {
                if (fromPlayer.Owner.Lookup != SNet.LocalPlayer.Lookup) return; // Ignore messages not from local player
                if (Slave.socket == null) return;

                ByteBuffer packet = new ByteBuffer();
                // host -> client : Forward message to viewer
                BitHelper.WriteBytes((ushort)MessageType.ForwardMessage, packet);

                // Message to forward
                packet.Reserve(sizeof(int), true);
                BitHelper.WriteBytes((ushort)ClientViewer.MessageType.InGameMessage, packet);
                BitHelper.WriteBytes(fromPlayer.Owner.Lookup, packet);
                BitHelper.WriteBytes(message, packet);
                BitHelper.WriteBytes(packet.count - sizeof(ushort) - sizeof(int), packet.Array, sizeof(ushort));

                if (spectatorMessageSender == null) {
                    Task.Run(() => Slave.socket.Send(packet.Array));
                } else {
                    HSteamNetConnection _sender = spectatorMessageSender.connection;
                    Task.Run(() => {
                        foreach (HSteamNetConnection connection in Slave.socket.currentConnections.Keys) {
                            if (connection != _sender) {
                                Slave.socket.SendTo(connection, packet.Array);
                            }
                        }
                    });
                }
            }

            [ReplayPluginLoad]
            private static void OnLoad() {
                PlayerChatManager.OnIncomingChatMessage += (Action<string, SNet_Player, SNet_Player>)((string msg, SNet_Player srcPlayer, SNet_Player dstPlayer) => {
                    if (srcPlayer.Lookup == SNet.LocalPlayer.Lookup) return; // Ignore local messages, they are handled by a local patch
                    if (Slave.socket == null) return;

                    ByteBuffer packet = new ByteBuffer();
                    // host -> client : Forward message to viewer
                    BitHelper.WriteBytes((ushort)MessageType.ForwardMessage, packet);

                    // Message to forward
                    packet.Reserve(sizeof(int), true);
                    BitHelper.WriteBytes((ushort)ClientViewer.MessageType.InGameMessage, packet);
                    BitHelper.WriteBytes(srcPlayer.Lookup, packet);
                    BitHelper.WriteBytes(msg, packet);
                    BitHelper.WriteBytes(packet.count - sizeof(ushort) - sizeof(int), packet.Array, sizeof(ushort));

                    Task.Run(() => Slave.socket.Send(packet.Array));
                });
            }
        }

        public enum MessageType {
            ForwardMessage,
            Connected,
            InGameMessage
        }

        private const int mainVPort = 10420;
        private const int slaveVPort = 10069;

        static HostClient() {
            rSteamworks.onInit += OnSteamworksInit;
            rSteamworks.onDispose += OnSteamworksDispose;
        }

        private static void OnSteamworksInit() {
            Main.Init();
            Slave.Init();
        }

        private static void OnSteamworksDispose() {
            Main.Dispose();
            Slave.Dispose();
        }
    }
}
