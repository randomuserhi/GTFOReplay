extern alias GTFO;

using API;
using HarmonyLib;
using ReplayRecorder.Snapshot;
using SNetwork;
using Steamworks;
using System.Collections.Concurrent;

namespace ReplayRecorder.Steam {
    public class ConcurrentHashSet<T> : ConcurrentDictionary<T, byte>
    where T : notnull {
        const byte DummyByte = byte.MinValue;

        public bool Contains(T item) => ContainsKey(item);
        public bool Add(T item) => TryAdd(item, DummyByte);
        public bool Remove(T item) => TryRemove(item, out _);
    }

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
        }

        internal static void onAccept(HSteamNetConnection connection) {
            if (Server == null) return;

            ByteBuffer cpacket = new ByteBuffer();
            BitHelper.WriteBytes(sizeof(ushort), cpacket); // message size in bytes
            BitHelper.WriteBytes((ushort)Net.MessageType.Connected, cpacket);

            Server.SendTo(connection, cpacket.Array);

            if (SnapshotManager.instance != null) {
                SnapshotInstance instance = SnapshotManager.instance;
                if (instance.Active) {
                    // Trigger start if already in level

                    ByteBuffer spacket = new ByteBuffer();
                    BitHelper.WriteBytes(sizeof(ushort), spacket); // message size in bytes
                    BitHelper.WriteBytes((ushort)Net.MessageType.StartGame, spacket);

                    Server.SendTo(connection, spacket.Array);

                    // NOTE(randomuserhi): Need to queue up current packets to send after file is sent
                    Server.currentConnections[connection].queuePackets = true;

                    // Send file:
                    Task.Run(() => {
                        if (Server == null) return;

                        byte[] buffer;

                        do {

                            instance.Flush();

                            using (var fs = new FileStream(instance.fullpath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) {
                                using (var ms = new MemoryStream()) {
                                    fs.CopyTo(ms);
                                    buffer = ms.ToArray();
                                }
                            }

                        } while (buffer.Length != instance.byteOffset);

                        ByteBuffer packet = new ByteBuffer();

                        // Header
                        const int sizeOfHeader = sizeof(ushort) + sizeof(int) + sizeof(int);
                        BitHelper.WriteBytes(sizeOfHeader + buffer.Length, packet); // message size in bytes
                        BitHelper.WriteBytes((ushort)Net.MessageType.LiveBytes, packet); // message type
                        BitHelper.WriteBytes(0, packet); // offset
                        BitHelper.WriteBytes(buffer.Length, packet); // number of bytes to read
                        BitHelper.WriteBytes(buffer, packet, false); // file-bytes

                        Server.SendTo(connection, packet.Array, force: true);

                        Server.currentConnections[connection].queuePackets = false;
                    });
                }
            }

            readyConnections.Add(connection);
        }

        internal static void onDisconnect(HSteamNetConnection connection) {
            readyConnections.Remove(connection);
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
    }
}
