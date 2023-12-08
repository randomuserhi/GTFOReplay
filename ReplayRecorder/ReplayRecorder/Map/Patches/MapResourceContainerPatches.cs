using AIGraph;
using API;
using HarmonyLib;
using LevelGeneration;

namespace ReplayRecorder.Map.Patches {
    [HarmonyPatch]
    class MapResourceContainerPatches {
        private static void AddResourceContainerToMap(Map.rContainer container, eDimensionIndex dimension) {
            APILogger.Debug("Added Resource Container.");

            if (!Map.containers.ContainsKey(dimension))
                Map.containers.Add(dimension, new List<Map.rContainer>());
            Map.containers[dimension].Add(container);
        }

        [HarmonyPatch(typeof(AIG_CourseNode), nameof(AIG_CourseNode.RegisterContainer))]
        [HarmonyPostfix]
        private static void ResourceContainer_Setup(AIG_CourseNode __instance, LG_ResourceContainer_Storage container) {
            if (container == null) return;

            Map.rContainer rcontainer = new Map.rContainer(container);

            AddResourceContainerToMap(rcontainer, __instance.m_dimension.DimensionIndex);
        }
    }
}
