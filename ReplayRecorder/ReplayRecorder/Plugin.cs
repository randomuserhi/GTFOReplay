extern alias GTFO;

using API;
using BepInEx;
using BepInEx.Unity.IL2CPP;
using HarmonyLib;
using Il2CppInterop.Runtime.Injection;
using ReplayRecorder.Net;
using ReplayRecorder.Snapshot;

namespace ReplayRecorder.BepInEx;

[BepInPlugin(Module.GUID, Module.Name, Module.Version)]
public class Plugin : BasePlugin {
    public override void Load() {
        APILogger.Log("Plugin is loaded!");
        harmony = new Harmony(Module.GUID);
        harmony.PatchAll();

        APILogger.Log("Debug is " + (ConfigManager.Debug ? "Enabled" : "Disabled"));

        ClassInjector.RegisterTypeInIl2Cpp<SnapshotInstance>();
        ClassInjector.RegisterTypeInIl2Cpp<MainThread>();

        Replay.RegisterAll();

        RundownManager.OnExpeditionGameplayStarted += (Action)OnGameplayStart;

        RNet.Init(); // Communication between players
        ClientViewer.Init(); // Communcation between Game and Viewer
        HostClient.Init(); // Communication between Host and Client (Spectator)
    }

    private static void OnGameplayStart() {
        Replay.OnGameplayStart?.Invoke();
    }

    private static Harmony? harmony;
}