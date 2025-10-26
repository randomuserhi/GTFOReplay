using API;
using BepInEx;
using BepInEx.Unity.IL2CPP;
using HarmonyLib;
using Il2CppInterop.Runtime.Injection;

namespace MindControl.BepInEx;

[BepInPlugin(Module.GUID, Module.Name, Module.Version)]
public class Plugin : BasePlugin {
    public override void Load() {
        APILogger.Log("Plugin is loaded!");
        harmony = new Harmony(Module.GUID);
        harmony.PatchAll();

        ClassInjector.RegisterTypeInIl2Cpp<EnemyController>();

        APILogger.Log("Debug is " + (ConfigManager.Debug ? "Enabled" : "Disabled"));
    }

    private static Harmony? harmony;
}