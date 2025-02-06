extern alias GTFO;

using API;
using BepInEx;
using BepInEx.Unity.IL2CPP;
using HarmonyLib;
using Il2CppInterop.Runtime.Injection;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Snapshot;
using ReplayRecorder.Steam;
using System.Net;

namespace ReplayRecorder.BepInEx;

// TODO(randomuserhi): Refactor...

[BepInPlugin(Module.GUID, Module.Name, Module.Version)]
public class Plugin : BasePlugin {
    internal static TCPServer server = new TCPServer();
    internal static Dictionary<EndPoint, rSteamClient> endPointToClient = new Dictionary<EndPoint, rSteamClient>();

    /// <summary>
    /// Is called when a client connects to the TCPServer.
    /// 
    /// Acknowledge the connected client and send back current replay path if currently in a game.
    /// </summary>
    /// <param name="endPoint"></param>
    internal static void onAccept(EndPoint endPoint) {
        APILogger.Debug($"{endPoint} connected.");
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
            ulong id = BitHelper.ReadULong(buffer, ref index);
            APILogger.Debug($"Acknowledged: {endPoint}, connecting to {id}.");
            if (endPointToClient.ContainsKey(endPoint)) {
                endPointToClient[endPoint].Dispose();
                endPointToClient.Remove(endPoint);
            }
            rSteamClient steam = new rSteamClient(id, endPoint);
            steam.onAccept += steam_onAccept;
            steam.onReceive += steam_onReceive;
            steam.onFail += steam_onFail;
            endPointToClient.Add(endPoint, steam);
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
        if (endPointToClient.ContainsKey(endPoint)) {
            endPointToClient[endPoint].Dispose();
            endPointToClient.Remove(endPoint);
        }
    }

    /// <summary>
    /// Clear all acknowledged clients on closure of TCPServer.
    /// </summary>
    internal static void onClose() {
        foreach (rSteamClient client in endPointToClient.Values) {
            client.Dispose();
        }
        endPointToClient.Clear();
    }

    internal static void steam_onReceive(ArraySegment<byte> buffer, rSteamClient client) {
        _ = server.RawSendTo(buffer, client.associatedEndPoint);
    }

    internal static void steam_onFail(rSteamClient client) {
        ByteBuffer cpacket = new ByteBuffer();
        BitHelper.WriteBytes(sizeof(ushort), cpacket); // message size in bytes
        BitHelper.WriteBytes((ushort)Net.MessageType.FailedToConnect, cpacket);

        _ = server.RawSendTo(cpacket.Array, client.associatedEndPoint);
    }

    internal static void steam_onAccept(rSteamClient client) {
        ByteBuffer cpacket = new ByteBuffer();
        BitHelper.WriteBytes(sizeof(ushort), cpacket); // message size in bytes
        BitHelper.WriteBytes((ushort)Net.MessageType.Connected, cpacket);

        _ = server.RawSendTo(cpacket.Array, client.associatedEndPoint);
    }

    /// <summary>
    /// Send a "game has started" message to acknowledged clients.
    /// </summary>
    [ReplayInit]
    internal static void TriggerGameStart() {
        if (rSteamManager.Server == null) return;

        ByteBuffer packet = new ByteBuffer();
        BitHelper.WriteBytes(sizeof(ushort), packet); // message size in bytes
        BitHelper.WriteBytes((ushort)Net.MessageType.StartGame, packet);

        rSteamManager.Server.Send(packet.Array);
    }

    /// <summary>
    /// Send a "game has ended" message to acknowledged clients.
    /// </summary>
    [ReplayOnExpeditionEnd]
    internal static void TriggerGameEnd() {
        if (rSteamManager.Server == null) return;

        ByteBuffer packet = new ByteBuffer();
        BitHelper.WriteBytes(sizeof(ushort), packet); // message size in bytes
        BitHelper.WriteBytes((ushort)Net.MessageType.EndGame, packet);

        rSteamManager.Server.Send(packet.Array);
    }

    public override void Load() {
        APILogger.Log("Plugin is loaded!");
        harmony = new Harmony(Module.GUID);
        harmony.PatchAll();

        APILogger.Log("Debug is " + (ConfigManager.Debug ? "Enabled" : "Disabled"));

        ClassInjector.RegisterTypeInIl2Cpp<SnapshotInstance>();

        Replay.RegisterAll();

        RundownManager.OnExpeditionGameplayStarted += (Action)OnGameplayStart;
        RNet.Init();

        server.onAccept += onAccept;
        server.onReceive += onReceive;
        server.onClose += onClose;
        server.onDisconnect += onDisconnect;
        server.Bind(new IPEndPoint(IPAddress.Any, 56759));
    }

    private static void OnGameplayStart() {
        Replay.OnGameplayStart?.Invoke();
    }

    private static Harmony? harmony;
}