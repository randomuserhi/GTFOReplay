using API;
using BepInEx;
using BepInEx.Unity.IL2CPP;
using EWC.API;
using EWC.CustomWeapon;
using Gear;
using HarmonyLib;
using Vanilla.Events;

namespace ReplayRecorder.ExtraWeaponCustomization.BepInEx;

[BepInPlugin(Module.GUID, Module.Name, Module.Version)]
[BepInDependency(ReplayRecorder.BepInEx.Module.GUID, BepInDependency.DependencyFlags.HardDependency)]
[BepInDependency(Vanilla.BepInEx.Module.GUID, BepInDependency.DependencyFlags.HardDependency)]
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

        DamageAPI.PreExplosiveDamage += rEWCDamage.Hooks.Explosive;
        DamageAPI.PreDOTDamage += rEWCDamage.Hooks.DoT;

        FireShotAPI.OnShotFired += rEWCGunShot.Hooks.Trigger;

        rGunshot.RegisterCancelSyncedShot(CancelSyncedShot);
    }

    // NOTE(randomuserhi): Cancel synced tracers from projectile weapons and multishot weapons.
    private static bool CancelSyncedShot(BulletWeapon weapon) {
        CustomWeaponComponent? cwc = weapon.GetComponent<CustomWeaponComponent>();

        if (cwc == null) return false;

        if (cwc.HasTrait<EWC.CustomWeapon.Properties.Traits.Projectile>()) {
            return true;
        }

        if (cwc.TryGetTrait<EWC.CustomWeapon.Properties.Traits.MultiShot>(out var multiShot) && multiShot.CancelShot) {
            return true;
        }

        return false;
    }

    private static Harmony? harmony;
}