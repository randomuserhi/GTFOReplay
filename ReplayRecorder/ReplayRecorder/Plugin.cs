using BepInEx;
using BepInEx.Unity.IL2CPP;
using HarmonyLib;
using API;

using BetterChat;
using Il2CppInterop.Runtime.Injection;
using UnityEngine;

namespace ReplayRecorder;

[BepInPlugin(Module.GUID, Module.Name, Module.Version)]
[BepInDependency(BetterChat.Module.GUID, BepInDependency.DependencyFlags.SoftDependency)]
public class Plugin : BasePlugin
{
    public override void Load()
    {
        APILogger.Log("Plugin is loaded!");
        harmony = new Harmony(Module.GUID);
        harmony.PatchAll();

        if (IL2CPPChainloader.Instance.Plugins.TryGetValue(BetterChat.Module.GUID, out _))
        {
            APILogger.Log("BetterChat is installed, adding commands.");

            // TODO(randomuserhi)
        }

        APILogger.Log("Debug is " + (ConfigManager.Debug ? "Enabled" : "Disabled"));

        // Register snapshot behaviour
        ClassInjector.RegisterTypeInIl2Cpp<SnapshotManager>();

        // Setup
        SnapshotManager.Setup();
        //RundownManager.add_OnExpeditionGameplayStarted((Action)GameEventManager.OnGameplayStart);
    }

    private static Harmony? harmony;
}