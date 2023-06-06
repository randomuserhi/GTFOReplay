using BepInEx;
using BepInEx.Unity.IL2CPP;
using HarmonyLib;
using API;

using BetterChat;

namespace StatTracker;

public static class Module
{
    public const string GUID = "randomuserhi.StatTracker";
    public const string Name = "StatTracker";
    public const string Version = "0.0.1";
}

[BepInPlugin(Module.GUID, Module.Name, Module.Version)]
[BepInDependency(BetterChatGUID, BepInDependency.DependencyFlags.SoftDependency)]
public class Plugin : BasePlugin
{
    const string BetterChatGUID = "randomuserhi.BetterChat";

    public override void Load()
    {
        APILogger.Debug(Module.Name, "Plugin is loaded!");
        harmony = new Harmony(Module.GUID);
        harmony.PatchAll();

        if (IL2CPPChainloader.Instance.Plugins.TryGetValue(BetterChatGUID, out _))
        {
            APILogger.Debug(Module.Name, "BetterChat is installed, adding commands.");

            // TODO(randomuserhi)
        }

        APILogger.Debug(Module.Name, "Debug is " + (ConfigManager.Debug ? "Enabled" : "Disabled"));
    }

    private static Harmony? harmony;
}