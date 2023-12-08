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
                Map.containers.Add(dimension, new Dictionary<int, Map.rContainer>());
            Map.containers[dimension].Add(container.instance, container);
        }

        [HarmonyPatch(typeof(AIG_CourseNode), nameof(AIG_CourseNode.RegisterContainer))]
        [HarmonyPostfix]
        private static void ResourceContainer_Add(AIG_CourseNode __instance, LG_ResourceContainer_Storage container) {
            Map.rContainer rcontainer = new Map.rContainer(container);

            AddResourceContainerToMap(rcontainer, __instance.m_dimension.DimensionIndex);
        }

        [HarmonyPatch(typeof(AIG_CourseNode), nameof(AIG_CourseNode.UnregisterContainer))]
        [HarmonyPostfix]
        private static void ResourceContainer_Remove(AIG_CourseNode __instance, LG_ResourceContainer_Storage container) {
            eDimensionIndex dimension = __instance.m_dimension.DimensionIndex;
            if (Map.containers.ContainsKey(dimension)) {
                Map.containers[dimension].Remove(container.GetInstanceID());
            }
        }
    }
}
