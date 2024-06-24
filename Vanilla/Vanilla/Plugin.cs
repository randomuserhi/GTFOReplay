using API;
using BepInEx;
using BepInEx.Unity.IL2CPP;
using HarmonyLib;
using ReplayRecorder;

namespace Vanilla.BepInEx;

[BepInPlugin(Module.GUID, Module.Name, Module.Version)]
[BepInDependency(OldBulkheadSoundGUID, BepInDependency.DependencyFlags.SoftDependency)]
public class Plugin : BasePlugin {
    // TODO(randomuserhi): Create a better API for handling compatability
    // NOTE(randomuserhi): Compatability issue with LG_SecurityDoor.OnDoorIsOpened
    private const string OldBulkheadSoundGUID = "OldBulkheadSound.GUID";

    public override void Load() {
        APILogger.Log("Plugin is loaded!");
        harmony = new Harmony(Module.GUID);
        harmony.PatchAll();

        Replay.RegisterAll();

        APILogger.Log("Debug is " + (ConfigManager.Debug ? "Enabled" : "Disabled"));

        Noises.Noises.OldBulkheadSound_Compatability(harmony, OldBulkheadSoundGUID);
    }

    private static Harmony? harmony;
}