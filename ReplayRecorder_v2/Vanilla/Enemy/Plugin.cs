using BepInEx;
using BepInEx.Unity.IL2CPP;
using HarmonyLib;
using Il2CppInterop.Runtime.Injection;
using ReplayRecorder;
using Vanilla.Enemy.Patches;

namespace Vanilla.Enemy.BepInEx;

[BepInPlugin(Module.GUID, Module.Name, Module.Version)]
[BepInDependency(ReplayRecorder.BepInEx.Module.GUID, BepInDependency.DependencyFlags.HardDependency)]
public class Plugin : BasePlugin {
    public override void Load() {
        harmony = new Harmony(Module.GUID);
        harmony.PatchAll();

        ClassInjector.RegisterTypeInIl2Cpp<EnemyModelBehaviour>();
        Replay.RegisterAll();
    }

    private static Harmony? harmony;
}