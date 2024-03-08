using Enemies;
using HarmonyLib;
using ReplayRecorder;

namespace Vanilla.Enemy.Patches {
    [HarmonyPatch]
    internal static class EnemyStatePatches {
        [HarmonyPatch(typeof(ES_Hitreact), nameof(ES_Hitreact.DoHitReact))]
        [HarmonyPostfix]
        private static void OnStaggerEnter(ES_Hitreact __instance) {
            if (!__instance.m_enemyAgent.Alive) return;

            Replay.Trigger(new rEnemyState(__instance.m_enemyAgent, rEnemyState.State.Stagger));
        }

        [HarmonyPatch(typeof(ES_Hitreact), nameof(ES_Hitreact.CommonUpdate))]
        [HarmonyPrefix]
        private static void OnStaggerExit(ES_Hitreact __instance) {
            if (!__instance.m_enemyAgent.Alive) return;

            if (Clock.Time <= __instance.m_endTime) return;
            Replay.Trigger(new rEnemyState(__instance.m_enemyAgent, rEnemyState.State.Default));
        }

        [HarmonyPatch(typeof(ES_StuckInGlue), nameof(ES_StuckInGlue.Enter))]
        [HarmonyPostfix]
        private static void OnGlueEnter(ES_StuckInGlue __instance) {
            if (!__instance.m_enemyAgent.Alive) return;

            Replay.Trigger(new rEnemyState(__instance.m_enemyAgent, rEnemyState.State.Glue));
        }

        [HarmonyPatch(typeof(ES_StuckInGlue), nameof(ES_StuckInGlue.Exit))]
        [HarmonyPostfix]
        private static void OnGlueExit(ES_StuckInGlue __instance) {
            if (!__instance.m_enemyAgent.Alive) return;

            Replay.Trigger(new rEnemyState(__instance.m_enemyAgent, rEnemyState.State.Default));
        }
    }
}
