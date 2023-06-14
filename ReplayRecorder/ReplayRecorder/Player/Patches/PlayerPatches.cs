using API;
using HarmonyLib;
using Player;

namespace ReplayRecorder.Player.Patches
{
    [HarmonyPatch]
    class PlayerPatches
    {
        [HarmonyPatch(typeof(PlayerSync), nameof(PlayerSync.OnSpawn))]
        [HarmonyPostfix]
        private static void OnSpawn(PlayerSync __instance)
        {
            if (!SnapshotManager.active) return;
            Player.SpawnPlayer(__instance.m_agent);
        }

        [HarmonyPatch(typeof(PlayerSync), nameof(PlayerSync.OnDespawn))]
        [HarmonyPostfix]
        private static void OnDespawn(PlayerSync __instance)
        {
            if (!SnapshotManager.active) return;
            Player.DespawnPlayer(__instance.m_agent);
        }
    }
}
