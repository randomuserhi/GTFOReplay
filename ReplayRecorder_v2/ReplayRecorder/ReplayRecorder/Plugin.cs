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
    internal static void onAccept(EndPoint endPoint) {
        APILogger.Debug($"{endPoint} connected.");

        if (SnapshotManager.instance == null) return;
        SnapshotInstance instance = SnapshotManager.instance;
        if (instance.Ready) {
            ByteBuffer packet = new ByteBuffer();
            BitHelper.WriteBytes((ushort)Net.MessageType.StartGame, packet);
            BitHelper.WriteBytes(instance.fullpath, packet);

            _ = server.SendTo(packet.Array, endPoint);
        }
    }
    internal static void onReceive(ArraySegment<byte> buffer, EndPoint endPoint) {
        APILogger.Debug($"Received bytes '{buffer.Count}' from {endPoint}.");
        int index = 0;
        Net.MessageType type = (Net.MessageType)BitHelper.ReadUShort(buffer, ref index);
        APILogger.Debug($"Received message of type '{type}'.");
        switch (type) {
        case Net.MessageType.Acknowledgement: {
            if (SnapshotManager.instance == null) return;
            SnapshotInstance instance = SnapshotManager.instance;

            string path = BitHelper.ReadString(buffer, ref index);
            APILogger.Debug($"path: '{path}' -> {instance.fullpath}.");
            if (string.Equals(Path.GetFullPath(path), Path.GetFullPath(instance.fullpath), StringComparison.OrdinalIgnoreCase)) {
                acknowledged.Add(endPoint);
            }
            break;
        }
        }
    }
    internal static void onDisconnect(EndPoint endPoint) {
        APILogger.Debug($"{endPoint} disconnected.");
        acknowledged.Remove(endPoint);
    }
    internal static void onClose() {
        acknowledged.Clear();
    }

    [ReplayOnHeaderCompletion]
    internal static void TriggerGameStart() {
        ByteBuffer packet = new ByteBuffer();
        BitHelper.WriteBytes((ushort)Net.MessageType.StartGame, packet);
        BitHelper.WriteBytes(SnapshotManager.GetInstance().fullpath, packet);

        _ = server.Send(packet.Array);
    }

    [ReplayReset]
    internal static void TriggerGameEnd() {
        ByteBuffer packet = new ByteBuffer();
        BitHelper.WriteBytes((ushort)Net.MessageType.EndGame, packet);

        _ = server.Send(packet.Array);

        acknowledged.Clear();
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