using HarmonyLib;
using ReplayRecorder;

namespace Vanilla.Sentry.Patches {
    [HarmonyPatch]
    internal static class SpawnPatches {
        [HarmonyPatch(typeof(SentryGunInstance), nameof(SentryGunInstance.OnSpawn))]
        [HarmonyPostfix]
        private static void OnSpawn(SentryGunInstance __instance, pGearSpawnData spawnData) {
            Replay.Spawn(new rSentry(__instance));
        }

        [HarmonyPatch(typeof(SentryGunInstance), nameof(SentryGunInstance.OnDespawn))]
        [HarmonyPostfix]
        private static void OnDespawn(SentryGunInstance __instance) {
            Replay.Despawn(Replay.Get<rSentry>(__instance.GetInstanceID()));
        }
    }
}
