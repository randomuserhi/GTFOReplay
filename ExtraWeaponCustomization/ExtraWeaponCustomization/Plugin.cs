﻿using API;
using BepInEx;
using BepInEx.Unity.IL2CPP;
using EWC.API;
using EWC.CustomWeapon;
using Gear;
using HarmonyLib;
using Vanilla.Events;

namespace ReplayRecorder.EWC.BepInEx;

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

        ProjectileAPI.OnProjectileDestroyed += EWCAccuracy.OnProjectileDespawn;
        ProjectileAPI.OnProjectileHit += EWCAccuracy.OnProjectileHit;
        FireShotAPI.OnShotFired += EWCAccuracy.OnShotFired;
        FireShotAPI.PreShotFired += EWCAccuracy.PreShotFired;
        DamageAPI.PreExplosiveDamage += EWCAccuracy.OnExplosiveDamage;

        rGunshot.RegisterCancelSyncedShot(CancelSyncedShot);
    }

    private static bool CancelSyncedShot(BulletWeapon weapon) {
        CustomWeaponComponent? cwc = weapon.GetComponent<CustomWeaponComponent>();
        return cwc != null;
    }

    private static Harmony? harmony;
}