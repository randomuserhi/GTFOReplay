using AIGraph;
using API;
using HarmonyLib;
using LevelGeneration;

namespace ReplayRecorder.Map.Patches {
    [HarmonyPatch]
    class MapTerminalPatches {
        private static void AddTerminalToMap(Map.rTerminal terminal, eDimensionIndex dimension) {
            APILogger.Debug("Added terminal.");

            if (!Map.terminals.ContainsKey(dimension))
                Map.terminals.Add(dimension, new List<Map.rTerminal>());
            Map.terminals[dimension].Add(terminal);
        }

        [HarmonyPatch(typeof(AIG_CourseNode), nameof(AIG_CourseNode.RegisterComputerTerminal))]
        [HarmonyPostfix]
        private static void Terminal_Setup(AIG_CourseNode __instance, LG_ComputerTerminal terminal) {
            Map.rTerminal rterminal = new Map.rTerminal(terminal);

            AddTerminalToMap(rterminal, __instance.m_dimension.DimensionIndex);
        }
    }
}
