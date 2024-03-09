using API;
using HarmonyLib;
using Player;
using ReplayRecorder;
using Vanilla.Map;

namespace Vanilla.Cfoam.Patches {
    [HarmonyPatch]
    internal static class SpawnPatches {
        [HarmonyPatch(typeof(ProjectileManager), nameof(ProjectileManager.SpawnGlueGunProjectileIfNeeded))]
        [HarmonyPostfix]
        private static void SpawnGlueGunProjectile(ProjectileManager __instance, GlueGunProjectile __result) {
            byte dimension;
            if (__result.m_owner != null) {
                dimension = (byte)__result.m_owner.DimensionIndex;
            } else {
                dimension = (byte)PlayerManager.GetLocalPlayerAgent().DimensionIndex;
            }

            int id = __result.GetInstanceID();
            if (Replay.Has<rCfoam>(id)) {
                rCfoam old = Replay.Get<rCfoam>(id);
                old.transform = new CfoamTransform(__result, old.transform.dimensionIndex);
            } else Replay.Spawn(new rCfoam(__result, dimension));
        }

        [HarmonyPatch(typeof(GlueGunProjectile), nameof(GlueGunProjectile.Update))]
        [HarmonyPostfix]
        private static void CheckGlueWithinBounds(GlueGunProjectile __instance) {
            int id = __instance.GetInstanceID();
            if (!Replay.Has<rCfoam>(id)) return;
            rCfoam foam = Replay.Get<rCfoam>(__instance.GetInstanceID());
            if (__instance.transform.position.y < MapBounds.lowestPoint[foam.transform.dimensionIndex]) {
                APILogger.Debug("Removed foam since it fell too far.");
                Replay.Despawn(foam);
            }
        }

        [HarmonyPatch(typeof(ProjectileManager), nameof(ProjectileManager.DoDestroyGlue))]
        [HarmonyPrefix]
        private static void DoDestroyGlue(ProjectileManager.pDestroyGlue data) {
            if (ProjectileManager.Current.m_glueGunProjectiles.ContainsKey(data.syncID)) {
                GlueGunProjectile p = ProjectileManager.Current.m_glueGunProjectiles[data.syncID];
                int id = p.GetInstanceID();
                if (!Replay.Has<rCfoam>(id)) return;
                Replay.Despawn(Replay.Get<rCfoam>(id));
            }
        }
    }
}
