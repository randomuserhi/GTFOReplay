using System;
using System.Collections.Generic;
using System.Linq;
using HarmonyLib;
using API;
using UnityEngine;

namespace ReplayRecorder
{
    [HarmonyPatch]
    public class GameEventManager
    {
        public static void OnGameplayStart()
        {
            APILogger.Debug($"Gameplay started!");

            SnapshotManager.Init();
            Player.Player.Init();
        }

        [HarmonyPatch(typeof(RundownManager), nameof(RundownManager.EndGameSession))]
        [HarmonyPrefix]
        private static void EndGameSession()
        {
            APILogger.Debug($"Level ended!");

            SnapshotManager.Dispose();

            // TODO(randomuserhi): Move reset to expedition start? This should be fine tho...
            Map.Map.Reset();
        }
    }
}
