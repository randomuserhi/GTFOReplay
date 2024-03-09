using Enemies;
using HarmonyLib;
using ReplayRecorder;

namespace Vanilla.Enemy.Patches {
    [HarmonyPatch]
    internal static class BossLimbPatches {
        [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnSpawn))]
        [HarmonyPostfix]
        private static void OnSpawn(EnemySync __instance, pEnemySpawnData spawnData) {
            foreach (Dam_EnemyDamageLimb limb in __instance.m_damage.DamageLimbs) {
                Dam_EnemyDamageLimb_Custom? limbCustom = limb.TryCast<Dam_EnemyDamageLimb_Custom>();
                if (limbCustom != null && limbCustom.HasDestruction()) {
                    Replay.Spawn(new rLimbCustom(limbCustom));
                }
            }
        }
        [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnDespawn))]
        [HarmonyPostfix]
        private static void OnDespawn(EnemySync __instance) {
            foreach (Dam_EnemyDamageLimb limb in __instance.m_damage.DamageLimbs) {
                Dam_EnemyDamageLimb_Custom? limbCustom = limb.TryCast<Dam_EnemyDamageLimb_Custom>();
                if (limbCustom != null) {
                    int id = limbCustom.GetInstanceID();
                    if (Replay.Has<rLimbCustom>(id)) Replay.Despawn(Replay.Get<rLimbCustom>(id));
                }
            }
        }
        [HarmonyPatch(typeof(Dam_EnemyDamageLimb_Custom), nameof(Dam_EnemyDamageLimb_Custom.DestroyLimb))]
        [HarmonyPostfix]
        private static void OnDestroy(Dam_EnemyDamageLimb_Custom __instance) {
            if (Replay.Has<rLimbCustom>(__instance.GetInstanceID())) Replay.Despawn(Replay.Get<rLimbCustom>(__instance.GetInstanceID()));
        }
    }
}
