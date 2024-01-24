using Agents;
using API;
using Enemies;
using HarmonyLib;
using Player;

namespace ReplayRecorder.Enemies.Patches {
    [HarmonyPatch]
    class EnemyTargetPatches {
        [HarmonyPatch(typeof(EnemyAI), nameof(EnemyAI.Target), MethodType.Setter)]
        [HarmonyPrefix]
        private static void SetTarget(EnemyAI __instance, AgentTarget value) {
            //if (__instance.m_mode != AgentMode.Agressive) return;
            if (value == null) return;
            if (__instance.m_target != null && value.m_agent.GetInstanceID() == __instance.m_target.m_agent.GetInstanceID()) return;
            // TODO(randomuserhi): Track individual enemy target states and make sure it only updates when target changes

            PlayerAgent? player = value.m_agent.TryCast<PlayerAgent>();
            if (player != null) {
                Enemy.EnemyTargetSet(__instance.m_enemyAgent, player);
            } else {
                APILogger.Debug("Target was not a player agent.");
            }
        }
    }
}
