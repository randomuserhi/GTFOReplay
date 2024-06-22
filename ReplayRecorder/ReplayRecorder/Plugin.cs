using API;
using BepInEx;
using BepInEx.Unity.IL2CPP;
using HarmonyLib;
using Il2CppInterop.Runtime.Injection;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Snapshot;
using System.Net;

namespace ReplayRecorder.BepInEx;

[BepInPlugin(Module.GUID, Module.Name, Module.Version)]
public class Plugin : BasePlugin {
    internal static HashSet<EndPoint> acknowledged = new HashSet<EndPoint>();
    internal static TCPServer server = new TCPServer();

    /// <summary>
    /// Is called when a client connects to the TCPServer.
    /// 
    /// Acknowledge the connected client and send back current replay path if currently in a game.
    /// </summary>
    /// <param name="endPoint"></param>
    internal static void onAccept(EndPoint endPoint) {
        APILogger.Debug($"{endPoint} connected.");

        if (SnapshotManager.instance == null) return;
        SnapshotInstance instance = SnapshotManager.instance;
        /*if (instance.Ready) {
            ByteBuffer packet = new ByteBuffer();
            BitHelper.WriteBytes((ushort)Net.MessageType.StartGame, packet);
            BitHelper.WriteBytes(instance.filename, packet);

            _ = server.SendTo(packet.Array, endPoint);
        }*/
    }

    /// <summary>
    /// Is called when receiving a message from a client.
    /// 
    /// Manages incoming messages from the client:
    /// - Acknowledgement: Upon receiving acknowledgement from the client, will proceed with communication.
    ///                    Non-acknowledged but connected clients will not be communicated with.
    /// </summary>
    /// <param name="buffer">Received bytes.</param>
    /// <param name="endPoint"></param>
    internal static void onReceive(ArraySegment<byte> buffer, EndPoint endPoint) {
        APILogger.Debug($"Received bytes '{buffer.Count}' from {endPoint}.");
        int index = 0;
        Net.MessageType type = (Net.MessageType)BitHelper.ReadUShort(buffer, ref index);
        APILogger.Debug($"Received message of type '{type}'.");
        switch (type) {
        case Net.MessageType.Acknowledgement: {
            APILogger.Debug($"Acknowledged: {endPoint}");
            acknowledged.Add(endPoint);
            break;
        }
        }
    }

    /// <summary>
    /// Unregister acknowledgement from clients on disconnect.
    /// </summary>
    /// <param name="endPoint"></param>
    internal static void onDisconnect(EndPoint endPoint) {
        APILogger.Debug($"{endPoint} disconnected.");
        acknowledged.Remove(endPoint);
    }

    /// <summary>
    /// Clear all acknowledged clients on closure of TCPServer.
    /// </summary>
    internal static void onClose() {
        acknowledged.Clear();
    }

    /// <summary>
    /// Send a "game has started" message to acknowledged clients.
    /// </summary>
    [ReplayInit]
    internal static void TriggerGameStart() {
        ByteBuffer packet = new ByteBuffer();
        BitHelper.WriteBytes((ushort)Net.MessageType.StartGame, packet);
        BitHelper.WriteBytes(SnapshotManager.GetInstance().fullpath, packet);

        _ = server.Send(packet.Array);
    }

    /// <summary>
    /// Send a "game has ended" message to acknowledged clients.
    /// </summary>
    [ReplayReset]
    internal static void TriggerGameEnd() {
        ByteBuffer packet = new ByteBuffer();
        BitHelper.WriteBytes((ushort)Net.MessageType.EndGame, packet);

        _ = server.Send(packet.Array);
    }

    public override void Load() {
        APILogger.Log("Plugin is loaded!");
        harmony = new Harmony(Module.GUID);
        harmony.PatchAll();

        APILogger.Log("Debug is " + (ConfigManager.Debug ? "Enabled" : "Disabled"));

        ClassInjector.RegisterTypeInIl2Cpp<SnapshotInstance>();
        Replay.RegisterAll();
        RundownManager.OnExpeditionGameplayStarted += Replay.OnGameplayStart;

        server.onAccept += onAccept;
        server.onReceive += onReceive;
        server.onClose += onClose;
        server.onDisconnect += onDisconnect;
        server.Bind(new IPEndPoint(IPAddress.Any, 56759));
    }

    private static Harmony? harmony;
}