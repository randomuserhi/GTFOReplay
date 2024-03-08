using API;
using HarmonyLib;
using LevelGeneration;
using ReplayRecorder;

namespace Vanilla.Map.Patches {
    [HarmonyPatch]
    class MapGeometryPatches {
        // Get number of dimensions that need loading
        public static Il2CppSystem.Collections.Generic.List<Dimension>? dimensions;

        [HarmonyPatch(typeof(LG_SetupFloor), nameof(LG_SetupFloor.Build))]
        [HarmonyPostfix]
        private static void OnSetupFloor(LG_SetupFloor __instance) {
            dimensions = __instance.m_floor.m_dimensions;
            dimensionsLoaded = 0;
        }

        // Called when a dimension's navmesh is building
        private static int dimensionsLoaded = 0;
        [HarmonyPatch(typeof(LG_BuildUnityGraphJob), nameof(LG_BuildUnityGraphJob.Build))]
        [HarmonyPostfix]
        private static void OnNavmeshDone(LG_BuildUnityGraphJob __instance) {
            // Check if the navmesh has finished
            if (__instance.m_dimension.NavmeshOperation.isDone) {
                if (dimensions == null) {
                    APILogger.Error("No dimensions found, this should not happen.");
                    return;
                }

                ++dimensionsLoaded; // Update number of dimensions that have finished loading
                if (dimensionsLoaded == dimensions.Count) {
                    // When all have finished loading, finalize
                    MapGeometryReplayManager.GenerateMapInfo(dimensions);
                }
            }
        }

        // Write map data once all loaded (elevator ride stops when level is finished loading)
        [HarmonyPatch(typeof(GS_ReadyToStopElevatorRide), nameof(GS_ReadyToStopElevatorRide.Enter))]
        [HarmonyPostfix]
        private static void StopElevatorRide() {
            Replay.Trigger(new rMapGeometryEOH());
        }
    }
}
