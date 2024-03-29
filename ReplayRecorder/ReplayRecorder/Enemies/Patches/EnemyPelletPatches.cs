﻿using Agents;
using API;
using Enemies;
using HarmonyLib;
using SNetwork;
using UnityEngine;

namespace ReplayRecorder.Enemies.Patches {
    [HarmonyPatch]
    class EnemyShooterPatches {
        // TODO(randomuserhi): Implement client side fix for tracking pellets => sphere cast to find closest enemy
        //                     or spatial partition
        //                     https://github.com/randomuserhi/StatTracker/commit/41b57c04b7357f6bf9bc4b791689a1e338398fc9

        private static EnemyAgent? currentShooter = null;

        #region patches to manage currentShooter

        [HarmonyPatch(typeof(EAB_ProjectileShooter), nameof(EAB_ProjectileShooter.FireAtAgent))]
        [HarmonyPrefix]
        private static void Prefix_FireAtAgent(EAB_ProjectileShooter __instance) {
            currentShooter = __instance.m_owner;
        }

        [HarmonyPatch(typeof(EAB_ProjectileShooter), nameof(EAB_ProjectileShooter.FireAtAgent))]
        [HarmonyPostfix]
        private static void Postfix_FireAtAgent(EAB_ProjectileShooter __instance) {
            currentShooter = null;
        }

        [HarmonyPatch(typeof(EAB_ProjectileShooter), nameof(EAB_ProjectileShooter.FireChaos))]
        [HarmonyPrefix]
        private static void Prefix_FireChaos(EAB_ProjectileShooter __instance) {
            currentShooter = __instance.m_owner;
        }

        [HarmonyPatch(typeof(EAB_ProjectileShooter), nameof(EAB_ProjectileShooter.FireChaos))]
        [HarmonyPostfix]
        private static void Postfix_FireChaos(EAB_ProjectileShooter __instance) {
            currentShooter = null;
        }

        [HarmonyPatch(typeof(EAB_ProjectileShooterSquidBoss), nameof(EAB_ProjectileShooterSquidBoss.FireAtAgent))]
        [HarmonyPrefix]
        private static void Prefix_Squid_FireAtAgent(EAB_ProjectileShooterSquidBoss __instance) {
            currentShooter = __instance.m_owner;
        }

        [HarmonyPatch(typeof(EAB_ProjectileShooterSquidBoss), nameof(EAB_ProjectileShooterSquidBoss.FireAtAgent))]
        [HarmonyPostfix]
        private static void Postfix_Squid_FireAtAgent(EAB_ProjectileShooterSquidBoss __instance) {
            currentShooter = null;
        }

        [HarmonyPatch(typeof(EAB_ProjectileShooterSquidBoss), nameof(EAB_ProjectileShooterSquidBoss.FireChaos))]
        [HarmonyPrefix]
        private static void Prefix_Squid_FireChaos(EAB_ProjectileShooterSquidBoss __instance) {
            currentShooter = __instance.m_owner;
        }

        [HarmonyPatch(typeof(EAB_ProjectileShooterSquidBoss), nameof(EAB_ProjectileShooterSquidBoss.FireChaos))]
        [HarmonyPostfix]
        private static void Postfix_Squid_FireChaos(EAB_ProjectileShooterSquidBoss __instance) {
            currentShooter = null;
        }

        #endregion

        [HarmonyPatch(typeof(ProjectileManager), nameof(ProjectileManager.DoFireTargeting))]
        [HarmonyPrefix]
        private static bool DoFireTargeting(ProjectileManager __instance, ProjectileManager.pFireTargeting data) {
            Agent comp;
            data.target.TryGet(out comp);
            Vector3 pos = data.position;
            Quaternion rot = Quaternion.LookRotation(data.forward);
            GameObject projectile = ProjectileManager.SpawnProjectileType(data.type, pos, rot);
            IProjectile component = projectile.GetComponent<IProjectile>();
            ProjectileTargeting targeting = projectile.GetComponent<ProjectileTargeting>();
            if (targeting != null)
                __instance.m_projectiles.Add(targeting);
            component.OnFire(comp);

            if (SNet.IsMaster) {
                if (currentShooter != null) Enemy.RegisterPellet(currentShooter, projectile);
                else APILogger.Debug($"currentShooter was null, this should not happen.");
            }

            Enemy.OnPelletSpawn(projectile, targeting!);

            return false;
        }

        [HarmonyPatch(typeof(ProjectileBase), nameof(ProjectileBase.OnDestroy))]
        [HarmonyPrefix]
        private static void OnDestroy(ProjectileBase __instance) {
            int instance = __instance.gameObject.GetInstanceID();
            Enemy.OnPelletDespawn(instance);
            if (SNet.IsMaster) Enemy.UnregisterPellet(instance);
        }

        private static EnemyAgent? hitByShooter = null;

        [HarmonyPatch(typeof(ProjectileBase), nameof(ProjectileBase.Collision))]
        [HarmonyPrefix]
        private static void Prefix_Collision(ProjectileBase __instance) {
            int instance = __instance.gameObject.GetInstanceID();
            Enemy.OnPelletDespawn(instance);

            if (SNet.IsMaster) {
                if (Enemy.pellets.ContainsKey(instance))
                    hitByShooter = Enemy.pellets[instance].owner;
                else APILogger.Debug($"Projectile was not tracked, this should not happen.");

                Enemy.UnregisterPellet(instance);
            }
        }

        [HarmonyPatch(typeof(ProjectileBase), nameof(ProjectileBase.Collision))]
        [HarmonyPostfix]
        private static void Postfix_Collision() {
            hitByShooter = null;
        }

        [HarmonyPatch(typeof(Dam_SyncedDamageBase), nameof(Dam_SyncedDamageBase.ShooterProjectileDamage))]
        [HarmonyPrefix]
        private static bool ShooterProjectileDamage(Dam_SyncedDamageBase __instance, float dam, Vector3 position) {
            if (!SNet.IsMaster) return true;

            pMediumDamageData data = new pMediumDamageData();
            data.damage.Set(dam, __instance.HealthMax);
            data.localPosition.Set(position - __instance.GetBaseAgent().Position, 10f);
            if (hitByShooter != null) data.source.Set(hitByShooter);
            else APILogger.Debug($"hitByShooter was null, this should not happen.");
            if (__instance.SendPacket()) {
                if (SNet.IsMaster) {
                    __instance.m_shooterProjectileDamagePacket.Send(data, SNet_ChannelType.GameNonCritical);
                } else {
                    __instance.m_shooterProjectileDamagePacket.Send(data, SNet_ChannelType.GameNonCritical, SNet.Master);
                }
            }
            if (__instance.SendLocally()) {
                __instance.ReceiveShooterProjectileDamage(data);
            }

            return false;
        }
    }
}
