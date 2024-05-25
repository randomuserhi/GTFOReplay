using Enemies;
using HarmonyLib;
using ReplayRecorder;
using UnityEngine;

namespace Vanilla.Enemy.Patches {
    [HarmonyPatch]
    internal static class BossLimbPatches {
        [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnSpawn))]
        [HarmonyPostfix]
        private static void OnSpawn(EnemySync __instance, pEnemySpawnData spawnData) {
            foreach (Dam_EnemyDamageLimb limb in __instance.m_damage.DamageLimbs) {
                Dam_EnemyDamageLimb_Custom? limbCustom = limb.TryCast<Dam_EnemyDamageLimb_Custom>();
                if (limbCustom != null) {
                    rLimbCustom.Bone bone = default;
                    Transform? boneTransform = rLimbCustom.GetBone(limbCustom, ref bone);
                    if (boneTransform != null) {
                        Replay.Spawn(new rLimbCustom(limbCustom, bone, boneTransform));
                    }
                }
            }
        }
        [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnDespawn))]
        [HarmonyPostfix]
        private static void OnDespawn(EnemySync __instance) {
            foreach (Dam_EnemyDamageLimb limb in __instance.m_damage.DamageLimbs) {
                Dam_EnemyDamageLimb_Custom? limbCustom = limb.TryCast<Dam_EnemyDamageLimb_Custom>();
                if (limbCustom != null) {
                    Replay.TryDespawn<rLimbCustom>(limbCustom.GetInstanceID());
                }
            }
        }
        [HarmonyPatch(typeof(Dam_EnemyDamageLimb_Custom), nameof(Dam_EnemyDamageLimb_Custom.DestroyLimb))]
        [HarmonyPostfix]
        private static void OnDestroy(Dam_EnemyDamageLimb_Custom __instance) {
            Replay.TryDespawn<rLimbCustom>(__instance.GetInstanceID());
        }
    }
}
