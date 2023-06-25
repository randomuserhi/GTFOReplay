using API;
using HarmonyLib;
using Enemies;

namespace ReplayRecorder.Enemies.Patches
{
    [HarmonyPatch]
    class EnemyPatches
    {
        // State change of enemy => hibernating -> attacking
        [HarmonyPatch(typeof(EnemyBehaviour), nameof(EnemyBehaviour.ChangeState), new Type[] { typeof(EB_States) })]
        [HarmonyPrefix]
        private static void ChangeState(EnemyBehaviour __instance, EB_States state)
        {
            if (!SnapshotManager.active) return;

            // TODO(randomuserhi): This works on client side => move to killindicatorfix
            if (__instance.m_currentStateName != state && state == EB_States.Dead)
            {
                Enemy.DeadEnemy(__instance.m_ai.m_enemyAgent);
                return;
            }

            Enemy.rEB_States rState = Enemy.toRState(state);
            if (Enemy.toRState(__instance.m_currentStateName) != rState)
            {
                Enemy.StateChange(__instance.m_ai.m_enemyAgent, rState);
            }
        }

        [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnSpawn))]
        [HarmonyPostfix]
        private static void OnSpawn(EnemySync __instance, pEnemySpawnData spawnData)
        {
            if (!SnapshotManager.active) return;
            Enemy.OnSpawnEnemy(__instance.m_agent, spawnData.mode);
        }
        [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnDespawn))]
        [HarmonyPostfix]
        private static void OnDespawn(EnemySync __instance)
        {
            if (!SnapshotManager.active) return;
            Enemy.OnDespawnEnemy(__instance.m_agent);
        }
    }
}
