using Agents;
using API;
using Enemies;
using HarmonyLib;
using UnityEngine;
using SNetwork;

namespace ReplayRecorder.Enemies.Patches
{
    [HarmonyPatch]
    class EnemyShooterPatches
    {
        private static EnemyAgent? currentShooter = null;

        [HarmonyPatch(typeof(EAB_ProjectileShooter), nameof(EAB_ProjectileShooter.FireAtAgent))]
        [HarmonyPrefix]
        private static void Prefix_FireAtAgent(EAB_ProjectileShooter __instance)
        {
            currentShooter = __instance.m_owner;
        }

        [HarmonyPatch(typeof(EAB_ProjectileShooter), nameof(EAB_ProjectileShooter.FireAtAgent))]
        [HarmonyPostfix]
        private static void Postfix_FireAtAgent(EAB_ProjectileShooter __instance)
        {
            currentShooter = null;
        }

        [HarmonyPatch(typeof(EAB_ProjectileShooter), nameof(EAB_ProjectileShooter.FireChaos))]
        [HarmonyPrefix]
        private static void Prefix_FireChaos(EAB_ProjectileShooter __instance)
        {
            currentShooter = __instance.m_owner;
        }

        [HarmonyPatch(typeof(EAB_ProjectileShooter), nameof(EAB_ProjectileShooter.FireChaos))]
        [HarmonyPostfix]
        private static void Postfix_FireChaos(EAB_ProjectileShooter __instance)
        {
            currentShooter = null;
        }

        [HarmonyPatch(typeof(ProjectileManager), nameof(ProjectileManager.DoFireTargeting))]
        [HarmonyPrefix]
        private static bool DoFireTargeting(ProjectileManager __instance, ProjectileManager.pFireTargeting data)
        {
            if (!SNet.IsMaster) return true;

            Agent? comp = null;
            data.target.TryGet(out comp);
            GameObject projectile = ProjectileManager.SpawnProjectileType(data.type, data.position, Quaternion.LookRotation(data.forward));
            IProjectile component = projectile.GetComponent<IProjectile>();
            ProjectileTargeting targeting = projectile.GetComponent<ProjectileTargeting>();
            if (targeting != null)
                __instance.m_projectiles.Add(targeting);
            component.OnFire(comp);

            if (currentShooter != null) Enemy.RegisterPellet(currentShooter, projectile);
            else APILogger.Debug($"currentShooter was null, this should not happen.");

            return false;
        }

        [HarmonyPatch(typeof(ProjectileTargeting), nameof(ProjectileTargeting.OnDestroy))]
        [HarmonyPrefix]
        private static void OnDestroy(ProjectileTargeting __instance)
        {
            if (!SNet.IsMaster) return;

            int instance = __instance.gameObject.GetInstanceID();
            Enemy.UnregisterPellet(instance);
        }

        private static EnemyAgent? hitByShooter = null;

        [HarmonyPatch(typeof(ProjectileBase), nameof(ProjectileBase.Collision))]
        [HarmonyPrefix]
        private static void Prefix_Collision(ProjectileBase __instance)
        {
            if (!SNet.IsMaster) return;

            int instance = __instance.gameObject.GetInstanceID();
            if (Enemy.pellets.ContainsKey(instance))
                hitByShooter = Enemy.pellets[instance].owner;
            else APILogger.Debug($"Projectile was not tracked, this should not happen.");

            Enemy.UnregisterPellet(instance);
        }

        [HarmonyPatch(typeof(ProjectileBase), nameof(ProjectileBase.Collision))]
        [HarmonyPostfix]
        private static void Postfix_Collision()
        {
            hitByShooter = null;
        }

        [HarmonyPatch(typeof(Dam_SyncedDamageBase), nameof(Dam_SyncedDamageBase.ShooterProjectileDamage))]
        [HarmonyPrefix]
        private static bool ShooterProjectileDamage(Dam_SyncedDamageBase __instance, float dam, Vector3 position)
        {
            if (!SNet.IsMaster) return true;

            pMediumDamageData data = new pMediumDamageData();
            data.damage.Set(dam, __instance.HealthMax);
            data.localPosition.Set(position - __instance.GetBaseAgent().Position, 10f);
            if (hitByShooter != null) data.source.Set(hitByShooter);
            else APILogger.Debug($"hitByShooter was null, this should not happen.");
            if (__instance.SendPacket())
            {
                if (SNet.IsMaster)
                {
                    __instance.m_shooterProjectileDamagePacket.Send(data, SNet_ChannelType.GameNonCritical);
                }
                else
                {
                    __instance.m_shooterProjectileDamagePacket.Send(data, SNet_ChannelType.GameNonCritical, SNet.Master);
                }
            }
            if (__instance.SendLocally())
            {
                __instance.ReceiveShooterProjectileDamage(data);
            }

            return false;
        }
    }
}
