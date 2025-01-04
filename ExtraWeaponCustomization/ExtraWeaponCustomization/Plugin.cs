using API;
using BepInEx;
using BepInEx.Unity.IL2CPP;
using EWC.API;
using HarmonyLib;

namespace ReplayRecorder.EWC.BepInEx;

[BepInPlugin(Module.GUID, Module.Name, Module.Version)]
[BepInDependency(ReplayRecorder.BepInEx.Module.GUID, BepInDependency.DependencyFlags.HardDependency)]
[BepInDependency("Dinorush.ExtraWeaponCustomization", BepInDependency.DependencyFlags.HardDependency)]
public class Plugin : BasePlugin {
    public override void Load() {
        APILogger.Log("Plugin is loaded!");
        harmony = new Harmony(Module.GUID);
        harmony.PatchAll();

        APILogger.Log("Debug is " + (ConfigManager.Debug ? "Enabled" : "Disabled"));

        Replay.RegisterAll();

        ProjectileAPI.OnProjectileSpawned += rEWCProjectile.Hooks.OnSpawn;
        ProjectileAPI.OnProjectileDestroyed += rEWCProjectile.Hooks.OnDespawn;

        ExplosionAPI.OnExplosionSpawned += rEWCExplosion.Hooks.Trigger;

        DamageAPI.OnExplosiveDamage += rEWCDamage.Hooks.Explosive;
        DamageAPI.OnDOTDamage += rEWCDamage.Hooks.DoT;
    }

    private static Harmony? harmony;
}