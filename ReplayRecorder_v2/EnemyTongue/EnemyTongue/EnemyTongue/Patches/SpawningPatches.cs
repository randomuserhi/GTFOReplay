using Enemies;
using HarmonyLib;

namespace Vanilla.EnemyTongue.Patches {
    [HarmonyPatch]
    internal class TonguePatches {
        [HarmonyPatch(typeof(MovingEnemyTentacleBase), nameof(MovingEnemyTentacleBase.DoAttack))]
        [HarmonyPostfix]
        private static void DoAttack(MovingEnemyTentacleBase __instance) {
            EnemyTongueReplayManager.Spawn(__instance);
        }

        [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnDespawn))]
        [HarmonyPostfix]
        private static void OnDespawn(EnemySync __instance) {
            EnemyTongueReplayManager.Despawn(__instance.m_agent);
        }

        [HarmonyPatch(typeof(EnemyBehaviour), nameof(EnemyBehaviour.ChangeState), new Type[] { typeof(EB_States) })]
        [HarmonyPrefix]
        private static void Behaviour_ChangeState(EnemyBehaviour __instance, EB_States state) {
            if (__instance.m_currentStateName != state && state == EB_States.Dead) {
                EnemyTongueReplayManager.Despawn(__instance.m_ai.m_enemyAgent);
                return;
            }
        }

        [HarmonyPatch(typeof(MovingEnemyTentacleBase), nameof(MovingEnemyTentacleBase.DeAllocateGPUCurvy))]
        [HarmonyPostfix]
        private static void Deallocate(MovingEnemyTentacleBase __instance) {
            EnemyTongueReplayManager.Despawn(__instance);
        }
    }
}
