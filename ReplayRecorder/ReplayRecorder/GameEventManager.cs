using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HarmonyLib;
using API;

namespace ReplayRecorder
{
    [HarmonyPatch]
    public class GameEventManager
    {
        [HarmonyPatch(typeof(GS_InLevel), nameof(GS_InLevel.Enter))]
        [HarmonyPrefix]
        private static void InLevelEnter(GS_InLevel __instance)
        {
            APILogger.Debug($"Entered Level!");
        }

        [HarmonyPatch(typeof(RundownManager), nameof(RundownManager.EndGameSession))]
        [HarmonyPrefix]
        private static void EndGameSession()
        {
            APILogger.Debug($"Level ended!");
        }
    }
}
