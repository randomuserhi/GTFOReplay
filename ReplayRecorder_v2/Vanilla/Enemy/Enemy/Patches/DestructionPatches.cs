using Enemies;
using HarmonyLib;
using ReplayRecorder;

namespace Vanilla.Enemy.Patches {
    [HarmonyPatch]
    internal static class DestructionPatches {
        [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnSpawn))]
        [HarmonyPostfix]
        private static void OnSpawn(EnemySync __instance) {
            if (__instance.m_agent.m_headLimb == null) return;
            __instance.m_agent.m_headLimb.add_OnLimbDestroyed((Action)(() => {
                if (__instance.m_agent.Alive) Replay.Trigger(new rLimbDestruction(__instance.m_agent, rLimbDestruction.Type.head));
            }));
        }
    }
}
