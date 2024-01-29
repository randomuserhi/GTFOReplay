using ChainedPuzzles;
using HarmonyLib;

namespace ReplayRecorder.ChainedPuzzle.Patches {
    [HarmonyPatch]
    class HolopathPatches {
        [HarmonyPatch(typeof(CP_Holopath_Spline), nameof(CP_Holopath_Spline.Reveal))]
        [HarmonyPostfix]
        private static void Postfix_CP_Holopath_Reveal(CP_Holopath_Spline __instance) {
            ChainedPuzzle.SpawnHolopath(__instance);
        }

        [HarmonyPatch(typeof(CP_Holopath_Spline), nameof(CP_Holopath_Spline.SetVisible))]
        [HarmonyPostfix]
        private static void Postfix_CP_Holopath_Visible(CP_Holopath_Spline __instance, bool vis) {
            int instance = __instance.GetInstanceID();
            if (!vis) {
                ChainedPuzzle.DespawnHolopath(instance);
            } else {
                ChainedPuzzle.SpawnHolopath(__instance);
            }
        }
    }
}
