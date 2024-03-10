using Enemies;
using HarmonyLib;
using ReplayRecorder;

namespace Vanilla.Enemy.Patches {
    [HarmonyPatch]
    internal static class BossLimbPatches {
        private static bool isBoss(EnemyAgent enemy) {
            bool isBoss = false;
            switch (enemy.EnemyData.persistentID) {
            case 43:
            case 44:
            case 47:
            case 36:
            case 37:
            case 29: isBoss = true; break;
            }
            return isBoss;
        }

        [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnSpawn))]
        [HarmonyPostfix]
        private static void OnSpawn(EnemySync __instance, pEnemySpawnData spawnData) {
            if (!isBoss(__instance.m_agent)) return;
            foreach (Dam_EnemyDamageLimb limb in __instance.m_damage.DamageLimbs) {
                Dam_EnemyDamageLimb_Custom? limbCustom = limb.TryCast<Dam_EnemyDamageLimb_Custom>();
                if (limbCustom != null) {
                    Replay.Spawn(new rLimbCustom(limbCustom));
                }
            }
        }
        [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnDespawn))]
        [HarmonyPostfix]
        private static void OnDespawn(EnemySync __instance) {
            if (!isBoss(__instance.m_agent)) return;
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
