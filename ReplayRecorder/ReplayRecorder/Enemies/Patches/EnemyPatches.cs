using Enemies;
using HarmonyLib;

namespace ReplayRecorder.Enemies.Patches {
    [HarmonyPatch]
    class EnemyPatches {
        // TODO(randomuserhi): This isnt called on clients for some reason
        // State change of enemy => hibernating -> attacking
        [HarmonyPatch(typeof(EnemyBehaviour), nameof(EnemyBehaviour.ChangeState), new Type[] { typeof(EB_States) })]
        [HarmonyPrefix]
        private static void Behaviour_ChangeState(EnemyBehaviour __instance, EB_States state) {
            if (!SnapshotManager.active) return;

            // TODO(randomuserhi): This works on client side => move to killindicatorfix
            if (__instance.m_currentStateName != state && state == EB_States.Dead) {
                Enemy.DeadEnemy(__instance.m_ai.m_enemyAgent);
                return;
            }

            Enemy.rEB_States rState = Enemy.toRState(state);
            if (Enemy.toRState(__instance.m_currentStateName) != rState) {
                Enemy.BehaviourStateChange(__instance.m_ai.m_enemyAgent, rState);
            }
        }

        // State change of enemy (cfoam glue)
        [HarmonyPatch(typeof(ES_StuckInGlue), nameof(ES_StuckInGlue.CommonUpdate))]
        [HarmonyPrefix]
        private static void UpdateGlueState(ES_StuckInGlue __instance) {
            if (!SnapshotManager.active) return;

            if (__instance.m_enemyAgent.Damage.AttachedGlueRel < 0.1f) {
                Enemy.LocomotionStateChange(__instance.m_enemyAgent, Enemy.rES_States.Default);
            }
        }
        [HarmonyPatch(typeof(ES_StuckInGlue), nameof(ES_StuckInGlue.CommonEnter))]
        [HarmonyPrefix]
        private static void Locomotion_ForceState(ES_StuckInGlue __instance) {
            if (!SnapshotManager.active) return;

            Enemy.LocomotionStateChange(__instance.m_enemyAgent, Enemy.rES_States.StuckInGlue);
        }

        [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnSpawn))]
        [HarmonyPostfix]
        private static void OnSpawn(EnemySync __instance, pEnemySpawnData spawnData) {
            if (!SnapshotManager.active) return;
            Enemy.OnSpawnEnemy(__instance.m_agent, spawnData.mode);
        }
        [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnDespawn))]
        [HarmonyPostfix]
        private static void OnDespawn(EnemySync __instance) {
            if (!SnapshotManager.active) return;
            Enemy.OnDespawnEnemy(__instance.m_agent);
        }
    }
}
