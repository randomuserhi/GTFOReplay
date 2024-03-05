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
        [HarmonyPatch(typeof(EnemyBehaviour), nameof(EnemyBehaviour.ChangeState), new Type[] { typeof(EB_States) })]
        [HarmonyPrefix]
        private static void Behaviour_ChangeState(EnemyBehaviour __instance, EB_States state) {
            if (__instance.m_currentStateName != state && state == EB_States.Dead) {
                // TODO(randomuserhi): Send dead event
                EnemyReplayManager.Despawn(__instance.m_ai.m_enemyAgent);
                return;
            }
        }
    }
}
