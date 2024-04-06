using AIGraph;
using HarmonyLib;
using LevelGeneration;

namespace Vanilla.Map.ResourceContainers.Patches {
    [HarmonyPatch]
    internal class Spawn {
        [HarmonyPatch(typeof(AIG_CourseNode), nameof(AIG_CourseNode.RegisterContainer))]
        [HarmonyPostfix]
        private static void ResourceContainer_Add(AIG_CourseNode __instance, LG_ResourceContainer_Storage container) {
            int id = container.GetInstanceID();
            if (!rContainers.containers.ContainsKey(id)) {
                rContainers.containers.Add(id, new rContainer(container, false, (byte)__instance.m_dimension.DimensionIndex));
            }
            rContainers.containers[id].dimension = (byte)__instance.m_dimension.DimensionIndex;
        }

        [HarmonyPatch(typeof(AIG_CourseNode), nameof(AIG_CourseNode.UnregisterContainer))]
        [HarmonyPostfix]
        private static void ResourceContainer_Remove(AIG_CourseNode __instance, LG_ResourceContainer_Storage container) {
            rContainers.containers.Remove(container.GetInstanceID());
        }

        [HarmonyPatch(typeof(LG_ResourceContainer_Storage), nameof(LG_ResourceContainer_Storage.Setup))]
        [HarmonyPostfix]
        private static void Resource_Setup(LG_ResourceContainer_Storage __instance, iLG_ResourceContainer_Core core, bool isLocker) {
            int id = __instance.GetInstanceID();
            if (!rContainers.containers.ContainsKey(id)) {
                rContainers.containers.Add(id, new rContainer(__instance, false, 0));
            }
            rContainers.containers[id].isLocker = isLocker;
        }
    }
}
