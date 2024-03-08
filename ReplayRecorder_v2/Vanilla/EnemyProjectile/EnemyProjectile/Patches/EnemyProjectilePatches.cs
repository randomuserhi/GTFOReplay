using Agents;
using HarmonyLib;
using ReplayRecorder;
using UnityEngine;

namespace Vanilla.EnemyProjectile.Patches {
    [HarmonyPatch]
    internal static class EnemyProjectilePatches {
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
            if (targeting != null) {
                __instance.m_projectiles.Add(targeting);
            }
            component.OnFire(comp);

            Replay.Spawn(new rEnemyProjectile(projectile));

            return false;
        }

        [HarmonyPatch(typeof(ProjectileBase), nameof(ProjectileBase.OnDestroy))]
        [HarmonyPrefix]
        private static void OnDestroy(ProjectileBase __instance) {
            Replay.Despawn(new rEnemyProjectile(__instance.gameObject));
        }

        [HarmonyPatch(typeof(ProjectileBase), nameof(ProjectileBase.Collision))]
        [HarmonyPrefix]
        private static void OnCollision(ProjectileBase __instance) {
            Replay.Despawn(new rEnemyProjectile(__instance.gameObject));
        }
    }
}
