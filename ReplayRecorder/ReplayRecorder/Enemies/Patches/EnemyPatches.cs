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

            Enemy.Enemy.rEB_States rState = Enemy.Enemy.toRState(state);
            if (Enemy.Enemy.toRState(__instance.m_currentStateName) != rState)
            {
                Enemy.Enemy.StateChange(__instance.m_ai.m_enemyAgent, rState);
            }
            // TODO(randomuserhi): Check if this works on client side
            if (__instance.m_currentStateName != state && state == EB_States.Dead)
            {
                Enemy.Enemy.DeadEnemy(__instance.m_ai.m_enemyAgent);
            }
        }

        // TODO(randomuserhi): Enemy patch doesn't work for clients
        [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnSpawn))]
        [HarmonyPostfix]
        private static void OnSpawn(EnemySync __instance, pEnemySpawnData spawnData)
        {
            if (!SnapshotManager.active) return;
            Enemy.Enemy.OnSpawnEnemy(__instance.m_agent, spawnData.mode);
        }

        [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnDespawn))]
        [HarmonyPostfix]
        private static void OnDespawn(EnemySync __instance)
        {
            if (!SnapshotManager.active) return;
            Enemy.Enemy.OnDespawnEnemy(__instance.m_agent);
        }

        // TODO:: Change the method of detecting when an enemy dies via network => Either dont use EnemyAppearance and look at what SNet things GTFO uses (refer to GTFO-API Network Receive Hooks) or look
        //        at the proper OnDead event triggers etc (see how to avoid triggering it on head limb kill)
        //        Maybe look at ES_Dead or ES_DeadBase (probs ES_Dead => needs more testing)
        /*[HarmonyPatch(typeof(EnemyAppearance), nameof(EnemyAppearance.OnDead))]
        [HarmonyPostfix]
        private static void OnDead(EnemyAppearance __instance)
        {
            if (!SnapshotManager.active) return;
            Enemy.Enemy.DeadEnemy(__instance.m_owner);
        }*/
    }
}
