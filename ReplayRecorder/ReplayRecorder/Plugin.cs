using BepInEx;
using BepInEx.Unity.IL2CPP;
using HarmonyLib;
using API;

using BetterChat;

namespace ReplayRecorder;

[BepInPlugin(Module.GUID, Module.Name, Module.Version)]
[BepInDependency(BetterChat.Module.GUID, BepInDependency.DependencyFlags.SoftDependency)]
public class Plugin : BasePlugin
{
    public override void Load()
    {
        APILogger.Debug("Plugin is loaded!");
        harmony = new Harmony(Module.GUID);
        harmony.PatchAll();

        if (IL2CPPChainloader.Instance.Plugins.TryGetValue(BetterChat.Module.GUID, out _))
        {
            APILogger.Debug("BetterChat is installed, adding commands.");

            // TODO(randomuserhi)
        }

        APILogger.Debug("Debug is " + (ConfigManager.Debug ? "Enabled" : "Disabled"));
    }

    private static Harmony? harmony;
}