using API;
using HarmonyLib;

namespace ReplayRecorder {
    [HarmonyPatch]
    internal class GameEventManager {
        [HarmonyPatch(typeof(RundownManager), nameof(RundownManager.EndGameSession))]
        [HarmonyPrefix]
        private static void EndGameSession() {
            APILogger.Debug($"Level ended!");

            SnapshotManager.Dispose();

            // TODO(randomuserhi): Move reset to expedition start? This should be fine tho...
            Map.Map.Reset();
            Mines.Mine.Reset();
            Enemies.Enemy.Reset();
            Player.PlayerSentry.Reset();
        }
    }
}
