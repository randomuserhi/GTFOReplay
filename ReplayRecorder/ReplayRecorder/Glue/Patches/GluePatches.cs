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

        [HarmonyPatch(typeof(GlueGunProjectile), nameof(GlueGunProjectile.Update))]
        [HarmonyPostfix]
        private static void CheckGlueBelowGround(GlueGunProjectile __instance)
        {
            if (Glue.glue.Contains(__instance.GetInstanceID()))
            {
                // TODO(randomuserhi): Find out what the layermask for the ground is
                // TODO(randomuserhi): Test cfoam falling through the ground of different dimension since
                //                     this ray might hit the ground of a different dimension negating it...
                // TODO(randomuserhi): Improve since if it falls through the floor that sits above a different room
                //                     this raycast won't catch that...
                //                     Another issue is shooting foam over gaps
                if (!Physics.Raycast(__instance.transform.position, Vector3.down))
                {
                    APILogger.Debug("Despawned glue as there was no ground beneath it. Suspected to be falling below surface.");
                    Glue.DespawnGlue(__instance);
                }
            }
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
