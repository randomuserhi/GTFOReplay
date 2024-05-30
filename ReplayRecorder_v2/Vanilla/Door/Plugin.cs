using BepInEx;
using BepInEx.Unity.IL2CPP;
using HarmonyLib;
using ReplayRecorder;

namespace Vanilla.Map.StaticItems.BepInEx;

[BepInPlugin(Module.GUID, Module.Name, Module.Version)]
[BepInDependency(ReplayRecorder.BepInEx.Module.GUID, BepInDependency.DependencyFlags.HardDependency)]
[BepInDependency(Specification.BepInEx.Module.GUID, BepInDependency.DependencyFlags.HardDependency)]
public class Plugin : BasePlugin {
    public override void Load() {
        harmony = new Harmony(Module.GUID);
        harmony.PatchAll();
        Replay.RegisterAll();
    }

    private static Harmony? harmony;
}