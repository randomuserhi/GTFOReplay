using API;
using HarmonyLib;
using SNetwork;

namespace ReplayRecorder.Player.Patches
{
    [HarmonyPatch]
    class PlayerSentryPatches
    {
        [HarmonyPatch(typeof(SentryGunInstance), nameof(SentryGunInstance.OnSpawn))]
        [HarmonyPostfix]
        private static void OnSpawn(SentryGunInstance __instance, pGearSpawnData spawnData)
        {
            if (spawnData.owner.TryGetPlayer(out SNet_Player player))
            {
                PlayerSentry.SpawnSentry(player, __instance, spawnData.position);
            }
            else APILogger.Error($"Sentry had no player as owner.");
        }

        [HarmonyPatch(typeof(SentryGunInstance), nameof(SentryGunInstance.OnDespawn))]
        [HarmonyPostfix]
        private static void OnDespawn(SentryGunInstance __instance)
        {
            PlayerSentry.DespawnSentry(__instance);
        }

        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.FireBullet))]
        [HarmonyPrefix]
        private static void Prefix_SentryGunFiringBullet(SentryGunInstance_Firing_Bullets __instance, bool doDamage, bool targetIsTagged)
        {
            if (!doDamage) return;

            PlayerSentry.sentryName = __instance.ArchetypeData.PublicName;
            var instance = __instance.GetComponent<SentryGunInstance>();
            if (instance != null)
            {
                PlayerSentry.sentryName = instance.PublicName;
            }
            else APILogger.Debug($"Could not find sentry gun instance, this should not happen.");
            PlayerSentry.sentryShot = true;
        }
        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.FireBullet))]
        [HarmonyPostfix]
        private static void Postfix_SentryGunFiringBullet()
        {
            PlayerSentry.sentryName = null;
            PlayerSentry.sentryShot = false;
        }

        // Special case for shotgun sentry

        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.UpdateFireShotgunSemi))]
        [HarmonyPrefix]
        private static void Prefix_ShotgunSentryFiring(SentryGunInstance_Firing_Bullets __instance, bool isMaster, bool targetIsTagged)
        {
            if (!isMaster) return;

            PlayerSentry.sentryName = __instance.ArchetypeData.PublicName;
            var instance = __instance.GetComponent<SentryGunInstance>();
            if (instance != null)
            {
                PlayerSentry.sentryName = instance.PublicName;
            }
            else APILogger.Debug($"Could not find sentry gun instance, this should not happen.");
            PlayerSentry.sentryShot = true;
        }
        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.UpdateFireShotgunSemi))]
        [HarmonyPostfix]
        private static void Postfix_ShotgunSentryFiring()
        {
            PlayerSentry.sentryName = null;
            PlayerSentry.sentryShot = false;
        }
    }
}
