extern alias GTFO;

using API;
using HarmonyLib;
using Player;
using ReplayRecorder.BepInEx;
using ReplayRecorder.Snapshot;
using SNetwork;
using Steamworks;
using UnityEngine;

namespace ReplayRecorder.Steam {
    [HarmonyPatch]
    internal static class rSteamManager {
        private static bool initialized = false;
        public static SteamServer? Server { get; private set; } = null;
        public static ConcurrentHashSet<HSteamNetConnection> readyConnections = new ConcurrentHashSet<HSteamNetConnection>();

        [HarmonyPatch(typeof(SteamManager), nameof(SteamManager.PostSetup))]
        [HarmonyPrefix]
        private static void Prefix_PostSetup() {
            if (initialized) return;
            initialized = true;

            SteamAPI.Init();
            GameServer.Init(0x7f000001, 0, 0, EServerMode.eServerModeNoAuthentication, "0.0.0.1");
            SteamNetworkingUtils.InitRelayNetworkAccess();

            /*SteamNetworkingUtils.SetDebugOutputFunction(ESteamNetworkingSocketsDebugOutputType.k_ESteamNetworkingSocketsDebugOutputType_Everything, (type, message) => {
                APILogger.Debug($"[STEAMWORKS] {type}: {message}");
            });*/

            APILogger.Debug("Initialized Steamworks!");

            Server = new SteamServer();

            Server.onAccept += onAccept;
            Server.onDisconnect += onDisconnect;
            Server.onClose += onClose;
            Server.onReceive += onReceive;
        }

        internal static void onAccept(HSteamNetConnection connection) {
            if (Server == null) return;

            ByteBuffer cpacket = new ByteBuffer();
            BitHelper.WriteBytes(sizeof(ushort), cpacket); // message size in bytes
            BitHelper.WriteBytes((ushort)Net.MessageType.Connected, cpacket);

            Server.SendTo(connection, cpacket.Array);
        }

        internal static void onReceive(ArraySegment<byte> buffer, HSteamNetConnection connection) {
            if (Server == null) return;

            int index = 0;
            Net.MessageType type = (Net.MessageType)BitHelper.ReadUShort(buffer, ref index);
            APILogger.Debug($"Received message of type '{type}'.");
            switch (type) {
            case Net.MessageType.Connected: {
                string name = BitHelper.ReadString(buffer, ref index);
                APILogger.Warn($"{name} is spectating.");
                Server.currentConnections[connection].name = name;

                if (SnapshotManager.instance != null) {
                    SnapshotInstance instance = SnapshotManager.instance;
                    if (instance.Active) {
                        // Trigger start if already in level
                        // TODO(randomuserhi): Make sure this happens AFTER the client recieves the Net.MessageType.Connected message

                        APILogger.Debug("Already in match, sending start signal");

                        ByteBuffer spacket = new ByteBuffer();
                        BitHelper.WriteBytes(sizeof(ushort) + 1, spacket); // message size in bytes
                        BitHelper.WriteBytes((ushort)Net.MessageType.StartGame, spacket);
                        BitHelper.WriteBytes(instance.replayInstanceId, spacket);

                        Server.SendTo(connection, spacket.Array);

                        APILogger.Debug("Already in match, sending initial bytes:");

                        // Send file:
                        Task.Run(async () => {
                            if (Server == null) return;

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

                                    int bytesToSend = Mathf.Min(buffer.Length - bytesSent, SteamServer.maxPacketSize - sizeOfHeader - sizeof(int));

                                    ByteBuffer packet = new ByteBuffer(new byte[sizeOfHeader + bytesToSend + sizeof(int)]);

                                    // Header
                                    BitHelper.WriteBytes(sizeOfHeader + bytesToSend, packet); // message size in bytes
                                    BitHelper.WriteBytes((ushort)Net.MessageType.LiveBytes, packet); // message type
                                    BitHelper.WriteBytes(instance.replayInstanceId, packet); // replay instance id
                                    BitHelper.WriteBytes(bytesSent, packet); // offset
                                    BitHelper.WriteBytes(bytesToSend, packet); // number of bytes to read
                                    BitHelper.WriteBytes(new ArraySegment<byte>(buffer, bytesSent, bytesToSend), packet, false); // file-bytes

                                    Server.SendTo(connection, packet.Array);

                                    bytesSent += bytesToSend;

                                    APILogger.Debug($"Sending init {bytesSent}/{buffer.Length} ...");

                                    if (bytesSent < buffer.Length) await Task.Delay(16); // NOTE(randomuserhi): Avoid straining the network
                                }
                            } catch (Exception e) {
                                APILogger.Error($"Unable to send initial bytes: {e}");
                            }
                        });
                    }
                }

                readyConnections.Add(connection);
                break;
            }
            case Net.MessageType.InGameMessage: {
                // TODO(randomuserhi): Move this logic elsewhere
                if (Server.currentConnections.TryGetValue(connection, out SteamServer.Connection? conn) && conn != null) {
                    ushort messageId = BitHelper.ReadUShort(buffer, ref index); // Used to acknowledge sent messages

                    int length = BitHelper.ReadUShort(buffer, ref index);
                    if (length > 150) return; // Ignore messages longer than 150 bytes

                    string message = Utils.RemoveHTMLTags(BitHelper.ReadString(buffer, length, ref index).Trim());
                    APILogger.Warn($"Spectator Message > > {conn.name}: {message}");
                    if (message.Length == 0) return; // Ignore messages of 0 length;

                    if (ConfigManager.MuteChat) return;

                    MainThread.Run(() => {
                        if (!SNet.LocalPlayer.IsInLobby) return;

                        sendMessageToSpectators = false;

                        const int maxLen = 49 - 2;
                        message = $"[{conn.name}] " + message;
                        while (message.Length > maxLen) {
                            PlayerChatManager.WantToSentTextMessage(PlayerManager.GetLocalPlayerAgent(), $"> {message.Substring(0, maxLen).Trim()}");
                            message = message.Substring(maxLen).Trim();
                        }
                        PlayerChatManager.WantToSentTextMessage(PlayerManager.GetLocalPlayerAgent(), $"> {message}");

                        sendMessageToSpectators = true;

                        ByteBuffer packet = new ByteBuffer();
                        BitHelper.WriteBytes(sizeof(ushort) + sizeof(ushort), packet);
                        BitHelper.WriteBytes((ushort)Net.MessageType.AckInGameMessage, packet);
                        BitHelper.WriteBytes(messageId, packet);

                        Server?.SendTo(conn.connection, packet.Array);
                    });
                }
                break;
            }
            }
        }

        internal static void onDisconnect(HSteamNetConnection connection) {
            readyConnections.Remove(connection);

            if (Server != null && Server.currentConnections.ContainsKey(connection)) {
                APILogger.Warn($"{Server.currentConnections[connection].name} is no longer spectating");

                // Remove spectator from log list in current instance
                // TODO(randomuserhi): probably move this logic elsewhere
                if (SnapshotManager.instance != null) {
                    SnapshotManager.instance.spectators.Remove(connection);

                    const int maxLen = 50;
                    string message = $"[{Server.currentConnections[connection].name}] is no longer spectating.";
                    APILogger.Warn(message);
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

        internal static void onClose() {
            readyConnections.Clear();
        }

        [HarmonyPatch(typeof(SteamManager), nameof(SteamManager.Update))]
        [HarmonyPrefix]
        private static void Prefix_Update() {
            SteamAPI.RunCallbacks();
            SteamNetworkingSockets.RunCallbacks();
        }

        [HarmonyPatch(typeof(SNet_Core_STEAM), nameof(SNet_Core_STEAM.OnQuit))]
        [HarmonyPostfix]
        private static void Postfix_OnQuit() {
            if (!initialized) return;

            Server?.Dispose();
            SteamAPI.Shutdown();
            GameServer.Shutdown();

            APILogger.Debug("Shutdown Steamworks!");
        }

        // TODO(randomuserhi): Chat patches -> Should definitely move elsewhere lol
        private static bool sendMessageToSpectators = true;
        [ReplayRecorder.API.Attributes.ReplayPluginLoad]
        private static void OnLoad() {
            PlayerChatManager.OnIncomingChatMessage += (Action<string, SNet_Player, SNet_Player>)((string msg, SNet_Player srcPlayer, SNet_Player dstPlayer) => {
                if (Server == null) return;
                if (!sendMessageToSpectators) return;

                ByteBuffer packet = new ByteBuffer();
                packet.Reserve(sizeof(int), true);
                BitHelper.WriteBytes((ushort)Net.MessageType.InGameMessage, packet);
                BitHelper.WriteBytes(srcPlayer.Lookup, packet);
                BitHelper.WriteBytes(msg, packet);
                int index = 0;
                BitHelper.WriteBytes(packet.count - sizeof(int), packet.Array, ref index);

                Server.Send(packet.Array);
            });
        }
    }
}
