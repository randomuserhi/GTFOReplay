using API;
using HarmonyLib;
using LevelGeneration;

namespace ReplayRecorder.Map.Patches {
    [HarmonyPatch]
    class MapLadderPatches {
        private static void AddLadderToMap(Map.rLadder ladder, eDimensionIndex dimension) {
            APILogger.Debug("Added ladder.");

            if (!Map.ladders.ContainsKey(dimension))
                Map.ladders.Add(dimension, new List<Map.rLadder>());
            Map.ladders[dimension].Add(ladder);
        }

        [HarmonyPatch(typeof(LG_BuildLadderAIGNodeJob), nameof(LG_BuildLadderAIGNodeJob.Build))]
        [HarmonyPostfix]
        private static void Ladder_OnBuild(LG_BuildLadderAIGNodeJob __instance) {
            LG_Ladder ladder = __instance.m_ladder;
            if (ladder.m_enemyClimbingOnly) return;

            Map.rLadder rladder = new Map.rLadder(ladder);

            AddLadderToMap(rladder, __instance.m_dimensionIndex);
        }
    }
}
