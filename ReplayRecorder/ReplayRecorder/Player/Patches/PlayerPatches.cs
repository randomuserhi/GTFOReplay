using API;
using HarmonyLib;
using Player;
using SNetwork;

namespace ReplayRecorder.Player.Patches
{
    class PlayerPatches
    {
        [HarmonyPatch(typeof(GS_Base), nameof(GS_Base.OnPlayerEvent))]
        [HarmonyPostfix]
        private void OnPlayerEvent(SNet_Player player, SNet_PlayerEvent playerEvent, SNet_PlayerEventReason reason)
        {
            if (!SnapshotManager.active) return;

            switch (playerEvent)
            {
            case SNet_PlayerEvent.PlayerAgentDeSpawned:
                APILogger.Debug($"{player.NickName} has left.");
                break;
            case SNet_PlayerEvent.PlayerAgentSpawned:
                APILogger.Debug($"{player.NickName} has joined.");
                break;
            }
        }
    }
}
