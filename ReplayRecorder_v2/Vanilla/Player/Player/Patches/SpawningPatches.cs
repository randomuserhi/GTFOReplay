using HarmonyLib;
using Player;

namespace Vanilla.Player.Patches {
    [HarmonyPatch]
    internal class SpawningPatches {
        [HarmonyPatch(typeof(PlayerSync), nameof(PlayerSync.OnSpawn))]
        [HarmonyPostfix]
        private static void OnSpawn(PlayerSync __instance) {
            PlayerReplayManager.Spawn(__instance.m_agent);
        }

        [HarmonyPatch(typeof(PlayerSync), nameof(PlayerSync.OnDespawn))]
        [HarmonyPostfix]
        private static void OnDespawn(PlayerSync __instance) {
            PlayerReplayManager.Despawn(__instance.m_agent);
        }
    }
}
