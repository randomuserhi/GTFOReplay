using Agents;
using API;
using Enemies;
using EWC.CustomWeapon.Properties.Traits.CustomProjectile.Components;
using EWC.Utils;
using Gear;
using HarmonyLib;
using LevelGeneration;
using Player;
using ReplayRecorder.API.Attributes;
using SNetwork;
using UnityEngine;
using Vanilla;
using Vanilla.StatTracker;

namespace ReplayRecorder.EWC {
    [HarmonyPatch]
    internal static class EWCAccuracy {
        private class BulletInfo {
            public int hits = 0;
            public int crits = 0;
        }

        private static Dictionary<ushort, BulletInfo> projectiles = new Dictionary<ushort, BulletInfo>();

        [ReplayInit]
        private static void Init() {
            projectiles.Clear();
        }

        public static void OnProjectileDespawn(EWCProjectileComponentBase projectile) {
            if (!projectile.IsLocal) return;

            if (!projectiles.ContainsKey(projectile.SyncID)) {
                projectiles.Add(projectile.SyncID, new BulletInfo());
            }

            BulletInfo bullet = projectiles[projectile.SyncID];

            if (bullet.hits > byte.MaxValue || bullet.crits > byte.MaxValue) {
                APILogger.Warn($"Number of enemies hit / crit for this bullet exceeded maximum value of {byte.MaxValue}.");
            }
            rGunshotInfo.Sync.Trigger(new rGunshotInfo(PlayerManager.GetLocalPlayerAgent(), Identifier.From(projectile.Settings.CWC.Weapon), (byte)bullet.hits, (byte)bullet.crits));

            projectiles.Remove(projectile.SyncID);
        }

        public static void OnProjectileHit(EWCProjectileComponentBase projectile, IDamageable? damageable) {
            if (!projectile.IsLocal) return;

            if (damageable == null) return;

            if (!projectiles.ContainsKey(projectile.SyncID)) {
                projectiles.Add(projectile.SyncID, new BulletInfo());
            }

            BulletInfo bullet = projectiles[projectile.SyncID];

            Dam_EnemyDamageLimb? enemy = damageable.TryCast<Dam_EnemyDamageLimb>();
            if (enemy != null && enemy.m_base.Owner.Alive) {
                bullet.hits += 1;
                if (enemy.m_type == eLimbDamageType.Weakspot) {
                    bullet.crits += 1;
                }

                return;
            }

            Dam_PlayerDamageLimb? player = damageable.TryCast<Dam_PlayerDamageLimb>();
            if (player != null && player.m_base.Owner.Alive) {
                bullet.hits += 1;
                return;
            }

            LG_WeakLockDamage? weakLock = damageable.TryCast<LG_WeakLockDamage>();
            if (weakLock != null && weakLock.Health > 0) {
                bullet.hits += 1;
                return;
            }

            if (damageable.TryCast<GenericDamageComponent>() != null) {
                bullet.hits += 1;
                return;
            }
        }

        private static Identifier currentWeapon = Identifier.unknown;
        private static PlayerAgent? currentPlayer = null;
        private static BulletInfo currentBullet = new BulletInfo();

        public static void PreShotFired(HitData hit, Ray ray) {
            if (!SNet.IsMaster && hit.owner.Owner.IsBot) return;
            if (!hit.owner.Owner.IsBot && !hit.owner.IsLocallyOwned) return;

            currentPlayer = hit.owner;

            currentWeapon = Identifier.unknown;
            ItemEquippable currentEquipped = currentPlayer.Inventory.m_wieldedItem;
            if (currentEquipped.IsWeapon && currentEquipped.TryCast<BulletWeapon>() != null) {
                currentWeapon = Identifier.From(currentEquipped);
            }
        }

        public static void OnShotFired(HitData hit, Vector3 start, Vector3 end) {
            if (currentPlayer == null) return;

            if (currentBullet.hits > byte.MaxValue || currentBullet.crits > byte.MaxValue) {
                APILogger.Warn($"Number of enemies hit / crit for this bullet exceeded maximum value of {byte.MaxValue}.");
            }
            rGunshotInfo.Sync.Trigger(new rGunshotInfo(currentPlayer, currentWeapon, (byte)currentBullet.hits, (byte)currentBullet.crits));

            currentPlayer = null;
            currentBullet.crits = 0;
            currentBullet.hits = 0;
        }

        public static void OnExplosiveDamage(float damage, EnemyAgent enemy, Dam_EnemyDamageLimb limb, PlayerAgent? player) {
            if (!enemy.Alive) return;

            // EWC handler
            if (currentPlayer != null) {
                ++currentBullet.hits;
                if (limb.m_type == eLimbDamageType.Weakspot) {
                    ++currentBullet.crits;
                }
            }

            // Vanilla handler
            if (rGunshotInfo.Patches.currentPlayer != null) {
                ++rGunshotInfo.Patches.currentBullet.hits;
                if (limb.m_type == eLimbDamageType.Weakspot) {
                    ++rGunshotInfo.Patches.currentBullet.crits;
                }
            }
        }

        [HarmonyPatch(typeof(Dam_EnemyDamageLimb), nameof(Dam_EnemyDamageLimb.BulletDamage))]
        [HarmonyPrefix]
        public static void Prefix_EnemyLimbBulletDamage(Dam_EnemyDamageLimb __instance, Agent sourceAgent) {
            if (!__instance.m_base.Owner.Alive) return;
            if (currentPlayer == null) return;

            ++currentBullet.hits;
            if (__instance.m_type == eLimbDamageType.Weakspot) {
                ++currentBullet.crits;
            }
        }

        [HarmonyPatch(typeof(Dam_PlayerDamageLimb), nameof(Dam_PlayerDamageLimb.BulletDamage))]
        [HarmonyPrefix]
        public static void Prefix_PlayerLimbBulletDamage(Dam_PlayerDamageLimb __instance, Agent sourceAgent) {
            if (!__instance.m_base.Owner.Alive) return;
            if (currentPlayer == null) return;

            ++currentBullet.hits;
        }

        [HarmonyPatch(typeof(GenericDamageComponent), nameof(GenericDamageComponent.BulletDamage))]
        [HarmonyPrefix]
        public static void Prefix_GenericBulletDamage(GenericDamageComponent __instance, Agent sourceAgent) {
            if (currentPlayer == null) return;

            ++currentBullet.hits;
        }

        [HarmonyPatch(typeof(LG_WeakLockDamage), nameof(LG_WeakLockDamage.BulletDamage))]
        [HarmonyPrefix]
        public static void Prefix_LockBulletDamage(LG_WeakLockDamage __instance, Agent sourceAgent) {
            if (__instance.Health <= 0) return;
            if (currentPlayer == null) return;

            ++currentBullet.hits;
        }
    }
}
