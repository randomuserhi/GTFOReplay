using API;
using BepInEx;
using BepInEx.Unity.IL2CPP;
using HarmonyLib;
using Il2CppInterop.Runtime.Injection;
using ReplayRecorder.Snapshot;
using System.Net;

namespace ReplayRecorder.BepInEx;

[BepInPlugin(Module.GUID, Module.Name, Module.Version)]
public class Plugin : BasePlugin {
    internal static TCPServer server = new TCPServer();

    public override void Load() {
        APILogger.Log("Plugin is loaded!");
        harmony = new Harmony(Module.GUID);
        harmony.PatchAll();

        APILogger.Log("Debug is " + (ConfigManager.Debug ? "Enabled" : "Disabled"));

        ClassInjector.RegisterTypeInIl2Cpp<SnapshotInstance>();
        Replay.RegisterAll();
        RundownManager.OnExpeditionGameplayStarted += Replay.OnGameplayStart;

        server.Bind(new IPEndPoint(IPAddress.Any, 56759));
    }

    private static Harmony? harmony;
}