using API;
using HarmonyLib;
using Player;
using UnityEngine;

namespace ReplayRecorder.Glue.Patches
{
    [HarmonyPatch]
    class GluePatches
    {
        [HarmonyPatch(typeof(ProjectileManager), nameof(ProjectileManager.SpawnGlueGunProjectileIfNeeded))]
        [HarmonyPostfix]
        private static void SpawnGlueGunProjectile(ProjectileManager __instance, GlueGunProjectile __result)
        {
            Glue.SpawnGlue(__result);
        }

        [HarmonyPatch(typeof(ProjectileManager), nameof(ProjectileManager.DoDestroyGlue))]
        [HarmonyPrefix]
        private static void DoDestroyGlue(ProjectileManager.pDestroyGlue data)
        {
            if (ProjectileManager.Current.m_glueGunProjectiles.ContainsKey(data.syncID))
            {
                GlueGunProjectile p = ProjectileManager.Current.m_glueGunProjectiles[data.syncID];
                Glue.DespawnGlue(p);
            }
        }
    }
}
