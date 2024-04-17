using API;
using HarmonyLib;
using Player;
using ReplayRecorder;
using ReplayRecorder.SNetUtils;
using SNetwork;
using Vanilla.Map;

namespace Vanilla.Cfoam.Patches {
    [HarmonyPatch]
    internal static class SpawnPatches {
        [HarmonyPatch(typeof(ProjectileManager), nameof(ProjectileManager.SpawnGlueGunProjectileIfNeeded))]
        [HarmonyPostfix]
        private static void SpawnGlueGunProjectile(ProjectileManager __instance, GlueGunProjectile __result) {
            if (__result == null) return;

            PlayerAgent player = PlayerManager.GetLocalPlayerAgent();
            byte dimension;
            if (SNetUtils.TryGetSender(__instance.m_fireGlue.m_packet, out SNet_Player? sender) && sender.PlayerAgent != null) {
                dimension = (byte)sender.PlayerAgent.Cast<PlayerAgent>().DimensionIndex;
            } else if (player != null) {
                dimension = (byte)player.DimensionIndex;
            } else {
                dimension = 0;
                APILogger.Error("Could not get dimension of cfoam blob.");
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
            if (!Replay.Active) return;
            if (__instance.m_landed || __instance.m_landedOnEnemy) return;

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
