using Enemies;
using HarmonyLib;
using ReplayRecorder;

namespace Vanilla.Enemy.Patches {
    [HarmonyPatch]
    internal class EnemyStatePatches {
        [HarmonyPatch(typeof(ES_Hitreact), nameof(ES_Hitreact.DoHitReact))]
        [HarmonyPostfix]
        private static void onStaggerEnter(ES_Hitreact __instance) {
            if (!__instance.m_enemyAgent.Alive) return;

            Replay.Trigger(new rEnemyState(__instance.m_enemyAgent, rEnemyState.State.Stagger));
        }

        [HarmonyPatch(typeof(ES_Hitreact), nameof(ES_Hitreact.CommonUpdate))]
        [HarmonyPrefix]
        private static void onStaggerExit(ES_Hitreact __instance) {
            if (!__instance.m_enemyAgent.Alive) return;

            if (Clock.Time <= __instance.m_endTime) return;
            Replay.Trigger(new rEnemyState(__instance.m_enemyAgent, rEnemyState.State.Default));
        }

        [HarmonyPatch(typeof(ES_StuckInGlue), nameof(ES_StuckInGlue.Enter))]
        [HarmonyPostfix]
        private static void onGlueEnter(ES_StuckInGlue __instance) {
            if (!__instance.m_enemyAgent.Alive) return;

            Replay.Trigger(new rEnemyState(__instance.m_enemyAgent, rEnemyState.State.Glue));
        }

        [HarmonyPatch(typeof(ES_StuckInGlue), nameof(ES_StuckInGlue.Exit))]
        [HarmonyPostfix]
        private static void onGlueExit(ES_StuckInGlue __instance) {
            if (!__instance.m_enemyAgent.Alive) return;

            Replay.Trigger(new rEnemyState(__instance.m_enemyAgent, rEnemyState.State.Default));
        }
    }
}
