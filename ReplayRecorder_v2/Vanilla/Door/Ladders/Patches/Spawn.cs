using HarmonyLib;
using LevelGeneration;

namespace Vanilla.Map.Ladders.Patches {
    [HarmonyPatch]
    internal class Spawn {
        [HarmonyPatch(typeof(LG_BuildLadderAIGNodeJob), nameof(LG_BuildLadderAIGNodeJob.Build))]
        [HarmonyPostfix]
        private static void Ladder_OnBuild(LG_BuildLadderAIGNodeJob __instance) {
            LG_Ladder ladder = __instance.m_ladder;
            if (ladder.m_enemyClimbingOnly) return;

            rLadders.ladders.Add(new rLadder((byte)__instance.m_dimensionIndex, ladder));
        }
    }
}
