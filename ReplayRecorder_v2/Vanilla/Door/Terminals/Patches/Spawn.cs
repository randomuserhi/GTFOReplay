using AIGraph;
using HarmonyLib;
using LevelGeneration;
using Vanilla.Map.Terminals;

namespace Vanilla.Map.Termminals.Patches {
    [HarmonyPatch]
    internal class Spawn {
        [HarmonyPatch(typeof(AIG_CourseNode), nameof(AIG_CourseNode.RegisterComputerTerminal))]
        [HarmonyPostfix]
        private static void Terminal_Setup(AIG_CourseNode __instance, LG_ComputerTerminal terminal) {
            rTerminals.terminals.Add(new rTerminal((byte)__instance.m_dimension.DimensionIndex, terminal));
        }
    }
}
