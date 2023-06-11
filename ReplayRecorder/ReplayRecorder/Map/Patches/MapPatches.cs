using API;
using HarmonyLib;

using LevelGeneration;

namespace ReplayRecorder.Map.Patches
{
    [HarmonyPatch]
    class MapPatches
    {
        /*private static Mesh[] surfaces = new Mesh[0];
        private static HashSet<int> contacts = new HashSet<int>();

        [HarmonyPatch(typeof(PlayerAgent), nameof(PlayerAgent.Update))]
        [HarmonyPostfix]
        private static void PlayerUpdate(PlayerAgent __instance)
        {
            if (surfaces.Length == 0) return;

            Vector3 pos = __instance.transform.position;

            // find closest surface below agent (TODO: Make more efficient with a lookup spatial partition or something)
            // => only record navmeshes once player has exited elevator to prevent dodgy surfaces from elevator being made
            int closest = 0;
            Mesh surface = surfaces[0];
            float distance = (pos - surfaces[0].bounds.ClosestPoint(pos)).sqrMagnitude;
            for (int i = 1; i < surfaces.Length; ++i)
            {
                //if (pos.y <= surfaces[i].bounds.max.y || (pos.y >= surfaces[i].bounds.min.y && pos.y <= surfaces[i].bounds.max.y)) continue;
                float dist = (pos - surfaces[i].bounds.ClosestPoint(pos)).sqrMagnitude;
                if (dist < distance)
                {
                    closest = i;
                    distance = dist;
                    surface = surfaces[i];
                }
            }
            //if (pos.y <= surface.bounds.max.y || (pos.y >= surface.bounds.min.y && pos.y <= surface.bounds.max.y)) return;
            contacts.Add(closest);
        }*/



        // Get number of dimensions that need loading
        public static Il2CppSystem.Collections.Generic.List<Dimension>? dimensions;
        
        [HarmonyPatch(typeof(LG_SetupFloor), nameof(LG_SetupFloor.Build))]
        [HarmonyPostfix]
        private static void OnSetupFloor(LG_SetupFloor __instance)
        {
            dimensions = __instance.m_floor.m_dimensions;
            dimensionsLoaded = 0;
        }

        // Called when a dimension's navmesh is building
        private static int dimensionsLoaded = 0;
        [HarmonyPatch(typeof(LG_BuildUnityGraphJob), nameof(LG_BuildUnityGraphJob.Build))]
        [HarmonyPostfix]
        private static void OnNavmeshDone(LG_BuildUnityGraphJob __instance)
        {
            // Check if the navmesh has finished
            if (__instance.m_dimension.NavmeshOperation.isDone)
            {
                if (dimensions == null)
                {
                    APILogger.Error("No dimensions found, this should not happen.");
                    return;
                }

                ++dimensionsLoaded; // Update number of dimensions that have finished loading
                if (dimensionsLoaded == dimensions.Count) 
                {
                    // When all have finished loading, finalize
                    Map.GenerateMapInfo(dimensions);
                }
            }
        }
    }
}
