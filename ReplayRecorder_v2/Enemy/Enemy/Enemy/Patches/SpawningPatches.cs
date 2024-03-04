using Enemies;
using HarmonyLib;

namespace Vanilla.Enemy.Patches {
    [HarmonyPatch]
    internal class SpawningPatches {
        [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnSpawn))]
        [HarmonyPostfix]
        private static void OnSpawn(EnemySync __instance, pEnemySpawnData spawnData) {
            EnemyReplayManager.Spawn(__instance.m_agent/*, spawnData.mode*/);
        }
        [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnDespawn))]
        [HarmonyPostfix]
        private static void OnDespawn(EnemySync __instance) {
            EnemyReplayManager.Despawn(__instance.m_agent);
        }
    }
}
